<script setup>
import { getDaysRemaining } from "~/utils/getDaysRemaining";
import PriorityBadge from "../ui/PriorityBadge.vue";
import StatusBadge from "../ui/StatusBadge.vue";
import ApprovalActionsPanel from "../tasks/ApprovalActionsPanel.vue";
import ApprovalWorkflowModal from "../tasks/ApprovalWorkflowModal.vue";
import ApprovalHistoryComponent from "../tasks/ApprovalHistoryComponent.vue";

const deadlineUpdate = useDeadlineUpdate();
const taskStore = useTaskStore();
const authStore = useAuthStore();

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

const showApprovalModal = ref(false);
const showApprovalHistoryModal = ref(false);
const showStatusHistoryModal = ref(false);

const daysRemaining = computed(() => {
  return getDaysRemaining(props.deadline.deadline_days_remaining);
});

const history = computed(() => {
  return props.deadline.status_history || [];
});

const hasHistory = computed(() => {
  return history.value && history.value.length > 0;
});

const canInitiateApproval = computed(() => {
  const allowedStatuses = ["on_going", "for_revision"];
  return (
    taskStore.canInitiateApproval(props.deadline) &&
    allowedStatuses.includes(props.deadline.status)
  );
});

const canApprove = computed(() => {
  return taskStore.canApproveTask(props.deadline);
});

const hasApprovalWorkflow = computed(() => {
  return props.deadline.requires_approval;
});

const canShowAddUpdateButton = computed(() => {
  const hiddenStatuses = ["for_revision", "cancelled", "completed"];
  return !hiddenStatuses.includes(props.deadline.status);
});

const openApprovalWorkflow = () => {
  showApprovalModal.value = true;
};

const openApprovalHistory = () => {
  showApprovalHistoryModal.value = true;
};

const openStatusHistory = () => {
  showStatusHistoryModal.value = true;
};

const onApprovalAction = () => {
  // Refresh task data after approval action
  taskStore.fetchTasks();
};
</script>

<template>
  <UCard
    class="w-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
    variant="subtle"
  >
    <template #header>
      <h3 class="text-lg font-semibold">{{ deadline.client_name }}</h3>
    </template>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Task ID:</span>
        <span class="text-sm">#{{ deadline.id }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Due Date:</span>
        <span class="text-sm">{{ deadline.deadline }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Days Remaining:</span>
        <span class="text-sm">{{ daysRemaining }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Priority:</span>
        <PriorityBadge :priority="deadline.priority" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Status:</span>
        <StatusBadge :status="deadline.status" />
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
          <div>Step: {{ deadline.current_approval_step }}</div>
          <div v-if="deadline.pending_approver">
            Pending: {{ deadline.pending_approver.fullname }}
          </div>
        </div>
      </div>

      <div v-if="deadline.description">
        <span class="text-sm font-medium">Description:</span>
        <p class="text-sm">{{ deadline.description }}</p>
      </div>
      <div v-if="deadline.needed_data">
        <span class="text-sm font-medium">Needed Data:</span>
        <p class="text-sm">{{ deadline.needed_data }}</p>
      </div>
      <div v-if="deadline.category_name">
        <span class="text-sm font-medium">Category:</span>
        <p class="text-sm">{{ deadline.category_name }}</p>
      </div>
      <div v-if="deadline.type_name">
        <span class="text-sm font-medium">Type:</span>
        <p class="text-sm">{{ deadline.type_name }}</p>
      </div>
      <div v-if="deadline.form_name">
        <span class="text-sm font-medium">Form:</span>
        <p class="text-sm">{{ deadline.form_name }}</p>
      </div>
      <div v-if="deadline.period_covered">
        <span class="text-sm font-medium">Period Covered:</span>
        <p class="text-sm">{{ deadline.period_covered }}</p>
      </div>
      <div v-if="deadline.tax_payable">
        <span class="text-sm font-medium">Tax Payable:</span>
        <p class="text-sm">{{ deadline.tax_payable }}</p>
      </div>
      <div v-if="deadline.remarks">
        <span class="text-sm font-medium">Remarks:</span>
        <p class="text-sm max-w-xs break-words">{{ deadline.remarks }}</p>
      </div>
    </div>

    <!-- Approval Actions Panel for Current Approver -->
    <ApprovalActionsPanel
      v-if="canApprove"
      :task="deadline"
      @approved="onApprovalAction"
      @rejected="onApprovalAction"
      @forwarded="onApprovalAction"
    />

    <template #footer>
      <div class="flex flex-col gap-2">
        <!-- History Buttons Row -->
        <div 
          v-if="hasHistory || hasApprovalWorkflow" 
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
            v-if="hasApprovalWorkflow"
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
          v-if="canInitiateApproval || canShowAddUpdateButton" 
          class="flex gap-2 justify-center"
        >
          <UButton
            v-if="canInitiateApproval"
            @click="openApprovalWorkflow"
            label="Request Approval"
            icon="i-lucide-check-circle"
            variant="soft"
            color="success"
            size="sm"
          />
          <UButton
            v-if="canShowAddUpdateButton"
            @click="deadlineUpdate.open(category, deadline)"
            label="Add Update"
            icon="i-lucide-plus"
            variant="soft"
            color="primary"
            size="sm"
          />
        </div>
      </div>
    </template>

    <!-- Approval Workflow Modal -->
    <ApprovalWorkflowModal
      v-model="showApprovalModal"
      :task="deadline"
      @approved="onApprovalAction"
    />

    <!-- Approval History Modal -->
    <UModal
      v-model:open="showApprovalHistoryModal"
      :ui="{ width: 'sm:max-w-4xl' }"
    >
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              Approval History - {{ deadline.description }}
            </h3>
          </template>

          <ApprovalHistoryComponent :task="deadline" />

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
              Status History - {{ deadline.description }}
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
                      {{ historyItem.change_type || "Status Change" }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 pe-2.5">
                    {{ historyItem.date }}
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
                    {{ historyItem.changed_by }}
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
  </UCard>
</template>
