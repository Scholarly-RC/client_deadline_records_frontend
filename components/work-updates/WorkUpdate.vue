<script setup>
// Props
const props = defineProps({
  workUpdates: Object,
});
</script>

<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
      {{ workUpdates.created_at }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
      {{ workUpdates.notes }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
      {{ workUpdates.status }}
    </td>
  </tr>
</template>
