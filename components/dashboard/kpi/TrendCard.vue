<template>
  <UCard :class="cardClasses">
    <!-- Header -->
    <div class="card-header flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ title }}</h3>
        <p v-if="description" class="text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
      </div>
      <UBadge :color="trendColor" variant="subtle">{{ trendLabel }}</UBadge>
    </div>
    
    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Metrics Section -->
      <div class="metrics-section">
        <template v-if="isLoading">
          <div class="space-y-3">
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          </div>
        </template>
        <template v-else>
          <!-- Primary Metric -->
          <div class="primary-metric mb-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</span>
              <TrendIndicator v-if="trend" :trend="trend" />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ valueLabel }}</p>
          </div>
          
          <!-- Secondary Metrics -->
          <div v-if="secondaryMetrics && secondaryMetrics.length" class="secondary-metrics space-y-2">
            <div 
              v-for="metric in secondaryMetrics" 
              :key="metric.label"
              class="flex justify-between items-center"
            >
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ metric.label }}</span>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metric.value }}</span>
                <TrendIndicator 
                  v-if="metric.trend" 
                  :trend="metric.trend" 
                  size="xs" 
                  :show-percentage="false" 
                />
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Mini Chart Section -->
      <div class="chart-section">
        <template v-if="isLoading">
          <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </template>
        <template v-else-if="chartData && chartData.length">
          <VChart 
            :option="miniChartOption" 
            :autoresize="true" 
            style="height: 80px;"
            class="w-full"
          />
        </template>
        <template v-else>
          <div class="h-20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <span class="text-sm text-gray-400">No chart data</span>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Footer Actions -->
    <div v-if="actions && actions.length && !isLoading" class="footer-actions mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div class="flex gap-2">
        <UButton 
          v-for="action in actions"
          :key="action.label"
          :label="action.label"
          :variant="action.variant || 'ghost'"
          :color="action.color || 'neutral'"
          size="sm"
          @click="handleAction(action)"
          :disabled="action.disabled"
        >
          <template v-if="action.icon" #leading>
            <UIcon :name="action.icon" />
          </template>
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TrendIndicator from './TrendIndicator.vue'

// Define interfaces for type safety
interface TrendInfo {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  value?: number;
}

interface SecondaryMetric {
  label: string;
  value: string | number;
  trend?: TrendInfo;
}

interface ActionButton {
  label: string;
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost';
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
  disabled?: boolean;
  icon?: string;
  action: string;
}

type CardVariant = 'default' | 'success' | 'warning' | 'error';
type FormatType = 'number' | 'currency' | 'percentage';
type ChartType = 'line' | 'area' | 'bar';

interface Props {
  title: string;
  description?: string;
  value: number | string;
  valueLabel?: string;
  trend?: TrendInfo | null;
  secondaryMetrics?: SecondaryMetric[];
  chartData?: number[];
  chartType?: ChartType;
  actions?: ActionButton[];
  isLoading?: boolean;
  format?: FormatType;
  variant?: CardVariant;
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  valueLabel: 'Current Value',
  trend: null,
  secondaryMetrics: () => [],
  chartData: () => [],
  chartType: 'line',
  actions: () => [],
  isLoading: false,
  format: 'number',
  variant: 'default'
})

const emit = defineEmits(['action'])

const cardClasses = computed(() => {
  const base = 'trend-card transition-all duration-200 hover:shadow-lg'
  const variants: Record<CardVariant, string> = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }
  
  return `${base} ${variants[props.variant] || variants.default}`
})

const trendColor = computed((): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  if (!props.trend) return 'neutral'
  
  switch (props.trend.direction) {
    case 'up':
      return 'success'
    case 'down':
      return 'error'
    default:
      return 'neutral'
  }
})

const trendLabel = computed(() => {
  if (!props.trend) return 'No Change'
  
  const labels: Record<string, string> = {
    up: 'Increasing',
    down: 'Decreasing',
    stable: 'Stable'
  }
  
  return labels[props.trend.direction] || 'Stable'
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  const numValue = Number(props.value)
  if (isNaN(numValue)) return props.value
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(numValue)
    
    case 'percentage':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(numValue / 100)
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(numValue)
  }
})

const miniChartOption = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return {}
  
  const baseOption = {
    grid: {
      left: 0,
      right: 0,
      top: 5,
      bottom: 5
    },
    xAxis: {
      type: 'category',
      show: false,
      data: props.chartData.map((_, index) => index)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    }
  }
  
  const series = {
    type: props.chartType === 'bar' ? 'bar' : 'line',
    data: props.chartData,
    smooth: props.chartType === 'line',
    symbol: 'none',
    lineStyle: {
      width: 2,
      color: trendColor.value === 'success' ? '#10B981' : trendColor.value === 'error' ? '#EF4444' : '#6B7280'
    },
    itemStyle: {
      color: trendColor.value === 'success' ? '#10B981' : trendColor.value === 'error' ? '#EF4444' : '#6B7280'
    }
  }
  
  if (props.chartType === 'area') {
    (series as any).areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: (trendColor.value === 'success' ? '#10B981' : trendColor.value === 'error' ? '#EF4444' : '#6B7280') + '40'
          },
          {
            offset: 1,
            color: (trendColor.value === 'success' ? '#10B981' : trendColor.value === 'error' ? '#EF4444' : '#6B7280') + '10'
          }
        ]
      }
    }
  }
  
  return {
    ...baseOption,
    series: [series]
  }
})

const handleAction = (action: ActionButton): void => {
  emit('action', action)
}
</script>

<style scoped>
@reference "tailwindcss";

.trend-card {
  @apply rounded-lg shadow-sm border overflow-hidden;
}

.card-header {
  @apply select-none;
}

.primary-metric {
  @apply select-none;
}

.secondary-metrics {
  @apply select-none;
}

/* Hover effects */
.trend-card:hover {
  @apply transform scale-[1.01];
}
</style>