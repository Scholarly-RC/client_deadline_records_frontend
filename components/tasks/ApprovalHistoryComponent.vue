<template>
  <div class="space-y-6">
    <!-- Approval Workflow Status -->
    <div v-if="task.requires_approval || task.current_approval_step" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div class="flex items-center space-x-2 mb-3">
        <UIcon name="i-lucide-check-circle" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 class="font-medium text-blue-800 dark:text-blue-200">
          {{ task.requires_approval ? 'Approval Workflow Active' : 'Approval Workflow Completed' }}
        </h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div v-if="task.current_approval_step">
          <span class="text-gray-600 dark:text-gray-400">Current Step:</span>
          <span class="ml-2 font-medium">{{ task.current_approval_step }}</span>
        </div>
        <div v-if="task.requires_approval && task.pending_approver">
          <span class="text-gray-600 dark:text-gray-400">Pending Approver:</span>
          <span class="ml-2 font-medium">{{ task.pending_approver?.fullname || 'None' }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-400">Status:</span>
          <StatusPill :status="task.status" class="ml-2" />
        </div>
      </div>
    </div>

    <!-- Approval History Timeline -->
    <div v-if="approvalHistory?.approvals?.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Approval History
      </h3>
      
      <div class="space-y-4">
        <div 
          v-for="approval in approvalHistory.approvals" 
          :key="approval.id"
          class="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                 :class="getApprovalStatusClasses(approval.action)">
              <UIcon :name="getApprovalIcon(approval.action)" class="h-4 w-4" />
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ approval.approver.fullname }}
                </span>
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                      :class="getApprovalBadgeClasses(approval.action)">
                  {{ approval.action_display }}
                </span>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Step {{ approval.step_number }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {{ approval.created_at }}
            </p>
            
            <div v-if="approval.comments" class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded p-2">
              "{{ approval.comments }}"
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No History Message -->
    <div v-if="!approvalHistory?.approvals?.length" class="text-center py-8">
      <UIcon name="i-lucide-history" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">No approval history available</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useTaskStore } from '~/stores/tasks';
import StatusPill from '../ui/StatusPill.vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  autoFetch: {
    type: Boolean,
    default: true
  }
});

const taskStore = useTaskStore();

const approvalHistory = computed(() => {
  return taskStore.approvalHistory[props.task.id] || null;
});

const getApprovalStatusClasses = (action) => {
  switch (action) {
    case 'approved':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
  }
};

const getApprovalBadgeClasses = (action) => {
  switch (action) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getApprovalIcon = (action) => {
  switch (action) {
    case 'approved':
      return 'i-lucide-check';
    case 'rejected':
      return 'i-lucide-x';
    case 'pending':
      return 'i-lucide-clock';
    default:
      return 'i-lucide-help-circle';
  }
};

// Fetch approval history when component mounts or task changes
const fetchHistory = async () => {
  if (props.task?.id && props.autoFetch) {
    await taskStore.fetchApprovalHistory(props.task.id);
  }
};

onMounted(fetchHistory);

watch(() => props.task?.id, fetchHistory, { immediate: true });
</script>