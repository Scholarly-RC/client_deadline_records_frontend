<script setup>
import {
  TASK_CATEGORIES,
  categoryChoices,
  statusChoices,
  priorityChoices,
} from "~/constants/choices";

const props = defineProps({
  category: {
    type: String,
    default: null, // If null, show all categories
  },
  showCategoryColumn: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "Tasks",
  },
  useTestData: {
    type: Boolean,
    default: false, // For testing purposes
  },
});

const emit = defineEmits(["edit", "delete", "view"]);

// Store
const taskStore = useTaskStore();

// Test data from your example
const testData = ref([
  {
    id: 2,
    client_name: "Christine Vang",
    category: "compliance",
    category_display: "Compliance",
    description: "Saepe cum non laboru",
    status: "not_yet_started",
    assigned_to: 11,
    assigned_to_name: "Aiko Rosas",
    priority: "medium",
    engagement_date: "Aug 26, 2025",
    deadline: "Aug 29, 2025",
    completion_date: null,
    last_update: "Aug 26, 2025 06:28 PM",
    deadline_days_remaining: 3,
    remarks: "Ratione voluptates u",
    status_history: [],
    category_specific_fields: {
      Steps: "Cum dolore temporibu",
      Requirements: "Ut molestiae sed ver",
    },
  },
  {
    id: 1,
    client_name: "Aristotle Walton",
    category: "accounting_audit",
    category_display: "Accounting Audit",
    description: "Illo incidunt aut e",
    status: "for_revision",
    assigned_to: 11,
    assigned_to_name: "Aiko Rosas",
    priority: "medium",
    engagement_date: "Aug 26, 2025",
    deadline: "Aug 27, 2025",
    completion_date: null,
    last_update: "Aug 26, 2025 02:46 PM",
    deadline_days_remaining: 1,
    remarks: "Ajuju",
    status_history: [],
    category_specific_fields: {},
  },
]);

// Store refs - use test data when in test mode
const {
  tasks: storeTasks,
  isLoading: storeIsLoading,
  pagination,
} = storeToRefs(taskStore);
const tasks = computed(() =>
  props.useTestData ? testData.value : storeTasks.value
);
const isLoading = computed(() =>
  props.useTestData ? false : storeIsLoading.value
);

// Local state
const selectedTasks = ref([]);
const searchQuery = ref("");
const statusFilter = ref(null);
const priorityFilter = ref(null);
const assigneeFilter = ref(null);

// Computed
const filteredTasks = computed(() => {
  console.log("🔍 UnifiedTaskTable - Raw tasks:", tasks.value);
  console.log("🔍 UnifiedTaskTable - Category prop:", props.category);
  console.log("🔍 UnifiedTaskTable - Is loading:", isLoading.value);

  let filtered = tasks.value;

  // Filter by category if specified
  if (props.category) {
    console.log("🔍 Filtering by category:", props.category);
    filtered = filtered.filter((task) => {
      console.log(
        "🔍 Task category:",
        task.category,
        "Expected:",
        props.category,
        "Match:",
        task.category === props.category
      );
      return task.category === props.category;
    });
    console.log("🔍 Filtered tasks after category filter:", filtered);
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.description.toLowerCase().includes(query) ||
        task.client_name?.toLowerCase().includes(query) ||
        task.assigned_to_name?.toLowerCase().includes(query)
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

  console.log("🔍 Final filtered tasks:", filtered);
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

// Actions for each row
const actions = [
  [
    {
      label: "View",
      icon: "i-heroicons-eye-20-solid",
      click: (row) => emit("view", row),
    },
    {
      label: "Edit",
      icon: "i-heroicons-pencil-20-solid",
      click: (row) => emit("edit", row),
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: (row) => handleDelete(row),
      color: "red",
    },
  ],
];

// Methods
const refreshData = async () => {
  if (props.useTestData) {
    console.log("🧪 Using test data, skipping API call");
    return;
  }

  console.log("🔄 UnifiedTaskTable - Refreshing data...");
  console.log("🔄 Category:", props.category);
  console.log("🔄 Task store:", taskStore);

  try {
    if (props.category) {
      console.log("🔄 Fetching tasks by category:", props.category);
      await taskStore.fetchTasksByCategory(props.category);
    } else {
      console.log("🔄 Fetching all tasks");
      await taskStore.fetchTasks();
    }
    console.log("🔄 Tasks after fetch:", tasks.value);
  } catch (error) {
    console.error("😱 Error refreshing data:", error);
  }
};

const handleDelete = async (task) => {
  if (
    confirm(`Are you sure you want to delete this task: ${task.description}?`)
  ) {
    try {
      await taskStore.deleteTask(task.id);
      await refreshData();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }
};

const handlePageChange = async (page) => {
  await taskStore.setPage(page);
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = null;
  priorityFilter.value = null;
  assigneeFilter.value = null;
};

const getCategoryLabel = (categoryValue) => {
  // Handle API category values and map to display labels
  const categoryMapping = {
    compliance: "Compliance",
    accounting_audit: "Accounting / Auditing",
    financial_statement: "Financial Statement Preparation",
    finance_implementation: "Finance Implementation",
    hr_implementation: "Human Resource Implementation",
    miscellaneous: "Miscellaneous Tasks",
    tax_case: "Tax",
  };

  // Try direct mapping first
  if (categoryMapping[categoryValue]) {
    return categoryMapping[categoryValue];
  }

  // Fallback to choices lookup for constants
  const choice = categoryChoices.find((c) => c.value === categoryValue);
  return choice ? choice.label : categoryValue;
};

const getStatusColor = (status) => {
  const colorMap = {
    completed: "green",
    on_going: "blue",
    pending: "yellow",
    not_yet_started: "gray",
    cancelled: "red",
    for_revision: "orange",
    for_checking: "purple",
    // Legacy uppercase versions for compatibility
    COMPLETED: "green",
    ON_GOING: "blue",
    PENDING: "yellow",
    NOT_YET_STARTED: "gray",
    CANCELLED: "red",
    FOR_REVISION: "orange",
    FOR_CHECKING: "purple",
  };
  return colorMap[status] || "gray";
};

const getPriorityColor = (priority) => {
  const colorMap = {
    high: "red",
    medium: "yellow",
    low: "green",
    // Legacy uppercase versions for compatibility
    HIGH: "red",
    MEDIUM: "yellow",
    LOW: "green",
  };
  return colorMap[priority] || "gray";
};

const formatDate = (dateString) => {
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

const getDaysRemaining = (deadline, task = null) => {
  // If the API provides deadline_days_remaining, use that
  if (task && typeof task.deadline_days_remaining === "number") {
    return task.deadline_days_remaining;
  }

  if (!deadline) return null;

  try {
    const today = new Date();
    let deadlineDate;

    // Handle different date formats
    if (typeof deadline === "string" && deadline.includes(",")) {
      // Parse "Aug 26, 2025" format
      deadlineDate = new Date(deadline);
    } else {
      deadlineDate = new Date(deadline);
    }

    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return null;
  }
};

const getDeadlineColor = (deadline, task = null) => {
  const daysRemaining = getDaysRemaining(deadline, task);
  if (daysRemaining === null) return "gray";
  if (daysRemaining < 0) return "red"; // Overdue
  if (daysRemaining <= 3) return "orange"; // Due soon
  if (daysRemaining <= 7) return "yellow"; // Due this week
  return "green"; // More than a week
};

// Lifecycle
onMounted(() => {
  refreshData();
});

// Watch for task changes
watch(
  tasks,
  (newTasks, oldTasks) => {
    // Tasks have changed, reactive updates will happen automatically
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
        <p v-if="category" class="text-sm text-gray-600">
          {{ getCategoryLabel(category) }} tasks
        </p>
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
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <UFormField label="Search">
          <UInput
            v-model="searchQuery"
            placeholder="Search tasks, clients, or assignees..."
            icon="i-heroicons-magnifying-glass-20-solid"
          />
        </UFormField>

        <!-- Status Filter -->
        <UFormField label="Status">
          <USelect
            v-model="statusFilter"
            :items="[{ label: 'All Statuses', value: null }, ...statusChoices]"
            value-key="value"
            placeholder="All Statuses"
          />
        </UFormField>

        <!-- Priority Filter -->
        <UFormField label="Priority">
          <USelect
            v-model="priorityFilter"
            :items="[
              { label: 'All Priorities', value: null },
              ...priorityChoices,
            ]"
            value-key="value"
            placeholder="All Priorities"
          />
        </UFormField>

        <!-- Clear Filters -->
        <UFormField label=" ">
          <UButton @click="clearFilters" variant="outline" class="w-full">
            Clear Filters
          </UButton>
        </UFormField>
      </div>
    </div>

    <!-- Task Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <UTable
        :data="filteredTasks"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <!-- Custom cell templates -->
        <template #category-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.category)" variant="soft">
            {{ getCategoryLabel(row.original.category) }}
          </UBadge>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="soft">
            {{ row.original.status.replace("_", " ") }}
          </UBadge>
        </template>

        <template #priority-cell="{ row }">
          <UBadge
            :color="getPriorityColor(row.original.priority)"
            variant="soft"
          >
            {{ row.original.priority }}
          </UBadge>
        </template>

        <template #deadline-cell="{ row }">
          <div v-if="row.original.deadline" class="flex flex-col">
            <span class="font-medium">{{
              formatDate(row.original.deadline)
            }}</span>
            <UBadge
              :color="getDeadlineColor(row.original.deadline, row.original)"
              variant="soft"
              size="xs"
              class="mt-1"
            >
              {{ getDaysRemaining(row.original.deadline, row.original) }} days
              remaining
            </UBadge>
          </div>
          <span v-else class="text-gray-400">No deadline</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton
              @click="emit('view', row.original)"
              label="View"
              color="info"
              size="sm"
              variant="soft"
            />
            <UButton
              @click="emit('edit', row.original)"
              label="Edit"
              color="primary"
              size="sm"
              variant="soft"
            />
            <UButton
              @click="handleDelete(row.original)"
              label="Delete"
              color="error"
              size="sm"
              variant="soft"
            />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="pagination.count > 0" class="p-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing
            {{
              Math.min((pagination.current_page - 1) * 10 + 1, pagination.count)
            }}
            to {{ Math.min(pagination.current_page * 10, pagination.count) }} of
            {{ pagination.count }} results
          </div>
          <UPagination
            v-if="pagination.num_pages > 1"
            :page-count="pagination.num_pages"
            :total="pagination.count"
            :model-value="pagination.current_page"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>
