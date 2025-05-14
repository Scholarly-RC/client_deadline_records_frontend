<script setup>
// Components
import Client from "./Client.vue";

const { source: search, debounced: debouncedSearch } = useDebouncedRef("", 750);

// Stores
const clientStore = useClientStore();
const { clients, pagination } = storeToRefs(clientStore);
const addClientStore = useAddClientStore();

// Watchers
watch(debouncedSearch, async (val) => {
  await clientStore.setSearch(val);
});
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <div class="relative w-full sm:w-64">
        <input
          v-model="search"
          type="search"
          placeholder="Search clients..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <button
        @click="addClientStore.open()"
        id="add-client-btn"
        class="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md"
      >
        Add Client
      </button>
    </div>

    <!-- Recent Clients Section -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          All Clients
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Client
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Added By
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Added
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
          >
            <!-- Client 1 -->
            <Client
              v-for="client in clients"
              :key="client.id"
              :client="client"
            />
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="pagination"
      class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4"
    >
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Showing
        <span class="font-medium">{{ pagination.item_range }}</span> of
        <span class="font-medium">{{ pagination.count }}</span> results
      </div>
      <div class="flex space-x-2">
        <button
          v-if="pagination.previous"
          @click="clientStore.setPage(pagination.current_page - 1)"
          class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          v-if="pagination.total_pages > 1"
          class="px-3 py-1 rounded-md border border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 font-medium"
        >
          {{ pagination.current_page }}
        </button>
        <button
          v-if="pagination.next"
          @click="clientStore.setPage(pagination.current_page + 1)"
          class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
