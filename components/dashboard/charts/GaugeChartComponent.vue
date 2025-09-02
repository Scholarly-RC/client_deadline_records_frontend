<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { ComposeOption } from 'echarts/core'
import type {
  GaugeSeriesOption,
} from 'echarts/charts'
import type { ECElementEvent } from 'echarts'
import type { ChartClickParams } from '~/types/entities'

// Define the proper ECharts option type
type ECOption = ComposeOption<GaugeSeriesOption>

interface ThresholdConfig {
  value: number
  color: string
  label: string
}

interface Props {
  title?: string
  value: number
  min?: number
  max?: number
  unit?: string
  isLoading?: boolean
  showStyleToggle?: boolean
  showExport?: boolean
  showDetails?: boolean
  height?: string
  thresholds?: ThresholdConfig[]
}

interface Emits {
  (e: 'click', data: ChartClickParams): void
  (e: 'styleChange', style: string): void
  (e: 'export', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Gauge Chart',
  min: 0,
  max: 100,
  unit: '%',
  isLoading: false,
  showStyleToggle: true,
  showExport: true,
  showDetails: true,
  height: '300px',
  thresholds: () => [
    { value: 25, color: '#EF4444', label: 'Poor' },
    { value: 50, color: '#F59E0B', label: 'Fair' },
    { value: 75, color: '#10B981', label: 'Good' },
    { value: 100, color: '#059669', label: 'Excellent' }
  ]
})

const emit = defineEmits<Emits>()

const chartRef = ref<any>(null)
const gaugeStyle = ref<string>('arc')
const isMounted = ref<boolean>(false)

// Store cleanup functions
let resizeHandler: (() => void) | null = null

const styleOptions = [
  { label: 'Arc Gauge', value: 'arc' },
  { label: 'Full Circle', value: 'circle' },
  { label: 'Half Circle', value: 'half' }
] as const

const formattedValue = computed<string>(() => {
  return `${props.value.toFixed(1)}${props.unit}`
})

const performanceLabel = computed<string>(() => {
  for (let i = props.thresholds.length - 1; i >= 0; i--) {
    if (props.value >= props.thresholds[i].value) {
      return props.thresholds[i].label
    }
  }
  return 'Poor'
})

const performanceClass = computed<string>(() => {
  const performance = performanceLabel.value.toLowerCase()
  switch (performance) {
    case 'excellent':
      return 'text-green-600 dark:text-green-400'
    case 'good':
      return 'text-green-500 dark:text-green-400'
    case 'fair':
      return 'text-yellow-500 dark:text-yellow-400'
    case 'poor':
      return 'text-red-500 dark:text-red-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
})

const chartOption = computed<ECOption>(() => {
  const range = props.max - props.min
  const normalizedValue = ((props.value - props.min) / range) * 100

  // Generate color stops for gauge
  const axisLineColorStops: [number, string][] = props.thresholds.map((threshold) => {
    const normalizedThreshold = ((threshold.value - props.min) / range)
    return [normalizedThreshold, threshold.color]
  })

  let startAngle: number, endAngle: number, center: [string, string], radius: string

  switch (gaugeStyle.value) {
    case 'circle':
      startAngle = 0
      endAngle = 360
      center = ['50%', '50%']
      radius = '80%'
      break
    case 'half':
      startAngle = 180
      endAngle = 0
      center = ['50%', '70%']
      radius = '90%'
      break
    default: // arc
      startAngle = 225
      endAngle = -45
      center = ['50%', '60%']
      radius = '80%'
  }

  return {
    series: [
      {
        name: props.title,
        type: 'gauge',
        startAngle: startAngle,
        endAngle: endAngle,
        center: center,
        radius: radius,
        min: props.min,
        max: props.max,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 8,
            color: axisLineColorStops
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 8,
          offsetCenter: [0, '-20%'],
          itemStyle: {
            color: 'auto',
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 5
          }
        },
        axisTick: {
          length: 8,
          lineStyle: {
            color: 'auto',
            width: 1
          }
        },
        splitLine: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        axisLabel: {
          fontSize: 11,
          distance: -40,
          formatter: function (value) {
            return value.toFixed(0) + props.unit
          }
        },
        title: {
          fontSize: 14,
          fontWeight: 'bold',
          offsetCenter: [0, '40%']
        },
        detail: {
          fontSize: 24,
          fontWeight: 'bold',
          offsetCenter: [0, '10%'],
          valueAnimation: true,
          formatter: function (value) {
            return value.toFixed(1) + props.unit
          },
          color: 'auto'
        },
        data: [
          {
            value: props.value,
            name: props.title
          }
        ]
      }
    ]
  }
})

const handleChartClick = (params: any): void => {
  // Convert ECElementEvent to ChartClickParams format
  const chartParams: ChartClickParams = {
    componentType: params.componentType,
    seriesType: params.seriesType || 'gauge',
    seriesIndex: params.seriesIndex || 0,
    seriesName: params.seriesName || '',
    name: params.name || '',
    dataIndex: params.dataIndex || 0,
    data: params.data,
    dataType: params.dataType,
    value: params.value as number | number[],
    color: params.color || ''
  }

  emit('click', chartParams)
}

const handleStyleChange = (value: any): void => {
  if (typeof value === 'string') {
    gaugeStyle.value = value
    emit('styleChange', value)
  } else if (value && typeof value.value === 'string') {
    gaugeStyle.value = value.value
    emit('styleChange', value.value)
  }
}

const exportChart = (): void => {
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (!chartInstance || chartInstance.isDisposed()) {
        console.warn('Chart instance not available for export')
        return
      }

      const dataURL = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })

      // Create download link
      const link = document.createElement('a')
      link.download = `${props.title.replace(/\s+/g, '_').toLowerCase()}_gauge.png`
      link.href = dataURL
      link.click()

      emit('export', dataURL)
    } catch (error) {
      console.error('Export failed:', error)
      emit('export', { error })
    }
  } else {
    console.warn('Chart not ready for export')
    emit('export', { error: 'Chart not ready' })
  }
}

// Watch for value changes and animate
watch(() => props.value, async (newValue) => {
  if (!isMounted.value) return
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    await nextTick()
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance && !chartInstance.isDisposed()) {
        chartInstance.setOption({
          series: [{
            data: [{ value: newValue, name: props.title }]
          }]
        })
      }
    } catch (error) {
      console.error('Failed to update gauge value:', error)
    }
  }
})

// Watch for style changes
watch(gaugeStyle, async () => {
  if (!isMounted.value) return
  if (chartRef.value && typeof chartRef.value.getEchartsInstance === 'function') {
    await nextTick()
    try {
      const chartInstance = chartRef.value.getEchartsInstance()
      if (chartInstance && !chartInstance.isDisposed()) {
        chartInstance.setOption(chartOption.value, true)
      }
    } catch (error) {
      console.error('Failed to update gauge style:', error)
    }
  }
})

onMounted(async () => {
  isMounted.value = true
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

        // Handle window resize
        resizeHandler = () => {
          try {
            chartInstance.resize()
          } catch (error) {
            console.error('Chart resize failed:', error)
          }
        }

        window.addEventListener('resize', resizeHandler)

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

// Cleanup on unmount
onUnmounted(() => {
  isMounted.value = false
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <div class="flex items-center gap-2">
          <!-- Gauge Style Toggle -->
          <USelectMenu
            v-if="showStyleToggle"
            v-model="gaugeStyle"
            :options="styleOptions"
            size="sm"
            @update:model-value="handleStyleChange"
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
        :style="{ height: height }"
        @click="handleChartClick"
        class="w-full"
      />

      <!-- Additional Info -->
      <div v-if="showDetails" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Current Value</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-medium text-green-600 dark:text-green-400">{{ max }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Target</div>
        </div>
        <div class="text-center">
          <div :class="performanceClass" class="text-lg font-medium">{{ performanceLabel }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Performance</div>
        </div>
      </div>
    </div>
  </UCard>
</template>