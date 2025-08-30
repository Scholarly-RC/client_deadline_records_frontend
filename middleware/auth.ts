import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  console.log('🔒 AUTH MIDDLEWARE: Called for route:', to.path);

  // Skip middleware if going to login page to avoid redirect loop
  if (to.path === "/login") {
    console.log('🔒 AUTH MIDDLEWARE: Skipping for login page');
    return;
  }

  const authStore = useAuthStore();
  console.log('🔒 AUTH MIDDLEWARE: Auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    isInitialized: authStore.isInitialized,
    isLoading: authStore.isLoading,
    hasUser: !!authStore.user
  });

  // Try to initialize auth if not already done
  // This handles cases where the user directly navigates to a protected route
  if (!authStore.isAuthenticated && !authStore.isLoading) {
    console.log('🔒 AUTH MIDDLEWARE: Initializing auth');
    try {
      await authStore.initializeAuth();
      console.log('🔒 AUTH MIDDLEWARE: Auth initialization completed');
    } catch (error) {
      console.error('🔒 AUTH MIDDLEWARE: Auth initialization failed:', error);
    }
  }

  // Redirect to login if not authenticated after initialization attempt
  if (!authStore.isAuthenticated) {
    console.log('🔒 AUTH MIDDLEWARE: Not authenticated, redirecting to login');
    return navigateTo("/login");
  }

  console.log('🔒 AUTH MIDDLEWARE: User is authenticated, proceeding');

  // Start notification polling if authenticated and on client side
  // Add a longer delay to ensure authentication is fully stable
  if (import.meta.client) {
    console.log('🔒 AUTH MIDDLEWARE: Scheduling notification polling in 1 second');
    setTimeout(async () => {
      console.log('🔒 AUTH MIDDLEWARE: Starting notification polling');
      try {
        const { useUnreadNotificationStore } = await import("~/stores/notification");
        const unreadNotificationStore = useUnreadNotificationStore();
        unreadNotificationStore.startPolling();
      } catch (error) {
        console.error('🔒 AUTH MIDDLEWARE: Failed to start notification polling:', error);
      }
    }, 1000); // 1 second delay to ensure auth is stable
  }
});