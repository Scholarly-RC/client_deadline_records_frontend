<script setup lang="ts">
import { getDaysRemaining } from "~/utils/getDaysRemaining";
import PriorityBadge from "../ui/PriorityBadge.vue";
import StatusBadge from "../ui/StatusBadge.vue";
import ApprovalHistoryComponent from "../tasks/ApprovalHistoryComponent.vue";
import ApprovalWorkflowModal from "../tasks/ApprovalWorkflowModal.vue";
import TaskCompletionModal from "../tasks/TaskCompletionModal.vue";
import type { TaskList, TaskCompletionRequest } from "~/types";

interface Props {
  task: TaskList;
  category: string;
}

interface Emits {
  (e: 'task-updated', taskId: number): void;
  (e: 'approval-initiated', taskId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const taskUpdate = useTaskUpdate();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const userTasksStore = useUserTasksStore();

const showApprovalHistoryModal = ref(false);
const showStatusHistoryModal = ref(false);
const showApprovalModal = ref(false);

// Task completion state
const showCompletionModal = ref(false);
const isCompletingTask = ref(false);

const daysRemaining = computed(() => {
  return getDaysRemaining(props.task.deadline_days_remaining);
});

// Create a local reactive copy of the task to ensure reactivity
const localTask = ref<TaskList>({ ...props.task });

// Watch for changes in the task prop and update local copy
watch(
  () => props.task,
  (newTask: TaskList) => {
    localTask.value = { ...newTask };
    // Fetch status history when task prop changes
    fetchStatusHistory();
  },
  { deep: true }
);

// Fetch status history for the current task
const fetchStatusHistory = async (): Promise<void> => {
  try {
    await taskStore.fetchStatusHistory(localTask.value.id);
  } catch (error) {
    console.error("Error fetching status history:", error);
  }
};

// Computed property for status history - now properly fetches from status history endpoint
const history = computed(() => {
  // First check if we have status history for this task
  const statusHistory = taskStore.statusHistory[localTask.value.id];
  if (statusHistory) {
    return statusHistory;
  }

  // Fallback to the direct field if available
  return localTask.value.status_history || [];
});

const hasHistory = computed(() => {
  // Check if we have any status history to display
  const statusHistory = history.value;
  return statusHistory && statusHistory.length > 0;
});

const canApprove = computed(() => {
  return taskStore.canApproveTask(localTask.value);
});

const canInitiateApproval = computed(() => {
  return taskStore.canInitiateApproval(localTask.value);
});

const canMarkComplete = computed(() => {
  return taskStore.canMarkTaskComplete(localTask.value);
});

const hasApprovalWorkflow = computed(() => {
  return localTask.value.requires_approval;
});

const shouldShowApprovalHistory = computed(() => {
  // Show if has approval workflow OR status is completed
  return (
    localTask.value.requires_approval ||
    localTask.value.current_approval_step ||
    (localTask.value.approval_history && localTask.value.approval_history.length > 0) ||
    localTask.value.status === "completed"
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
  return !hiddenStatuses.includes(localTask.value.status);
});

const openApprovalHistory = (): void => {
  showApprovalHistoryModal.value = true;
};

const openStatusHistory = (): void => {
  showStatusHistoryModal.value = true;
};

const onApprovalAction = async (): Promise<void> => {
  // Emit event to notify parent to refresh only this specific task
  emit("task-updated", localTask.value.id);
};

const initiateApproval = (): void => {
  showApprovalModal.value = true;
};

const onApprovalInitiated = async (): Promise<void> => {
  showApprovalModal.value = false;
  // Emit event to notify parent to refresh only this specific task
  emit("approval-initiated", localTask.value.id);
};

const openAddUpdate = (): void => {
  taskUpdate.open(props.category, localTask.value);
};

// Task completion methods
const openCompletionModal = (): void => {
  showCompletionModal.value = true;
};

const handleTaskCompletion = async (completionData: { remarks: string }): Promise<void> => {
  isCompletingTask.value = true;
  try {
    // Convert simple completion data to TaskCompletionRequest
    const fullCompletionData: TaskCompletionRequest = {
      remarks: completionData.remarks,
      completion_date: new Date().toISOString().split('T')[0],
      date_complied: new Date().toISOString().split('T')[0],
    };

    // Use userTasks store if available, otherwise use tasks store
    const userTasksStore = useUserTasksStore();
    if (userTasksStore && userTasksStore.markTaskCompleted) {
      await userTasksStore.markTaskCompleted(
        localTask.value.id,
        fullCompletionData
      );
    } else {
      await taskStore.markCompleted(localTask.value.id, fullCompletionData);
    }

    showCompletionModal.value = false;
    // Emit event to notify parent to refresh this specific task
    emit("task-updated", localTask.value.id);
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

// Watch for when the task update modal closes (indicating completion)
watch(
  () => taskUpdate.showModal,
  async (newValue: boolean, oldValue: boolean): Promise<void> => {
    // If modal was open and is now closed, update was likely completed
    if (
      oldValue &&
      !newValue &&
      taskUpdate.task?.id === localTask.value.id
    ) {
      // Add a small delay to ensure backend processing is complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh the local task data immediately
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.getTask(
          localTask.value.id
        );
        // Convert Task to TaskList format or use type assertion since the UI fields are compatible
        localTask.value = updatedTask as any as TaskList;

        // Fetch status history which should contain the status history
        await taskStore.fetchStatusHistory(localTask.value.id);

        // Emit event to notify parent to refresh only this specific task
        emit("task-updated", localTask.value.id);
      } catch (error) {
        console.error("Error refreshing task data:", error);
        // Fallback to emitting the event even if refresh fails
        emit("task-updated", localTask.value.id);
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
      <h3 class="text-lg font-semibold">{{ localTask.client_name }}</h3>
    </template>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Task ID:</span>
        <span class="text-sm">#{{ localTask.id }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Due Date:</span>
        <span class="text-sm">{{ localTask.deadline }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Days Remaining:</span>
        <span class="text-sm">{{ daysRemaining }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Priority:</span>
        <PriorityBadge :priority="localTask.priority" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Status:</span>
        <StatusBadge :status="localTask.status" />
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
          <div>Step: {{ localTask.current_approval_step }}</div>
          <div v-if="localTask.pending_approver">
            Pending: {{ localTask.pending_approver.fullname }}
          </div>
        </div>
      </div>

      <div v-if="localTask.description">
        <span class="text-sm font-medium">Description:</span>
        <p class="text-sm">{{ localTask.description }}</p>
      </div>
      <div v-if="localTask.needed_data">
        <span class="text-sm font-medium">Needed Data:</span>
        <p class="text-sm">{{ localTask.needed_data }}</p>
      </div>
      <div v-if="localTask.category_name">
        <span class="text-sm font-medium">Category:</span>
        <p class="text-sm">{{ localTask.category_name }}</p>
      </div>
      <div v-if="localTask.type_name">
        <span class="text-sm font-medium">Type:</span>
        <p class="text-sm">{{ localTask.type_name }}</p>
      </div>
      <div v-if="localTask.form_name">
        <span class="text-sm font-medium">Form:</span>
        <p class="text-sm">{{ localTask.form_name }}</p>
      </div>
      <div v-if="localTask.period_covered">
        <span class="text-sm font-medium">Period Covered:</span>
        <p class="text-sm">{{ localTask.period_covered }}</p>
      </div>
      <div v-if="localTask.tax_payable">
        <span class="text-sm font-medium">Tax Payable:</span>
        <p class="text-sm">{{ localTask.tax_payable }}</p>
      </div>
      <div v-if="localTask.remarks">
        <span class="text-sm font-medium">Remarks:</span>
        <p class="text-sm max-w-xs break-words">{{ localTask.remarks }}</p>
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
          v-if="
            canShowAddUpdateButton || canInitiateApproval || canMarkComplete
          "
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
            color="primary"
            size="sm"
          />
        </div>
      </div>
    </template>

    <!-- Approval History Modal -->
    <UModal
      v-model:open="showApprovalHistoryModal"
      :title="`Approval History - ${localTask.description}`"
      description="View the complete approval workflow history for this task"
      :ui="{ content: 'sm:max-w-4xl' } as any"
    >
      <template #content>
        <UCard>

          <ApprovalHistoryComponent :task="localTask" />

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
      :title="`Status History - ${localTask.description}`"
      description="View the complete status change history for this task"
      :ui="{ content: 'sm:max-w-4xl' } as any"
    >
      <template #content>
        <UCard>

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
                    <StatusBadge v-if="historyItem.old_status" :status="historyItem.old_status" />
                    <span v-else class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">No previous status</span>
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
      :task="localTask"
      @approved="onApprovalInitiated"
    />

    <!-- Task Completion Modal -->
    <TaskCompletionModal
      v-model="showCompletionModal"
      :task="localTask"
      :is-submitting="isCompletingTask"
      @complete="handleTaskCompletion"
    />
  </UCard>
</template>
