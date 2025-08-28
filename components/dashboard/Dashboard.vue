<script setup>
// Enhanced Dashboard Components
import PageHeader from "../ui/PageHeader.vue"
import DashboardLayoutSwitcher from "./DashboardLayoutSwitcher.vue"
import RealTimeControls from "./RealTimeControls.vue"
import ExecutiveDashboardLayout from "./layouts/ExecutiveDashboardLayout.vue"
import OperationsDashboardLayout from "./layouts/OperationsDashboardLayout.vue"
import AnalyticsDashboardLayout from "./layouts/AnalyticsDashboardLayout.vue"
import PersonalDashboardLayout from "./layouts/PersonalDashboardLayout.vue"

// Legacy components for fallback
import ClientBirthdays from "./ClientBirthdays.vue"
import Stats from "./Stats.vue"

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const { currentLayout, isAnyLoading, realtimeEnabled } = storeToRefs(dashboardStore)
const { isAdmin } = storeToRefs(authStore)

const isRefreshing = ref(false)
const showLegacyFallback = ref(false)

// Layout component mapping
const layoutComponents = {
  executive: ExecutiveDashboardLayout,
  operations: OperationsDashboardLayout,
  analytics: AnalyticsDashboardLayout,
  personal: PersonalDashboardLayout
}

const currentLayoutComponent = computed(() => {
  return layoutComponents[currentLayout.value] || OperationsDashboardLayout
})

// Enhanced data loading
const loadDashboardData = async () => {
  try {
    isRefreshing.value = true
    
    // Load enhanced dashboard data
    await dashboardStore.fetchEnhancedDashboardData()
    
    // Load legacy data for backward compatibility if needed
    if (showLegacyFallback.value) {
      await dashboardStore.getDashboardData()
    }
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    // Fallback to legacy components on error
    showLegacyFallback.value = true
    await dashboardStore.loadAllDashboardData()
  } finally {
    isRefreshing.value = false
  }
}

// Real-time data refresh
const handleRefresh = async () => {
  await loadDashboardData()
}

// Toggle real-time updates
const handleToggleRealtime = () => {
  dashboardStore.toggleRealtime()
}

// Handle real-time status changes
const handleRealtimeStatusChange = (data) => {
  console.log('Real-time status changed:', data)
  // Additional logic for status changes can be added here
}

// Handle refresh interval changes
const handleIntervalChange = (newInterval) => {
  console.log('Refresh interval changed to:', newInterval)
  // Additional logic for interval changes can be added here
}

// Export dashboard functionality
const handleExport = async (format) => {
  const toast = useToast()
  
  try {
    switch (format) {
      case 'pdf':
        // PDF export logic would go here
        toast.add({
          title: 'Export Started',
          description: 'Your dashboard PDF is being generated...',
          color: 'success'
        })
        break
      case 'png':
        // PNG export logic would go here
        toast.add({
          title: 'Export Started', 
          description: 'Your dashboard image is being generated...',
          color: 'success'
        })
        break
      case 'csv':
        // CSV export logic would go here
        toast.add({
          title: 'Export Started',
          description: 'Your dashboard data is being exported...',
          color: 'success'
        })
        break
    }
  } catch (error) {
    toast.add({
      title: 'Export Failed',
      description: 'Failed to export dashboard data',
      color: 'error'
    })
  }
}

// Navigation handler
const handleNavigation = (route) => {
  navigateTo(route)
}

// Chart click handler for data drilling
const handleChartClick = (data) => {
  console.log('Chart clicked:', data)
  // Implement chart drilling logic here
  // Could open modals, navigate to filtered views, etc.
}

// Alert action handler
const handleAlertAction = (alert) => {
  console.log('Alert action:', alert)
  // Implement alert-specific actions
  switch (alert.type) {
    case 'error':
      if (alert.title === 'Overdue Tasks') {
        navigateTo('/tasks?filter=overdue')
      }
      break
    case 'warning':
      if (alert.title === 'High Priority Tasks') {
        navigateTo('/tasks?filter=high_priority')
      }
      break
  }
}

// Modal opening handler
const handleOpenModal = (modalType) => {
  console.log('Open modal:', modalType)
  // Implement modal opening logic
  // This would integrate with your existing modal system
}

// Action handler for various dashboard actions
const handleAction = (action) => {
  console.log('Dashboard action:', action)
  // Implement action-specific logic
}

// Error boundary for layout components
const handleLayoutError = (error) => {
  console.error('Layout error:', error)
  showLegacyFallback.value = true
}

// Initialize dashboard data on mount
onMounted(async () => {
  await loadDashboardData()
})

// Cleanup real-time updates on unmount
onUnmounted(() => {
  if (realtimeEnabled.value) {
    dashboardStore.stopRealTimeUpdates()
  }
})
</script>

<template>
  <div class="enhanced-dashboard h-screen flex flex-col flex-1 overflow-hidden">
    <!-- Enhanced Header with Layout Switcher and Real-time Controls -->
    <PageHeader page="Dashboard">
      <template #actions>
        <div class="flex items-center gap-4">
          <!-- Real-time Controls -->
          <RealTimeControls
            :auto-start="true"
            :interval="30000"
            @refresh="handleRefresh"
            @status-change="handleRealtimeStatusChange"
            @interval-change="handleIntervalChange"
          />
          
          <!-- Layout Switcher -->
          <DashboardLayoutSwitcher
            v-model="currentLayout"
            :is-refreshing="isRefreshing"
            :realtime-enabled="realtimeEnabled"
            :show-quick-actions="true"
            :show-export-options="isAdmin"
            @refresh="handleRefresh"
            @toggle-realtime="handleToggleRealtime"
            @export="handleExport"
          />
        </div>
      </template>
    </PageHeader>

    <!-- Enhanced Dashboard Content -->
    <main class="dashboard-content flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
      <!-- Loading Overlay -->
      <div v-if="isAnyLoading && !showLegacyFallback" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Enhanced Layout Content -->
      <div v-else-if="!showLegacyFallback" class="layout-container overflow-y-auto">
        <Suspense>
          <template #default>
            <component 
              :is="currentLayoutComponent"
              @navigate="handleNavigation"
              @chart-click="handleChartClick"
              @alert-action="handleAlertAction"
              @open-modal="handleOpenModal"
              @action="handleAction"
            />
          </template>
          <template #fallback>
            <div class="fallback-loading">
              <div class="loading-spinner"></div>
              <p>Loading dashboard layout...</p>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- Legacy Fallback Content -->
      <div v-else class="legacy-content overflow-y-auto p-4">
        <div class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex items-center gap-2">
            <UIcon name="mdi:information" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span class="text-sm text-yellow-800 dark:text-yellow-200">
              Enhanced dashboard temporarily unavailable. Showing basic view.
            </span>
            <UButton 
              @click="showLegacyFallback = false; loadDashboardData()" 
              variant="ghost" 
              size="sm"
              class="ml-auto"
            >
              Retry Enhanced View
            </UButton>
          </div>
        </div>
        
        <div class="space-y-6">
          <!-- Legacy Stats cards -->
          <Stats />
          <!-- Legacy Client Birthdays -->
          <ClientBirthdays />
        </div>
      </div>
    </main>

    <!-- Real-time Status Indicator -->
    <div v-if="realtimeEnabled" class="realtime-indicator">
      <div class="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">
        <div class="realtime-dot"></div>
        <span>Live updates enabled</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.enhanced-dashboard {
  position: relative;
  transition: background-color 0.2s ease-in-out;
}

.dashboard-content {
  position: relative;
  max-height: calc(100vh - 4rem);
}

.layout-container {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.legacy-content {
  max-height: calc(100vh - 4rem);
}

/* Loading States */
.loading-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.dark .loading-overlay {
  background-color: rgba(17, 24, 39, 0.9);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 500;
}

.dark .loading-text {
  color: #9ca3af;
}

.fallback-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 16rem;
  color: #6b7280;
}

.dark .fallback-loading {
  color: #9ca3af;
}

.fallback-loading .loading-spinner {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.75rem;
}

/* Real-time Indicator */
.realtime-indicator {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 40;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.realtime-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Error Boundary Styles */
.error-boundary {
  padding: 2rem;
  text-align: center;
}

.error-boundary h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.dark .error-boundary h3 {
  color: #f87171;
}

.error-boundary p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.dark .error-boundary p {
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-content {
    max-height: calc(100vh - 3rem);
  }
  
  .realtime-indicator {
    bottom: 0.5rem;
    right: 0.5rem;
  }
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  .realtime-dot {
    animation: none;
  }
  
  .layout-container {
    transition: none;
  }
  
  .enhanced-dashboard {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .loading-overlay {
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  .dark .loading-overlay {
    background-color: rgba(17, 24, 39, 0.95);
  }
  
  .loading-spinner {
    border-color: #000000;
    border-top-color: #ffffff;
  }
}

/* Print styles */
@media print {
  .realtime-indicator {
    display: none;
  }
  
  .loading-overlay {
    display: none;
  }
}
</style>
