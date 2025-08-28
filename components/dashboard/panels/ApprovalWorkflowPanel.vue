<template>
  <UCard class="approval-workflow-panel">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Approval Workflow</h3>
        <div class="flex items-center gap-2">
          <!-- Workflow Filter -->
          <USelectMenu 
            v-model="selectedWorkflowFilter" 
            :options="workflowFilterOptions"
            size="sm"
            @update:model-value="handleWorkflowFilterChange"
          />
          <!-- View All Approvals Button -->
          <UButton 
            @click="viewAllApprovals" 
            variant="ghost" 
            size="sm"
            icon="mdi:open-in-new"
          >
            Manage
          </UButton>
        </div>
      </div>
    </template>
    
    <div class="approval-workflow-content">
      <!-- Workflow Status Overview -->
      <div class="workflow-status-section mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Pending Approvals -->
          <div class="status-card">
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"></div>
                </template>
                <template v-else>
                  <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {{ workflowData?.tasks_requiring_approval || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">Pending Approval</div>
              </div>
              <div class="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
                <UIcon name="mdi:clock-outline" class="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <!-- In Progress Approvals -->
          <div class="status-card">
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"></div>
                </template>
                <template v-else>
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ workflowData?.tasks_in_approval || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">In Review</div>
              </div>
              <div class="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                <UIcon name="mdi:eye-outline" class="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <!-- Approved -->
          <div class="status-card">
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"></div>
                </template>
                <template v-else>
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {{ workflowData?.tasks_approved || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">Approved</div>
              </div>
              <div class="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                <UIcon name="mdi:check-circle-outline" class="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <!-- My Approvals -->
          <div class="status-card">
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"></div>
                </template>
                <template v-else>
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {{ workflowData?.pending_my_approval || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">Awaiting Me</div>
              </div>
              <div class="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                <UIcon name="mdi:account-check-outline" class="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Workflow Chart and Queue -->
      <div class="workflow-details grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Approval Status Chart -->
        <div class="approval-status-chart">
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Approval Status Distribution</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Current workflow state breakdown</p>
          </div>
          
          <template v-if="isLoading">
            <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </template>
          <template v-else-if="approvalChartData">
            <PieChartComponent
              title="Approval Status"
              :data="approvalChartData"
              :is-loading="isLoading"
              :height="'280px'"
              :show-export="false"
              :show-chart-type-toggle="false"
              @click="handleApprovalChartClick"
            />
          </template>
          <template v-else>
            <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-center">
                <UIcon name="mdi:chart-donut" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 dark:text-gray-400">No approval data available</p>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Recent Approvals Queue -->
        <div class="recent-approvals">
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Approval Activity</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Latest workflow updates and decisions</p>
          </div>
          
          <template v-if="isLoading">
            <div class="space-y-3">
              <div v-for="i in 4" :key="i" class="approval-item-skeleton">
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
          <template v-else-if="recentApprovals && recentApprovals.length">
            <div class="approvals-list space-y-3 max-h-64 overflow-y-auto">
              <div 
                v-for="approval in recentApprovals" 
                :key="approval.id"
                class="approval-item"
                @click="viewApprovalDetails(approval)"
              >
                <!-- Status Icon -->
                <div :class="getApprovalStatusIconClasses(approval.status)">
                  <UIcon :name="getApprovalStatusIcon(approval.status)" class="w-4 h-4" />
                </div>
                
                <!-- Approval Info -->
                <div class="approval-info flex-1">
                  <div class="approval-title text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {{ approval.title || `Task #${approval.id}` }}
                  </div>
                  <div class="approval-meta text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ approval.client_name }}</span>
                    <span class="mx-1">•</span>
                    <span>{{ formatApprovalTime(approval.updated_at) }}</span>
                  </div>
                </div>
                
                <!-- Status Badge -->
                <UBadge :color="getApprovalStatusColor(approval.status)" variant="subtle">
                  {{ formatApprovalStatus(approval.status) }}
                </UBadge>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="text-center">
                <UIcon name="mdi:clipboard-check-outline" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 dark:text-gray-400">No recent approvals</p>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div v-if="!isLoading" class="quick-actions mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
        <div class="flex flex-wrap gap-2">
          <UButton 
            @click="viewPendingApprovals"
            variant="outline"
            size="sm"
            icon="mdi:clock-outline"
            :disabled="!workflowData?.pending_my_approval"
          >
            Review Pending ({{ workflowData?.pending_my_approval || 0 }})
          </UButton>
          <UButton 
            @click="viewApprovalHistory"
            variant="ghost"
            size="sm"
            icon="mdi:history"
          >
            View History
          </UButton>
          <UButton 
            @click="configureWorkflow"
            variant="ghost"
            size="sm"
            icon="mdi:cog-outline"
            v-if="isAdmin"
          >
            Configure Workflow
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PieChartComponent from '../charts/PieChartComponent.vue'

// Define interfaces for type safety
interface WorkflowData {
  tasks_requiring_approval: number;
  tasks_in_approval: number;
  tasks_approved: number;
  pending_my_approval: number;
}

interface ApprovalChartItem {
  name: string;
  value: number;
  display_name: string;
}

interface RecentApproval {
  id: number;
  title: string;
  client_name: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  updated_at: Date;
}

interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  isLoading?: boolean;
}

type ApprovalStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits([
  'viewAllApprovals', 
  'viewApproval', 
  'workflowFilterChange', 
  'chartClick',
  'viewPendingApprovals',
  'viewApprovalHistory',
  'configureWorkflow'
])

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const { businessIntelligence } = storeToRefs(dashboardStore)
const { isAdmin } = storeToRefs(authStore)

const selectedWorkflowFilter = ref('all')

const workflowFilterOptions: FilterOption[] = [
  { label: 'All Workflows', value: 'all' },
  { label: 'Pending Only', value: 'pending' },
  { label: 'My Approvals', value: 'my_approvals' },
  { label: 'Recently Approved', value: 'recent_approved' }
]

const workflowData = computed((): WorkflowData => {
  return businessIntelligence.value?.approval_workflow || {
    tasks_requiring_approval: 0,
    tasks_in_approval: 0,
    tasks_approved: 0,
    pending_my_approval: 0
  }
})

const approvalChartData = computed((): ApprovalChartItem[] | null => {
  if (!workflowData.value || Object.keys(workflowData.value).length === 0) return null
  
  const data: ApprovalChartItem[] = []
  
  if (workflowData.value.tasks_requiring_approval > 0) {
    data.push({
      name: 'Pending Approval',
      value: workflowData.value.tasks_requiring_approval,
      display_name: 'Pending Approval'
    })
  }
  
  if (workflowData.value.tasks_in_approval > 0) {
    data.push({
      name: 'In Review',
      value: workflowData.value.tasks_in_approval,
      display_name: 'In Review'
    })
  }
  
  if (workflowData.value.tasks_approved > 0) {
    data.push({
      name: 'Approved',
      value: workflowData.value.tasks_approved,
      display_name: 'Approved'
    })
  }
  
  return data.length > 0 ? data : null
})

// Mock data for recent approvals - in real implementation, this would come from the API
const recentApprovals = computed((): RecentApproval[] => {
  // This would typically come from the enhanced statistics API or a separate approvals endpoint
  return [
    {
      id: 1,
      title: 'Tax Compliance Review',
      client_name: 'Christine Vang',
      status: 'approved' as const,
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      title: 'Financial Statement Audit',
      client_name: 'Fletcher Rice',
      status: 'pending' as const,
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      id: 3,
      title: 'Quarterly Report',
      client_name: 'Aristotle Walton',
      status: 'in_review' as const,
      updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
    },
    {
      id: 4,
      title: 'Budget Analysis',
      client_name: 'Hiroko Snowee',
      status: 'rejected' as const,
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    }
  ]
})

const getApprovalStatusIcon = (status: ApprovalStatus): string => {
  const icons: Record<ApprovalStatus, string> = {
    pending: 'mdi:clock-outline',
    in_review: 'mdi:eye-outline',
    approved: 'mdi:check-circle-outline',
    rejected: 'mdi:close-circle-outline'
  }
  return icons[status] || icons.pending
}

const getApprovalStatusIconClasses = (status: ApprovalStatus): string => {
  const base = 'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center'
  const colors: Record<ApprovalStatus, string> = {
    pending: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200',
    in_review: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
  }
  return `${base} ${colors[status] || colors.pending}`
}

const getApprovalStatusColor = (status: ApprovalStatus): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  const colors: Record<ApprovalStatus, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    pending: 'warning',
    in_review: 'info',
    approved: 'success',
    rejected: 'error'
  }
  return colors[status] || colors.pending
}

const formatApprovalStatus = (status: ApprovalStatus): string => {
  return status.replace('_', ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatApprovalTime = (timestamp: Date): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

const handleWorkflowFilterChange = (filter: any): void => {
  const filterValue = typeof filter === 'string' ? filter : filter?.value || filter
  selectedWorkflowFilter.value = filterValue
  emit('workflowFilterChange', filterValue)
}

const handleApprovalChartClick = (params: any): void => {
  emit('chartClick', { type: 'approval_status', params })
}

const viewAllApprovals = (): void => {
  emit('viewAllApprovals')
}

const viewApprovalDetails = (approval: RecentApproval): void => {
  emit('viewApproval', approval)
}

const viewPendingApprovals = (): void => {
  emit('viewPendingApprovals')
}

const viewApprovalHistory = (): void => {
  emit('viewApprovalHistory')
}

const configureWorkflow = (): void => {
  emit('configureWorkflow')
}

onMounted(() => {
  // Component initialization
})
</script>

<style scoped>
@reference "tailwindcss";

.approval-workflow-panel {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
}

.status-card {
  @apply p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600;
}

.approval-item {
  @apply flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer;
}

.approval-item:hover {
  @apply shadow-sm transform scale-[1.01];
}

.approval-info {
  @apply min-w-0;
}

.approval-title {
  @apply truncate;
}

/* Loading animations */
.approval-item-skeleton {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg;
}

/* Custom scrollbar for approvals list */
.approvals-list::-webkit-scrollbar {
  @apply w-2;
}

.approvals-list::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700 rounded-full;
}

.approvals-list::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.approvals-list::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
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