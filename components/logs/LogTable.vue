<script setup lang="ts">
import type { AppLog } from "~/types";
import Pagination from "~/components/ui/Pagination.vue";

const user = ref(0);

const logsStore = useLogsStore();
const userStore = useUserStore();

const { logs, pagination, isLoading } = storeToRefs(logsStore);
const { usersWithLogs } = storeToRefs(userStore);

interface Column {
  accessorKey: string;
  header: string;
}

const columns: Column[] = [
  {
    accessorKey: "created_at",
    header: "Date",
  },
  {
    accessorKey: "user.fullname",
    header: "User",
  },
  {
    accessorKey: "details",
    header: "Details",
  },
];

// Methods
const goToFirstPage = async (): Promise<void> => {
  await handleSetPage(1);
};

const goToLastPage = async (): Promise<void> => {
  if (pagination.value.total_pages) {
    await handleSetPage(pagination.value.total_pages);
  }
};

const goToPreviousPage = async (): Promise<void> => {
  const currentPage = pagination.value.current_page || 1;
  if (currentPage > 1) {
    await handleSetPage(currentPage - 1);
  }
};

const goToNextPage = async (): Promise<void> => {
  const currentPage = pagination.value.current_page || 1;
  const totalPages = pagination.value.total_pages || 1;
  if (currentPage < totalPages) {
    await handleSetPage(currentPage + 1);
  }
};

const handleSetPage = async (page: number): Promise<void> => {
  await logsStore.setPage(page);
};

// Watchers
watch(user, async (value: number) => await logsStore.setUser(value));

// Debug - check what's in usersWithLogs
watch(
  usersWithLogs,
  (newUsersWithLogs) => {
    console.log("usersWithLogs updated:", newUsersWithLogs);
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-4">
    <!-- Filter Controls -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <div class="relative w-full sm:w-64">
        <select
          v-model="user"
          class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
        >
          <option :value="0">All Users</option>
          <option v-for="u in usersWithLogs" :key="u.id" :value="u.id">
            {{ u.fullname || "No name" }}
          </option>
        </select>
      </div>
    </div>

    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <!-- Logs Table -->
      <UTable
        :data="logs"
        :columns="columns"
        :loading="isLoading"
        class="flex-1 h-[calc(100vh-15rem)]"
        :ui="{
          tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        }"
      >
        <template #created_at-cell="{ row }">
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ row.original.created_at }}
          </div>
        </template>

        <template #user.fullname-cell="{ row }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-8 w-8">
              <div
                class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center"
              >
                <span
                  class="text-sm font-medium text-primary-600 dark:text-primary-300"
                >
                  {{
                    row.original.user?.fullname?.charAt(0).toUpperCase() || "U"
                  }}
                </span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ row.original.user?.fullname || "Unknown User" }}
              </div>
            </div>
          </div>
        </template>

        <template #details-cell="{ row }">
          <div
            class="text-sm text-gray-900 dark:text-gray-100 max-w-md truncate"
          >
            {{ row.original.details }}
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pagination Component -->
    <Pagination
      :pagination="pagination"
      :is-loading="isLoading"
      item-name="log entry"
      @first-page="goToFirstPage"
      @previous-page="goToPreviousPage"
      @next-page="goToNextPage"
      @last-page="goToLastPage"
    />
  </div>
</template>