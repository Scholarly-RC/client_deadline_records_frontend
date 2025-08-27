<script setup>
// Props
const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
});

// State and stores
const isRead = ref(props.notification.is_read);
const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const unreadNotificationStore = useUnreadNotificationStore();

// Handle notification click
const handleNotificationClick = async () => {
  if (!isRead.value) {
    await notificationStore.markNotificationAsRead(props.notification.id);
    isRead.value = true; // Update the ref after marking as read
  }

  await unreadNotificationStore.getUnreadNotificationCount();
  notificationStore.close();

  if (props.notification.link) {
    // Check if the user is already on the same page
    if (route.path === props.notification.link) {
      // Refresh the page content based on the current route
      await refreshCurrentPageContent();
    }
    router.push(props.notification.link);
  }
};

// Refresh page content based on the current route
const refreshCurrentPageContent = async () => {
  // For approvals page
  if (route.path === "/approvals") {
    const { useTaskStore } = await import("~/stores/tasks");
    const taskStore = useTaskStore();
    await taskStore.fetchPendingApprovals();
  }
  // For my-tasks page
  else if (route.path === "/my-tasks") {
    const { useUserTasksStore } = await import("~/stores/userTasks");
    const userTasksStore = useUserTasksStore();
    const { useAuthStore } = await import("~/stores/auth");
    const authStore = useAuthStore();
    if (authStore.user && authStore.user.id) {
      await userTasksStore.fetchUserTasks(authStore.user.id);
    }
  }
};
</script>

<template>
  <div
    class="border-l-4"
    :class="{
      'border-primary-500 dark:border-primary-400': !isRead,
      'border-transparent': isRead,
    }"
  >
    <NuxtLink
      :to="notification.link"
      class="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      @click.prevent="handleNotificationClick"
    >
      <div class="flex-shrink-0">
        <div
          class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/80 flex items-center justify-center relative"
        >
          <!-- Notification bell icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-blue-600 dark:text-blue-300"
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
        </div>
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
          {{ notification.title }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ notification.message }}
        </p>
        <p class="text-xs text-primary-500 dark:text-primary-400 mt-1">
          {{ notification.timesince_created }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
