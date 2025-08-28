import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if going to login page to avoid redirect loop
  if (to.path === "/login") {
    return;
  }

  const authStore = useAuthStore();

  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }
  
  // Start notification polling if authenticated
  if (import.meta.client) {
    const { useUnreadNotificationStore } = await import("~/stores/notification");
    const unreadNotificationStore = useUnreadNotificationStore();
    unreadNotificationStore.startPolling();
  }
});