<script setup>
// Stores
const darkModeStore = useDarkModeStore();
</script>

<template>
  <div class="mt-4 text-center flex justify-center items-center">
    <button
      @click="darkModeStore.toggle()"
      id="dark-mode-toggle"
      class="flex flex-row items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      <span class="me-1">Toggle</span>
      <svg
        id="dark-icon"
        class="w-4 h-4 hidden dark:block"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        ></path>
      </svg>
      <svg
        id="light-icon"
        class="w-4 h-4 block dark:hidden"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        ></path>
      </svg>
    </button>
  </div>
</template>
