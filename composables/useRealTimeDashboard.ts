/**
 * Real-time Dashboard Composable
 * Provides reactive real-time dashboard functionality for components
 */

import { ref, computed, onMounted, onUnmounted, watch, readonly } from 'vue'
import { useToast } from '../node_modules/@nuxt/ui/dist/runtime/composables/useToast'
import { useDashboardStore } from '../stores/dashboard'

interface RealTimeDashboardOptions {
  autoStart?: boolean;
  interval?: number;
  enableNotifications?: boolean;
  enableVisibilityOptimization?: boolean;
  [key: string]: any;
}

interface RefreshStatus {
  isActive: boolean;
  interval: number;
  lastRefresh: Date | null;
  refreshCount: number;
  connectionStatus: string;
  dataFreshness: any;
  timeSinceLastUpdate: string | null;
  isVisible: boolean;
}

export const useRealTimeDashboard = (options: RealTimeDashboardOptions = {}) => {
  const dashboardStore = useDashboardStore()
  
  // Configuration
  const config = {
    autoStart: options.autoStart !== false,
    interval: options.interval || 30000,
    enableNotifications: options.enableNotifications !== false,
    enableVisibilityOptimization: options.enableVisibilityOptimization !== false,
    ...options
  }
  
  // Reactive state
  const isRealTimeActive = ref(false)
  const lastRefreshTime = ref<Date | null>(null)
  const refreshCount = ref(0)
  const isVisible = ref(true)
  const connectionStatus = ref('connected') // connected, disconnected, error
  
  // Computed properties
  const dataFreshness = computed(() => dashboardStore.getDataFreshness())
  const needsRefresh = computed(() => dashboardStore.needsRefresh())
  const timeSinceLastUpdate = computed(() => {
    if (!dashboardStore.lastUpdated) return null
    
    const now = new Date()
    const lastUpdate = new Date(dashboardStore.lastUpdated)
    const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  })
  
  // Internal state
  let refreshInterval: NodeJS.Timeout | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  
  /**
   * Start real-time updates
   */
  const startRealTime = () => {
    if (isRealTimeActive.value) return

    dashboardStore.toggleRealtime(true)
    dashboardStore.startRealTimeUpdates(config.interval)
    
    isRealTimeActive.value = true
    connectionStatus.value = 'connected'
    reconnectAttempts = 0
    
    if (config.enableNotifications) {
      const toast = useToast()
      toast.add({
        title: 'Real-time Updates',
        description: 'Dashboard will update automatically',
        color: 'success'
      })
    }
  }
  
  /**
   * Stop real-time updates
   */
  const stopRealTime = () => {
    if (!isRealTimeActive.value) return
    
    dashboardStore.toggleRealtime(false)
    dashboardStore.stopRealTimeUpdates()
    
    isRealTimeActive.value = false
    connectionStatus.value = 'disconnected'
    
    if (config.enableNotifications) {
      const toast = useToast()
      toast.add({
        title: 'Real-time Updates Paused',
        description: 'Dashboard updates have been disabled',
        color: 'neutral'
      })
    }
  }
  
  /**
   * Toggle real-time updates
   */
  const toggleRealTime = () => {
    if (isRealTimeActive.value) {
      stopRealTime()
    } else {
      startRealTime()
    }
  }
  
  /**
   * Force refresh dashboard data
   */
  const forceRefresh = async () => {
    try {
      connectionStatus.value = 'connected'
      await dashboardStore.refreshDashboard(true)
      
      refreshCount.value++
      lastRefreshTime.value = new Date()
      
      return true
    } catch (error) {
      console.error('Force refresh failed:', error)
      connectionStatus.value = 'error'
      
      // Attempt to reconnect if this was part of real-time updates
      if (isRealTimeActive.value && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++
          forceRefresh()
        }, 5000 * reconnectAttempts) // Exponential backoff
      }
      
      throw error
    }
  }
  
  /**
   * Update refresh interval
   */
  const updateInterval = (newInterval: number) => {
    config.interval = newInterval
    
    if (isRealTimeActive.value) {
      // Restart with new interval
      stopRealTime()
      setTimeout(startRealTime, 100)
    }
  }
  
  /**
   * Handle visibility change (pause updates when tab is hidden)
   */
  const handleVisibilityChange = () => {
    if (!config.enableVisibilityOptimization) return
    
    const wasVisible = isVisible.value
    isVisible.value = !document.hidden
    
    if (!wasVisible && isVisible.value && isRealTimeActive.value) {
      // Tab became visible, check if we need to refresh
      if (needsRefresh.value) {
        forceRefresh()
      }
    }
  }
  
  /**
   * Get refresh status information
   */
  const getRefreshStatus = () => {
    return {
      isActive: isRealTimeActive.value,
      interval: config.interval,
      lastRefresh: lastRefreshTime.value,
      refreshCount: refreshCount.value,
      connectionStatus: connectionStatus.value,
      dataFreshness: dataFreshness.value,
      timeSinceLastUpdate: timeSinceLastUpdate.value,
      isVisible: isVisible.value
    }
  }
  
  /**
   * Set up periodic freshness checks
   */
  const setupFreshnessMonitoring = () => {
    setInterval(() => {
      if (needsRefresh.value && !isRealTimeActive.value) {
        // Data is stale, consider enabling real-time updates
      }
    }, 60000) // Check every minute
  }
  
  // Lifecycle hooks
  onMounted(() => {
    // Set up visibility monitoring
    if (config.enableVisibilityOptimization) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    
    // Start real-time updates if auto-start is enabled
    if (config.autoStart) {
      startRealTime()
    }
    
    // Set up freshness monitoring
    setupFreshnessMonitoring()
    
    // Initial refresh if data is stale
    if (needsRefresh.value) {
      forceRefresh()
    }
  })
  
  onUnmounted(() => {
    // Clean up
    stopRealTime()
    
    if (config.enableVisibilityOptimization) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })
  
  // Watch for store state changes
  watch(() => dashboardStore.realtimeEnabled, (newValue) => {
    isRealTimeActive.value = newValue
  })
  
  return {
    // State
    isRealTimeActive: readonly(isRealTimeActive),
    connectionStatus: readonly(connectionStatus),
    dataFreshness,
    needsRefresh,
    timeSinceLastUpdate,
    isVisible: readonly(isVisible),
    
    // Actions
    startRealTime,
    stopRealTime,
    toggleRealTime,
    forceRefresh,
    updateInterval,
    getRefreshStatus,
    
    // Configuration
    config: readonly(ref(config))
  }
}

/**
 * Simplified composable for basic real-time functionality
 */
export const useBasicRealTime = () => {
  const dashboardStore = useDashboardStore()
  
  return {
    isEnabled: computed(() => dashboardStore.realtimeEnabled),
    lastUpdated: computed(() => dashboardStore.lastUpdated),
    toggle: () => dashboardStore.toggleRealtime(),
    refresh: () => dashboardStore.refreshDashboard(true)
  }
}