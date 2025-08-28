import { defineStore } from 'pinia';
import type { User } from '~/types/entities';
import type { LoginRequest } from '~/types/requests';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

interface RefreshResponse {
  access: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken,
    userProfile: (state): User | null => state.user,
    isAdmin: (state): boolean => (state.user ? state.user.is_admin : false),
  },

  actions: {
    async login(credentials: LoginRequest): Promise<void> {
      const toast = useToast();

      this.isLoading = true;

      try {
        const config = useRuntimeConfig();
        const response = await $fetch<LoginResponse>(`${config.public.apiBase}/api/token/`, {
          method: 'POST',
          body: credentials,
        });

        this.setTokens(response.access, response.refresh);
        await this.setUser();
        toast.add({
          title: 'Welcome Back',
          description:
            'You have successfully logged in. Redirecting to your dashboard...',
          color: 'success',
          icon: 'mdi:checkbox-multiple-marked',
          duration: 2000,
        });

        setTimeout(async () => {
          await navigateTo({ path: '/' });
        }, 2 * 1000);
      } catch (error: any) {
        toast.add({
          title: 'Login Unsuccessful',
          description: getErrorMessage(error),
          color: 'error',
          icon: 'mdi:close-box-multiple',
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },

    async logout(): Promise<void> {
      try {
        // Clear tokens and user data
        this.clearAuth();

        // Redirect to login page
        await navigateTo({ path: '/login' });
      } catch (error) {
        console.error(error);
      }
    },

    setTokens(accessToken: string, refreshToken: string): void {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      const cookie = useCookie<string>('refresh_token');
      cookie.value = refreshToken;
    },

    async refreshAccessToken(): Promise<void> {
      try {
        // Get refresh token from cookie
        const config = useRuntimeConfig();
        const refreshToken = this.getRefreshTokenFromCookie();

        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // For token refresh, we use raw $fetch to avoid circular dependency
        // where the interceptor tries to refresh the token which calls the interceptor again
        const response = await $fetch<RefreshResponse>(
          `${config.public.apiBase}/api/token/refresh/`,
          {
            method: 'POST',
            body: { refresh: refreshToken },
          }
        );

        this.accessToken = response.access;
        await this.setUser();
      } catch (error) {
        this.clearAuth();
        navigateTo({ path: '/login' });
        console.error(error);
        throw error;
      }
    },

    getRefreshTokenFromCookie(): string | null {
      const refreshToken = useCookie<string>('refresh_token');
      return refreshToken.value || null;
    },

    async setUser(): Promise<void> {
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<User>(
          `${config.public.apiBase}/api/users/get-current-user/`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );
        this.user = response;
      } catch (error) {
        console.error(error);
      }
    },

    clearAuth(): void {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      const refreshCookie = useCookie<string | null>('refresh_token');
      refreshCookie.value = null;

      // Stop notification polling
      if (import.meta.client) {
        // Use dynamic import to avoid circular dependencies
        import('~/stores/notification').then(({ useUnreadNotificationStore }) => {
          const unreadNotificationStore = useUnreadNotificationStore();
          unreadNotificationStore.stopPolling();
        }).catch(error => {
          console.error('Failed to stop notification polling:', error);
        });
      }

      // We don't need to remove headers, we'll just use the interceptor
      // which will check for accessToken existence
    },

    // Call this on app initialization
    async initAuth(): Promise<void> {
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