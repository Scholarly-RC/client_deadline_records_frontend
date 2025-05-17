<script setup>
import Notification from "./Notification.vue";

const notificationStore = useNotificationStore();

const { showNotification, notifications, showMoreNotification, pagination } =
  storeToRefs(notificationStore);

const notificationContainer = ref(null);

const handleShowMoreNotification = async () => {
  await notificationStore.getNotifications();
};

watch(showNotification, async (value) => {
  if (value) {
    await notificationStore.getNotifications();
  }
});

const handleClickOutside = (event) => {
  // Close dropdown if clicked outside
  if (
    notificationContainer.value &&
    !notificationContainer.value.contains(event.target)
  ) {
    if (
      event.target.closest(".notification-button") ||
      event.target.closest(".dark-mode-toggle")
    ) {
      return;
    }
    if (showNotification.value) {
      notificationStore.close();
    }
  }
};

// Lifecycle Hooks
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <!-- Dropdown content -->
  <div
    v-if="showNotification"
    id="notificationDropdown"
    ref="notificationContainer"
    class="absolute right-3.5 top-12 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden z-10"
  >
    <!-- Dropdown header -->
    <div
      class="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
    >
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">
        System Notifications
      </h3>
    </div>

    <!-- Notification items -->
    <div
      class="divide-y divide-gray-200 dark:divide-gray-600 max-h-96 overflow-y-auto"
    >
      <template v-if="notifications.length > 0">
        <Notification
          v-for="(notification, index) in notifications"
          :key="notification.id"
          :notification="notification"
          :count="index"
        />
      </template>
      <template v-else>
        <div class="flex flex-col items-center justify-center p-6 text-center">
          <svg
            class="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
          <h4 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            No notifications
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            You're all caught up! Check back later.
          </p>
        </div>
      </template>
    </div>

    <!-- Dropdown footer -->
    <div
      class="px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center"
    >
      <button
        v-if="showMoreNotification"
        @click="handleShowMoreNotification"
        class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
      >
        Show more
      </button>
    </div>
  </div>
</template>
