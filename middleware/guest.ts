// middleware/guest.js
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  // If app just initialized, try to restore session
  if (!authStore.isLoading) {
    await authStore.initAuth();
  }

  // Redirect to dashboard if already authenticated
  if (authStore.isAuthenticated) {
    return navigateTo("/");
  }
});
