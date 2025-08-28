<template>
  <div :class="trendClasses" class="trend-indicator">
    <UIcon :name="trendIcon" class="w-4 h-4" />
    <span class="text-xs font-medium">{{ formattedPercentage }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  trend: {
    type: Object,
    required: true,
    validator: (value) => {
      return typeof value === 'object' && 
             'direction' in value && 
             'percentage' in value &&
             ['up', 'down', 'stable'].includes(value.direction)
    }
  },
  showPercentage: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'sm', // xs, sm, md, lg
  }
})

const trendClasses = computed(() => {
  const baseClasses = 'flex items-center gap-1 px-2 py-1 rounded-full'
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  const directionClasses = {
    up: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    stable: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  
  return `${baseClasses} ${sizeClasses[props.size]} ${directionClasses[props.trend.direction]}`
})

const trendIcon = computed(() => {
  const icons = {
    up: 'mdi:trending-up',
    down: 'mdi:trending-down',
    stable: 'mdi:trending-neutral'
  }
  
  return icons[props.trend.direction] || icons.stable
})

const formattedPercentage = computed(() => {
  if (!props.showPercentage) return ''
  
  const percentage = Math.abs(props.trend.percentage)
  const sign = props.trend.direction === 'up' ? '+' : props.trend.direction === 'down' ? '-' : ''
  
  return `${sign}${percentage.toFixed(1)}%`
})
</script>

<style scoped>
@reference "tailwindcss";

.trend-indicator {
  @apply inline-flex select-none;
}
</style>