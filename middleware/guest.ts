// middleware/guest.ts
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  // Always try to restore session on guest routes to ensure proper state
  // This handles cases where the user refreshes the login page
  try {
    await authStore.initializeAuth();
  } catch (error) {
    // If initializeAuth fails, continue to login page
    console.error('Auth initialization failed in guest middleware:', error);
  }

  // Redirect to dashboard if already authenticated
  if (authStore.isAuthenticated) {
    return navigateTo("/");
  }
});
