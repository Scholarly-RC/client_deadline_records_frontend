<script></script>
<!-- 
<script setup>
// Components
import WorkUpdate from "./WorkUpdate.vue";

// Stores
const viewDeadlineStore = useViewDeadlineStore();
const { deadline, isLoading } = storeToRefs(viewDeadlineStore);
</script>

<template>

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
          <template v-if="isLoading">

            <tr v-for="i in 3" :key="`loading-${i}`" class="animate-pulse">
              <td class="px-6 py-4">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                ></div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div
                    class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                ></div>
              </td>
            </tr>
          </template>
          <template v-else>
            <WorkUpdate
              v-for="workUpdate in deadline.work_updates"
              :key="workUpdate.id"
              :work-updates="workUpdate"
            />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
 -->
