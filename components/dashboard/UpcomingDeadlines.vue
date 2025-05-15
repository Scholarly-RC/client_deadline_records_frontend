<script setup>
import DeadlinePriorityPill from "../ui/DeadlinePriorityPill.vue";
import DeadlineStatusPill from "../ui/DeadlineStatusPill.vue";

const upcomingDeadlineStore = useUpcomingDeadlineStore();
const { deadlines } = storeToRefs(upcomingDeadlineStore);
</script>

<template>
  <!-- Upcoming Deadlines Section -->
  <div
    class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
  >
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        Upcoming Deadlines
      </h3>
      <NuxtLink
        to="/deadlines"
        class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        View All
      </NuxtLink>
    </div>
    <div class="p-6 space-y-4">
      <!-- Deadline Item 1 -->
      <div
        v-for="deadline in deadlines"
        :key="deadline.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700"
      >
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white">
            {{ deadline.client.name }} - {{ deadline.deadline_type.name }}
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Due in {{ deadline.days_remaining }} days ({{ deadline.due_date }})
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <DeadlinePriorityPill :priority="deadline.priority" />
          <DeadlineStatusPill :status="deadline.status" />
          <NuxtLink
            :to="`/deadlines/${deadline.id}`"
            class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Update
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
