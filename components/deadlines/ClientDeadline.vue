<script setup>
// Props
const props = defineProps({
  deadline: Object,
});

// Priority label function
const getPriorityLabel = (priority) => {
  const priorityMap = {
    1: "Lowest",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Highest",
  };

  return priorityMap[priority] || "Unknown";
};
</script>

<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
      {{ deadline.client.name }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
      {{ deadline.deadline_type.name }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
      {{ deadline.due_date }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
      {{ getPriorityLabel(deadline.priority) }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
      {{ deadline.status }}
    </td>
    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
      {{ deadline.assigned_to.fullname }}
    </td>
    <td class="px-6 py-4 text-right text-sm font-medium space-x-2">
      <NuxtLink
        :to="`/deadlines/${deadline.id}`"
        class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
      >
        View
      </NuxtLink>
    </td>
  </tr>
</template>
