<script setup>
// Components
import AddDeadline from "./AddDeadline.vue";
</script>

<template>
  <section
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Client Deadlines
      </h2>
      <AddDeadline />
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
            >
              Client
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
            >
              Deadline Type
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
            >
              Due Date
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
            >
              Notes
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td
              class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white"
            >
              Beta LLC
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
              Contract Expiration
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
              2025-06-30
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
              Renewal required
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium space-x-2">
              <button
                class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
