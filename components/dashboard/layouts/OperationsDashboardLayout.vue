<template>
  <div class="operations-dashboard-layout space-y-6">
    <!-- Task Distribution Grid -->
    <section class="task-distribution-section">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Task Overview</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <!-- Total Tasks -->
        <MetricCard
          title="Total Tasks"
          :value="dashboardStore.totalTasks"
          icon="mdi:format-list-bulleted"
          icon-color="purple"
          :is-loading="dashboardStore.isAnyLoading"
          action-label="View All"
          @action="navigateToTasks"
        />
        
        <!-- In Progress -->
        <MetricCard
          title="In Progress"
          :value="enhancedStats?.summary?.in_progress || 0"
          icon="mdi:progress-clock"
          icon-color="blue"
          :is-loading="dashboardStore.isAnyLoading"
          variant="info"
        />
        
        <!-- Pending Review -->
        <MetricCard
          title="For Checking"
          :value="enhancedStats?.summary?.for_checking || 0"
          icon="mdi:eye-check"
          icon-color="yellow"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getForCheckingVariant()"
        />
        
        <!-- Completed -->
        <MetricCard
          title="Completed"
          :value="dashboardStore.completedTasks"
          icon="mdi:check-circle"
          icon-color="green"
          :is-loading="dashboardStore.isAnyLoading"
          variant="success"
        />
        
        <!-- Overdue -->
        <MetricCard
          title="Overdue"
          :value="dashboardStore.overdueTasksCount"
          icon="mdi:calendar-alert"
          icon-color="red"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getOverdueVariant()"
          action-label="Review"
          @action="navigateToOverdue"
        />
        
        <!-- Due Soon -->
        <MetricCard
          title="Due Soon"
          :value="dashboardStore.tasksDueSoonCount"
          icon="mdi:calendar-clock"
          icon-color="orange"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getDueSoonVariant()"
        />
      </div>
    </section>
    
    <!-- Workload Management -->
    <section class="workload-management-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Team Performance Chart -->
        <TeamPerformancePanel
          :is-loading="dashboardStore.isAnyLoading"
          @view-details="navigateToTeam"
          @view-performer="viewPerformerDetails"
          @chart-click="handleChartClick"
        />
        
        <!-- Task Distribution Charts -->
        <div class="task-charts space-y-6">
          <!-- Status Breakdown -->
          <PieChartComponent
            title="Task Status Distribution"
            :data="dashboardStore.statusBreakdownChartData"
            :is-loading="dashboardStore.isChartLoading('statusBreakdown')"
            :height="'300px'"
            @click="handleStatusChartClick"
          />
          
          <!-- Priority Breakdown -->
          <div class="priority-breakdown">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Priority Distribution</h4>
            <div class="space-y-3">
              <div 
                v-for="item in dashboardStore.priorityBreakdownChartData" 
                :key="item.key"
                class="priority-item flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div class="flex items-center gap-3">
                  <div :class="getPriorityColorClasses(item.key)" class="w-4 h-4 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</span>
                </div>
                <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Due Date Tracking -->
    <section class="due-date-tracking-section">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Due Today -->
        <TrendCard
          title="Due Today"
          :value="enhancedStats?.summary?.due_today || 0"
          value-label="Tasks due today"
          :trend="{ direction: 'stable', percentage: 0 }"
          :secondary-metrics="[
            { label: 'High Priority', value: getHighPriorityDueToday() },
            { label: 'Completion Rate', value: getTodayCompletionRate() }
          ]"
          :actions="[
            { label: 'View Tasks', variant: 'outline', icon: 'mdi:eye' }
          ]"
          @action="navigateToDueToday"
        />
        
        <!-- Due This Week -->
        <TrendCard
          title="Due This Week"
          :value="enhancedStats?.summary?.due_this_week || 0"
          value-label="Tasks due this week"
          :trend="{ direction: 'up', percentage: 15.2 }"
          :secondary-metrics="[
            { label: 'On Track', value: getOnTrackThisWeek() },
            { label: 'At Risk', value: getAtRiskThisWeek() }
          ]"
          :actions="[
            { label: 'Plan Week', variant: 'outline', icon: 'mdi:calendar' }
          ]"
          @action="navigateToWeeklyPlan"
        />
        
        <!-- Completion Trends -->
        <TrendCard
          title="Completion Rate"
          :value="dashboardStore.overallCompletionRate"
          format="percentage"
          value-label="Overall completion rate"
          :trend="{ direction: 'up', percentage: 3.8 }"
          :chart-data="getCompletionTrendData()"
          chart-type="area"
          :secondary-metrics="[
            { label: 'This Month', value: '89.2%' },
            { label: 'Last Month', value: '85.4%' }
          ]"
        />
      </div>
    </section>
    
    <!-- Team Coordination -->
    <section class="team-coordination-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Approval Workflow -->
        <ApprovalWorkflowPanel
          :is-loading="dashboardStore.isAnyLoading"
          @view-all-approvals="navigateToApprovals"
          @view-pending-approvals="navigateToPendingApprovals"
          @chart-click="handleChartClick"
        />
        
        <!-- Recent Activity & Quick Actions -->
        <div class="activity-and-actions space-y-6">
          <!-- Recent Activity -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </template>
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="activity-item flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div :class="getActivityIconClasses(activity.type)">
                  <UIcon :name="getActivityIcon(activity.type)" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white truncate">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatActivityTime(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </UCard>
          
          <!-- Quick Actions Panel -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </template>
            <div class="grid grid-cols-2 gap-3">
              <UButton 
                label="Add Task"
                icon="mdi:plus"
                variant="outline"
                class="justify-center"
                @click="openAddTaskModal"
              />
              <UButton 
                label="View Calendar"
                icon="mdi:calendar"
                variant="outline"
                class="justify-center"
                @click="navigateToCalendar"
              />
              <UButton 
                label="Team Report"
                icon="mdi:chart-bar"
                variant="outline"
                class="justify-center"
                @click="generateTeamReport"
              />
              <UButton 
                label="Export Data"
                icon="mdi:download"
                variant="outline"
                class="justify-center"
                @click="exportDashboardData"
              />
            </div>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricCard from '../kpi/MetricCard.vue'
import TrendCard from '../kpi/TrendCard.vue'
import PieChartComponent from '../charts/PieChartComponent.vue'
import TeamPerformancePanel from '../panels/TeamPerformancePanel.vue'
import ApprovalWorkflowPanel from '../panels/ApprovalWorkflowPanel.vue'

const emit = defineEmits(['navigate', 'chartClick', 'openModal', 'action'])

const dashboardStore = useDashboardStore()
const { enhancedStats } = storeToRefs(dashboardStore)

// Mock recent activities data
const recentActivities = computed(() => [
  {
    id: 1,
    type: 'task_completed',
    description: 'Tax compliance review completed for Christine Vang',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: 2,
    type: 'task_assigned',
    description: 'New audit task assigned to team member',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 3,
    type: 'approval_pending',
    description: 'Financial statement requires approval',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 4,
    type: 'task_overdue',
    description: 'Budget analysis task is now overdue',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  }
])

const getForCheckingVariant = () => {
  const count = enhancedStats.value?.summary?.for_checking || 0
  if (count === 0) return 'default'
  if (count <= 2) return 'warning'
  return 'error'
}

const getOverdueVariant = () => {
  const count = dashboardStore.overdueTasksCount
  if (count === 0) return 'success'
  if (count <= 2) return 'warning'
  return 'error'
}

const getDueSoonVariant = () => {
  const count = dashboardStore.tasksDueSoonCount
  if (count === 0) return 'default'
  if (count <= 3) return 'warning'
  return 'error'
}

const getPriorityColorClasses = (priority) => {
  switch (priority) {
    case 'high_priority':
      return 'bg-red-500'
    case 'medium_priority':
      return 'bg-yellow-500'
    case 'low_priority':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getHighPriorityDueToday = () => {
  // This would be calculated from actual data
  return '2'
}

const getTodayCompletionRate = () => {
  // This would be calculated from actual data
  return '75%'
}

const getOnTrackThisWeek = () => {
  // This would be calculated from actual data
  return '8'
}

const getAtRiskThisWeek = () => {
  // This would be calculated from actual data
  return '3'
}

const getCompletionTrendData = () => {
  // Mock trend data for the last 7 days
  return [85, 87, 82, 90, 88, 92, 89]
}

const getActivityIconClasses = (type) => {
  const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center'
  
  switch (type) {
    case 'task_completed':
      return `${baseClasses} bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200`
    case 'task_assigned':
      return `${baseClasses} bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200`
    case 'approval_pending':
      return `${baseClasses} bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200`
    case 'task_overdue':
      return `${baseClasses} bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200`
    default:
      return `${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`
  }
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'task_completed':
      return 'mdi:check-circle'
    case 'task_assigned':
      return 'mdi:account-plus'
    case 'approval_pending':
      return 'mdi:clock-outline'
    case 'task_overdue':
      return 'mdi:alert-circle'
    default:
      return 'mdi:information'
  }
}

const formatActivityTime = (timestamp) => {
  const now = new Date()
  const diff = Math.floor((now - timestamp) / (1000 * 60)) // difference in minutes
  
  if (diff < 60) {
    return `${diff}m ago`
  } else if (diff < 1440) { // less than 24 hours
    return `${Math.floor(diff / 60)}h ago`
  } else {
    return `${Math.floor(diff / 1440)}d ago`
  }
}

// Navigation methods
const navigateToTasks = () => emit('navigate', '/tasks')
const navigateToOverdue = () => emit('navigate', '/tasks?filter=overdue')
const navigateToTeam = () => emit('navigate', '/users')
const navigateToApprovals = () => emit('navigate', '/approvals')
const navigateToPendingApprovals = () => emit('navigate', '/approvals?filter=pending')
const navigateToDueToday = () => emit('navigate', '/tasks?filter=due_today')
const navigateToWeeklyPlan = () => emit('navigate', '/tasks?view=weekly')
const navigateToCalendar = () => emit('navigate', '/calendar')

// Action methods
const openAddTaskModal = () => emit('openModal', 'addTask')
const generateTeamReport = () => emit('action', 'generateTeamReport')
const exportDashboardData = () => emit('action', 'exportDashboard')

// Event handlers
const handleChartClick = (data) => emit('chartClick', data)
const handleStatusChartClick = (params) => emit('chartClick', { type: 'status', params })
const viewPerformerDetails = (performer) => emit('navigate', `/users/${performer.id}`)
</script>

<style scoped>
@reference "tailwindcss";

.operations-dashboard-layout {
  @apply p-4;
}

.task-distribution-section {
  @apply mb-8;
}

.workload-management-section {
  @apply mb-8;
}

.due-date-tracking-section {
  @apply mb-8;
}

.team-coordination-section {
  @apply mb-8;
}

.priority-item:hover {
  @apply bg-gray-100 dark:bg-gray-600 transform scale-[1.01] transition-all duration-200;
}

.activity-item {
  @apply transition-all duration-200;
}

/* Custom scrollbar for activity feed */
.overflow-y-auto::-webkit-scrollbar {
  @apply w-2;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .operations-dashboard-layout {
    @apply p-2 space-y-4;
  }
  
  .grid-cols-6 {
    @apply grid-cols-2;
  }
}
</style>