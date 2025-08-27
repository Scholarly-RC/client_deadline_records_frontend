<script setup>
import { getDaysRemaining } from "~/utils/getDaysRemaining";
import PriorityBadge from "../ui/PriorityBadge.vue";
import StatusBadge from "../ui/StatusBadge.vue";
import ApprovalHistoryComponent from "../tasks/ApprovalHistoryComponent.vue";
import ApprovalWorkflowModal from "../tasks/ApprovalWorkflowModal.vue";
import TaskCompletionModal from "../tasks/TaskCompletionModal.vue";

const deadlineUpdate = useDeadlineUpdate();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const userDeadlinesStore = useUserDeadlinesStore();

const props = defineProps({
  deadline: {
    type: Object,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["task-updated", "approval-initiated"]);

const showApprovalHistoryModal = ref(false);
const showStatusHistoryModal = ref(false);
const showApprovalModal = ref(false);

// Task completion state
const showCompletionModal = ref(false);
const isCompletingTask = ref(false);

const daysRemaining = computed(() => {
  return getDaysRemaining(props.deadline.deadline_days_remaining);
});

// Create a local reactive copy of the deadline to ensure reactivity
const localDeadline = ref({ ...props.deadline });

// Watch for changes in the deadline prop and update local copy
watch(
  () => props.deadline,
  (newDeadline) => {
    localDeadline.value = { ...newDeadline };
    // Fetch status history when deadline prop changes
    fetchStatusHistory();
  },
  { deep: true }
);

// Fetch status history for the current task
const fetchStatusHistory = async () => {
  try {
    await taskStore.fetchStatusHistory(localDeadline.value.id);
  } catch (error) {
    console.error("Error fetching status history:", error);
  }
};

// Computed property for status history - now properly fetches from status history endpoint
const history = computed(() => {
  // First check if we have status history for this task
  const statusHistory = taskStore.statusHistory[localDeadline.value.id];
  if (statusHistory) {
    return statusHistory;
  }

  // Fallback to the direct field if available
  return localDeadline.value.status_history || [];
});

const hasHistory = computed(() => {
  // Check if we have any status history to display
  const statusHistory = history.value;
  return statusHistory && statusHistory.length > 0;
});

const canApprove = computed(() => {
  return taskStore.canApproveTask(localDeadline.value);
});

const canInitiateApproval = computed(() => {
  return taskStore.canInitiateApproval(localDeadline.value);
});

const canMarkComplete = computed(() => {
  return taskStore.canMarkTaskComplete(localDeadline.value);
});

const hasApprovalWorkflow = computed(() => {
  return localDeadline.value.requires_approval;
});

const shouldShowApprovalHistory = computed(() => {
  // Show if has approval workflow OR status is completed
  return (
    localDeadline.value.requires_approval ||
    localDeadline.value.current_approval_step ||
    localDeadline.value.approval_history?.length > 0 ||
    localDeadline.value.status === "completed"
  );
});

const canShowAddUpdateButton = computed(() => {
  // Show Add Update if status is NOT for_revision, completed, for_checking, or cancelled
  const hiddenStatuses = [
    "for_revision",
    "completed",
    "for_checking",
    "cancelled",
  ];
  return !hiddenStatuses.includes(localDeadline.value.status);
});

const openApprovalHistory = () => {
  showApprovalHistoryModal.value = true;
};

const openStatusHistory = () => {
  showStatusHistoryModal.value = true;
};

const onApprovalAction = async () => {
  // Emit event to notify parent to refresh only this specific task
  emit("task-updated", localDeadline.value.id);
};

const initiateApproval = () => {
  showApprovalModal.value = true;
};

const onApprovalInitiated = async () => {
  showApprovalModal.value = false;
  // Emit event to notify parent to refresh only this specific task
  emit("approval-initiated", localDeadline.value.id);
};

const openAddUpdate = () => {
  deadlineUpdate.open(props.category, localDeadline.value);
};

// Task completion methods
const openCompletionModal = () => {
  showCompletionModal.value = true;
};

const handleTaskCompletion = async (completionData) => {
  isCompletingTask.value = true;
  try {
    // Use userDeadlines store if available, otherwise use tasks store
    const userDeadlinesStore = useUserDeadlinesStore();
    if (userDeadlinesStore && userDeadlinesStore.markTaskCompleted) {
      await userDeadlinesStore.markTaskCompleted(localDeadline.value.id, completionData);
    } else {
      await taskStore.markCompleted(localDeadline.value.id, completionData);
    }
    
    showCompletionModal.value = false;
    // Emit event to notify parent to refresh this specific task
    emit("task-updated", localDeadline.value.id);
  } catch (error) {
    console.error("Error completing task:", error);
  } finally {
    isCompletingTask.value = false;
  }
};

// Fetch status history when component is mounted
onMounted(() => {
  fetchStatusHistory();
});

// Watch for when the deadline update modal closes (indicating completion)
watch(
  () => deadlineUpdate.showModal,
  async (newValue, oldValue) => {
    // If modal was open and is now closed, update was likely completed
    if (
      oldValue &&
      !newValue &&
      deadlineUpdate.deadline?.id === localDeadline.value.id
    ) {
      // Add a small delay to ensure backend processing is complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh the local deadline data immediately
      try {
        const taskService = useTaskService();
        const updatedDeadline = await taskService.getTask(
          localDeadline.value.id
        );
        localDeadline.value = updatedDeadline;

        // Fetch status history which should contain the status history
        await taskStore.fetchStatusHistory(localDeadline.value.id);

        // Emit event to notify parent to refresh only this specific task
        emit("task-updated", localDeadline.value.id);
      } catch (error) {
        console.error("Error refreshing deadline data:", error);
        // Fallback to emitting the event even if refresh fails
        emit("task-updated", localDeadline.value.id);
      }
    }
  }
);
</script>

<template>
  <UCard
    class="w-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
    variant="subtle"
  >
    <template #header>
      <h3 class="text-lg font-semibold">{{ localDeadline.client_name }}</h3>
    </template>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Task ID:</span>
        <span class="text-sm">#{{ localDeadline.id }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Due Date:</span>
        <span class="text-sm">{{ localDeadline.deadline }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Days Remaining:</span>
        <span class="text-sm">{{ daysRemaining }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Priority:</span>
        <PriorityBadge :priority="localDeadline.priority" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Status:</span>
        <StatusBadge :status="localDeadline.status" />
      </div>

      <!-- Approval Workflow Status -->
      <div
        v-if="hasApprovalWorkflow"
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2"
      >
        <div class="flex items-center space-x-2 mb-1">
          <UIcon
            name="i-lucide-check-circle"
            class="h-4 w-4 text-blue-600 dark:text-blue-400"
          />
          <span class="text-xs font-medium text-blue-800 dark:text-blue-200"
            >Approval Workflow</span
          >
        </div>
        <div class="text-xs text-blue-700 dark:text-blue-300">
          <div>Step: {{ localDeadline.current_approval_step }}</div>
          <div v-if="localDeadline.pending_approver">
            Pending: {{ localDeadline.pending_approver.fullname }}
          </div>
        </div>
      </div>

      <div v-if="localDeadline.description">
        <span class="text-sm font-medium">Description:</span>
        <p class="text-sm">{{ localDeadline.description }}</p>
      </div>
      <div v-if="localDeadline.needed_data">
        <span class="text-sm font-medium">Needed Data:</span>
        <p class="text-sm">{{ localDeadline.needed_data }}</p>
      </div>
      <div v-if="localDeadline.category_name">
        <span class="text-sm font-medium">Category:</span>
        <p class="text-sm">{{ localDeadline.category_name }}</p>
      </div>
      <div v-if="localDeadline.type_name">
        <span class="text-sm font-medium">Type:</span>
        <p class="text-sm">{{ localDeadline.type_name }}</p>
      </div>
      <div v-if="localDeadline.form_name">
        <span class="text-sm font-medium">Form:</span>
        <p class="text-sm">{{ localDeadline.form_name }}</p>
      </div>
      <div v-if="localDeadline.period_covered">
        <span class="text-sm font-medium">Period Covered:</span>
        <p class="text-sm">{{ localDeadline.period_covered }}</p>
      </div>
      <div v-if="localDeadline.tax_payable">
        <span class="text-sm font-medium">Tax Payable:</span>
        <p class="text-sm">{{ localDeadline.tax_payable }}</p>
      </div>
      <div v-if="localDeadline.remarks">
        <span class="text-sm font-medium">Remarks:</span>
        <p class="text-sm max-w-xs break-words">{{ localDeadline.remarks }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-2">
        <!-- History Buttons Row -->
        <div
          v-if="hasHistory || shouldShowApprovalHistory"
          class="flex gap-2 justify-center"
        >
          <UButton
            v-if="hasHistory"
            @click="openStatusHistory"
            label="Status History"
            icon="i-lucide-history"
            variant="outline"
            color="neutral"
            size="xs"
          />
          <UButton
            v-if="shouldShowApprovalHistory"
            @click="openApprovalHistory"
            label="Approval History"
            icon="i-lucide-scroll-text"
            variant="outline"
            color="neutral"
            size="xs"
          />
        </div>

        <!-- Action Buttons Row -->
        <div
          v-if="canShowAddUpdateButton || canInitiateApproval || canMarkComplete"
          class="flex gap-2 justify-center flex-wrap"
        >
          <UButton
            v-if="canMarkComplete"
            @click="openCompletionModal"
            label="Mark Complete"
            icon="i-heroicons-check-circle"
            variant="soft"
            color="success"
            size="sm"
          />
          <UButton
            v-if="canShowAddUpdateButton"
            @click="openAddUpdate"
            label="Add Update"
            icon="i-lucide-plus"
            variant="soft"
            color="primary"
            size="sm"
          />
          <UButton
            v-if="canInitiateApproval"
            @click="initiateApproval"
            label="Request Approval"
            icon="i-lucide-check-circle"
            variant="soft"
            color="blue"
            size="sm"
          />
        </div>
      </div>
    </template>

    <!-- Approval History Modal -->
    <UModal
      v-model:open="showApprovalHistoryModal"
      :ui="{ width: 'sm:max-w-4xl' }"
    >
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              Approval History - {{ localDeadline.description }}
            </h3>
          </template>

          <ApprovalHistoryComponent :task="localDeadline" />

          <template #footer>
            <div class="flex justify-end">
              <UButton
                @click="showApprovalHistoryModal = false"
                variant="ghost"
              >
                Close
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Status History Modal -->
    <UModal
      v-model:open="showStatusHistoryModal"
      :ui="{ width: 'sm:max-w-4xl' }"
    >
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              Status History - {{ localDeadline.description }}
            </h3>
          </template>

          <div class="space-y-4">
            <div v-if="hasHistory" class="max-h-96 overflow-y-auto">
              <div
                v-for="(historyItem, index) in history"
                :key="index"
                class="border-l-4 border-blue-200 pl-4 py-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <span
                      class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium"
                    >
                      {{ historyItem.change_type_display || "Status Change" }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 pe-3">
                    {{ historyItem.formatted_date }}
                  </span>
                </div>

                <div class="space-y-1">
                  <div
                    v-if="historyItem.old_status !== historyItem.new_status"
                    class="flex items-center space-x-2 text-sm"
                  >
                    <span class="text-gray-600 dark:text-gray-400"
                      >Status:</span
                    >
                    <StatusBadge :status="historyItem.old_status" />
                    <UIcon
                      name="i-lucide-arrow-right"
                      class="h-3 w-3 text-gray-400"
                    />
                    <StatusBadge :status="historyItem.new_status" />
                  </div>

                  <div v-else class="flex items-center space-x-2 text-sm">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Status:</span
                    >
                    <span
                      class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {{ historyItem.new_status }}
                    </span>
                    <span class="text-xs text-gray-500">(No change)</span>
                  </div>

                  <div v-if="historyItem.remarks" class="text-sm">
                    <span class="text-gray-600 dark:text-gray-400 font-medium"
                      >Remarks:</span
                    >
                    <p class="text-gray-700 dark:text-gray-300 mt-1">
                      {{ historyItem.remarks }}
                    </p>
                  </div>

                  <div class="text-xs text-gray-500 mt-2">
                    <span class="font-medium">Changed by:</span>
                    {{ historyItem.changed_by.fullname }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <UIcon name="i-lucide-clock" class="h-12 w-12 mx-auto mb-2" />
              <p>No status history available</p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton @click="showStatusHistoryModal = false" variant="ghost">
                Close
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Approval Workflow Modal -->
    <ApprovalWorkflowModal
      v-model="showApprovalModal"
      :task="localDeadline"
      @approved="onApprovalInitiated"
    />

    <!-- Task Completion Modal -->
    <TaskCompletionModal
      v-model="showCompletionModal"
      :task="localDeadline"
      :is-submitting="isCompletingTask"
      @complete="handleTaskCompletion"
    />
  </UCard>
</template>
