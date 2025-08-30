import { useAuthStore } from "~/stores/auth";

// Type declarations for API functions
declare module '#app' {
  interface NuxtApp {
    $apiFetch: typeof $fetch
    apiFetch: typeof $fetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $apiFetch: typeof $fetch
    apiFetch: typeof $fetch
  }
}

// Simple API plugin
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  // Create API fetch function
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: "include",

    onRequest({ request, options }) {
      console.log('🌐 API DEBUG: onRequest called');
      console.log('🌐 API DEBUG: Request URL:', request);
      console.log('🌐 API DEBUG: Base URL:', options.baseURL);
      console.log('🌐 API DEBUG: Request method:', options.method);

      const authHeader = authStore.getAuthHeader();
      console.log('🌐 API DEBUG: Auth header present:', !!authHeader);

      if (authHeader) {
        if (!options.headers) {
          options.headers = new Headers();
        }
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', authHeader);
        } else {
          (options.headers as any).Authorization = authHeader;
        }
        console.log('🌐 API DEBUG: Authorization header set');
      } else {
        console.log('🌐 API DEBUG: No authorization header set');
      }

      console.log('🌐 API DEBUG: Final headers:', options.headers);
    },

    onResponseError({ response, request }) {
      console.log('🌐 API DEBUG: onResponseError called');
      console.log('🌐 API DEBUG: Response status:', response.status);
      console.log('🌐 API DEBUG: Response URL:', response.url);
      console.log('🌐 API DEBUG: Request URL:', request);

      if (response.status === 401) {
        console.log('🌐 API DEBUG: 401 error detected');
        console.log('🌐 API DEBUG: Auth store state:', {
          hasAccessToken: !!authStore.accessToken,
          hasRefreshToken: !!authStore.refreshToken,
          hasUser: !!authStore.user,
          isAuthenticated: authStore.isAuthenticated,
          isLoading: authStore.isLoading,
          isInitialized: authStore.isInitialized
        });

        if (authStore.accessToken) {
          console.log('🌐 API DEBUG: Clearing auth due to 401 with valid token');
          authStore.clearAuth();

          if (import.meta.client) {
            console.log('🌐 API DEBUG: Redirecting to login');
            navigateTo('/login');
          }
        } else {
          console.log('🌐 API DEBUG: Ignoring 401 - no auth token present');
        }
      }
    },
  });

  // Provide the API fetch function
  nuxtApp.provide('apiFetch', apiFetch);
  nuxtApp.provide('$apiFetch', apiFetch);
});