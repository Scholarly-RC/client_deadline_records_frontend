<script setup>
import NotificationButton from "../notifications/NotificationButton.vue";

// Props
const props = defineProps({
  page: String,
});

// Stores
const sidebarStore = useSidebarStore();
</script>

<template>
  <div
    class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  >
    <div class="hidden md:block"></div>
    <button
      @click="sidebarStore.open()"
      id="mobile-sidebar-open"
      class="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        ></path>
      </svg>
    </button>
    <h1 class="text-lg font-bold text-gray-800 dark:text-white text-center">
      {{ props.page }}
    </h1>
    <div class="flex items-center">
      <NotificationButton />
    </div>
  </div>
</template>
