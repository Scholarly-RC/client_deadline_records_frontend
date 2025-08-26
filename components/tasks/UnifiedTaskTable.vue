<script setup>
import { TASK_CATEGORIES, categoryChoices, statusChoices, priorityChoices } from "~/constants/choices";

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
});

const emit = defineEmits(["edit", "delete", "view"]);

// Store
const taskStore = useTaskStore();

// Store refs
const { tasks, isLoading, pagination } = storeToRefs(taskStore);

// Local state
const selectedTasks = ref([]);
const searchQuery = ref("");
const statusFilter = ref(null);
const priorityFilter = ref(null);
const assigneeFilter = ref(null);

// Computed
const filteredTasks = computed(() => {
  let filtered = tasks.value;

  // Filter by category if specified
  if (props.category) {
    filtered = filtered.filter(task => task.category === props.category);
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(task => 
      task.description.toLowerCase().includes(query) ||
      task.client_detail?.name?.toLowerCase().includes(query) ||
      task.assigned_to_detail?.fullname?.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value);
  }

  // Apply priority filter
  if (priorityFilter.value) {
    filtered = filtered.filter(task => task.priority === priorityFilter.value);
  }

  return filtered;
});

// Table columns configuration
const columns = computed(() => {
  const baseColumns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    ...(props.showCategoryColumn ? [{
      key: 'category',
      label: 'Category',
      sortable: true,
    }] : []),
    {
      key: 'client_detail.name',
      label: 'Client',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
    },
    {
      key: 'assigned_to_detail.fullname',
      label: 'Assigned To',
      sortable: true,
    },
    {
      key: 'deadline',
      label: 'Deadline',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  return baseColumns;
});

// Actions for each row
const actions = [
  [{
    label: 'View',
    icon: 'i-heroicons-eye-20-solid',
    click: (row) => emit('view', row)
  }, {
    label: 'Edit',
    icon: 'i-heroicons-pencil-20-solid',
    click: (row) => emit('edit', row)
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: (row) => handleDelete(row),
    color: 'red'
  }]
];

// Methods
const refreshData = async () => {
  if (props.category) {
    await taskStore.fetchTasksByCategory(props.category);
  } else {
    await taskStore.fetchTasks();
  }
};

const handleDelete = async (task) => {
  if (confirm(`Are you sure you want to delete this task: ${task.description}?`)) {
    try {
      await taskStore.deleteTask(task.id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting task:', error);
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
  const choice = categoryChoices.find(c => c.value === categoryValue);
  return choice ? choice.label : categoryValue;
};

const getStatusColor = (status) => {
  const colorMap = {
    'COMPLETED': 'green',
    'ON_GOING': 'blue',
    'PENDING': 'yellow',
    'NOT_YET_STARTED': 'gray',
    'CANCELLED': 'red',
    'FOR_REVISION': 'orange',
    'FOR_CHECKING': 'purple',
  };
  return colorMap[status] || 'gray';
};

const getPriorityColor = (priority) => {
  const colorMap = {
    'HIGH': 'red',
    'MEDIUM': 'yellow',
    'LOW': 'green',
  };
  return colorMap[priority] || 'gray';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDeadlineColor = (deadline) => {
  const daysRemaining = getDaysRemaining(deadline);
  if (daysRemaining === null) return 'gray';
  if (daysRemaining < 0) return 'red'; // Overdue
  if (daysRemaining <= 3) return 'orange'; // Due soon
  if (daysRemaining <= 7) return 'yellow'; // Due this week
  return 'green'; // More than a week
};

// Lifecycle
onMounted(() => {
  refreshData();
});
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
            :items="[{ label: 'All Priorities', value: null }, ...priorityChoices]"
            value-key="value"
            placeholder="All Priorities"
          />
        </UFormField>

        <!-- Clear Filters -->
        <UFormField label=" ">
          <UButton
            @click="clearFilters"
            variant="outline"
            class="w-full"
          >
            Clear Filters
          </UButton>
        </UFormField>
      </div>
    </div>

    <!-- Task Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <UTable
        :rows="filteredTasks"
        :columns="columns"
        :loading="isLoading"
        v-model="selectedTasks"
        class="w-full"
      >
        <!-- Category column -->
        <template v-if="showCategoryColumn" #category-data="{ row }">
          <UBadge :color="getStatusColor(row.category)" variant="subtle">
            {{ getCategoryLabel(row.category) }}
          </UBadge>
        </template>

        <!-- Client column -->
        <template #client_detail.name-data="{ row }">
          <div class="font-medium">
            {{ row.client_detail?.name || 'No Client' }}
          </div>
        </template>

        <!-- Description column -->
        <template #description-data="{ row }">
          <div class="max-w-xs truncate" :title="row.description">
            {{ row.description }}
          </div>
        </template>

        <!-- Status column -->
        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(row.status)" variant="subtle">
            {{ row.status.replace('_', ' ') }}
          </UBadge>
        </template>

        <!-- Priority column -->
        <template #priority-data="{ row }">
          <UBadge :color="getPriorityColor(row.priority)" variant="subtle">
            {{ row.priority }}
          </UBadge>
        </template>

        <!-- Assigned to column -->
        <template #assigned_to_detail.fullname-data="{ row }">
          <div class="font-medium">
            {{ row.assigned_to_detail?.fullname || 'Unassigned' }}
          </div>
        </template>

        <!-- Deadline column -->
        <template #deadline-data="{ row }">
          <div v-if="row.deadline" class="flex flex-col">
            <span class="font-medium">{{ formatDate(row.deadline) }}</span>
            <UBadge 
              :color="getDeadlineColor(row.deadline)" 
              variant="subtle" 
              size="xs"
              class="mt-1"
            >
              <template v-if="getDaysRemaining(row.deadline) !== null">
                <template v-if="getDaysRemaining(row.deadline) < 0">
                  {{ Math.abs(getDaysRemaining(row.deadline)) }} days overdue
                </template>
                <template v-else-if="getDaysRemaining(row.deadline) === 0">
                  Due today
                </template>
                <template v-else>
                  {{ getDaysRemaining(row.deadline) }} days remaining
                </template>
              </template>
            </UBadge>
          </div>
          <span v-else class="text-gray-400">No deadline</span>
        </template>

        <!-- Actions column -->
        <template #actions-data="{ row }">
          <UDropdown :items="actions">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="pagination.count > 0" class="p-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ Math.min((pagination.current_page - 1) * 10 + 1, pagination.count) }} to 
            {{ Math.min(pagination.current_page * 10, pagination.count) }} of {{ pagination.count }} results
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

      <!-- Empty state -->
      <div v-if="!isLoading && filteredTasks.length === 0" class="p-8 text-center">
        <div class="text-gray-500">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-lg font-medium mb-2">No tasks found</h3>
          <p class="text-sm">
            {{ searchQuery || statusFilter || priorityFilter 
              ? 'Try adjusting your filters to see more results.' 
              : 'No tasks have been created yet.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>