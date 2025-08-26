<script setup>
import { UCard } from "#components";

const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const dashboardStore = useDashboardStore();
const { stats, taskStatistics, overdueTasks, tasksDueSoon, isAnyLoading } =
  storeToRefs(dashboardStore);

// Computed values for unified statistics
const totalTasks = computed(() => taskStatistics.value?.total_tasks || 0);
const completedTasks = computed(
  () => taskStatistics.value?.completed_tasks || 0
);
const pendingTasks = computed(() => taskStatistics.value?.pending_tasks || 0);
const overdueTasksCount = computed(() => overdueTasks.value?.length || 0);
const tasksDueSoonCount = computed(() => tasksDueSoon.value?.length || 0);
const inProgressTasks = computed(
  () => taskStatistics.value?.by_status?.IN_PROGRESS || 0
);

// Legacy stats for backward compatibility
const totalClients = computed(() => stats.value?.total_clients || 0);
const completedThisMonth = computed(
  () => stats.value?.completed_deadlines || 0
);

// Task statistics by category
const tasksByCategory = computed(() => taskStatistics.value?.by_category || {});

// Load all dashboard data on mount
onMounted(async () => {
  await dashboardStore.loadAllDashboardData();
});
</script>

<template>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
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
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ totalClients }}
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

    <!-- Total Tasks -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Total Tasks
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ totalTasks }}
              </p>
            </template>
          </div>
          <div
            class="p-1 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200"
          >
            <UIcon name="mdi:format-list-bulleted" class="w-7 h-7 mx-1 mt-1" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Tasks Due Soon -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Due Soon (Next 7 Days)
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ tasksDueSoonCount }}
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
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ overdueTasksCount }}
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

    <!-- In Progress Tasks -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              In Progress
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ inProgressTasks }}
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

    <!-- Pending Tasks -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Pending Tasks
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ pendingTasks }}
              </p>
            </template>
          </div>
          <div
            class="p-1 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200"
          >
            <UIcon
              name="mdi:calendar-minus-outline"
              class="w-7 h-7 mx-1 mt-1"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Completed Tasks -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Completed Tasks
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ completedTasks }}
              </p>
            </template>
          </div>
          <div
            class="p-1 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
          >
            <UIcon
              name="mdi:calendar-check-outline"
              class="w-7 h-7 mx-1 mt-1"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Task Category Breakdown (if admin) -->
    <UCard
      v-if="
        isAdmin && tasksByCategory && Object.keys(tasksByCategory).length > 0
      "
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden col-span-full"
    >
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Tasks by Category
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(count, category) in tasksByCategory"
            :key="category"
            class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
          >
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {{ category.replace(/_/g, " ") }}
            </p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ count }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
