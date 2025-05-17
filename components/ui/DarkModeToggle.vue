<script setup>
// Stores
const darkModeStore = useDarkModeStore();
</script>

<template>
  <button
    @click="darkModeStore.toggle()"
    id="desktop-dark-mode-toggle"
    class="dark-mode-toggle flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
  >
    <!-- Sun icon (light mode) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5 mr-2 dark:hidden"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>

    <!-- Moon icon (dark mode) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="hidden w-5 h-5 mr-2 dark:block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>

    <span>Toggle Mode</span>
  </button>
</template>
