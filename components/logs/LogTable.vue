<script setup lang="ts">
import type { AppLog } from "~/types";

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

    <!-- Enhanced Pagination -->
    <div
      v-if="pagination.count || isLoading"
      class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <!-- Results Info -->
      <div
        v-if="isLoading"
        class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"
      ></div>
      <div v-else class="text-sm text-gray-600 dark:text-gray-300">
        <span v-if="pagination.count">
          Showing
          <span class="font-semibold">{{
            ((pagination.current_page || 1) - 1) *
              (pagination.page_size || 10) +
            1
          }}</span>
          to
          <span class="font-semibold">{{
            Math.min(
              (pagination.current_page || 1) * (pagination.page_size || 10),
              pagination.count
            )
          }}</span>
          of
          <span class="font-semibold">{{ pagination.count }}</span>
          {{ pagination.count === 1 ? "log entry" : "log entries" }}
        </span>
        <span v-else>No log entries found</span>
      </div>

      <!-- Pagination Controls -->
      <div v-if="isLoading" class="flex space-x-2">
        <div
          v-for="i in 5"
          :key="i"
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-8 animate-pulse"
        ></div>
      </div>
      <div
        v-else-if="pagination.total_pages && pagination.total_pages > 1"
        class="flex items-center space-x-2"
      >
        <!-- First Page -->
        <UButton
          :disabled="(pagination.current_page || 1) <= 1"
          icon="mdi:chevron-double-left"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToFirstPage"
          :loading="isLoading"
        />

        <!-- Previous Page -->
        <UButton
          :disabled="(pagination.current_page || 1) <= 1"
          icon="mdi:chevron-left"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToPreviousPage"
          :loading="isLoading"
        />

        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          <span class="text-sm text-gray-600 dark:text-gray-300 px-2">
            Page {{ pagination.current_page || 1 }} of
            {{ pagination.total_pages }}
          </span>
        </div>

        <!-- Next Page -->
        <UButton
          :disabled="
            (pagination.current_page || 1) >= (pagination.total_pages || 1)
          "
          icon="mdi:chevron-right"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToNextPage"
          :loading="isLoading"
        />

        <!-- Last Page -->
        <UButton
          :disabled="
            (pagination.current_page || 1) >= (pagination.total_pages || 1)
          "
          icon="mdi:chevron-double-right"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToLastPage"
          :loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>
