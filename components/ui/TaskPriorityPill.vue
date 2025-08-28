<script setup lang="ts">
// Component Props
interface Props {
  priority: number;
}

const props = defineProps<Props>();
</script>

<template>
  <span
    v-if="priority === 1"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  >
    Lowest
  </span>

  <span
    v-else-if="priority === 2"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  >
    Low
  </span>

  <span
    v-else-if="priority === 3"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  >
    Medium
  </span>

  <span
    v-else-if="priority === 4"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  >
    High
  </span>

  <span
    v-else-if="priority === 5"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  >
    Highest
  </span>
</template>