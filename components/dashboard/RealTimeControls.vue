<template>
  <div class="real-time-controls flex items-center gap-3">
    <!-- Real-time Status Indicator -->
    <div class="flex items-center gap-2">
      <div 
        :class="statusIndicatorClass" 
        class="w-2 h-2 rounded-full transition-all duration-200"
      ></div>
      <span class="text-xs text-gray-600 dark:text-gray-400">
        {{ statusText }}
      </span>
    </div>
    
    <!-- Last Updated Time -->
    <div v-if="timeSinceLastUpdate" class="text-xs text-gray-500 dark:text-gray-400">
      Updated {{ timeSinceLastUpdate }}
    </div>
    
    <!-- Refresh Button -->
    <UButton
      @click="handleRefresh"
      :loading="isRefreshing"
      variant="ghost"
      size="sm"
      icon="mdi:refresh"
      :class="{ 'animate-spin': isRefreshing }"
    >
      <span class="hidden sm:inline">Refresh</span>
    </UButton>
    
    <!-- Real-time Toggle -->
    <UToggle
      v-model="realTimeEnabled"
      @change="handleToggle"
      :disabled="isRefreshing"
    />
    
    <!-- Settings Dropdown -->
    <UDropdown :items="settingsMenuItems" :popper="{ placement: 'bottom-end' }">
      <UButton variant="ghost" size="sm" icon="mdi:cog" />
      
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <UIcon :name="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
          <span v-if="item.value" class="ml-auto text-xs text-gray-500">{{ item.value }}</span>
        </div>
      </template>
    </UDropdown>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRealTimeDashboard } from '~/composables/useRealTimeDashboard.js'

const props = defineProps({
  autoStart: {
    type: Boolean,
    default: true
  },
  showSettings: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 30000
  }
})

const emit = defineEmits(['statusChange', 'refresh', 'intervalChange'])

// Real-time dashboard composable
const {
  isRealTimeActive,
  connectionStatus,
  dataFreshness,
  timeSinceLastUpdate,
  startRealTime,
  stopRealTime,
  toggleRealTime,
  forceRefresh,
  updateInterval,
  getRefreshStatus
} = useRealTimeDashboard({
  autoStart: props.autoStart,
  interval: props.interval,
  enableNotifications: true,
  enableVisibilityOptimization: true
})

// Local state
const isRefreshing = ref(false)
const realTimeEnabled = ref(isRealTimeActive.value)
const selectedInterval = ref(props.interval)

// Computed properties
const statusIndicatorClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'bg-green-500 animate-pulse'
    case 'disconnected':
      return 'bg-gray-400'
    case 'error':
      return 'bg-red-500 animate-pulse'
    default:
      return 'bg-gray-400'
  }
})

const statusText = computed(() => {
  if (isRealTimeActive.value) {
    switch (connectionStatus.value) {
      case 'connected':
        return 'Live'
      case 'error':
        return 'Error'
      default:
        return 'Connecting'
    }
  }
  return 'Paused'
})

const intervalOptions = [
  { label: '10 seconds', value: 10000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
  { label: '10 minutes', value: 600000 }
]

const settingsMenuItems = computed(() => {
  const items = [
    [{
      label: 'Refresh Interval',
      icon: 'mdi:timer',
      children: intervalOptions.map(option => ({
        label: option.label,
        value: option.value,
        click: () => handleIntervalChange(option.value),
        active: selectedInterval.value === option.value
      }))
    }]
  ]
  
  if (props.showSettings) {
    items[0].push({
      label: 'Auto-refresh when visible',
      icon: 'mdi:eye',
      click: () => {
        // Toggle visibility optimization
      }
    })
  }
  
  return items
})

// Event handlers
const handleRefresh = async () => {
  try {
    isRefreshing.value = true
    await forceRefresh()
    emit('refresh', getRefreshStatus())
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    isRefreshing.value = false
  }
}

const handleToggle = (enabled) => {
  realTimeEnabled.value = enabled
  toggleRealTime()
  emit('statusChange', { enabled, status: getRefreshStatus() })
}

const handleIntervalChange = (newInterval) => {
  selectedInterval.value = newInterval
  updateInterval(newInterval)
  emit('intervalChange', newInterval)
  
  const toast = useToast()
  const intervalText = intervalOptions.find(opt => opt.value === newInterval)?.label || 'custom'
  toast.add({
    title: 'Refresh Interval Updated',
    description: `Dashboard will update every ${intervalText}`,
    color: 'success',
    timeout: 3000
  })
}

// Watch for external changes
watch(isRealTimeActive, (newValue) => {
  realTimeEnabled.value = newValue
})

// Provide refresh status to parent components
defineExpose({
  getRefreshStatus,
  forceRefresh: handleRefresh,
  toggle: handleToggle,
  setInterval: handleIntervalChange
})
</script>

<style scoped>
@reference "tailwindcss";

.real-time-controls {
  @apply bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600;
}

/* Pulsing animation for live status */
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

/* Spinning animation for refresh button */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>