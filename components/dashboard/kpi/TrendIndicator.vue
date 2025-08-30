<script setup lang="ts">
import { computed } from 'vue'

// Define interfaces for type safety
interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
}

type TrendSize = 'xs' | 'sm' | 'md' | 'lg';

interface Props {
  trend: TrendData;
  showPercentage?: boolean;
  size?: TrendSize;
}

const props = withDefaults(defineProps<Props>(), {
  showPercentage: true,
  size: 'sm'
})

const trendClasses = computed(() => {
  const baseClasses = 'flex items-center gap-1 px-2 py-1 rounded-full'

  const sizeClasses: Record<TrendSize, string> = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const directionClasses: Record<TrendData['direction'], string> = {
    up: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    stable: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  return `${baseClasses} ${sizeClasses[props.size]} ${directionClasses[props.trend.direction]}`
})

const trendIcon = computed(() => {
  const icons: Record<TrendData['direction'], string> = {
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

<template>
  <div :class="trendClasses" class="trend-indicator">
    <UIcon :name="trendIcon" class="w-4 h-4" />
    <span class="text-xs font-medium">{{ formattedPercentage }}</span>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.trend-indicator {
  display: inline-flex;
  user-select: none;
}
</style>