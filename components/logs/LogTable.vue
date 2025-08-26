<script setup>
import Log from "./Log.vue";
import { storeToRefs } from "pinia";

const user = ref(0);
const logsStore = useLogsStore();
const userStore = useUserStore();

const { logs, pagination, isLoading } = storeToRefs(logsStore);
const { usersWithLogs } = storeToRefs(userStore);

// Methods
const handleSetPage = async (page) => {
  await logsStore.setPage(page);
};

watch(user, async (value) => await logsStore.setUser(value));
</script>

<template>
  <div>
    <!-- Action Bar -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <div class="relative w-full sm:w-64">
        <select
          v-model="user"
          class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
        >
          <option :value="0">All Users</option>
          <option v-for="user in usersWithLogs" :key="user.id" :value="user.id">
            {{ user.fullname }}
          </option>
        </select>
      </div>
    </div>

    <!-- Logs Table -->
    <div
      class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              User
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Details
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
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"
                ></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"
                ></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"
                ></div>
              </td>
            </tr>
          </template>

          <!-- Actual Content -->
          <Log v-else v-for="log in logs" :key="log.id" :log="log" />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
    v-if="pagination.count || isLoading"
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
