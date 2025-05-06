import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    userProfile: (state) => state.user,
  },

  actions: {
    async login(credentials) {
      const alertStore = useAlertStore();

      this.loading = true;

      try {
        const config = useRuntimeConfig();
        const response = await $fetch(`${config.public.apiBase}/api/token/`, {
          method: "POST",
          body: credentials,
        });

        this.setTokens(response.access, response.refresh);
        await this.setUser();
        alertStore.success(
          "Login success.",
          "Redirecting to the dashboard.",
          3
        );
        setTimeout(async () => {
          await navigateTo({ path: "/" });
        }, 4 * 1000);
      } catch (error) {
        alertStore.danger("Login failed.", error?.data?.detail, 5);
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        // Clear tokens and user data
        this.clearAuth();

        // Redirect to login page
        await navigateTo({ path: "/login" });
      } catch (error) {
        console.error(error);
      }
    },

    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      const cookie = useCookie("refresh_token");
      cookie.value = refreshToken;
    },

    async refreshAccessToken() {
      try {
        // Get refresh token from cookie
        const config = useRuntimeConfig();
        const refreshToken = this.getRefreshTokenFromCookie();

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // For token refresh, we use raw $fetch to avoid circular dependency
        // where the interceptor tries to refresh the token which calls the interceptor again
        const response = await $fetch(
          `${config.public.apiBase}/api/token/refresh/`,
          {
            method: "POST",
            body: { refresh: refreshToken },
          }
        );

        this.accessToken = response.access;
        await this.setUser();
      } catch (error) {
        this.clearAuth();
        navigateTo({ path: "/login" });
        console.error(error);
        throw error;
      }
    },

    getRefreshTokenFromCookie() {
      const refreshToken = useCookie("refresh_token");
      return refreshToken.value;
    },

    async setUser() {
      try {
        const config = useRuntimeConfig();
        const response = await $fetch(
          `${config.public.apiBase}/api/users/get-current-user/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );
        this.user = response;
      } catch (error) {
        console.error(error);
      }
    },

    clearAuth() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      const refreshCookie = useCookie("refresh_token");
      refreshCookie.value = null;

      // We don't need to remove headers, we'll just use the interceptor
      // which will check for accessToken existence
    },

    // Call this on app initialization
    async initAuth() {
      // Try to get refresh token from cookie
      const refreshToken = this.getRefreshTokenFromCookie();

      if (refreshToken) {
        this.refreshToken = refreshToken;

        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
});
