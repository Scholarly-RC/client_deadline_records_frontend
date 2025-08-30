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

interface Props {
  title: string;
  description?: string;
  value: number | string;
  valueLabel?: string;
  trend?: TrendInfo | null;
  secondaryMetrics?: SecondaryMetric[];
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



const handleAction = (action: ActionButton): void => {
  emit('action', action)
}
</script>

<template>
  <UCard :class="cardClasses">
    <!-- Header -->
    <div class="card-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-4">
      <div class="flex-1">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ title }}</h3>
        <p v-if="description" class="text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
      </div>
      <UBadge :color="trendColor" variant="subtle" size="sm">{{ trendLabel }}</UBadge>
    </div>

    <!-- Main Content -->
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
            <span class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</span>
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

<style scoped>
@reference "tailwindcss";

.trend-card {
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgb(229 231 235);
  overflow: hidden;
}

.card-header {
  user-select: none;
}

.primary-metric {
  user-select: none;
}

.secondary-metrics {
  user-select: none;
}

/* Hover effects */
.trend-card:hover {
  transform: scale(1.01);
}
</style>