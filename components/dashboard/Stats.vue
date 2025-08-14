<script setup>
import { UCard } from "#components";

const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const dashboardStore = useDashboardStore();
const { stats, isLoading } = storeToRefs(dashboardStore);
</script>

<template>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
    <!-- Total Clients -->
    <UCard
      v-if="isAdmin"
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
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
            class="p-1 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200"
          >
            <UIcon name="mdi:account-group-outline" class="w-7 h-7 mx-1 mt-1" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Upcoming Deadlines -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
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
            class="p-1 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200"
          >
            <UIcon name="mdi:calendar-month" class="w-7 h-7 mx-1 mt-1" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Overdue Tasks -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
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
            class="p-1 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200"
          >
            <UIcon
              name="mdi:calendar-alert-outline"
              class="w-7 h-7 mx-1 mt-1"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Pending Deadlines -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
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
            class="p-1 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
          >
            <UIcon
              name="mdi:calendar-clock-outline"
              class="w-7 h-7 mx-1 mt-1"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Cancelled Deadlines -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
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
            class="p-1 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200"
          >
            <UIcon
              name="mdi:calendar-minus-outline"
              class="w-7 h-7 mx-1 mt-1"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Completed This Month -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
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
            class="p-1 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
          >
            <UIcon name="mdi:calendar-star-outline" class="w-7 h-7 mx-1 mt-1" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
