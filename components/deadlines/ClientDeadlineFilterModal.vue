<script setup>
// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const alertStore = useAlertStore();
const deadlineStore = useDeadlineStore();
const { showFilter, filters } = storeToRefs(deadlineStore);
const userStore = useUserStore();
const { users } = storeToRefs(userStore);
const deadlineTypeStore = useDeadlineTypesStore();
const { deadlineTypes } = storeToRefs(deadlineTypeStore);
const clientStore = useClientStore();
const { clients } = storeToRefs(clientStore);

// Reactive variables
const client = ref(filters.value["client"] || 0);
const deadlineType = ref(filters.value["deadlineType"] || 0);
const priority = ref(filters.value["priority"] || 0);
const status = ref(filters.value["status"] || "");
const assignedTo = ref(filters.value["assignedTo"] || 0);

// Methods
const applyFilter = async () => {
  try {
    const filters = {
      ...(client.value ? { client: client.value } : {}),
      ...(deadlineType.value ? { deadlineType: deadlineType.value } : {}),
      ...(priority.value ? { priority: priority.value } : {}),
      ...(status.value ? { status: status.value } : {}),
      ...(assignedTo.value ? { assignedTo: assignedTo.value } : {}),
    };
    await deadlineStore.setFilters(filters);
    alertStore.success(
      "Filters Applied",
      "Your filters have been applied successfully.",
      3.5
    );
  } catch (error) {
    alertStore.danger(
      "Filter Error",
      "Failed to apply filters. Please try again.",
      3.5
    );
    console.error(error);
  }
};

const handleClearFilter = async () => {
  await deadlineStore.clearFilters();
  alertStore.success(
    "Filters Cleared",
    "All filters have been reset successfully.",
    3.5
  );
};
</script>

<template>
  <div
    v-if="showFilter"
    id="deadline-modal"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
  >
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

    <!-- Modal panel -->
    <div
      class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700 z-10"
    >
      <section
        class="w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Client Deadline Filter
          </h3>
          <button
            @click="deadlineStore.closeFilter()"
            type="button"
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <span class="sr-only">Close</span>
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form>
          <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
            <!-- Client -->
            <div class="sm:col-span-3">
              <label
                for="client"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Client</label
              >
              <select
                v-model="client"
                id="client"
                name="client"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
              >
                <option :value="0">All Clients</option>
                <option
                  v-for="client in clients"
                  :key="client.id"
                  :value="client.id"
                >
                  {{ client.name }}
                </option>
              </select>
            </div>

            <!-- Deadline Type -->
            <div class="sm:col-span-3">
              <label
                for="deadline_type"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Deadline Type</label
              >
              <select
                v-model="deadlineType"
                id="deadline_type"
                name="deadline_type"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 appearance-none shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
              >
                <option :value="0">All Types</option>
                <option
                  v-for="deadlineType in deadlineTypes"
                  :key="deadlineType.id"
                  :value="deadlineType.id"
                >
                  {{ deadlineType.name }}
                </option>
              </select>
            </div>

            <!-- Priority -->
            <div class="sm:col-span-3">
              <label
                for="priority"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Priority</label
              >
              <select
                v-model="priority"
                id="priority"
                name="priority"
                class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
              >
                <option :value="0">All Priority</option>
                <option :value="1">Lowest</option>
                <option :value="2">Low</option>
                <option :value="3">Medium</option>
                <option :value="4">High</option>
                <option :value="5">Highest</option>
              </select>
            </div>

            <!-- Status -->
            <div class="sm:col-span-3">
              <label
                for="status"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Status</label
              >
              <select
                v-model="status"
                id="status"
                name="status"
                class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Assigned To -->
            <div v-if="isAdmin" class="sm:col-span-3">
              <label
                for="assigned_to"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Assigned To</label
              >
              <select
                v-model="assignedTo"
                id="assigned_to"
                name="assigned_to"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 appearance-none shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
              >
                <option :value="0">All Assignee</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.fullname }}
                </option>
              </select>
            </div>
          </div>

          <!-- Form actions -->
          <div class="mt-6 flex items-center justify-center space-x-3">
            <button
              @click="handleClearFilter"
              type="button"
              class="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              @click="applyFilter"
              type="button"
              class="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
