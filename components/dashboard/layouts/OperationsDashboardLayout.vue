<template>
  <div class="operations-dashboard-layout space-y-6">
    <!-- Task Distribution Grid -->
    <section class="task-distribution-section">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Task Overview
      </h2>
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
          icon-color="yellow"
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
            <h4
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4"
            >
              Priority Distribution
            </h4>
            <div class="space-y-3">
              <div
                v-for="item in dashboardStore.priorityBreakdownChartData"
                :key="item.key"
                class="priority-item flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="getPriorityColorClasses(item.key)"
                    class="w-4 h-4 rounded-full"
                  ></div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    >{{ item.name }}</span
                  >
                </div>
                <div
                  class="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {{ item.value }}
                </div>
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
            { label: 'Completion Rate', value: getTodayCompletionRate() },
          ]"
          :actions="[
            {
              label: 'View Tasks',
              variant: 'outline',
              icon: 'mdi:eye',
              action: 'view_tasks',
            },
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
            { label: 'At Risk', value: getAtRiskThisWeek() },
          ]"
          :actions="[
            {
              label: 'Plan Week',
              variant: 'outline',
              icon: 'mdi:calendar',
              action: 'plan_week',
            },
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
            { label: 'Last Month', value: '85.4%' },
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MetricCard from "../kpi/MetricCard.vue";
import TrendCard from "../kpi/TrendCard.vue";
import PieChartComponent from "../charts/PieChartComponent.vue";
import TeamPerformancePanel from "../panels/TeamPerformancePanel.vue";
import ApprovalWorkflowPanel from "../panels/ApprovalWorkflowPanel.vue";

// Define interfaces for type safety
interface RecentActivity {
  id: number;
  type:
    | "task_completed"
    | "task_assigned"
    | "approval_pending"
    | "task_overdue";
  description: string;
  timestamp: Date;
}

type ActivityType =
  | "task_completed"
  | "task_assigned"
  | "approval_pending"
  | "task_overdue";
type VariantType = "default" | "warning" | "error" | "success";
type PriorityType = "high_priority" | "medium_priority" | "low_priority";

const emit = defineEmits(["navigate", "chartClick", "openModal", "action"]);

const dashboardStore = useDashboardStore();
const { enhancedStats } = storeToRefs(dashboardStore);

// Use actual recent activities from business intelligence data if available
const recentActivities = computed((): RecentActivity[] => {
  // This should come from the actual API in the future
  // For now, return empty array as specific recent activities endpoint may not exist yet
  return [];
});

const getForCheckingVariant = (): VariantType => {
  const count = enhancedStats.value?.summary?.for_checking || 0;
  if (count === 0) return "default";
  if (count <= 2) return "warning";
  return "error";
};

const getOverdueVariant = (): VariantType => {
  const count = dashboardStore.overdueTasksCount;
  if (count === 0) return "success";
  if (count <= 2) return "warning";
  return "error";
};

const getDueSoonVariant = (): VariantType => {
  const count = dashboardStore.tasksDueSoonCount;
  if (count === 0) return "default";
  if (count <= 3) return "warning";
  return "error";
};

const getPriorityColorClasses = (priority: PriorityType | string): string => {
  switch (priority) {
    case "high_priority":
      return "bg-red-500";
    case "medium_priority":
      return "bg-yellow-500";
    case "low_priority":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getHighPriorityDueToday = (): string => {
  // This would be calculated from actual data
  return "2";
};

const getTodayCompletionRate = (): string => {
  // This would be calculated from actual data
  return "75%";
};

const getOnTrackThisWeek = (): string => {
  // This would be calculated from actual data
  return "8";
};

const getAtRiskThisWeek = (): string => {
  // This would be calculated from actual data
  return "3";
};

const getCompletionTrendData = (): number[] => {
  // Use actual performance data from dashboard store
  const weeklyTrends = dashboardStore.weeklyTrends || [];
  const last7Weeks = weeklyTrends.slice(-7);

  return last7Weeks
    .map((trend) => {
      const total = (trend.completed || 0) + (trend.created || 0);
      return total > 0 ? Math.round(((trend.completed || 0) / total) * 100) : 0;
    })
    .concat(Array(7 - last7Weeks.length).fill(0))
    .slice(0, 7);
};

const getActivityIconClasses = (type: ActivityType): string => {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center";

  switch (type) {
    case "task_completed":
      return `${baseClasses} bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200`;
    case "task_assigned":
      return `${baseClasses} bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200`;
    case "approval_pending":
      return `${baseClasses} bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200`;
    case "task_overdue":
      return `${baseClasses} bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;
  }
};

const getActivityIcon = (type: ActivityType): string => {
  switch (type) {
    case "task_completed":
      return "mdi:check-circle";
    case "task_assigned":
      return "mdi:account-plus";
    case "approval_pending":
      return "mdi:clock-outline";
    case "task_overdue":
      return "mdi:alert-circle";
    default:
      return "mdi:information";
  }
};

const formatActivityTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60)); // difference in minutes

  if (diff < 60) {
    return `${diff}m ago`;
  } else if (diff < 1440) {
    // less than 24 hours
    return `${Math.floor(diff / 60)}h ago`;
  } else {
    return `${Math.floor(diff / 1440)}d ago`;
  }
};

// Navigation methods
const navigateToTasks = (): void => emit("navigate", "/tasks");
const navigateToOverdue = (): void => emit("navigate", "/tasks?filter=overdue");
const navigateToTeam = (): void => emit("navigate", "/users");
const navigateToApprovals = (): void => emit("navigate", "/approvals");
const navigateToPendingApprovals = (): void =>
  emit("navigate", "/approvals?filter=pending");
const navigateToDueToday = (): void =>
  emit("navigate", "/tasks?filter=due_today");
const navigateToWeeklyPlan = (): void => emit("navigate", "/tasks?view=weekly");
const navigateToCalendar = (): void => emit("navigate", "/calendar");

// Action methods
const openAddTaskModal = (): void => emit("openModal", "addTask");
const generateTeamReport = (): void => emit("action", "generateTeamReport");
const exportDashboardData = (): void => emit("action", "exportDashboard");

// Event handlers
const handleChartClick = (data: any): void => emit("chartClick", data);
const handleStatusChartClick = (params: any): void =>
  emit("chartClick", { type: "status", params });
const viewPerformerDetails = (performer: any): void =>
  emit("navigate", `/users/${performer.id}`);
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
