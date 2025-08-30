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

    onRequest({ options }) {
      const authHeader = authStore.getAuthHeader();

      if (authHeader) {
        if (!options.headers) {
          options.headers = new Headers();
        }
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', authHeader);
        } else {
          (options.headers as any).Authorization = authHeader;
        }
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        if (authStore.accessToken) {
          authStore.clearAuth();

          if (import.meta.client) {
            navigateTo('/login');
          }
        }
      }
    },
  });

  // Provide the API fetch function
  nuxtApp.provide('apiFetch', apiFetch);
  nuxtApp.provide('$apiFetch', apiFetch);
});