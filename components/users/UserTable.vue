<script setup>
import User from "./User.vue";
import { storeToRefs } from "pinia";

const addUserStore = useAddUserStore();
const userStore = useUserStore();
const { users, pagination, isLoading } = storeToRefs(userStore);

// Methods
const handleSetPage = async (page) => {
  await userStore.setPage(page);
};

// Search with debounce
const { source: search, debounced: debouncedSearch } = useDebouncedRef("", 750);
watch(debouncedSearch, async (value) => await userStore.setSearch(value));
</script>

<template>
  <div>
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
      <div class="relative w-full sm:w-64">
        <input
          v-model="search"
          type="search"
          placeholder="Search users..."
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
        @click="addUserStore.open()"
        class="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md"
      >
        Add User
      </button>
    </div>

    <!-- Users Table -->
    <div
      class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Email
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Role
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
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
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                  ></div>
                  <div class="ml-4 space-y-2">
                    <div
                      class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"
                    ></div>
                    <div
                      class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"
                ></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"
                ></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"
                ></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div
                  class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-16 animate-pulse inline-block"
                ></div>
              </td>
            </tr>
          </template>

          <!-- Actual Content -->
          <User v-else v-for="user in users" :key="user.id" :user="user" />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
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
