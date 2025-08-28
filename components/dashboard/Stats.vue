<script setup lang="ts">
import { UCard } from "#components";
import type { TaskStatistics } from '~/types/entities'

const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const dashboardStore = useDashboardStore();
const taskStore = useTaskStore();
const { stats, enhancedStats, overdueTasks, tasksDueSoon, isAnyLoading } =
  storeToRefs(dashboardStore);

// Computed values for unified statistics
const totalTasks = computed((): number => enhancedStats.value?.summary?.total_tasks || 0);
const completedTasks = computed(
  (): number => enhancedStats.value?.summary?.completed_tasks || 0
);
const pendingTasks = computed((): number => enhancedStats.value?.summary?.pending_tasks || 0);
const overdueTasksCount = computed((): number => overdueTasks.value?.length || 0);
const tasksDueSoonCount = computed((): number => tasksDueSoon.value?.length || 0);
const onGoingTasks = computed(
  (): number => enhancedStats.value?.by_status?.ON_GOING || 0
);

// Approval-related statistics
const pendingApprovalsCount = computed((): number => taskStore.pendingApprovalsCount);

// Legacy stats for backward compatibility
const totalClients = computed((): number => (stats.value as any)?.total_clients || 0);
const completedThisMonth = computed(
  (): number => (stats.value as any)?.completed_deadlines || 0
);

// Task statistics by category
const tasksByCategory = computed(() => enhancedStats.value?.by_category || {});

// Load all dashboard data on mount
onMounted(async (): Promise<void> => {
  await dashboardStore.loadAllDashboardData();
  if (isAdmin.value) {
    await taskStore.fetchPendingApprovals();
  }
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

    <!-- On Going Tasks -->
    <UCard
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              On Going
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ onGoingTasks }}
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

    <!-- Pending Approvals (Admin only) -->
    <UCard
      v-if="isAdmin"
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      @click="$router.push('/approvals')"
    >
      <div class="p-1">
        <div class="flex items-center justify-between">
          <div class="w-full">
            <p
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Pending Approvals
            </p>
            <template v-if="isAnyLoading">
              <div
                class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"
              ></div>
            </template>
            <template v-else>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ pendingApprovalsCount }}
              </p>
            </template>
          </div>
          <div
            class="p-1 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200"
          >
            <UIcon
              name="i-lucide-user-check"
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
              {{ String(category).replace(/_/g, " ") }}
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
