<script setup lang="ts">
import {
  categoryChoices,
  statusChoices,
  priorityChoices,
} from "~/constants/choices";
import StatusBadge from "~/components/ui/StatusBadge.vue";
import PriorityBadge from "~/components/ui/PriorityBadge.vue";
import TaskCompletionModal from "~/components/tasks/TaskCompletionModal.vue";
import TaskViewModal from "~/components/tasks/TaskViewModal.vue";
import TaskEditModal from "~/components/tasks/TaskEditModal.vue";
import TaskDeleteModal from "~/components/tasks/TaskDeleteModal.vue";
import type { Task, TaskList, PaginationInfo } from '~/types/entities'
import type { TaskCategory } from '~/constants/choices'

interface Props {
  category?: string | null;
  showCategoryColumn?: boolean;
  title?: string;
  showUserTasksOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
  showCategoryColumn: true,
  title: 'Tasks',
  showUserTasksOnly: false
})

// No longer emitting to parent since we handle actions internally

// Stores
const taskStore = useTaskStore();
const userStore = useUserStore();
const authStore = useAuthStore();

// Composables
const { getTaskPermissions } = useTaskPermissions();

// Store refs
const { tasks, isLoading, pagination } = storeToRefs(taskStore);
const { users } = storeToRefs(userStore);

// Type assertion for pagination to access all properties
const typedPagination = computed(() => pagination.value as PaginationInfo | null)

// Computed assignee options
const assigneeOptions = computed(() => {
  return [
    { label: "All Assignees", value: null },
    ...users.value.map((user) => ({
      label: user.fullname,
      value: user.id,
    })),
  ];
});

// Local state
const searchQuery = ref<string>("");
const statusFilter = ref<string | null>(null);
const priorityFilter = ref<string | null>(null);
const assigneeFilter = ref<number | null>(null);

// Completion modal state
const showCompletionModal = ref<boolean>(false);
const selectedTaskForCompletion = ref<TaskList | null>(null);
const isCompletingTask = ref<boolean>(false);

// Action modal states
const showViewModal = ref<boolean>(false);
const showEditModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);
const selectedTask = ref<TaskList | null>(null);

// Computed
const filteredTasks = computed(() => {
  let filtered = tasks.value;

  // Filter by category if specified
  if (props.category) {
    filtered = filtered.filter((task) => {
      return task.category === props.category;
    });
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.description.toLowerCase().includes(query) ||
        task.client_name?.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter((task) => task.status === statusFilter.value);
  }

  // Apply priority filter
  if (priorityFilter.value) {
    filtered = filtered.filter(
      (task) => task.priority === priorityFilter.value
    );
  }

  // Apply assignee filter
  if (assigneeFilter.value) {
    filtered = filtered.filter(
      (task) => task.assigned_to === assigneeFilter.value
    );
  }

  return filtered;
});

// Table columns configuration
const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "client_name",
    header: "Client",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "assigned_to_name",
    header: "Assigned To",
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
  },
  {
    accessorKey: "actions",
    header: "Actions",
  },
];

// Methods
const refreshData = async () => {
  // Clear all filters to ensure we see the refreshed data
  clearFilters();

  try {
    if (props.showUserTasksOnly && authStore.user?.id) {
      // Fetch tasks for the current user only using the new paginated endpoint
      const taskService = useTaskService();
      // Use getTasksByCategory instead of getUserDeadlines
      const response = await taskService.getTasksByCategory('all', {
        category: (props.category as TaskCategory) || undefined,
        assigned_to: authStore.user.id,
      });

      // Handle paginated response structure
      if (response && 'results' in response) {
        taskStore.tasks = response.results;
        const { results, ...paginationData } = response;
        taskStore.pagination = paginationData;
      } else {
        // Handle direct array response
        taskStore.tasks = Array.isArray(response) ? response : [];
      }
    } else if (props.category) {
      await taskStore.fetchTasksByCategory(props.category);
    } else {
      await taskStore.fetchTasks();
    }
  } catch (error) {
    console.error("Error refreshing data:", error);
  }
};

// Modal handlers
const handleView = (task: TaskList): void => {
  selectedTask.value = task;
  showViewModal.value = true;
};

const handleEdit = (task: TaskList): void => {
  selectedTask.value = task;
  showEditModal.value = true;
};

const handleDelete = (task: TaskList): void => {
  selectedTask.value = task;
  showDeleteModal.value = true;
};

const handleDeleteSuccess = async () => {
  await refreshData();
};

const handleEditSuccess = async () => {
  await refreshData();
};

// Task completion methods
const openCompletionModal = (task: TaskList): void => {
  selectedTaskForCompletion.value = task;
  showCompletionModal.value = true;
};

const handleTaskCompletion = async (completionData: any): Promise<void> => {
  if (!selectedTaskForCompletion.value) return;

  isCompletingTask.value = true;
  try {
    await taskStore.markCompleted(
      selectedTaskForCompletion.value.id,
      completionData
    );
    showCompletionModal.value = false;
    selectedTaskForCompletion.value = null;
    await refreshData();
  } catch (error) {
    console.error("Error completing task:", error);
  } finally {
    isCompletingTask.value = false;
  }
};

const handlePageChange = async (page: number): Promise<void> => {
  await taskStore.setPage(page);
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = null;
  priorityFilter.value = null;
  assigneeFilter.value = null;
};

// Computed to track if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    statusFilter.value ||
    priorityFilter.value ||
    assigneeFilter.value
  );
});

const getCategoryLabel = (categoryValue: string): string => {
  const choice = categoryChoices.find((c) => c.value === categoryValue);
  return choice ? choice.label : categoryValue;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";

  // If the date is already formatted (e.g., "Aug 26, 2025"), return as is
  if (typeof dateString === "string" && dateString.includes(",")) {
    return dateString;
  }

  // Otherwise try to parse and format
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

const getDaysRemaining = (deadline: string | null | undefined, task: TaskList | null = null): number | null => {
  // If the API provides deadline_days_remaining, use that
  if (task && typeof task.deadline_days_remaining === "number") {
    return task.deadline_days_remaining;
  }

  if (!deadline) return null;

  try {
    const today = new Date();
    let deadlineDate: Date;

    // Handle different date formats
    if (typeof deadline === "string" && deadline.includes(",")) {
      // Parse "Aug 26, 2025" format
      deadlineDate = new Date(deadline);
    } else {
      deadlineDate = new Date(deadline);
    }

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return null;
  }
};

const getDeadlineColor = (deadline: string | null | undefined, task: TaskList | null = null): string => {
  const daysRemaining = getDaysRemaining(deadline, task);
  if (daysRemaining === null) return "secondary";
  if (daysRemaining < 0) return "error"; // Overdue
  if (daysRemaining <= 3) return "warning"; // Due soon
  if (daysRemaining <= 7) return "primary"; // Due this week
  return "success"; // More than a week
};

// Lifecycle
onMounted(async () => {
  await Promise.all([refreshData(), userStore.getUserChoices()]);
});

// Watch for task changes
watch(
  tasks,
  (newTasks, oldTasks) => {
    // Tasks have changed, reactive updates will happen automatically
  },
  { deep: true, immediate: true }
);

// Expose methods to parent components
defineExpose({
  refreshData,
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
      </div>
      <div class="flex space-x-3">
        <UButton
          icon="i-heroicons-arrow-path-20-solid"
          @click="refreshData"
          :loading="isLoading"
          variant="outline"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-funnel-20-solid" class="text-gray-500" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Tasks
            </h3>
          </div>
          <UButton
            @click="clearFilters"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark-20-solid"
            :disabled="!hasActiveFilters"
            class="text-gray-500 hover:text-gray-700"
          >
            Clear All
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Search Row -->
        <div class="w-full">
          <UFormField label="Search" class="mb-1">
            <UInput
              v-model="searchQuery"
              placeholder="Search by task description, or client name..."
              icon="i-heroicons-magnifying-glass-20-solid"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Filter Controls Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Status Filter -->
          <UFormField label="Filter by Status">
            <USelect
              v-model="statusFilter"
              :items="[
                { label: 'All Statuses', value: null },
                ...statusChoices,
              ]"
              value-key="value"
              placeholder="Select status..."
              size="md"
              :search-input="{
                placeholder: 'Search statuses...',
              }"
            >
              <template #leading>
                <UIcon
                  name="i-heroicons-check-circle-20-solid"
                  class="text-gray-400"
                />
              </template>
            </USelect>
          </UFormField>

          <!-- Priority Filter -->
          <UFormField label="Filter by Priority">
            <USelect
              v-model="priorityFilter"
              :items="[
                { label: 'All Priorities', value: null },
                ...priorityChoices,
              ]"
              value-key="value"
              placeholder="Select priority..."
              size="md"
              :search-input="{
                placeholder: 'Search priorities...',
              }"
            >
              <template #leading>
                <UIcon
                  name="i-heroicons-exclamation-triangle-20-solid"
                  class="text-gray-400"
                />
              </template>
            </USelect>
          </UFormField>

          <!-- Assignee Filter -->
          <UFormField label="Filter by Assignee">
            <USelectMenu
              v-model="assigneeFilter"
              :items="assigneeOptions"
              value-key="value"
              placeholder="Select assignee..."
              size="md"
              :search-input="{
                placeholder: 'Search assignees...',
              }"
            >
              <template #leading>
                <UIcon name="i-heroicons-user-20-solid" class="text-gray-400" />
              </template>
            </USelectMenu>
          </UFormField>
        </div>
      </div>
    </UCard>

    <!-- Task Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <UTable
        :data="filteredTasks"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <!-- Custom cell templates -->
        <template #category-cell="{ row }">
          {{ getCategoryLabel(row.original.category) }}
        </template>

        <template #status-cell="{ row }">
          <StatusBadge :status="row.original.status" />
        </template>

        <template #priority-cell="{ row }">
          <PriorityBadge :priority="row.original.priority" />
        </template>

        <template #deadline-cell="{ row }">
          <div v-if="row.original.deadline" class="flex flex-col">
            <span class="font-medium">{{
              formatDate(row.original.deadline)
            }}</span>
            <span class="font-ligh text-xs">
              {{ getDaysRemaining(row.original.deadline, row.original) }} days
              remaining
            </span>
          </div>
          <span v-else class="text-gray-400">No deadline</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <!-- Mark Complete button for admin users on their own ongoing tasks -->
            <UButton
              v-if="taskStore.canMarkTaskComplete(row.original)"
              @click="openCompletionModal(row.original)"
              label="Mark Complete"
              color="success"
              size="sm"
              variant="soft"
              icon="i-heroicons-check-circle"
            />

            <!-- View button - always available -->
            <UButton
              v-if="getTaskPermissions(row.original).canView"
              @click="handleView(row.original)"
              label="View"
              color="info"
              size="sm"
              variant="soft"
              icon="i-heroicons-eye"
            />

            <!-- Edit button - only for admins on /tasks route with not_yet_started status -->
            <UButton
              v-if="getTaskPermissions(row.original).canEdit"
              @click="handleEdit(row.original)"
              label="Edit"
              color="primary"
              size="sm"
              variant="soft"
              icon="i-heroicons-pencil"
            />

            <!-- Delete button - only for admins on /tasks route with not_yet_started status -->
            <UButton
              v-if="getTaskPermissions(row.original).canDelete"
              @click="handleDelete(row.original)"
              label="Delete"
              color="error"
              size="sm"
              variant="soft"
              icon="i-heroicons-trash"
            />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="(typedPagination?.count || 0) > 0" class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-end">
          <UPagination
            v-if="(typedPagination?.total_pages || 0) > 1"
            :page-count="typedPagination?.total_pages || 1"
            :total="typedPagination?.count || 0"
            :model-value="typedPagination?.current_page || 1"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Task Completion Modal -->
  <TaskCompletionModal
    v-if="selectedTaskForCompletion"
    v-model="showCompletionModal"
    :task="selectedTaskForCompletion"
    :is-submitting="isCompletingTask"
    @complete="handleTaskCompletion"
  />

  <!-- Task View Modal -->
  <TaskViewModal
    v-if="selectedTask && showViewModal"
    v-model="showViewModal"
    :task-id="selectedTask.id"
  />

  <!-- Task Edit Modal -->
  <TaskEditModal
    v-if="selectedTask && showEditModal"
    v-model="showEditModal"
    :task="selectedTask"
    @success="handleEditSuccess"
  />

  <!-- Task Delete Modal -->
  <TaskDeleteModal
    v-if="selectedTask && showDeleteModal"
    v-model="showDeleteModal"
    :task="selectedTask"
    @success="handleDeleteSuccess"
  />
</template>
