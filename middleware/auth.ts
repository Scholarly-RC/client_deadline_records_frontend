import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if going to login page to avoid redirect loop
  if (to.path === "/login") {
    return;
  }

  const authStore = useAuthStore();

  // Wait for auth initialization if not already done
  if (!authStore.isInitialized) {
    try {
      await authStore.initializeAuth();
    } catch (error) {
      console.error('Auth initialization failed in middleware:', error);
    }
  }

  // Redirect to login if not authenticated after initialization
  if (!authStore.isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return navigateTo("/login");
  }

  // Start notification polling if authenticated and on client side
  if (import.meta.client && authStore.isAuthenticated) {
    // Use nextTick to ensure DOM is ready
    await nextTick();
    setTimeout(async () => {
      try {
        const { useUnreadNotificationStore } = await import("~/stores/notification");
        const unreadNotificationStore = useUnreadNotificationStore();
        unreadNotificationStore.startPolling();
      } catch (error) {
        console.error('Failed to start notification polling:', error);
      }
    }, 500); // Shorter delay since we're using nextTick
  }
});