<script setup>
import { storeToRefs } from "pinia";

// Stores
const notificationStore = useNotificationStore();
const unreadNotificationStore = useUnreadNotificationStore();
const { unreadNotificationCount } = storeToRefs(unreadNotificationStore);

// Lifecycle hooks
onMounted(async () => {
  await unreadNotificationStore.startPolling();
});

onBeforeUnmount(() => {
  unreadNotificationStore.stopPolling();
});
</script>

<template>
  <button
    @click="notificationStore.toggle()"
    id="notificationButton"
    class="notification-button relative p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-transparent dark:border-gray-600"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 text-gray-600 dark:text-gray-200"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
    <!-- Notification badge -->
    <span
      v-if="unreadNotificationCount"
      class="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary-500 dark:bg-primary-400 text-xs text-white flex items-center justify-center transform translate-x-1 -translate-y-1 shadow-sm"
      >{{ unreadNotificationCount }}</span
    >
  </button>
</template>
