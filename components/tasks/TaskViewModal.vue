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
import type {
  Task,
  TaskList,
  StatusHistoryEntry,
  ApprovalHistoryEntry,
} from "~/types/entities";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  taskId: {
    type: Number,
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

// Computed for current task (use fetched data)
const currentTask = computed(() => {
  return taskData.value;
});

// Fetch detailed task data from API
const fetchTaskData = async () => {
  if (!props.taskId) return;

  try {
    isLoading.value = true;
    error.value = null;

    const { $apiFetch } = useNuxtApp();

    // Fetch main task data
    const response = await $apiFetch(`/api/tasks/${props.taskId}/`);
    taskData.value = response as Task;

    // Fetch additional data in parallel if applicable
    await Promise.allSettled([
      fetchTaskApprovals(props.taskId),
      fetchStatusHistory(props.taskId),
    ]);
  } catch (err) {
    console.error("Error fetching task details:", err);
    error.value = "Failed to load task details";

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Load Failed",
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

// Watch for modal opening and task ID changes
watch(
  () => [props.modelValue, props.taskId],
  ([isModalOpen, taskId]) => {
    if (isModalOpen && taskId) {
      fetchTaskData();
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
    case "approve":
    case "approved":
      return "i-heroicons-check-circle";
    case "reject":
    case "rejected":
      return "i-heroicons-x-circle";
    case "pending":
      return "i-heroicons-clock";
    default:
      return "i-heroicons-question-mark-circle";
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
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
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
      currentTask ? `Task ID: #${currentTask.id}` : `Task ID: #${props.taskId}`
    "
    :ui="{ content: 'w-full max-w-5xl' }"
  >
    <template #body>
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
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
      <div v-else-if="error" class="flex items-center justify-center py-12">
        <div class="text-center space-y-3">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-8 h-8 text-red-500 mx-auto"
          />
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          <UButton
            @click="fetchTaskData()"
            color="primary"
            variant="outline"
            size="sm"
          >
            Try Again
          </UButton>
        </div>
      </div>

      <!-- Task Details Content -->
      <div v-else-if="currentTask" class="space-y-6">
        <!-- Task Header -->
        <div
          class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h2
                class="text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
              >
                {{ currentTask.description || "Untitled Task" }}
              </h2>
              <div class="flex flex-wrap items-center gap-3">
                <StatusBadge :status="currentTask.status" />
                <PriorityBadge :priority="currentTask.priority" />
              </div>
            </div>
            <div
              v-if="currentTask.deadline"
              class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700 min-w-[180px]"
            >
              <div
                class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1"
              >
                Deadline
              </div>
              <div class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {{ formatDate(currentTask.deadline) }}
              </div>
              <span
                :class="[
                  'inline-block text-xs px-3 py-1 rounded-full font-medium',
                  getDeadlineColor(currentTask.deadline) === 'red'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    : '',
                  getDeadlineColor(currentTask.deadline) === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                    : '',
                  getDeadlineColor(currentTask.deadline) === 'blue'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    : '',
                  getDeadlineColor(currentTask.deadline) === 'green'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    : '',
                  getDeadlineColor(currentTask.deadline) === 'gray'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                    : '',
                ]"
              >
                {{ getDeadlineStatus(currentTask.deadline) }}
              </span>
            </div>
          </div>

          <!-- Client and Assignment Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <label
                class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2 block"
                >Client</label
              >
              <div class="text-lg text-gray-900 dark:text-white font-semibold">
                {{ currentTask.client_detail?.name || "No Client" }}
              </div>
            </div>
            <div
              class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <label
                class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2 block"
                >Assigned To</label
              >
              <div class="text-lg text-gray-900 dark:text-white font-semibold">
                {{ currentTask.assigned_to_detail?.fullname || "Unassigned" }}
              </div>
            </div>
          </div>
        </div>
        <!-- Basic Information -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div
              class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <h3
                class="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700"
              >
                Task Details
              </h3>
              <div class="space-y-6">
                <div>
                  <label
                    class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                  >
                    Category
                  </label>
                  <div
                    class="text-lg text-gray-900 dark:text-white font-semibold"
                  >
                    {{ getCategoryLabel(currentTask.category) }}
                  </div>
                </div>

                <div v-if="currentTask.remarks">
                  <label
                    class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                  >
                    Remarks
                  </label>
                  <div
                    class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div
                      class="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed"
                    >
                      {{ currentTask.remarks }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div>
            <div
              class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <h3
                class="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700"
              >
                Information
              </h3>
              <div class="space-y-6">
                <div v-if="currentTask.last_update">
                  <label
                    class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                  >
                    Last Update
                  </label>
                  <div
                    class="text-sm text-gray-900 dark:text-white font-medium"
                  >
                    {{ formatDate(currentTask.last_update) }}
                  </div>
                </div>

                <div v-if="currentTask.period_covered">
                  <label
                    class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                  >
                    Period Covered
                  </label>
                  <div
                    class="text-sm text-gray-900 dark:text-white font-medium"
                  >
                    {{ currentTask.period_covered }}
                  </div>
                </div>

                <div v-if="currentTask.engagement_date">
                  <label
                    class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                  >
                    Engagement Date
                  </label>
                  <div
                    class="text-sm text-gray-900 dark:text-white font-medium"
                  >
                    {{ formatDate(currentTask.engagement_date) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category-Specific Fields -->
        <div
          v-if="
            currentTask.category_specific_fields &&
            Object.keys(currentTask.category_specific_fields).length > 0 &&
            Object.values(currentTask.category_specific_fields).some(
              (value) => value !== null && value !== '' && value !== undefined
            )
          "
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700"
            >
              {{ getCategoryLabel(currentTask.category) }} Specific Details
            </h3>

            <!-- Use category_specific_fields from API response if available -->
            <div
              v-if="currentTask.category_specific_fields"
              class="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div
                v-for="(
                  value, fieldName
                ) in currentTask.category_specific_fields"
                :key="fieldName"
                class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <label
                  class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                >
                  {{ fieldName }}
                </label>
                <div
                  class="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed font-medium"
                >
                  {{ value || "Not specified" }}
                </div>
              </div>
            </div>

            <!-- Fallback to manual field rendering -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <template v-for="field in categorySpecificFields" :key="field">
                <div
                  class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <label
                    class="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2"
                  >
                    {{ getFieldLabel(field) }}
                  </label>
                  <div
                    class="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed font-medium"
                  >
                    {{
                      getFieldDisplayValue(
                        field,
                        getTaskFieldValue(currentTask, field)
                      )
                    }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Task Approvals Section -->
        <div v-if="taskApprovals.length > 0 || isLoadingApprovals">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div
              class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700"
            >
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Approval History
              </h3>
              <div
                v-if="!isLoadingApprovals && taskApprovals.length > 0"
                class="text-sm text-gray-500 dark:text-gray-400 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-full font-semibold"
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
                class="px-4 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
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
                        <p
                          class="text-sm text-gray-600 dark:text-gray-400 mt-1"
                        >
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

                      <div v-if="approval.created_at" class="space-y-2">
                        <div
                          class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                        >
                          <UIcon
                            name="i-heroicons-clock"
                            class="w-4 h-4 mr-1"
                          />
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
                    <div v-if="approval.remarks" class="space-y-2">
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
                  class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-shield-check"
                    class="w-8 h-8 text-gray-400"
                  />
                </div>
                <p class="text-gray-500 dark:text-gray-400 font-medium">
                  No approvals found for this task.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status History Section -->
        <div v-if="statusHistory.length > 0 || isLoadingHistory">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div
              class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700"
            >
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Status History
              </h3>
              <div
                v-if="!isLoadingHistory && statusHistory.length > 0"
                class="text-sm text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full font-semibold"
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
              class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
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
                        <StatusBadge
                          v-if="history.old_status"
                          :status="history.old_status"
                        />
                        <UIcon
                          name="i-heroicons-arrow-right"
                          class="w-4 h-4 text-gray-400"
                        />
                        <StatusBadge
                          v-if="history.new_status_display"
                          :status="history.new_status_display"
                        />
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
                  class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-clock"
                    class="w-8 h-8 text-gray-400"
                  />
                </div>
                <p class="text-gray-500 dark:text-gray-400 font-medium">
                  No status history found for this task.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
