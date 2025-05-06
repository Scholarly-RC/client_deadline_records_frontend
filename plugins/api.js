import { useAuthStore } from "~/stores/auth";

// plugins/api.js
export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();

  // Avoid direct store import to prevent circular dependencies
  const getAuthStore = () => {
    const authStore = useAuthStore();
    return authStore;
  };

  // Initialize authentication on app start
  try {
    await getAuthStore().initAuth();
  } catch (error) {
    console.error("Auth initialization failed:", error);
  }

  // Track refresh token operations to prevent multiple simultaneous refreshes
  let isRefreshing = false;
  let refreshPromise = null;

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: "include",
    async onRequest({ options }) {
      const authStore = getAuthStore();
      if (authStore.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.accessToken}`,
        };
      }
    },

    async onResponseError({ response, request, options }) {
      const authStore = getAuthStore();

      // Only handle 401 errors when we have a refresh token
      if (response.status === 401 && authStore.refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = authStore.refreshAccessToken().finally(() => {
            isRefreshing = false;
          });
        }

        try {
          // Wait for the refresh to complete (whether it's the current one or a previous one)
          await refreshPromise;

          // Clone the original options to avoid mutation issues
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          };

          // Retry the original request
          return $fetch(request, newOptions);
        } catch (error) {
          // Clear auth and redirect only on client side
          authStore.clearAuth();
          if (import.meta.client) {
            await navigateTo("/login");
          }
          // Re-throw the error to ensure the original caller knows the request failed
          throw error;
        }
      }

      // For non-401 errors or when we can't refresh, just throw
      throw response._data || new Error("Request failed");
    },
  });

  nuxtApp.provide("apiFetch", apiFetch);
});
