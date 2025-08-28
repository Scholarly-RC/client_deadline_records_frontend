<template>
  <UCard class="client-insights-panel">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Client Insights</h3>
        <div class="flex items-center gap-2">
          <!-- Client Filter -->
          <USelectMenu 
            v-model="selectedClientFilter" 
            :options="clientFilterOptions"
            size="sm"
            @change="handleClientFilterChange"
          />
          <!-- View All Clients Button -->
          <UButton 
            @click="viewAllClients" 
            variant="ghost" 
            size="sm"
            icon="mdi:open-in-new"
          >
            View All
          </UButton>
        </div>
      </div>
    </template>
    
    <div class="client-insights-content">
      <!-- Client Distribution Charts -->
      <div class="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Workload Distribution Chart -->
        <div class="workload-chart">
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Workload Distribution</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Task distribution across clients</p>
          </div>
          
          <template v-if="isLoading">
            <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </template>
          <template v-else-if="workloadChartData">
            <PieChartComponent
              title="Client Workload"
              :data="workloadChartData"
              :is-loading="isLoading"
              :height="'280px'"
              :show-export="false"
              :show-chart-type-toggle="true"
              @click="handleWorkloadChartClick"
            />
          </template>
          <template v-else>
            <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-center">
                <UIcon name="mdi:chart-pie" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 dark:text-gray-400">No workload data available</p>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Completion Rate Chart -->
        <div class="completion-rate-chart">
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Completion Rates</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Task completion performance by client</p>
          </div>
          
          <template v-if="isLoading">
            <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </template>
          <template v-else-if="completionRateChartData">
            <BarChartComponent
              :data="completionRateChartData"
              :is-loading="isLoading"
              :height="'280px'"
              :show-export="false"
              :show-orientation-toggle="false"
              :show-sort-options="true"
              @click="handleCompletionRateChartClick"
            />
          </template>
          <template v-else>
            <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-center">
                <UIcon name="mdi:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 dark:text-gray-400">No completion data available</p>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- Top Clients Table -->
      <div class="top-clients-section">
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Clients by Activity</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">Clients with highest task volume and engagement</p>
        </div>
        
        <template v-if="isLoading">
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="client-item-skeleton">
              <div class="flex items-center gap-4 p-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
                <div class="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="topClients && topClients.length">
          <div class="clients-grid space-y-3">
            <div 
              v-for="client in topClients" 
              :key="client.client__id"
              class="client-item"
              @click="viewClientDetails(client)"
            >
              <!-- Client Avatar/Initial -->
              <div class="client-avatar">
                <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span class="text-lg font-semibold text-blue-600 dark:text-blue-300">
                    {{ getClientInitials(client.client__name) }}
                  </span>
                </div>
              </div>
              
              <!-- Client Info -->
              <div class="client-info flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="client-name text-sm font-medium text-gray-900 dark:text-white">
                    {{ client.client__name }}
                  </span>
                  <UBadge 
                    :color="getClientStatusColor(client.client__status)" 
                    variant="subtle" 
                    size="xs"
                  >
                    {{ client.client__status }}
                  </UBadge>
                </div>
                <div class="client-stats text-xs text-gray-500 dark:text-gray-400">
                  {{ client.total_tasks }} total tasks
                  <template v-if="client.overdue_tasks > 0">
                    • {{ client.overdue_tasks }} overdue
                  </template>
                  <template v-if="client.pending_tasks > 0">
                    • {{ client.pending_tasks }} pending
                  </template>
                </div>
              </div>
              
              <!-- Task Progress -->
              <div class="task-progress">
                <div class="text-right mb-1">
                  <span class="text-sm font-semibold" :class="getCompletionRateColor(client.completion_rate)">
                    {{ client.completion_rate.toFixed(1) }}%
                  </span>
                </div>
                <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    :class="getProgressBarColor(client.completion_rate)"
                    :style="{ width: `${Math.min(client.completion_rate, 100)}%` }"
                    class="h-2 rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
              
              <!-- Client Metrics -->
              <div class="client-metrics text-right">
                <div class="completed-tasks text-sm font-medium text-green-600 dark:text-green-400">
                  {{ client.completed_tasks }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">completed</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-center">
              <UIcon name="mdi:account-multiple" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400">No client data available</p>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Client Summary -->
    <div v-if="!isLoading && clientSummary" class="client-summary mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Client Portfolio Summary</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientSummary.totalClients }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Active Clients</div>
        </div>
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ clientSummary.avgTasksPerClient }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Avg Tasks/Client</div>
        </div>
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ clientSummary.avgCompletionRate }}%</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Avg Completion</div>
        </div>
        <div class="summary-item text-center">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ clientSummary.totalOverdue }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Total Overdue</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PieChartComponent from '../charts/PieChartComponent.vue'
import BarChartComponent from '../charts/BarChartComponent.vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['viewAllClients', 'viewClient', 'clientFilterChange', 'chartClick'])

const dashboardStore = useDashboardStore()
const { clientInsights } = storeToRefs(dashboardStore)

const selectedClientFilter = ref('all')

const clientFilterOptions = [
  { label: 'All Clients', value: 'all' },
  { label: 'Active Only', value: 'active' },
  { label: 'High Volume', value: 'high_volume' },
  { label: 'At Risk', value: 'at_risk' }
]

const topClients = computed(() => {
  return clientInsights.value?.top_clients || []
})

const workloadChartData = computed(() => {
  if (!topClients.value?.length) return null
  
  return topClients.value.map(client => ({
    name: client.client__name,
    value: client.total_tasks,
    display_name: client.client__name
  }))
})

const completionRateChartData = computed(() => {
  if (!topClients.value?.length) return null
  
  return {
    categories: topClients.value.map(client => client.client__name),
    series: [
      {
        name: 'Completion Rate',
        data: topClients.value.map(client => client.completion_rate)
      },
      {
        name: 'Total Tasks',
        data: topClients.value.map(client => client.total_tasks)
      }
    ]
  }
})

const clientSummary = computed(() => {
  if (!topClients.value?.length) return null
  
  const totalClients = topClients.value.length
  const avgTasksPerClient = (topClients.value.reduce((sum, client) => sum + client.total_tasks, 0) / totalClients).toFixed(1)
  const avgCompletionRate = (topClients.value.reduce((sum, client) => sum + client.completion_rate, 0) / totalClients).toFixed(1)
  const totalOverdue = topClients.value.reduce((sum, client) => sum + client.overdue_tasks, 0)
  
  return {
    totalClients,
    avgTasksPerClient,
    avgCompletionRate,
    totalOverdue
  }
})

const getClientInitials = (name) => {
  return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase()
}

const getClientStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'gray'
    case 'pending':
      return 'yellow'
    default:
      return 'blue'
  }
}

const getCompletionRateColor = (rate) => {
  if (rate >= 80) return 'text-green-600 dark:text-green-400'
  if (rate >= 60) return 'text-blue-600 dark:text-blue-400'
  if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getProgressBarColor = (rate) => {
  if (rate >= 80) return 'bg-green-500'
  if (rate >= 60) return 'bg-blue-500'
  if (rate >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const handleClientFilterChange = (filter) => {
  selectedClientFilter.value = filter
  emit('clientFilterChange', filter)
}

const handleWorkloadChartClick = (params) => {
  emit('chartClick', { type: 'workload', params })
}

const handleCompletionRateChartClick = (params) => {
  emit('chartClick', { type: 'completion_rate', params })
}

const viewAllClients = () => {
  emit('viewAllClients')
}

const viewClientDetails = (client) => {
  emit('viewClient', client)
}

onMounted(() => {
  // Component initialization
})
</script>

<style scoped>
@reference "tailwindcss";

.client-insights-panel {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
}

.client-item {
  @apply flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer;
}

.client-item:hover {
  @apply shadow-sm transform scale-[1.01];
}

.client-avatar {
  @apply flex-shrink-0;
}

.client-info {
  @apply min-w-0;
}

.client-name {
  @apply truncate;
}

.task-progress {
  @apply flex-shrink-0;
}

.client-metrics {
  @apply flex-shrink-0;
}

.summary-item {
  @apply p-3 rounded-lg bg-gray-50 dark:bg-gray-700;
}

/* Loading animations */
.client-item-skeleton {
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