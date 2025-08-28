<template>
  <UCard class="team-performance-panel">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h3>
        <div class="flex items-center gap-2">
          <!-- Performance Period Toggle -->
          <USelectMenu 
            v-model="selectedPeriod" 
            :options="periodOptions"
            size="sm"
            @change="handlePeriodChange"
          />
          <!-- View Details Button -->
          <UButton 
            @click="viewDetails" 
            variant="ghost" 
            size="sm"
            icon="mdi:open-in-new"
          >
            View Details
          </UButton>
        </div>
      </div>
    </template>
    
    <div class="performance-content grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Performance Chart Section -->
      <div class="performance-chart-section">
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Completion Rates</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">Completion rate comparison across team members</p>
        </div>
        
        <template v-if="isLoading">
          <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </template>
        <template v-else-if="performanceChartData">
          <BarChartComponent
            :data="performanceChartData"
            :is-loading="isLoading"
            :height="'280px'"
            :show-export="false"
            :show-orientation-toggle="false"
            :show-sort-options="true"
            @click="handleChartClick"
          />
        </template>
        <template v-else>
          <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-center">
              <UIcon name="mdi:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400">No performance data available</p>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Leaderboard Section -->
      <div class="leaderboard-section">
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Performers</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">Based on completion rate and task quality</p>
        </div>
        
        <template v-if="isLoading">
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="performer-item-skeleton">
              <div class="flex items-center gap-3 p-3">
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
                <div class="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="topPerformers && topPerformers.length">
          <div class="leaderboard space-y-2">
            <div 
              v-for="(performer, index) in topPerformers" 
              :key="performer.assigned_to__id"
              class="performer-item"
              @click="viewPerformerDetails(performer)"
            >
              <!-- Rank Badge -->
              <div :class="getRankBadgeClasses(index)" class="rank-badge">
                <span class="text-xs font-bold">{{ index + 1 }}</span>
              </div>
              
              <!-- Performer Info -->
              <div class="performer-info flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="performer-name text-sm font-medium text-gray-900 dark:text-white">
                    {{ performer.fullname }}
                  </span>
                  <UBadge 
                    v-if="performer.is_admin" 
                    color="purple" 
                    variant="subtle" 
                    size="xs"
                  >
                    Admin
                  </UBadge>
                </div>
                <div class="performer-stats text-xs text-gray-500 dark:text-gray-400">
                  {{ performer.completed_tasks }}/{{ performer.total_tasks }} tasks completed
                  <template v-if="performer.overdue_tasks > 0">
                    • {{ performer.overdue_tasks }} overdue
                  </template>
                </div>
              </div>
              
              <!-- Performance Metrics -->
              <div class="performer-metrics text-right">
                <div class="completion-rate text-sm font-semibold" :class="getCompletionRateColor(performer.completion_rate)">
                  {{ performer.completion_rate.toFixed(1) }}%
                </div>
                <div class="overdue-rate text-xs text-gray-500 dark:text-gray-400">
                  {{ performer.overdue_rate.toFixed(1) }}% overdue
                </div>
              </div>
              
              <!-- Performance Badge -->
              <UBadge :color="getPerformanceBadgeColor(performer.completion_rate)" class="ml-2">
                {{ getPerformanceLabel(performer.completion_rate) }}
              </UBadge>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-center">
              <UIcon name="mdi:account-group" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400">No team performance data available</p>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Performance Summary -->
    <div v-if="!isLoading && performanceSummary" class="performance-summary mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Team Summary</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ performanceSummary.totalMembers }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Team Members</div>
        </div>
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ performanceSummary.avgCompletionRate }}%</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Avg Completion</div>
        </div>
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ performanceSummary.totalCompleted }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</div>
        </div>
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ performanceSummary.totalOverdue }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Overdue Tasks</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BarChartComponent from '../charts/BarChartComponent.vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  teamData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['viewDetails', 'viewPerformer', 'periodChange', 'chartClick'])

const dashboardStore = useDashboardStore()
const { teamAnalytics } = storeToRefs(dashboardStore)

const selectedPeriod = ref('current_month')

const periodOptions = [
  { label: 'This Week', value: 'current_week' },
  { label: 'This Month', value: 'current_month' },
  { label: 'Last 3 Months', value: 'quarter' },
  { label: 'This Year', value: 'year' }
]

const topPerformers = computed(() => {
  return teamAnalytics.value?.user_performance
    ?.sort((a, b) => b.completion_rate - a.completion_rate)
    ?.slice(0, 5) || []
})

const performanceChartData = computed(() => {
  if (!teamAnalytics.value?.user_performance?.length) return null
  
  const users = teamAnalytics.value.user_performance
  
  return {
    categories: users.map(user => user.fullname),
    series: [
      {
        name: 'Completion Rate',
        data: users.map(user => user.completion_rate)
      },
      {
        name: 'Overdue Rate', 
        data: users.map(user => user.overdue_rate)
      }
    ]
  }
})

const performanceSummary = computed(() => {
  if (!teamAnalytics.value?.user_performance?.length) return null
  
  const users = teamAnalytics.value.user_performance
  const totalMembers = users.length
  const avgCompletionRate = (users.reduce((sum, user) => sum + user.completion_rate, 0) / totalMembers).toFixed(1)
  const totalCompleted = users.reduce((sum, user) => sum + user.completed_tasks, 0)
  const totalOverdue = users.reduce((sum, user) => sum + user.overdue_tasks, 0)
  
  return {
    totalMembers,
    avgCompletionRate,
    totalCompleted,
    totalOverdue
  }
})

const getRankBadgeClasses = (index) => {
  const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs'
  
  switch (index) {
    case 0:
      return `${baseClasses} bg-yellow-500` // Gold
    case 1:
      return `${baseClasses} bg-gray-400` // Silver
    case 2:
      return `${baseClasses} bg-yellow-600` // Bronze
    default:
      return `${baseClasses} bg-gray-300 text-gray-700`
  }
}

const getCompletionRateColor = (rate) => {
  if (rate >= 80) return 'text-green-600 dark:text-green-400'
  if (rate >= 60) return 'text-blue-600 dark:text-blue-400'
  if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getPerformanceBadgeColor = (rate) => {
  if (rate >= 80) return 'green'
  if (rate >= 60) return 'blue'
  if (rate >= 40) return 'yellow'
  return 'red'
}

const getPerformanceLabel = (rate) => {
  if (rate >= 80) return 'Excellent'
  if (rate >= 60) return 'Good'
  if (rate >= 40) return 'Fair'
  return 'Needs Improvement'
}

const handlePeriodChange = (period) => {
  selectedPeriod.value = period
  emit('periodChange', period)
}

const handleChartClick = (params) => {
  emit('chartClick', params)
}

const viewDetails = () => {
  emit('viewDetails')
}

const viewPerformerDetails = (performer) => {
  emit('viewPerformer', performer)
}

onMounted(() => {
  // Component initialization
})
</script>

<style scoped>
@reference "tailwindcss";

.team-performance-panel {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
}

.performer-item {
  @apply flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer;
}

.performer-item:hover {
  @apply shadow-sm transform scale-[1.01];
}

.rank-badge {
  @apply flex-shrink-0;
}

.performer-info {
  @apply min-w-0;
}

.performer-name {
  @apply truncate;
}

.performer-metrics {
  @apply flex-shrink-0;
}

.summary-item {
  @apply p-3 rounded-lg bg-gray-50 dark:bg-gray-700;
}

/* Loading animations */
.performer-item-skeleton {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg;
}

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