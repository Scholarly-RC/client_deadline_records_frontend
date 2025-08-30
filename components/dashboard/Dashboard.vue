<script setup lang="ts">
// Dashboard Components
import PageHeader from "~/components/ui/PageHeader.vue"
import MetricCard from "~/components/dashboard/kpi/MetricCard.vue"
import TrendCard from "~/components/dashboard/kpi/TrendCard.vue"
import PieChartComponent from "~/components/dashboard/charts/PieChartComponent.vue"
import BarChartComponent from "~/components/dashboard/charts/BarChartComponent.vue"
import LineChartComponent from "~/components/dashboard/charts/LineChartComponent.vue"
import TeamPerformancePanel from "~/components/dashboard/panels/TeamPerformancePanel.vue"
import ClientInsightsPanel from "~/components/dashboard/panels/ClientInsightsPanel.vue"
import ApprovalWorkflowPanel from "~/components/dashboard/panels/ApprovalWorkflowPanel.vue"

// Type imports
import type { Ref } from 'vue'
import type { User } from '~/types/entities'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const { enhancedStats, isAnyLoading } = storeToRefs(dashboardStore)
const { isAdmin } = storeToRefs(authStore)

const isRefreshing: Ref<boolean> = ref(false)

// Data loading
const loadDashboardData = async (): Promise<void> => {
  try {
    isRefreshing.value = true
    await dashboardStore.fetchEnhancedDashboardData()
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isRefreshing.value = false
  }
}

// Refresh handler
const handleRefresh = async (): Promise<void> => {
  await loadDashboardData()
}

// Export handler
const handleExport = async (format: string): Promise<void> => {
  const toast = useToast()

  try {
    toast.add({
      title: 'Export Started',
      description: `Your dashboard ${format.toUpperCase()} is being generated...`,
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Export Failed',
      description: 'Failed to export dashboard data',
      color: 'error'
    })
  }
}

// View handlers
const handleViewPerformer = (performer: any): void => {
  navigateTo(`/users/${performer.id}`)
}

const handleViewClient = (client: any): void => {
  navigateTo(`/clients/${client.client__id}`)
}

// Chart data getters
const getWeeklyTrendsData = () => {
  const trends = enhancedStats.value?.charts_data?.weekly_trends || []
  const last7Weeks = trends.slice(-7)

  return {
    xAxis: last7Weeks.map((trend: any) => trend.week_label || ''),
    datasets: [
      {
        name: 'Completed',
        data: last7Weeks.map((trend: any) => trend.completed || 0),
        showArea: true
      },
      {
        name: 'Created',
        data: last7Weeks.map((trend: any) => trend.created || 0),
        showArea: false
      }
    ]
  }
}

const getCategoryData = () => {
  const categories = enhancedStats.value?.charts_data?.category_distribution || {}
  return Object.entries(categories).map(([key, value]: [string, any]) => ({
    name: key,
    value: value.count || 0,
    display_name: value.display_name || key
  }))
}

const getStatusData = () => {
  const status = enhancedStats.value?.charts_data?.status_breakdown || {}
  return Object.entries(status).map(([key, value]: [string, any]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value: value as number,
    display_name: key.replace('_', ' ').toUpperCase()
  }))
}

const getPriorityData = () => {
  const priority = enhancedStats.value?.charts_data?.priority_breakdown || {}

  return {
    categories: Object.keys(priority).map(key => key.replace('_priority', '').toUpperCase()),
    series: [
      {
        name: 'Count',
        data: Object.values(priority).map(value => value as number)
      }
    ]
  }
}

// Initialize dashboard data on mount
onMounted(async (): Promise<void> => {
  await loadDashboardData()
})

// Navigation handler
const handleNavigation = (route: string): void => {
  navigateTo(route)
}

// Chart click handler
const handleChartClick = (data: any): void => {
  console.log('Chart clicked:', data)
}

// Alert action handler
const handleAlertAction = (alert: any): void => {
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
const handleOpenModal = (modalType: string): void => {
  console.log('Open modal:', modalType)
  // Implement modal opening logic
  // This would integrate with your existing modal system
}

// Action handler for various dashboard actions
const handleAction = (action: any): void => {
  // Implement action-specific logic
}

// Initialize dashboard data on mount
onMounted(async (): Promise<void> => {
  await loadDashboardData()
})

// Cleanup on unmount
onUnmounted((): void => {
  // Cleanup logic if needed
})
</script>

<template>
  <div class="dashboard h-screen flex flex-col flex-1 overflow-hidden">
    <!-- Header -->
    <PageHeader page="Dashboard">
      <template #actions>
        <div class="flex items-center gap-4">
          <UButton
            @click="handleRefresh"
            :loading="isRefreshing"
            variant="outline"
            size="sm"
            icon="mdi:refresh"
          >
            Refresh
          </UButton>
          <UButton
            v-if="isAdmin"
            @click="handleExport('pdf')"
            variant="outline"
            size="sm"
            icon="mdi:download"
          >
            Export
          </UButton>
        </div>
      </template>
    </PageHeader>

    <!-- Dashboard Content -->
    <main class="dashboard-content flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <!-- Loading Overlay -->
      <div v-if="isAnyLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <div v-else class="dashboard-main p-6 space-y-6">
        <!-- Key Metrics Row -->
        <section class="key-metrics">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Key Metrics</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard
              title="Total Tasks"
              :value="enhancedStats?.summary?.total || 0"
              icon="mdi:format-list-bulleted"
              icon-color="purple"
              :is-loading="isAnyLoading"
            />
            <MetricCard
              title="Completed"
              :value="enhancedStats?.summary?.completed || 0"
              icon="mdi:check-circle"
              icon-color="green"
              :is-loading="isAnyLoading"
              variant="success"
            />
            <MetricCard
              title="In Progress"
              :value="enhancedStats?.summary?.in_progress || 0"
              icon="mdi:progress-clock"
              icon-color="blue"
              :is-loading="isAnyLoading"
            />
            <MetricCard
              title="For Checking"
              :value="enhancedStats?.summary?.for_checking || 0"
              icon="mdi:eye-check"
              icon-color="yellow"
              :is-loading="isAnyLoading"
            />
            <MetricCard
              title="Overdue"
              :value="enhancedStats?.summary?.overdue || 0"
              icon="mdi:calendar-alert"
              icon-color="red"
              :is-loading="isAnyLoading"
              variant="error"
            />
            <MetricCard
              title="High Priority"
              :value="enhancedStats?.summary?.high_priority || 0"
              icon="mdi:alert-circle"
              icon-color="red"
              :is-loading="isAnyLoading"
            />
          </div>
        </section>

        <!-- Performance Overview -->
        <section class="performance-overview">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <TrendCard
              title="Completion Rate"
              :value="enhancedStats?.performance_metrics?.overall_completion_rate || 0"
              format="percentage"
              value-label="Overall completion rate"
              :trend="{ direction: 'up', percentage: 5.2 }"
              :secondary-metrics="[
                { label: 'On Time Rate', value: `${enhancedStats?.performance_metrics?.on_time_completion_rate || 0}%` },
                { label: 'Avg Days', value: `${enhancedStats?.performance_metrics?.average_completion_days || 0} days` }
              ]"
            />
            <TrendCard
              title="Due Today"
              :value="enhancedStats?.summary?.due_today || 0"
              value-label="Tasks due today"
              :trend="{ direction: 'stable', percentage: 0 }"
              :secondary-metrics="[
                { label: 'Due This Week', value: (enhancedStats?.summary?.due_this_week || 0).toString() },
                { label: 'Due This Month', value: (enhancedStats?.summary?.due_this_month || 0).toString() }
              ]"
            />
            <TrendCard
              title="System Health"
              :value="enhancedStats?.business_intelligence?.system_health?.active_clients || 0"
              value-label="Active clients"
              :trend="{ direction: 'up', percentage: 2.1 }"
              :secondary-metrics="[
                { label: 'Total Clients', value: (enhancedStats?.business_intelligence?.system_health?.total_clients || 0).toString() },
                { label: 'Avg Tasks/Client', value: `${enhancedStats?.business_intelligence?.system_health?.average_tasks_per_client || 0}` }
              ]"
            />
          </div>
        </section>

        <!-- Charts Section -->
        <section class="charts-section">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Analytics</h2>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Weekly Trends -->
            <LineChartComponent
              title="Weekly Performance Trends"
              :data="getWeeklyTrendsData()"
              :is-loading="isAnyLoading"
              :colors="['#10B981', '#3B82F6']"
              :height="'350px'"
              @click="handleChartClick"
            />

            <!-- Category Distribution -->
            <PieChartComponent
              title="Task Categories"
              :data="getCategoryData()"
              :is-loading="isAnyLoading"
              :show-legend="true"
              :show-percentages="true"
              :height="'350px'"
              @click="handleChartClick"
            />

            <!-- Status Breakdown -->
            <PieChartComponent
              title="Task Status Distribution"
              :data="getStatusData()"
              :is-loading="isAnyLoading"
              :show-legend="true"
              :show-percentages="true"
              :height="'350px'"
              @click="handleChartClick"
            />

            <!-- Priority Breakdown -->
            <BarChartComponent
              title="Priority Distribution"
              :data="getPriorityData()"
              :is-loading="isAnyLoading"
              :height="'350px'"
              @click="handleChartClick"
            />
          </div>
        </section>

        <!-- Team & Client Insights -->
        <section class="insights-section">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Team & Client Insights</h2>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Team Performance -->
            <TeamPerformancePanel
              :is-loading="isAnyLoading"
              @view-details="handleNavigation('/users')"
              @view-performer="handleViewPerformer"
              @chart-click="handleChartClick"
            />

            <!-- Client Insights -->
            <ClientInsightsPanel
              :is-loading="isAnyLoading"
              @view-all-clients="handleNavigation('/clients')"
              @view-client="handleViewClient"
              @chart-click="handleChartClick"
            />
          </div>
        </section>

        <!-- Business Intelligence -->
        <section class="business-intelligence">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Business Intelligence</h2>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Approval Workflow -->
            <ApprovalWorkflowPanel
              :is-loading="isAnyLoading"
              @view-all-approvals="handleNavigation('/approvals')"
              @view-pending-approvals="handleNavigation('/approvals?filter=pending')"
              @chart-click="handleChartClick"
            />

            <!-- Tax Analysis Summary -->
            <div class="tax-analysis">
              <UCard>
                <template #header>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tax Analysis</h3>
                </template>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div class="text-2xl font-bold text-blue-600">{{ enhancedStats?.business_intelligence?.tax_analysis?.total_tax_cases || 0 }}</div>
                      <div class="text-xs text-gray-500">Total Tax Cases</div>
                    </div>
                    <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div class="text-2xl font-bold text-green-600">{{ enhancedStats?.business_intelligence?.tax_analysis?.completed_tax_cases || 0 }}</div>
                      <div class="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                  <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">${{ (enhancedStats?.business_intelligence?.tax_analysis?.tax_payable_total || 0).toLocaleString() }}</div>
                    <div class="text-xs text-gray-500">Total Tax Payable</div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </section>


      </div>
    </main>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.dashboard {
  position: relative;
  transition: background-color 0.2s ease-in-out;
}

.dashboard-content {
  position: relative;
  max-height: calc(100vh - 4rem);
}

.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Loading States */
.loading-overlay {
  position: fixed;
  top: 4rem;
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

/* Section Styles */
.key-metrics,
.performance-overview,
.charts-section,
.insights-section,
.business-intelligence {
  margin-bottom: 2rem;
}

.key-metrics h2,
.performance-overview h2,
.charts-section h2,
.insights-section h2,
.business-intelligence h2 {
  margin-bottom: 1.5rem;
}

/* Responsive Design */
@media (max-width: 640px) {
  .dashboard-content {
    max-height: calc(100vh - 3rem);
  }

  .dashboard-main {
    padding: 1rem;
  }

  .key-metrics h2,
  .performance-overview h2,
  .charts-section h2,
  .insights-section h2,
  .business-intelligence h2 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .charts-section .grid,
  .insights-section .grid,
  .business-intelligence .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
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

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }

  .dashboard {
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
  .loading-overlay {
    display: none;
  }
}
</style>
