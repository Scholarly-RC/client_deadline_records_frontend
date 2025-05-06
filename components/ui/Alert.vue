<script setup>
const alertStore = useAlertStore();
const { activeAlerts, hasAlerts } = storeToRefs(alertStore);

const handleCloseAlert = (id) => {
  alertStore.removeAlert(id);
};
</script>

<template>
  <div
    v-if="hasAlerts"
    id="alert-container"
    class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
  >
    <div class="w-full items-end flex flex-col gap-2">
      <div
        v-for="alert in activeAlerts"
        :key="alert.id"
        id="success-alert"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5"
                :class="{
                  'text-green-400': alert.type === 'SUCCESS',
                  'text-blue-400': alert.type === 'INFO',
                  'text-yellow-500': alert.type === 'WARNING',
                  'text-red-500': alert.type === 'DANGER',
                }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ alert.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ alert.description }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="handleCloseAlert(alert.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
