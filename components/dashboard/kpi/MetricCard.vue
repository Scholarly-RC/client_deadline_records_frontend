<template>
  <UCard :class="cardClasses">
    <div class="flex items-center justify-between">
      <!-- Content Section -->
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <p class="metric-title text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 truncate">
          {{ title }}
        </p>
        
        <!-- Value and Trend -->
        <div class="metric-value-container flex items-center gap-2 mb-1">
          <template v-if="isLoading">
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-20"></div>
          </template>
          <template v-else>
            <span class="metric-value text-2xl font-bold text-gray-900 dark:text-white">
              {{ formattedValue }}
            </span>
            <TrendIndicator v-if="trend && showTrend" :trend="trend" />
          </template>
        </div>
        
        <!-- Subtitle -->
        <p v-if="subtitle && !isLoading" class="metric-subtitle text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ subtitle }}
        </p>
        
        <!-- Progress Bar -->
        <div v-if="showProgress && !isLoading" class="metric-progress mt-2">
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{{ progressPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              :class="progressBarClasses"
              :style="{ width: `${Math.min(progressPercentage, 100)}%` }"
              class="h-2 rounded-full transition-all duration-500 ease-out"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Icon Section -->
      <div :class="iconClasses">
        <UIcon :name="icon" class="w-8 h-8" />
      </div>
    </div>
    
    <!-- Action Button -->
    <div v-if="actionLabel && !isLoading" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
      <UButton 
        :label="actionLabel"
        variant="ghost"
        size="sm"
        class="w-full justify-center"
        @click="handleAction"
        :disabled="actionDisabled"
      >
        <template v-if="actionIcon" #leading>
          <UIcon :name="actionIcon" />
        </template>
      </UButton>
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

type CardVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type IconColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray';
type FormatType = 'number' | 'currency' | 'percentage';

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  iconColor?: IconColor;
  trend?: TrendInfo | null;
  showTrend?: boolean;
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
  format?: FormatType;
  locale?: string;
  currency?: string;
  isLoading?: boolean;
  actionLabel?: string;
  actionIcon?: string;
  actionDisabled?: boolean;
  variant?: CardVariant;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  iconColor: 'blue',
  trend: null,
  showTrend: true,
  showProgress: false,
  progressValue: 0,
  progressMax: 100,
  format: 'number',
  locale: 'en-US',
  currency: 'USD',
  isLoading: false,
  actionLabel: '',
  actionIcon: '',
  actionDisabled: false,
  variant: 'default'
})

const emit = defineEmits(['action'])

const cardClasses = computed(() => {
  const base = 'metric-card transition-all duration-200 hover:shadow-md'
  const variants: Record<CardVariant, string> = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  }
  
  return `${base} ${variants[props.variant] || variants.default}`
})

const iconClasses = computed(() => {
  const colors: Record<IconColor, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  }
  
  return `p-3 rounded-xl ${colors[props.iconColor] || colors.blue}`
})

const progressBarClasses = computed(() => {
  const percentage = progressPercentage.value
  
  if (percentage >= 80) {
    return 'bg-green-500'
  } else if (percentage >= 60) {
    return 'bg-blue-500'
  } else if (percentage >= 40) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
})

const progressPercentage = computed(() => {
  if (props.progressMax === 0) return 0
  return Math.round((props.progressValue / props.progressMax) * 100)
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  const numValue = Number(props.value)
  if (isNaN(numValue)) return props.value
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat(props.locale, {
        style: 'currency',
        currency: props.currency
      }).format(numValue)
    
    case 'percentage':
      return new Intl.NumberFormat(props.locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(numValue / 100)
    
    case 'number':
    default:
      return new Intl.NumberFormat(props.locale).format(numValue)
  }
})

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
@reference "tailwindcss";

.metric-card {
  @apply rounded-lg shadow-sm border overflow-hidden;
}

.metric-title {
  @apply select-none;
}

.metric-value {
  @apply select-none;
}

.metric-subtitle {
  @apply select-none;
}

.metric-progress {
  @apply select-none;
}

/* Hover effects */
.metric-card:hover {
  @apply shadow-lg transform scale-[1.02];
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>