<script setup lang="ts">
import Notification from "~/components/notifications/Notification.vue";

const notificationStore = useNotificationStore();

const { showNotification, notifications, showMoreNotification } =
  storeToRefs(notificationStore);

const unreadNotificationStore = useUnreadNotificationStore();
const { unreadNotificationCount } = storeToRefs(unreadNotificationStore);

// Function to handle "Show more" button click
const handleShowMoreNotification = async () => {
  try {
    await notificationStore.getNotifications();
  } catch (error) {
    console.error("Failed to load more notifications:", error);
  }
};

// Function to handle popover open/close
const handlePopoverUpdate = async (isOpen: boolean): Promise<void> => {
  if (isOpen) {
    // Fetch notifications when popover opens
    try {
      // Use refresh to get the latest notifications
      await notificationStore.refreshNotifications();
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }
  // Sync the store state with popover state
  notificationStore.showNotification = isOpen;
};

// Function to handle notification button click (in addition to popover open)
const handleNotificationButtonClick = async () => {
  // Ensure we fetch notifications when the button is clicked
  if (!showNotification.value) {
    try {
      await notificationStore.refreshNotifications();
    } catch (error) {
      console.error("Failed to fetch notifications on button click:", error);
    }
  }
};
</script>

<template>
  <UPopover :open="showNotification" @update:open="handlePopoverUpdate">
    <UButton
      icon="mdi:bell-ring-outline"
      class="notification-button relative p-3 rounded-full"
      :ui="{
        leadingIcon:
          unreadNotificationCount > 0
            ? 'animate-shake-ring text-green-500'
            : '',
      }"
      variant="subtle"
      size="xl"
      color="neutral"
      @click="handleNotificationButtonClick"
    />

    <template #content>
      <div
        class="mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden z-10"
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
              v-for="notification in notifications"
              :key="notification.id"
              :notification="notification"
            />
          </template>
          <template v-else>
            <div
              class="flex flex-col items-center justify-center p-6 text-center"
            >
              <UIcon name="mdi:bell-circle-outline" class="w-12 h-12 mb-3" />

              <h4 class="text-lg font-medium mb-1">No notifications</h4>
              <p class="text-sm">You're all caught up! Check back later.</p>
            </div>
          </template>
        </div>

        <!-- Dropdown footer -->
        <div
          class="px-4 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center"
        >
          <UButton
            v-if="showMoreNotification"
            @click="handleShowMoreNotification"
            label="Load more notifications"
            variant="soft"
            color="primary"
            size="sm"
            class="w-full justify-center"
            :loading="notificationStore.isLoading"
          >
            <template #leading>
              <UIcon name="mdi:reload" />
            </template>
          </UButton>
          <p
            v-else-if="notifications.length > 0"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            No more notifications to load
          </p>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<style>
.animate-shake-ring {
  animation: shake-ring 6s ease-in-out infinite !important;
  transform-origin: center !important;
}

@keyframes shake-ring {
  /* Shake for first 2 seconds (0-33.33%) */
  0%, 8.33%, 16.67%, 25%, 33.33% {
    transform: translateX(0) rotate(0deg);
  }
  4.17% {
    transform: translateX(-4px) rotate(-2deg);
  }
  12.5% {
    transform: translateX(4px) rotate(2deg);
  }
  20.83% {
    transform: translateX(-3px) rotate(-1deg);
  }
  29.17% {
    transform: translateX(3px) rotate(1deg);
  }
  /* Pause for 4 seconds (33.33%-100%) */
  33.33%, 100% {
    transform: translateX(0) rotate(0deg);
  }
}
</style>
