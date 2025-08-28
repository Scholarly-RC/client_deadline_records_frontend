<template>
  <UCard class="bar-chart-container">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <div class="flex items-center gap-2">
          <!-- Orientation Toggle -->
          <USelectMenu 
            v-if="showOrientationToggle"
            v-model="orientation" 
            :options="orientationOptions"
            size="sm"
            @change="handleOrientationChange"
          />
          <!-- Sort Options -->
          <USelectMenu 
            v-if="showSortOptions"
            v-model="sortBy" 
            :options="sortOptions"
            size="sm"
            @change="handleSortChange"
          />
          <!-- Export Button -->
          <UButton 
            v-if="showExport"
            @click="exportChart" 
            variant="ghost" 
            size="sm"
            icon="mdi:download"
          >
            Export
          </UButton>
        </div>
      </div>
    </template>
    
    <div class="chart-wrapper">
      <VChart 
        ref="chartRef"
        :option="chartOption" 
        :autoresize="true" 
        :loading="isLoading"
        :style="{ height: height }"
        @click="handleChartClick"
        class="w-full"
      />
    </div>
  </UCard>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useChartInteractivity } from '~/composables/useChartInteractivity.js'

const props = defineProps({
  title: {
    type: String,
    default: 'Bar Chart'
  },
  data: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 
             Array.isArray(value.categories) && 
             Array.isArray(value.series)
    }
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  showOrientationToggle: {
    type: Boolean,
    default: true
  },
  showSortOptions: {
    type: Boolean,
    default: true
  },
  showExport: {
    type: Boolean,
    default: true
  },
  colors: {
    type: Array,
    default: () => ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  },
  height: {
    type: String,
    default: '400px'
  },
  stack: {
    type: Boolean,
    default: false
  },
  showDataLabels: {
    type: Boolean,
    default: false
  },
  chartType: {
    type: String,
    default: 'team_performance' // For interactivity identification
  },
  enableInteractivity: {
    type: Boolean,
    default: true
  },
  drillContext: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['click', 'orientationChange', 'sortChange', 'export', 'drill'])

const chartRef = ref(null)
const orientation = ref('vertical')
const sortBy = ref('none')
const realTimeCleanup = ref(null)

// Enhanced interactivity with composable
const {
  initializeChartInteractivity,
  handleChartClick: handleInteractiveChartClick,
  exportChart: exportInteractiveChart,
  createEnhancedTooltipFormatter,
  enableRealTimeUpdates,
  isExporting,
  exportProgress
} = useChartInteractivity({
  customDrillHandlers: {
    [props.chartType]: (params, context) => {
      emit('drill', { params, context, chartType: props.chartType })
    }
  }
})

const orientationOptions = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

const sortOptions = [
  { label: 'No Sort', value: 'none' },
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' },
  { label: 'By Name', value: 'name' }
]

const processedData = computed(() => {
  if (!props.data || !props.data.categories || !props.data.series) {
    return { categories: [], series: [] }
  }

  let categories = [...props.data.categories]
  let series = props.data.series.map(s => ({ ...s, data: [...s.data] }))

  // Apply sorting
  if (sortBy.value !== 'none') {
    const indices = Array.from({ length: categories.length }, (_, i) => i)
    
    if (sortBy.value === 'name') {
      indices.sort((a, b) => categories[a].localeCompare(categories[b]))
    } else {
      // Sort by first series values
      const firstSeriesData = series[0]?.data || []
      indices.sort((a, b) => {
        const valueA = firstSeriesData[a] || 0
        const valueB = firstSeriesData[b] || 0
        return sortBy.value === 'asc' ? valueA - valueB : valueB - valueA
      })
    }

    // Reorder categories and series data based on sorted indices
    categories = indices.map(i => categories[i])
    series = series.map(s => ({
      ...s,
      data: indices.map(i => s.data[i])
    }))
  }

  return { categories, series }
})

const chartOption = computed(() => {
  const { categories, series } = processedData.value
  
  if (!categories.length || !series.length) {
    return {}
  }

  const isHorizontal = orientation.value === 'horizontal'
  
  return {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: createEnhancedTooltipFormatter(props.chartType, {
        showClickHint: props.enableInteractivity
      }),
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: {
      data: series.map(s => s.name),
      bottom: 0,
      textStyle: {
        color: '#6b7280'
      }
    },
    grid: {
      left: isHorizontal ? '15%' : '3%',
      right: '4%',
      bottom: series.length > 1 ? '15%' : '3%',
      top: '5%',
      containLabel: !isHorizontal
    },
    xAxis: {
      type: isHorizontal ? 'value' : 'category',
      data: isHorizontal ? undefined : categories,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        interval: 0,
        rotate: isHorizontal ? 0 : (categories.length > 6 ? 45 : 0)
      },
      splitLine: isHorizontal ? {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      } : undefined
    },
    yAxis: {
      type: isHorizontal ? 'category' : 'value',
      data: isHorizontal ? categories : undefined,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12
      },
      splitLine: !isHorizontal ? {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      } : undefined
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      stack: props.stack ? 'total' : undefined,
      itemStyle: {
        color: props.colors[index % props.colors.length]
      },
      label: {
        show: props.showDataLabels,
        position: isHorizontal ? 'right' : 'top',
        fontSize: 11,
        color: '#6b7280'
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }))
  }
})

const handleChartClick = async (params) => {
  // Emit the basic click event
  emit('click', params)
  
  // Handle interactive drilling if enabled
  if (props.enableInteractivity) {
    try {
      await handleInteractiveChartClick(props.chartType, params, {
        orientation: orientation.value,
        sortBy: sortBy.value,
        drillContext: props.drillContext,
        chartData: props.data
      })
    } catch (error) {
      console.error('Chart interaction failed:', error)
    }
  }
}

const handleOrientationChange = (value) => {
  orientation.value = value
  emit('orientationChange', value)
}

const handleSortChange = (value) => {
  sortBy.value = value
  emit('sortChange', value)
}

const exportChart = async (format = 'png') => {
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (!chartInstance) {
        throw new Error('Chart instance not available')
      }
      
      const filename = `${props.title.replace(/\s+/g, '_').toLowerCase()}_chart`
      
      const result = await exportInteractiveChart(
        chartInstance, 
        format, 
        filename, 
        props.data
      )
      
      emit('export', { 
        format, 
        filename, 
        data: result,
        chartType: props.chartType 
      })
      
      return result
    } catch (error) {
      console.error('Export failed:', error)
      emit('export', { error, chartType: props.chartType })
    }
  } else {
    console.warn('Chart not ready for export')
    emit('export', { error: 'Chart not ready', chartType: props.chartType })
  }
}

// Watch for data changes and update chart
watch(() => props.data, async (newData) => {
  if (chartRef.value && newData && typeof chartRef.value.getEchartsInstance === 'function') {
    await nextTick()
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance) {
        chartInstance.setOption(chartOption.value, true)
      }
    } catch (error) {
      console.error('Failed to update chart:', error)
    }
  }
}, { deep: true })

// Watch for orientation changes
watch(orientation, async () => {
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    await nextTick()
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance) {
        chartInstance.setOption(chartOption.value, true)
      }
    } catch (error) {
      console.error('Failed to update chart orientation:', error)
    }
  }
})

// Watch for sort changes
watch(sortBy, async () => {
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    await nextTick()
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance) {
        chartInstance.setOption(chartOption.value, true)
      }
    } catch (error) {
      console.error('Failed to update chart sort:', error)
    }
  }
})

onMounted(async () => {
  // Wait for component to be fully mounted
  await nextTick()
  
  // Initialize chart with retry logic
  const initializeChart = async (retries = 3) => {
    if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
      try {
        const chartInstance = chartRef.value.getEchartsInstance()
        
        if (!chartInstance && retries > 0) {
          // Chart not ready yet, retry after a short delay
          setTimeout(() => initializeChart(retries - 1), 100)
          return
        }
        
        if (!chartInstance) {
          console.error('Failed to get ECharts instance after retries')
          return
        }
        
        // Initialize interactivity features
        if (props.enableInteractivity) {
          initializeChartInteractivity(chartInstance, props.chartType, {
            enableAnimations: true,
            drillContext: props.drillContext
          })
        }
        
        // Handle window resize
        const handleResize = () => {
          try {
            chartInstance.resize()
          } catch (error) {
            console.error('Chart resize failed:', error)
          }
        }
        
        window.addEventListener('resize', handleResize)
        
        // Setup real-time updates if needed
        if (props.enableInteractivity) {
          realTimeCleanup.value = enableRealTimeUpdates(chartInstance, 30000)
        }
        
        onUnmounted(() => {
          window.removeEventListener('resize', handleResize)
          if (realTimeCleanup.value) {
            realTimeCleanup.value()
          }
        })
        
      } catch (error) {
        console.error('Chart initialization failed:', error)
        if (retries > 0) {
          setTimeout(() => initializeChart(retries - 1), 100)
        }
      }
    } else if (retries > 0) {
      setTimeout(() => initializeChart(retries - 1), 100)
    }
  }
  
  await initializeChart()
})
</script>

<style scoped>
@reference "tailwindcss";

.bar-chart-container {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
}

.chart-wrapper {
  @apply relative;
}

/* Loading state styling */
.chart-wrapper[data-loading="true"] {
  @apply opacity-50;
}
</style>