<script setup>
// Props
const props = defineProps({
  log: Object,
});
</script>

<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900 dark:text-white">
          {{ log.created_at }}
        </div>
      </div>
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      {{ log.user.fullname }}
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      {{ log.details }}
    </td>
  </tr>
</template>
