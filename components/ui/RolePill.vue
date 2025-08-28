<script setup lang="ts">
// Component Props
interface Props {
  role?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <span
    v-if="role === 'admin'"
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  >
    Admin
  </span>

  <span
    v-else-if="role === 'staff'"
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  >
    Staff
  </span>

  <!-- Optionally, you could add a default condition to handle invalid role inputs -->
  <span
    v-else
    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  >
    Unknown Role
  </span>
</template>