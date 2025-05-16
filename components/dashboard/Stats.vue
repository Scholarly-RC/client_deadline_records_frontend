<script setup>
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const dashboardStore = useDashboardStore();
const { stats, isLoading } = storeToRefs(dashboardStore);
</script>

<template>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
    <!-- Total Clients -->
    <div
      v-if="isAdmin"
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Total Clients
            </p>
            <template v-if="isLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.total_clients }}
              </p>
            </template>
          </div>
          <div
            class="p-3 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Deadlines -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Upcoming Deadlines
            </p>
            <template v-if="isLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.upcoming_deadlines }}
              </p>
            </template>
          </div>
          <div
            class="p-3 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Overdue Tasks -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Overdue Tasks
            </p>
            <template v-if="isLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.overdue_deadlines }}
              </p>
            </template>
          </div>
          <div
            class="p-3 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <!-- Pending Deadlines -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Pending Deadlines
            </p>
            <template v-if="isLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.pending_deadlines }}
              </p>
            </template>
          </div>
          <div
            class="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <!-- Cancelled Deadlines -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Cancelled Deadlines
            </p>
            <template v-if="isLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.cancelled_deadlines }}
              </p>
            </template>
          </div>
          <div
            class="p-3 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 12m-9 0a9 9 0 1118 0 9 9 0 01-18 0zm6-3l6 6m0-6l-6 6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <!-- Completed This Month -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Completed This Month
            </p>
            <template v-if="isLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.monthly_completed_deadlines }}
              </p>
            </template>
          </div>
          <div
            class="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
