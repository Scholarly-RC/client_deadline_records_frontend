<script setup>
// Components
import WorkUpdate from "./WorkUpdate.vue";

// Stores
const workUpdateStore = useWorkUpdateStore();
const { workUpdates } = storeToRefs(workUpdateStore);
</script>

<template>
  <!-- Current Works -->
  <div
    class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  >
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        Work Updates
      </h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Notes
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <WorkUpdate
            v-for="workUpdate in workUpdates"
            :key="workUpdate.id"
            :work-updates="workUpdate"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
