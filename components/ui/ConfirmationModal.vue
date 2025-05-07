<script setup>
const confirmationStore = useConfirmationStore();
</script>

<template>
  <div v-if="confirmationStore.show">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
    ></div>

    <!-- Modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
      >
        <!-- Modal Header -->
        <div class="px-6 pt-6 pb-3">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <svg
              class="w-5 h-5 text-yellow-500 dark:text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9 2a7 7 0 017 7v1a7 7 0 01-7 7 7 7 0 01-7-7V9a7 7 0 017-7zm0 2a5 5 0 00-5 5v1a5 5 0 0010 0V9a5 5 0 00-5-5zm1 4a1 1 0 10-2 0v2a1 1 0 102 0V8zm-1 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              />
            </svg>
            Confirm Action
          </h2>
        </div>

        <!-- Modal Body -->
        <div class="px-6 pb-4 text-sm text-gray-700 dark:text-gray-300">
          {{ confirmationStore.message }}
        </div>

        <!-- Modal Footer -->
        <div class="px-6 pb-6 pt-2 flex justify-end space-x-3">
          <button
            @click="confirmationStore.resolve(false)"
            class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmationStore.resolve(true)"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition flex items-center gap-1"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
