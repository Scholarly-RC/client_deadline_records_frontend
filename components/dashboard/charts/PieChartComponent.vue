<template>
  <UCard class="pie-chart-container">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <div class="flex items-center gap-2">
          <!-- Chart Type Toggle -->
          <USelectMenu 
            v-if="showChartTypeToggle"
            v-model="chartTypeSelection" 
            :options="chartTypeOptions"
            size="sm"
            @update:model-value="handleChartTypeChange"
          />
          <!-- Export Button -->
          <UButton 
            v-if="showExport"
            @click="() => exportChart()" 
            variant="ghost" 
            size="sm"
            icon="mdi:download"
          >
            Export
          </UButton>
        </div>
      </div>
    </template>
    
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Chart -->
      <div class="flex-1">
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
      
      <!-- Custom Legend Panel -->
      <div v-if="showLegend" class="legend-panel w-full lg:w-64 space-y-2">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Details</h4>
        <div 
          v-for="(item, index) in legendData" 
          :key="item.name || index" 
          class="legend-item flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          @click="handleLegendClick(item, index)"
        >
          <div class="flex items-center gap-2">
            <div 
              :style="{ backgroundColor: getItemColor(index) }" 
              class="legend-color w-3 h-3 rounded-full"
            ></div>
            <span class="legend-label text-sm text-gray-700 dark:text-gray-300">
              {{ item.display_name || item.name }}
            </span>
          </div>
          <div class="flex flex-col items-end">
            <span class="legend-value text-sm font-medium text-gray-900 dark:text-white">
              {{ item.value }}
            </span>
            <span v-if="showPercentages" class="text-xs text-gray-500 dark:text-gray-400">
              {{ calculatePercentage(item.value) }}%
            </span>
          </div>
        </div>
        
        <!-- Total -->
        <div v-if="showTotal" class="legend-total border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
          <div class="flex items-center justify-between p-2 font-medium">
            <span class="text-sm text-gray-700 dark:text-gray-300">Total</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ totalValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { ComposeOption } from 'echarts/core'
import type {
  PieSeriesOption,
} from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption
} from 'echarts/components'
import type { ECElementEvent } from 'echarts'
import { useChartInteractivity } from '~/composables/useChartInteractivity.js'
import type { ChartClickParams } from '~/types/entities'

// Define the proper ECharts option type
type ECOption = ComposeOption<
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
>

interface PieDataItem {
  name: string
  value: number
  display_name?: string
}

interface Props {
  title?: string
  data: PieDataItem[]
  isLoading?: boolean
  showLegend?: boolean
  showPercentages?: boolean
  showTotal?: boolean
  showChartTypeToggle?: boolean
  showExport?: boolean
  colors?: string[]
  height?: string
  innerRadius?: string
  outerRadius?: string
  chartType?: string
  enableInteractivity?: boolean
  drillContext?: Record<string, any>
}

interface Emits {
  (e: 'click', data: ChartClickParams): void
  (e: 'legendClick', data: { item: PieDataItem; index: number }): void
  (e: 'chartTypeChange', type: string): void
  (e: 'export', data: any): void
  (e: 'drill', data: { params: ChartClickParams; context: any; chartType: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Pie Chart',
  isLoading: false,
  showLegend: true,
  showPercentages: true,
  showTotal: true,
  showChartTypeToggle: true,
  showExport: true,
  colors: () => [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ],
  height: '350px',
  innerRadius: '0%',
  outerRadius: '70%',
  chartType: 'category_distribution',
  enableInteractivity: true,
  drillContext: () => ({})
})

const emit = defineEmits<Emits>()

const chartRef = ref<any>(null)
const chartTypeSelection = ref<string>('pie')
const realTimeCleanup = ref<(() => void) | null>(null)

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
    [props.chartType]: (params: any, context: any) => {
      emit('drill', { params, context, chartType: props.chartType })
    }
  }
})

const chartTypeOptions = [
  { label: 'Pie Chart', value: 'pie' },
  { label: 'Donut Chart', value: 'donut' },
  { label: 'Rose Chart', value: 'rose' }
] as const

const legendData = computed<PieDataItem[]>(() => {
  return props.data.map(item => ({
    ...item,
    display_name: item.display_name || item.name
  }))
})

const totalValue = computed<number>(() => {
  return props.data.reduce((sum, item) => sum + (item.value || 0), 0)
})

const chartOption = computed<ECOption>(() => {
  if (!props.data || props.data.length === 0) {
    return {}
  }

  const isDonut = chartTypeSelection.value === 'donut'
  const isRose = chartTypeSelection.value === 'rose'
  
  return {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: createEnhancedTooltipFormatter('pie', {
        showClickHint: props.enableInteractivity,
        customFormatter: (params: any) => {
          const percentage = ((params.value / totalValue.value) * 100).toFixed(1)
          return `${params.name}<br/>${params.seriesName}: ${params.value} (${percentage}%)`
        }
      }),
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: {
      show: false // Using custom legend
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: isDonut ? [props.innerRadius || '40%', props.outerRadius] : props.outerRadius,
        roseType: isRose ? 'area' : undefined,
        center: ['50%', '50%'],
        data: props.data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: props.colors[index % props.colors.length]
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        label: {
          show: !props.showLegend,
          position: 'outside',
          formatter: '{b}: {c}\n({d}%)',
          fontSize: 12,
          color: '#6b7280'
        },
        labelLine: {
          show: !props.showLegend,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#d1d5db'
          }
        }
      }
    ]
  }
})

const getItemColor = (index: number): string => {
  return props.colors[index % props.colors.length]
}

const calculatePercentage = (value: number): string => {
  if (totalValue.value === 0) return '0'
  return ((value / totalValue.value) * 100).toFixed(1)
}

const handleChartClick = async (params: any): Promise<void> => {
  // Convert ECElementEvent to ChartClickParams format
  const chartParams: ChartClickParams = {
    componentType: params.componentType,
    seriesType: params.seriesType || 'pie',
    seriesIndex: params.seriesIndex || 0,
    seriesName: params.seriesName || '',
    name: params.name || '',
    dataIndex: params.dataIndex || 0,
    data: params.data,
    dataType: params.dataType,
    value: params.value as number | number[],
    color: params.color || ''
  }
  
  // Emit the basic click event
  emit('click', chartParams)
  
  // Handle interactive drilling if enabled
  if (props.enableInteractivity) {
    try {
      await handleInteractiveChartClick(props.chartType, chartParams, {
        chartData: props.data,
        drillContext: props.drillContext
      })
    } catch (error) {
      console.error('Chart interaction failed:', error)
    }
  }
}

const handleLegendClick = (item: PieDataItem, index: number): void => {
  // Toggle item visibility in chart
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance) {
        chartInstance.dispatchAction({
          type: 'legendToggleSelect',
          name: item.name
        })
      }
    } catch (error) {
      console.error('Legend click failed:', error)
    }
  }
  
  emit('legendClick', { item, index })
}

const handleChartTypeChange = (value: any): void => {
  if (typeof value === 'string') {
    chartTypeSelection.value = value
    emit('chartTypeChange', value)
  } else if (value && typeof value.value === 'string') {
    chartTypeSelection.value = value.value
    emit('chartTypeChange', value.value)
  }
}

const exportChart = async (format: string = 'png'): Promise<any> => {
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

// Watch for chart type changes
watch(chartTypeSelection, async () => {
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    await nextTick()
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance) {
        chartInstance.setOption(chartOption.value, true)
      }
    } catch (error) {
      console.error('Failed to update chart type:', error)
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

.pie-chart-container {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
}

.legend-panel {
  @apply bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600;
}

.legend-item:hover {
  @apply shadow-sm;
}

.legend-color {
  @apply flex-shrink-0;
}

.legend-total {
  @apply bg-white dark:bg-gray-700 rounded-lg;
}

/* Loading state styling */
.pie-chart-container[data-loading="true"] {
  @apply opacity-50;
}
</style>