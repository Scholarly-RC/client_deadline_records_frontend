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
  return taskStore.canInitiateApproval(props.deadline);
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
      <div class="flex justify-end gap-2">
        <UButton
          v-if="hasApprovalWorkflow"
          @click="openApprovalHistory"
          label="Approval History"
          variant="soft"
          color="blue"
          size="sm"
        />

        <UButton
          v-if="canInitiateApproval"
          @click="openApprovalWorkflow"
          label="Request Approval"
          variant="soft"
          color="green"
          size="sm"
        />

        <UButton
          v-if="canShowAddUpdateButton"
          @click="deadlineUpdate.open(category, deadline)"
          label="Add Update"
          variant="soft"
          color="primary"
          size="sm"
        />
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
  </UCard>
</template>
