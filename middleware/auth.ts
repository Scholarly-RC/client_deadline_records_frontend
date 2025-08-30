import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if going to login page to avoid redirect loop
  if (to.path === "/login") {
    return;
  }

  const authStore = useAuthStore();

  // Try to initialize auth if not already done
  // This handles cases where the user directly navigates to a protected route
  if (!authStore.isAuthenticated && !authStore.isLoading) {
    try {
      await authStore.initializeAuth();
    } catch (error) {
      console.error('Auth initialization failed:', error);
    }
  }

  // Redirect to login if not authenticated after initialization attempt
  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  // Start notification polling if authenticated and on client side
  // Add a longer delay to ensure authentication is fully stable
  if (import.meta.client) {
    setTimeout(async () => {
      try {
        const { useUnreadNotificationStore } = await import("~/stores/notification");
        const unreadNotificationStore = useUnreadNotificationStore();
        unreadNotificationStore.startPolling();
      } catch (error) {
        console.error('Failed to start notification polling:', error);
      }
    }, 1000); // 1 second delay to ensure auth is stable
  }
});