<script setup>
// Components
import ClientDeadline from "./ClientDeadline.vue";

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const deadlineStore = useDeadlineStore();
const addDeadlineStore = useAddDeadlineStore();
const deadlineTypesStore = useDeadlineTypesStore();

// Methods
const handleSetPage = async (page) => {
  await deadlineStore.setPage(page);
};

// Reactive variables
const { deadlines, pagination, isLoading } = storeToRefs(deadlineStore);
</script>

<template>
  <div>
    <!-- Filter/Add buttons -->
    <div
      class="flex flex-row justify-between items-end sm:items-center mb-6 gap-4"
    >
      <div>
        <button
          @click="deadlineStore.openFilter()"
          class="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          Filter
        </button>
      </div>
      <div v-if="isAdmin" class="flex flex-row gap-2">
        <button
          @click="deadlineTypesStore.open()"
          class="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          Deadline Types
        </button>
        <button
          @click="addDeadlineStore.open()"
          class="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md"
        >
          Add Deadline
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          All Client Deadlines
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Client
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Deadline Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Due Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Priority
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Assigned to
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <!-- Loading State -->
            <template v-if="isLoading">
              <tr
                v-for="i in 5"
                :key="`skeleton-${i}`"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"
                  ></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"
                  ></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"
                  ></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20"
                  ></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20"
                  ></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"
                  ></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-16"
                  ></div>
                </td>
              </tr>
            </template>

            <!-- Actual Content -->
            <template v-else>
              <ClientDeadline
                v-for="deadline in deadlines"
                :key="deadline.id"
                :deadline="deadline"
              />
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination with Loading State -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4"
    >
      <div
        v-if="isLoading"
        class="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"
      ></div>
      <div
        v-else-if="pagination"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        Showing <span class="font-medium">{{ pagination.item_range }}</span> of
        <span class="font-medium">{{ pagination.count }}</span> results
      </div>

      <div v-if="isLoading" class="flex space-x-2">
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-20"
        ></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-8"
        ></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-20"
        ></div>
      </div>
      <div v-else-if="pagination" class="flex space-x-2">
        <button
          v-if="pagination.previous"
          @click="handleSetPage(pagination.current_page - 1)"
          class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          @click="handleSetPage(pagination.current_page + 1)"
          class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
