<script setup lang="ts">
import {
  categoryChoices,
  statusChoices,
  priorityChoices,
  taxCaseCategoryChoices,
  birFormChoices,
  typeOfTaxCaseChoices,
  fsrTypeChoices,
  TASK_CATEGORIES,
  CATEGORY_FIELDS,
} from "~/constants/choices";
import StatusBadge from "../ui/StatusBadge.vue";
import PriorityBadge from "../ui/PriorityBadge.vue";
import type { Task, TaskList, StatusHistoryEntry, ApprovalHistoryEntry } from '~/types/entities'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object as PropType<TaskList | Task>,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Reactive state
const taskData = ref<Task | null>(null);
const taskApprovals = ref<ApprovalHistoryEntry[]>([]);
const statusHistory = ref<StatusHistoryEntry[]>([]);
const isLoading = ref<boolean>(false);
const isLoadingApprovals = ref<boolean>(false);
const isLoadingHistory = ref<boolean>(false);
const error = ref<string | null>(null);

// Computed for modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Computed for current task (prioritize fetched data over prop)
const currentTask = computed(() => {
  return taskData.value || props.task;
});

// Fetch detailed task data from API
const fetchTaskData = async (taskId: number) => {
  if (!taskId) return;

  try {
    isLoading.value = true;
    error.value = null;

    const { $apiFetch } = useNuxtApp();

    // Fetch main task data
    const response = await $apiFetch(`/api/tasks/${taskId}/`);
    taskData.value = response as Task;

    // Fetch additional data in parallel if applicable
    await Promise.allSettled([
      fetchTaskApprovals(taskId),
      fetchStatusHistory(taskId),
    ]);
  } catch (err) {
    console.error("Error fetching task details:", err);
    error.value = "Failed to load task details";

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to load task details. Please try again.",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isLoading.value = false;
  }
};

// Fetch task approvals
const fetchTaskApprovals = async (taskId: number) => {
  try {
    isLoadingApprovals.value = true;
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(`/api/tasks/${taskId}/task-approvals/`);
    taskApprovals.value = response as ApprovalHistoryEntry[];
  } catch (err) {
    console.error("Error fetching task approvals:", err);
    taskApprovals.value = [];
  } finally {
    isLoadingApprovals.value = false;
  }
};

// Fetch status history
const fetchStatusHistory = async (taskId: number) => {
  try {
    isLoadingHistory.value = true;
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(`/api/tasks/${taskId}/status-history/`);
    statusHistory.value = response as StatusHistoryEntry[];
  } catch (err) {
    console.error("Error fetching status history:", err);
    statusHistory.value = [];
  } finally {
    isLoadingHistory.value = false;
  }
};

// Watch for modal opening and task changes
watch(
  () => [props.modelValue, props.task?.id],
  ([isModalOpen, taskId]) => {
    if (isModalOpen && taskId && typeof taskId === 'number') {
      fetchTaskData(taskId);
    }
  },
  { immediate: true }
);

// Watch for modal closing to reset data
watch(
  () => props.modelValue,
  (isModalOpen) => {
    if (!isModalOpen) {
      taskData.value = null;
      error.value = null;
    }
  }
);

// Helper function for approval status colors
const getApprovalStatusColor = (action: string) => {
  switch (action) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
    case "in_review":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";
  }
};

// Helper function for status change title
const getStatusChangeTitle = (history: StatusHistoryEntry) => {
  const oldStatus =
    history.old_status_display || getStatusLabel(history.old_status);
  const newStatus =
    history.new_status_display || getStatusLabel(history.new_status);
  return `Status Updated: ${oldStatus} → ${newStatus}`;
};

// Helper function for history colors
const getHistoryColor = (status: string) => {
  switch (status) {
    case "completed":
      return "green";
    case "on_going":
    case "in_progress":
      return "blue";
    case "not_yet_started":
      return "gray";
    case "pending_approval":
      return "yellow";
    case "cancelled":
      return "red";
    default:
      return "primary";
  }
};

// Helper function for approval content
const getApprovalContent = (approval: ApprovalHistoryEntry) => {
  const parts = [];

  if (approval.approver?.fullname) {
    parts.push(`Approver: ${approval.approver.fullname}`);
  }

  if (approval.action_display) {
    parts.push(`Status: ${approval.action_display}`);
  }

  if (approval.approval_step) {
    parts.push(`Step: ${approval.approval_step}`);
  }

  if (approval.created_at) {
    parts.push(`Created: ${approval.created_at}`);
  }

  if (approval.remarks) {
    parts.push(`Comments: ${approval.remarks}`);
  } else {
    parts.push("Comments: No comments provided");
  }

  return parts.join("\n");
};

// Helper function for approval icons
const getApprovalIcon = (action: string) => {
  switch (action) {
    case 'approve':
    case 'approved':
      return 'i-heroicons-check-circle';
    case 'reject':
    case 'rejected':
      return 'i-heroicons-x-circle';
    case 'pending':
      return 'i-heroicons-clock';
    default:
      return 'i-heroicons-question-mark-circle';
  }
};

// Helper function for status history description
const getHistoryDescription = (history: StatusHistoryEntry) => {
  const parts: string[] = [];
  
  if (history.changed_by?.fullname) {
    parts.push(`Changed by ${history.changed_by.fullname}`);
  }

  if (history.change_type_display) {
    parts.push(`(${history.change_type_display})`);
  }

  if (history.remarks) {
    parts.push(`Remarks: ${history.remarks}`);
  }

  return parts.length > 0 ? parts.join(" ") : "Status change";
};

// Helper function for status history icons
const getHistoryIcon = (status: string) => {
  switch (status) {
    case "completed":
      return "i-lucide-check-circle";
    case "on_going":
    case "in_progress":
      return "i-lucide-arrow-path";
    case "not_yet_started":
      return "i-lucide-play";
    case "pending_approval":
      return "i-lucide-clock";
    case "cancelled":
      return "i-lucide-x-circle";
    default:
      return "i-lucide-activity";
  }
};

// Helper functions for field formatting
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Not specified";

  // If already formatted, return as is
  if (typeof dateString === "string" && dateString.includes(",")) {
    return dateString;
  }

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (amount: number | string | null | undefined) => {
  if (!amount) return "Not specified";
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "Not specified";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(numericAmount);
};

const getDaysRemaining = (deadline: string | null | undefined) => {
  if (!deadline) return null;

  try {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return null;
  }
};

const getDeadlineStatus = (deadline: string | null | undefined) => {
  const days = getDaysRemaining(deadline);
  if (days === null) return "";

  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days remaining`;
};

const getDeadlineColor = (deadline: string | null | undefined) => {
  const days = getDaysRemaining(deadline);
  if (days === null) return "gray";
  if (days < 0) return "red";
  if (days <= 3) return "yellow";
  if (days <= 7) return "blue";
  return "green";
};

// Helper functions to get choice labels
const getCategoryLabel = (categoryValue: string | null | undefined) => {
  const choice = categoryChoices.find((c) => c.value === categoryValue);
  return choice ? choice.label : categoryValue || "Not specified";
};

const getStatusLabel = (statusValue: string | null | undefined) => {
  const choice = statusChoices.find((s) => s.value === statusValue);
  return choice ? choice.label : statusValue || "Not specified";
};

const getPriorityLabel = (priorityValue: string | null | undefined) => {
  const choice = priorityChoices.find((p) => p.value === priorityValue);
  return choice ? choice.label : priorityValue || "Not specified";
};

const getTaxCategoryLabel = (taxCategoryValue: string | null | undefined) => {
  const choice = taxCaseCategoryChoices.find(
    (t) => t.value === taxCategoryValue
  );
  return choice ? choice.label : taxCategoryValue || "Not specified";
};

const getTaxTypeLabel = (taxTypeValue: string | null | undefined) => {
  const choice = typeOfTaxCaseChoices.find((t) => t.value === taxTypeValue);
  return choice ? choice.label : taxTypeValue || "Not specified";
};

const getBirFormLabel = (birFormValue: string | null | undefined) => {
  const choice = birFormChoices.find((b) => b.value === birFormValue);
  return choice ? choice.label : birFormValue || "Not specified";
};

const getFsrTypeLabel = (fsrTypeValue: string | null | undefined) => {
  const choice = fsrTypeChoices.find((f) => f.value === fsrTypeValue);
  return choice ? choice.label : fsrTypeValue || "Not specified";
};

// Computed for category-specific fields
const categorySpecificFields = computed(() => {
  if (!currentTask.value?.category) return [];

  const categoryConfig = CATEGORY_FIELDS[currentTask.value.category];
  return categoryConfig ? categoryConfig.fields : [];
});

// Helper function to safely get task field value
const getTaskFieldValue = (task: any, fieldName: string) => {
  return task ? task[fieldName] : undefined;
};

// Field display configuration
const getFieldDisplayValue = (fieldName: string, value: any) => {
  if (!value && value !== 0) return "Not specified";

  switch (fieldName) {
    case "tax_payable":
      return formatCurrency(value);
    case "deadline":
    case "engagement_date":
    case "last_followup":
    case "date_complied":
    case "completion_date":
      return formatDate(value);
    case "tax_category":
      return getTaxCategoryLabel(value);
    case "tax_type":
      return getTaxTypeLabel(value);
    case "form":
      return getBirFormLabel(value);
    case "type":
      return getFsrTypeLabel(value);
    case "priority":
      return getPriorityLabel(value);
    case "status":
      return getStatusLabel(value);
    case "category":
      return getCategoryLabel(value);
    default:
      return value;
  }
};

const getFieldLabel = (fieldName: string) => {
  const fieldLabels = {
    client_name: "Client",
    description: "Description",
    category: "Category",
    status: "Status",
    priority: "Priority",
    assigned_to_name: "Assigned To",
    deadline: "Deadline",
    created_at: "Created",
    updated_at: "Last Updated",
    remarks: "Remarks",
    steps: "Steps",
    requirements: "Requirements",
    type: "Type",
    needed_data: "Needed Data",
    tax_category: "Tax Category",
    tax_type: "Tax Type",
    form: "BIR Form",
    working_paper: "Working Paper",
    tax_payable: "Tax Payable",
    last_followup: "Last Follow-up",
    area: "Area",
    period_covered: "Period Covered",
    engagement_date: "Engagement Date",
    date_complied: "Date Complied",
    completion_date: "Completion Date",
  };
  return fieldLabels[fieldName as keyof typeof fieldLabels] || fieldName;
};

// Base fields that are common to all tasks (removed created_at, updated_at, requires_approval, approval_step)
const baseFields = [
  "client_name",
  "description",
  "category",
  "status",
  "priority",
  "assigned_to_name",
  "deadline",
];

// Additional fields that might be present in the API response (excluding removed fields)
const additionalFields = [
  "remarks",
  "date_complied",
  "completion_date",
  "period_covered",
  "engagement_date",
];
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Task Details"
    :description="
      currentTask ? `Task ID: #${currentTask.id}` : 'Loading task details...'
    "
    :ui="{ content: 'w-full max-w-4xl' }"
  >
    <template #body>
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="flex flex-col items-center space-y-3">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-primary-500"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Loading task details...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center py-8">
        <div class="text-center space-y-3">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-8 h-8 text-red-500 mx-auto"
          />
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          <UButton
            @click="fetchTaskData(props.task?.id)"
            color="primary"
            variant="outline"
            size="sm"
          >
            Retry
          </UButton>
        </div>
      </div>

      <!-- Task Details Content -->
      <div v-else-if="currentTask" class="space-y-6">
        <!-- Basic Information -->
        <div>
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Base Fields -->
            <template v-for="field in baseFields" :key="field">
              <div class="space-y-1">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ getFieldLabel(field) }}
                </label>
                <div class="min-h-[2.25rem] flex items-center">
                  <StatusBadge
                    v-if="field === 'status'"
                    :status="getTaskFieldValue(currentTask, field)"
                  />
                  <PriorityBadge
                    v-else-if="field === 'priority'"
                    :priority="getTaskFieldValue(currentTask, field)"
                  />
                  <div v-else-if="field === 'deadline'" class="space-y-1">
                    <div class="font-medium">
                      {{ getFieldDisplayValue(field, getTaskFieldValue(currentTask, field)) }}
                    </div>
                    <div
                      v-if="getTaskFieldValue(currentTask, field)"
                      :class="[
                        'text-xs px-2 py-1 rounded-full inline-block',
                        getDeadlineColor(getTaskFieldValue(currentTask, field)) === 'red'
                          ? 'bg-red-100 text-red-800'
                          : '',
                        getDeadlineColor(getTaskFieldValue(currentTask, field)) === 'yellow'
                          ? 'bg-yellow-100 text-yellow-800'
                          : '',
                        getDeadlineColor(getTaskFieldValue(currentTask, field)) === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : '',
                        getDeadlineColor(getTaskFieldValue(currentTask, field)) === 'green'
                          ? 'bg-green-100 text-green-800'
                          : '',
                        getDeadlineColor(getTaskFieldValue(currentTask, field)) === 'gray'
                          ? 'bg-gray-100 text-gray-800'
                          : '',
                      ]"
                    >
                      {{ getDeadlineStatus(getTaskFieldValue(currentTask, field)) }}
                    </div>
                  </div>
                  <div
                    v-else-if="field === 'client_name'"
                    class="text-gray-900 dark:text-gray-100"
                  >
                    {{
                      currentTask.client_detail?.name ||
                      getFieldDisplayValue(field, getTaskFieldValue(currentTask, field))
                    }}
                  </div>
                  <div
                    v-else-if="field === 'assigned_to_name'"
                    class="text-gray-900 dark:text-gray-100"
                  >
                    {{
                      getTaskFieldValue(currentTask, 'assigned_to_name') ||
                      getFieldDisplayValue(field, getTaskFieldValue(currentTask, field))
                    }}
                  </div>
                  <div v-else class="text-gray-900 dark:text-gray-100">
                    {{ getFieldDisplayValue(field, getTaskFieldValue(currentTask, field)) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Category-Specific Fields -->
        <div
          v-if="
            categorySpecificFields.length > 0 ||
            currentTask.category_specific_fields
          "
        >
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4">
            {{ getCategoryLabel(currentTask.category) }} Details
          </h4>

          <!-- Use category_specific_fields from API response if available -->
          <div
            v-if="currentTask.category_specific_fields"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          >
            <div
              v-for="(value, fieldName) in currentTask.category_specific_fields"
              :key="fieldName"
              class="space-y-1"
            >
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ fieldName }}
              </label>
              <div class="min-h-[2.25rem] flex items-start">
                <div
                  class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                >
                  {{ value || "Not specified" }}
                </div>
              </div>
            </div>
          </div>

          <!-- Fallback to manual field rendering -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template v-for="field in categorySpecificFields" :key="field">
              <div class="space-y-1">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ getFieldLabel(field) }}
                </label>
                <div class="min-h-[2.25rem] flex items-start">
                  <div
                    class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                  >
                    {{ getFieldDisplayValue(field, getTaskFieldValue(currentTask, field)) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Additional Information -->
        <div>
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-4">
            Additional Information
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template v-for="field in additionalFields" :key="field">
              <div class="space-y-1">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ getFieldLabel(field) }}
                </label>
                <div class="min-h-[2.25rem] flex items-start">
                  <div
                    class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                  >
                    {{ getFieldDisplayValue(field, getTaskFieldValue(currentTask, field)) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Last Update from API response -->
            <div v-if="currentTask.last_update" class="space-y-1">
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Update
              </label>
              <div class="min-h-[2.25rem] flex items-start">
                <div class="text-gray-900 dark:text-gray-100">
                  {{ formatDate(currentTask.last_update) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Approvals Section -->
        <div
          v-if="taskApprovals.length > 0 || isLoadingApprovals"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <h4
              class="text-base font-medium text-gray-900 dark:text-white mb-2"
            >
              Task Approvals
            </h4>
            <div
              v-if="!isLoadingApprovals && taskApprovals.length > 0"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              {{ taskApprovals.length }} approval{{
                taskApprovals.length !== 1 ? "s" : ""
              }}
            </div>
          </div>

          <!-- Loading state for approvals -->
          <div
            v-if="isLoadingApprovals"
            class="flex items-center justify-center py-8"
          >
            <div class="flex flex-col items-center space-y-3">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-6 h-6 animate-spin text-primary-500"
              />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Loading approvals...
              </p>
            </div>
          </div>

          <!-- Approvals content using UAccordion with enhanced design -->
          <div v-else-if="taskApprovals.length > 0">
            <UAccordion
              :items="
                taskApprovals.map((approval, index) => ({
                  label: `Step ${approval.step_number || index + 1} - ${
                    approval.action_display || approval.action || 'Pending'
                  }`,
                  icon: getApprovalIcon(approval.action),
                  slot: `approval-${index}`,
                }))
              "
              class="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden px-4"
            >
              <template
                v-for="(approval, index) in taskApprovals"
                :key="approval.id || index"
                v-slot:[`approval-${index}-body`]
              >
                <div class="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                  <!-- Approver Information -->
                  <div class="flex items-start space-x-3">
                    <div
                      class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <UIcon
                        name="i-heroicons-user"
                        class="w-5 h-5 text-primary-600 dark:text-primary-400"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2">
                        <p class="font-medium text-gray-900 dark:text-white">
                          {{
                            approval.approver?.fullname || "Unknown Approver"
                          }}
                        </p>
                        <div
                          :class="[
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getApprovalStatusColor(approval.action),
                          ]"
                        >
                          <UIcon
                            :name="getApprovalIcon(approval.action)"
                            class="w-3 h-3 mr-1"
                          />
                          {{
                            approval.action_display ||
                            approval.action ||
                            "Pending"
                          }}
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ approval.approver?.role || "Approver" }}
                      </p>
                    </div>
                  </div>

                  <!-- Approval Details Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <div
                        class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                      >
                        <UIcon
                          name="i-heroicons-calendar"
                          class="w-4 h-4 mr-1"
                        />
                        Created
                      </div>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ approval.created_at || "Not specified" }}
                      </p>
                    </div>

                    <div
                      v-if="approval.created_at"
                      class="space-y-2"
                    >
                      <div
                        class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                      >
                        <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1" />
                        Last Updated
                      </div>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ approval.created_at }}
                      </p>
                    </div>

                    <div class="space-y-2">
                      <div
                        class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                      >
                        <UIcon
                          name="i-heroicons-list-bullet"
                          class="w-4 h-4 mr-1"
                        />
                        Step Number
                      </div>
                      <p class="text-sm text-gray-900 dark:text-white">
                        {{ approval.step_number || "N/A" }}
                      </p>
                    </div>

                    <!-- Skip the next_approver section as it doesn't exist -->
                  </div>

                  <!-- Comments Section -->
                  <div
                    v-if="approval.remarks"
                    class="space-y-2"
                  >
                    <div
                      class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      <UIcon
                        name="i-heroicons-chat-bubble-left-ellipsis"
                        class="w-4 h-4 mr-1"
                      />
                      Comments
                    </div>
                    <div
                      class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                    >
                      <p
                        class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap"
                      >
                        {{ approval.comments || "No comments provided yet." }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>
            </UAccordion>
          </div>

          <!-- No approvals message -->
          <div v-else class="text-center py-8">
            <div class="flex flex-col items-center space-y-3">
              <div
                class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-shield-check"
                  class="w-6 h-6 text-gray-400"
                />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                No approvals found for this task.
              </p>
            </div>
          </div>
        </div>

        <!-- Status History Section -->
        <div
          v-if="statusHistory.length > 0 || isLoadingHistory"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <h4
              class="text-base font-medium text-gray-900 dark:text-white mb-2"
            >
              Status History
            </h4>
            <div
              v-if="!isLoadingHistory && statusHistory.length > 0"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              {{ statusHistory.length }} change{{
                statusHistory.length !== 1 ? "s" : ""
              }}
            </div>
          </div>

          <!-- Loading state for status history -->
          <div
            v-if="isLoadingHistory"
            class="flex items-center justify-center py-8"
          >
            <div class="flex flex-col items-center space-y-3">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-6 h-6 animate-spin text-primary-500"
              />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Loading status history...
              </p>
            </div>
          </div>

          <!-- Status history timeline using enhanced UTimeline -->
          <div
            v-else-if="statusHistory.length > 0"
            class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
          >
            <UTimeline
              :items="
                statusHistory.map((history, index) => ({
                  date:
                    history.formatted_date || formatDate(history.created_at),
                  title: getStatusChangeTitle(history),
                  description: getHistoryDescription(history),
                  icon: getHistoryIcon(history.new_status),
                  color: getHistoryColor(history.new_status),
                  slot: `history-${index}`,
                }))
              "
              class="w-full"
            >
              <template
                v-for="(history, index) in statusHistory"
                :key="history.id || index"
                v-slot:[`history-${index}-description`]
              >
                <div class="mt-2 space-y-3">
                  <!-- Status Change Details -->
                  <div class="flex items-center space-x-2 text-sm">
                    <div class="flex items-center space-x-1">
                      <span
                        class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-medium"
                      >
                        {{
                          history.old_status_display ||
                          getStatusLabel(history.old_status)
                        }}
                      </span>
                      <UIcon
                        name="i-heroicons-arrow-right"
                        class="w-4 h-4 text-gray-400"
                      />
                      <span
                        class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-medium"
                      >
                        {{
                          history.new_status_display ||
                          getStatusLabel(history.new_status)
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- Change Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div class="flex items-center space-x-2">
                      <UIcon
                        name="i-heroicons-user"
                        class="w-4 h-4 text-gray-400 flex-shrink-0"
                      />
                      <span class="text-gray-600 dark:text-gray-400"
                        >Changed by:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ history.changed_by?.fullname || "System" }}
                      </span>
                    </div>

                    <div
                      v-if="history.change_type_display"
                      class="flex items-center space-x-2"
                    >
                      <UIcon
                        name="i-heroicons-cog-6-tooth"
                        class="w-4 h-4 text-gray-400 flex-shrink-0"
                      />
                      <span class="text-gray-600 dark:text-gray-400"
                        >Type:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ history.change_type_display }}
                      </span>
                    </div>
                  </div>

                  <!-- Remarks Section -->
                  <div v-if="history.remarks" class="mt-3">
                    <div class="flex items-start space-x-2">
                      <UIcon
                        name="i-heroicons-chat-bubble-left-ellipsis"
                        class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                      />
                      <div class="flex-1">
                        <span
                          class="text-xs text-gray-500 dark:text-gray-400 block mb-1"
                          >Remarks:</span
                        >
                        <div
                          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md p-2"
                        >
                          <p
                            class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap"
                          >
                            {{ history.remarks }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Skip related approval section as it doesn't exist -->
                </div>
              </template>
            </UTimeline>
          </div>

          <!-- No status history message -->
          <div v-else class="text-center py-8">
            <div class="flex flex-col items-center space-y-3">
              <div
                class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
              >
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-gray-400" />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                No status history found for this task.
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
