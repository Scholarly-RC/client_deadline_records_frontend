<script setup>
import Notification from "./Notification.vue";

const notificationStore = useNotificationStore();

const { showNotification, notifications, showMoreNotification } =
  storeToRefs(notificationStore);

const unreadNotificationStore = useUnreadNotificationStore();
const { unreadNotificationCount } = storeToRefs(unreadNotificationStore);

const handleShowMoreNotification = async () => {
  await notificationStore.getNotifications();
};

watch(showNotification, async (value) => {
  if (value) {
    await notificationStore.getNotifications();
  }
});
</script>

<template>
  <UPopover>
    <UChip
      :show="unreadNotificationCount > 0"
      :text="unreadNotificationCount"
      size="3xl"
    >
      <UButton
        icon="mdi:bell-ring-outline"
        class="notification-button relative p-3 rounded-full"
        variant="subtle"
        size="xl"
        color="neutral"
      />
    </UChip>

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
              v-for="(notification, index) in notifications"
              :key="notification.id"
              :notification="notification"
              :count="index"
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
          class="px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center"
        >
          <UButton
            v-if="showMoreNotification"
            `
            @click="handleShowMoreNotification"
            label="Show more"
            variant="outline"
            size="xs"
            color="neutral"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
