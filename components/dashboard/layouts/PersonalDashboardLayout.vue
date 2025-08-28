<template>
  <div class="personal-dashboard-layout space-y-6">
    <!-- Personal Performance Overview -->
    <section class="personal-performance-section">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Performance</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- My Completion Rate -->
        <MetricCard
          title="My Completion Rate"
          :value="personalStats.completionRate"
          format="percentage"
          icon="mdi:check-circle"
          icon-color="green"
          :trend="{ direction: 'up', percentage: 8.3 }"
          :is-loading="dashboardStore.isAnyLoading"
          variant="success"
          subtitle="Last 30 days"
        />
        
        <!-- Tasks Assigned to Me -->
        <MetricCard
          title="Assigned to Me"
          :value="personalStats.assignedTasks"
          icon="mdi:account-check"
          icon-color="blue"
          :is-loading="dashboardStore.isAnyLoading"
          subtitle="Active tasks"
          action-label="View All"
          @action="navigateToMyTasks"
        />
        
        <!-- Tasks Due Today -->
        <MetricCard
          title="Due Today"
          :value="personalStats.dueToday"
          icon="mdi:calendar-today"
          icon-color="yellow"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getDueTodayVariant()"
          subtitle="Requires attention"
          action-label="Review"
          @action="navigateToDueToday"
        />
        
        <!-- My Overdue Tasks -->
        <MetricCard
          title="Overdue"
          :value="personalStats.overdue"
          icon="mdi:calendar-alert"
          icon-color="red"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getOverdueVariant()"
          subtitle="Needs immediate action"
          action-label="Fix Now"
          @action="navigateToOverdue"
        />
      </div>
    </section>
    
    <!-- Personal Task Overview -->
    <section class="personal-tasks-section">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Task Status Distribution -->
        <PieChartComponent
          title="My Task Distribution"
          :data="getPersonalTaskDistribution()"
          :is-loading="dashboardStore.isAnyLoading"
          :height="'300px'"
          @click="handleTaskDistributionClick"
        />
        
        <!-- Daily Activity Chart -->
        <LineChartComponent
          title="Daily Activity"
          :data="getDailyActivityData()"
          :is-loading="dashboardStore.isAnyLoading"
          :height="'300px'"
          :show-time-range="false"
          :colors="['#10B981', '#3B82F6']"
          @click="handleActivityClick"
        />
        
        <!-- Personal Goals Progress -->
        <div class="goals-progress">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Monthly Goals</h3>
            </template>
            <div class="space-y-4">
              <div v-for="goal in personalGoals" :key="goal.id" class="goal-item">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ goal.title }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ goal.progress }}/{{ goal.target }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    :class="getGoalProgressColor(goal)"
                    :style="{ width: `${getGoalProgressPercentage(goal)}%` }"
                    class="h-2 rounded-full transition-all duration-500"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ getGoalProgressPercentage(goal) }}% complete
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
    
    <!-- Personal Productivity -->
    <section class="personal-productivity-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Weekly Performance Trends -->
        <TrendCard
          title="Weekly Performance"
          :value="personalStats.completionRate"
          format="percentage"
          value-label="This week's completion rate"
          :trend="{ direction: 'up', percentage: 12.4 }"
          :chart-data="getWeeklyPerformanceData()"
          chart-type="area"
          :secondary-metrics="[
            { label: 'Tasks Completed', value: personalStats.completedThisWeek },
            { label: 'Quality Score', value: personalStats.qualityScore + '%' }
          ]"
        />
        
        <!-- Time Management -->
        <div class="time-management">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Time Management</h3>
            </template>
            <div class="space-y-4">
              <!-- Average Task Time -->
              <div class="time-metric">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Avg Task Completion</span>
                  <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ personalStats.avgTaskTime }} hrs</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getTaskTimeComparison() }}
                </div>
              </div>
              
              <!-- Time Distribution -->
              <div class="time-distribution">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How I Spend My Time</h4>
                <div class="space-y-2">
                  <div v-for="activity in timeDistribution" :key="activity.name" class="activity-bar">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-gray-600 dark:text-gray-400">{{ activity.name }}</span>
                      <span class="text-gray-900 dark:text-white">{{ activity.percentage }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        :style="{ width: `${activity.percentage}%`, backgroundColor: activity.color }"
                        class="h-2 rounded-full transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
    
    <!-- Personal Actions & Insights -->
    <section class="personal-actions-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          </template>
          <div class="space-y-3">
            <UButton 
              label="View My Tasks"
              icon="mdi:format-list-bulleted"
              variant="outline"
              class="w-full justify-start"
              @click="navigateToMyTasks"
            />
            <UButton 
              label="Update Progress"
              icon="mdi:progress-check"
              variant="outline"
              class="w-full justify-start"
              @click="openProgressUpdate"
            />
            <UButton 
              label="Request Extension"
              icon="mdi:calendar-plus"
              variant="outline"
              class="w-full justify-start"
              :disabled="personalStats.overdue === 0"
              @click="openExtensionRequest"
            />
            <UButton 
              label="Set New Goal"
              icon="mdi:target"
              variant="outline"
              class="w-full justify-start"
              @click="openGoalSetting"
            />
          </div>
        </UCard>
        
        <!-- Personal Insights -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Personal Insights</h3>
          </template>
          <div class="space-y-4">
            <!-- Performance Summary -->
            <div class="insight-item">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Summary</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getPerformanceSummary() }}
              </p>
            </div>
            
            <!-- Productivity Tips -->
            <div class="insight-item">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Productivity Tips</h4>
              <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li v-for="tip in getPersonalizedTips()" :key="tip" class="flex items-start gap-2">
                  <UIcon name="mdi:lightbulb-outline" class="w-4 h-4 mt-0.5 text-yellow-500" />
                  {{ tip }}
                </li>
              </ul>
            </div>
            
            <!-- Achievement Badges -->
            <div class="achievement-badges">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Achievements</h4>
              <div class="flex flex-wrap gap-2">
                <UBadge 
                  v-for="badge in recentBadges" 
                  :key="badge.name"
                  :color="badge.color"
                  variant="subtle"
                  size="sm"
                >
                  {{ badge.name }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MetricCard from '../kpi/MetricCard.vue'
import TrendCard from '../kpi/TrendCard.vue'
import LineChartComponent from '../charts/LineChartComponent.vue'
import PieChartComponent from '../charts/PieChartComponent.vue'

// Define interfaces for type safety
interface PersonalStats {
  completionRate: number;
  assignedTasks: number;
  dueToday: number;
  overdue: number;
  completedThisWeek: number;
  qualityScore: number;
  avgTaskTime: number;
}

interface PersonalGoal {
  id: number;
  title: string;
  progress: number;
  target: number;
}

interface TimeDistribution {
  name: string;
  percentage: number;
  color: string;
}

interface RecentBadge {
  name: string;
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
}

interface TaskDistributionItem {
  name: string;
  value: number;
  display_name: string;
}

interface DailyActivityDataset {
  name: string;
  data: number[];
  showArea: boolean;
}

interface DailyActivityData {
  xAxis: string[];
  datasets: DailyActivityDataset[];
}

type VariantType = 'success' | 'warning' | 'error';

const emit = defineEmits(['navigate', 'chartClick', 'openModal'])

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Use actual data from dashboard store instead of mock data
const personalStats = computed((): PersonalStats => {
  const stats = dashboardStore.enhancedStats?.summary || {};
  return {
    completionRate: dashboardStore.overallCompletionRate || 0,
    assignedTasks: stats.total || 0,
    dueToday: stats.due_today || 0,
    overdue: stats.overdue || 0,
    completedThisWeek: stats.completed || 0,
    qualityScore: dashboardStore.performanceMetrics?.on_time_completion_rate || 0,
    avgTaskTime: dashboardStore.performanceMetrics?.average_completion_days || 0,
  };
})

const personalGoals = computed((): PersonalGoal[] => [
  { id: 1, title: 'Complete 20 tasks', progress: 15, target: 20 },
  { id: 2, title: 'Maintain 90% quality', progress: 92, target: 90 },
  { id: 3, title: 'Zero overdue tasks', progress: 90, target: 100 }
])

const timeDistribution = computed((): TimeDistribution[] => [
  { name: 'Task Execution', percentage: 45, color: '#10B981' },
  { name: 'Research', percentage: 25, color: '#3B82F6' },
  { name: 'Communication', percentage: 15, color: '#F59E0B' },
  { name: 'Planning', percentage: 10, color: '#8B5CF6' },
  { name: 'Admin', percentage: 5, color: '#6B7280' }
])

const recentBadges = computed((): RecentBadge[] => [
  { name: 'Early Bird', color: 'success' },
  { name: 'Quality Master', color: 'primary' },
  { name: 'Team Player', color: 'secondary' }
])

const getDueTodayVariant = (): VariantType => {
  const count = personalStats.value.dueToday
  if (count === 0) return 'success'
  if (count <= 2) return 'warning'
  return 'error'
}

const getOverdueVariant = (): VariantType => {
  const count = personalStats.value.overdue
  if (count === 0) return 'success'
  return 'error'
}

const getPersonalTaskDistribution = (): TaskDistributionItem[] => {
  // Use actual data from dashboard store
  const statusBreakdown = dashboardStore.statusBreakdown || {};
  return [
    { name: 'In Progress', value: statusBreakdown.in_progress || 0, display_name: 'In Progress' },
    { name: 'Pending Review', value: statusBreakdown.for_checking || 0, display_name: 'Pending Review' },
    { name: 'Completed', value: statusBreakdown.completed || 0, display_name: 'Completed' },
    { name: 'Overdue', value: statusBreakdown.overdue || 0, display_name: 'Overdue' }
  ];
}

const getDailyActivityData = (): DailyActivityData => {
  // Use actual weekly trends data from dashboard store
  const weeklyTrends = dashboardStore.weeklyTrends || [];
  const last7Days = weeklyTrends.slice(-7);
  
  return {
    xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        name: 'Tasks Completed',
        data: last7Days.map(trend => trend.completed || 0).concat(Array(7 - last7Days.length).fill(0)).slice(0, 7),
        showArea: true
      },
      {
        name: 'Tasks Created',
        data: last7Days.map(trend => trend.created || 0).concat(Array(7 - last7Days.length).fill(0)).slice(0, 7),
        showArea: false
      }
    ]
  };
}

const getWeeklyPerformanceData = (): number[] => {
  // Use actual performance data from dashboard store
  const weeklyTrends = dashboardStore.weeklyTrends || [];
  const last7Weeks = weeklyTrends.slice(-7);
  
  return last7Weeks.map(trend => {
    const total = (trend.completed || 0) + (trend.created || 0);
    return total > 0 ? Math.round(((trend.completed || 0) / total) * 100) : 0;
  }).concat(Array(7 - last7Weeks.length).fill(0)).slice(0, 7);
}

const getGoalProgressPercentage = (goal: PersonalGoal): number => {
  return Math.min(Math.round((goal.progress / goal.target) * 100), 100)
}

const getGoalProgressColor = (goal: PersonalGoal): string => {
  const percentage = getGoalProgressPercentage(goal)
  if (percentage >= 90) return 'bg-green-500'
  if (percentage >= 70) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getTaskTimeComparison = (): string => {
  const avgTime = personalStats.value.avgTaskTime
  const teamAvg = 3.2 // Mock team average
  
  if (avgTime < teamAvg) {
    return `${((teamAvg - avgTime) / teamAvg * 100).toFixed(1)}% faster than team average`
  } else {
    return `${((avgTime - teamAvg) / teamAvg * 100).toFixed(1)}% slower than team average`
  }
}

const getPerformanceSummary = (): string => {
  const rate = personalStats.value.completionRate
  
  if (rate >= 90) {
    return "Excellent performance! You're consistently delivering high-quality work ahead of schedule."
  } else if (rate >= 80) {
    return "Great job! Your completion rate is above average with room for minor improvements."
  } else if (rate >= 70) {
    return "Good work! Focus on time management to improve your completion rate."
  } else {
    return "There's room for improvement. Consider reviewing your workflow and prioritization."
  }
}

const getPersonalizedTips = (): string[] => {
  const tips: string[] = []
  
  if (personalStats.value.overdue > 0) {
    tips.push("Prioritize overdue tasks first thing in the morning")
  }
  
  if (personalStats.value.dueToday > 2) {
    tips.push("Break large tasks into smaller, manageable chunks")
  }
  
  if (personalStats.value.completionRate < 85) {
    tips.push("Try time-blocking for better focus and productivity")
  } else {
    tips.push("Maintain your excellent pace and help team members when possible")
  }
  
  return tips.length > 0 ? tips : ["Keep up the great work! You're performing excellently."]
}

// Event handlers
const handleTaskDistributionClick = (params: any): void => {
  emit('chartClick', { type: 'personal_tasks', params })
}

const handleActivityClick = (params: any): void => {
  emit('chartClick', { type: 'daily_activity', params })
}

// Navigation methods
const navigateToMyTasks = (): void => emit('navigate', '/my-tasks')
const navigateToDueToday = (): void => emit('navigate', '/my-tasks?filter=due_today')
const navigateToOverdue = (): void => emit('navigate', '/my-tasks?filter=overdue')

// Modal opening methods
const openProgressUpdate = (): void => emit('openModal', 'progressUpdate')
const openExtensionRequest = (): void => emit('openModal', 'extensionRequest')
const openGoalSetting = (): void => emit('openModal', 'goalSetting')
</script>

<style scoped>
@reference "tailwindcss";

.personal-dashboard-layout {
  @apply p-4;
}

.goal-item {
  @apply pb-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 last:pb-0;
}

.time-metric {
  @apply pb-4 border-b border-gray-200 dark:border-gray-600;
}

.activity-bar {
  @apply space-y-1;
}

.insight-item {
  @apply pb-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 last:pb-0;
}

.achievement-badges {
  @apply pt-2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .personal-dashboard-layout {
    @apply p-2 space-y-4;
  }
}
</style>