<script setup lang="ts">
import TaskPriorityPill from "../ui/TaskPriorityPill.vue";
import TaskStatusPill from "../ui/TaskStatusPill.vue";
import type { Task } from '~/types/entities'

const dashboardStore = useDashboardStore();
const { enhancedStats } = storeToRefs(dashboardStore);

// Computed properties for component usage
const deadlines = computed(() => {
  // Since the statistics endpoint doesn't provide detailed task lists,
  // we'll show a summary instead of individual tasks
  return [];
});
const isLoading = computed(() => dashboardStore.isAnyLoading);

// Use the summary data from statistics
const dueThisWeek = computed(() => enhancedStats.value?.summary?.due_this_week || 0);
const dueToday = computed(() => enhancedStats.value?.summary?.due_today || 0);
const overdue = computed(() => enhancedStats.value?.summary?.overdue || 0);

onMounted(async (): Promise<void> => {
  // Data is already loaded by the dashboard store
});
</script>

<template>
  <!-- Upcoming Deadlines Section -->
  <UCard
    class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Upcoming Deadlines
        </h3>
      </div>
    </template>

    <div class="p-6 space-y-4">
      <template v-if="isLoading">
        <div
          v-for="i in 3"
          :key="`skeleton-${i}`"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 animate-pulse"
        >
          <div class="space-y-2 w-full">
            <div class="h-5 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="w-20 h-6 bg-gray-200 rounded-full dark:bg-gray-700"
            ></div>
            <div
              class="w-20 h-6 bg-gray-200 rounded-full dark:bg-gray-700"
            ></div>
            <div class="w-16 h-8 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          </div>
        </div>
      </template>

      <!-- Actual Content -->
      <template v-else>
        <div class="space-y-4">
          <!-- Overdue Tasks Summary -->
          <div v-if="overdue > 0" class="flex items-center justify-between p-4 border border-red-200 rounded-lg dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                <UIcon name="mdi:alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 class="font-medium text-red-900 dark:text-red-100">Overdue Tasks</h4>
                <p class="text-sm text-red-700 dark:text-red-300">{{ overdue }} tasks need immediate attention</p>
              </div>
            </div>

          </div>

          <!-- Due Today Summary -->
          <div v-if="dueToday > 0" class="flex items-center justify-between p-4 border border-yellow-200 rounded-lg dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center">
                <UIcon name="mdi:calendar-today" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 class="font-medium text-yellow-900 dark:text-yellow-100">Due Today</h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ dueToday }} tasks due today</p>
              </div>
            </div>

          </div>

          <!-- Due This Week Summary -->
          <div v-if="dueThisWeek > 0" class="flex items-center justify-between p-4 border border-blue-200 rounded-lg dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <UIcon name="mdi:calendar-week" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 class="font-medium text-blue-900 dark:text-blue-100">Due This Week</h4>
                <p class="text-sm text-blue-700 dark:text-blue-300">{{ dueThisWeek }} tasks due this week</p>
              </div>
            </div>

          </div>
        </div>
      </template>
      <!-- Empty State -->
      <div v-if="!isLoading && dueThisWeek === 0 && dueToday === 0 && overdue === 0" class="p-4 text-center">
        No upcoming deadlines
      </div>
    </div>
  </UCard>
</template>
