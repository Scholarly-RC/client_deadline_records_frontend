<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { ComposeOption } from 'echarts/core'
import type {
  LineSeriesOption,
} from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
  DataZoomComponentOption,
  BrushComponentOption,
  ToolboxComponentOption
} from 'echarts/components'
import type { ECElementEvent } from 'echarts'
import { useChartInteractivity } from '~/composables/useChartInteractivity.js'
import type { ChartClickParams } from '~/types/entities'

// Define the proper ECharts option type
type ECOption = ComposeOption<
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | DataZoomComponentOption
  | BrushComponentOption
  | ToolboxComponentOption
>

// Define props interface
interface LineDataset {
  name: string
  data: number[]
  showArea?: boolean
}

interface LineChartData {
  xAxis: string[]
  datasets: LineDataset[]
}

interface Props {
  title?: string
  data: LineChartData
  isLoading?: boolean
  showTimeRange?: boolean
  showExport?: boolean
  colors?: string[]
  smooth?: boolean
  height?: string
  chartType?: string
  enableInteractivity?: boolean
  drillContext?: Record<string, any>
}

interface Emits {
  (e: 'click', data: ChartClickParams): void
  (e: 'timeRangeChange', value: string): void
  (e: 'export', data: any): void
  (e: 'drill', data: { params: ChartClickParams; context: any; chartType: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Line Chart',
  isLoading: false,
  showTimeRange: true,
  showExport: true,
  colors: () => ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  smooth: true,
  height: '400px',
  chartType: 'trends',
  enableInteractivity: true,
  drillContext: () => ({})
})

const emit = defineEmits<Emits>()

const chartRef = ref<any>(null)
const selectedTimeRange = ref<string>('7d')
const realTimeCleanup = ref<(() => void) | null>(null)

// Enhanced interactivity with composable
const {
  initializeChartInteractivity,
  handleChartClick: handleInteractiveChartClick,
  exportChart: exportInteractiveChart,
  createEnhancedTooltipFormatter,
  enableRealTimeUpdates,
  resetChartZoom,
  isExporting,
  exportProgress
} = useChartInteractivity({
  customDrillHandlers: {
    [props.chartType]: (params: any, context: any) => {
      emit('drill', { params, context, chartType: props.chartType })
    }
  }
})

const timeRangeOptions = [
  { label: '24 Hours', value: '1d' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' }
] as const

const chartOption = computed<ECOption>(() => {
  if (!props.data || !props.data.xAxis || !props.data.datasets) {
    return {}
  }

  return {
    title: {
      show: false // Title is handled by the card header
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: createEnhancedTooltipFormatter(props.chartType, {
        showClickHint: props.enableInteractivity
      })
    },
    legend: {
      data: props.data.datasets.map(dataset => dataset.name),
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: props.data.datasets.map((dataset, index) => ({
      name: dataset.name,
      type: 'line',
      data: dataset.data,
      smooth: props.smooth,
      itemStyle: {
        color: props.colors[index % props.colors.length]
      },
      lineStyle: {
        color: props.colors[index % props.colors.length],
        width: 2
      },
      areaStyle: dataset.showArea ? {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: props.colors[index % props.colors.length] + '40'
            },
            {
              offset: 1,
              color: props.colors[index % props.colors.length] + '10'
            }
          ]
        }
      } : undefined,
      emphasis: {
        focus: 'series'
      }
    })),
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        filterMode: 'filter'
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 20,
        bottom: 40,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.2h6.6V19.6z',
        handleSize: '80%',
        showDetail: false
      }
    ],
    brush: {
      toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
      xAxisIndex: 0
    },
    toolbox: {
      show: props.enableInteractivity,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        brush: {
          type: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear']
        },
        restore: {},
        saveAsImage: {
          name: props.title.replace(/\s+/g, '_').toLowerCase()
        }
      },
      right: '2%',
      top: '2%'
    }
  }
})

const handleChartClick = async (params: any): Promise<void> => {
  // Convert ECElementEvent to ChartClickParams format
  const chartParams: ChartClickParams = {
    componentType: params.componentType,
    seriesType: params.seriesType || 'line',
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
        timeRange: selectedTimeRange.value,
        drillContext: props.drillContext,
        chartData: props.data
      })
    } catch (error) {
      console.error('Chart interaction failed:', error)
    }
  }
}

const handleTimeRangeChange = (value: any): void => {
  if (typeof value === 'string') {
    selectedTimeRange.value = value
    emit('timeRangeChange', value)
  } else if (value && typeof value.value === 'string') {
    selectedTimeRange.value = value.value
    emit('timeRangeChange', value.value)
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
            enableZoomPan: true,
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

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <div class="flex items-center gap-2">
          <!-- Time Range Selector -->
          <USelectMenu
            v-if="showTimeRange"
            v-model="selectedTimeRange"
            :options="timeRangeOptions"
            size="sm"
            @update:model-value="handleTimeRangeChange"
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

    <div>
      <VChart
        ref="chartRef"
        :option="chartOption"
        :autoresize="true"
        :loading="isLoading"
        style="height: 400px;"
        @click="handleChartClick"
        class="w-full"
      />
    </div>
  </UCard>
</template>