<script setup>
// Component Props
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <span
    v-if="status === 'pending'"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  >
    Pending
  </span>

  <span
    v-else-if="status === 'in_progress'"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  >
    In Progress
  </span>

  <span
    v-else-if="status === 'completed'"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  >
    Completed
  </span>

  <span
    v-else-if="status === 'overdue'"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  >
    Overdue
  </span>

  <span
    v-else-if="status === 'cancelled'"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  >
    Cancelled
  </span>
</template>
