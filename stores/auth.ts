import { defineStore } from 'pinia';
import type { User } from '~/types/entities';
import type { LoginRequest } from '~/types/requests';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken && !!state.user,
    userProfile: (state): User | null => state.user,
    isAdmin: (state): boolean => state.user?.is_admin || false,
  },

  actions: {
    // Initialize auth state from cookies
    async initializeAuth(): Promise<void> {
      if (this.isInitialized) {
        return;
      }

      try {
        const refreshTokenCookie = useCookie<string>('refresh_token');
        const storedRefreshToken = refreshTokenCookie.value;

        if (storedRefreshToken) {
          this.refreshToken = storedRefreshToken;

          // Try to refresh the access token
          await this.refreshAccessToken();

          // Verify we have user data after initialization
          if (!this.user) {
            console.warn('Auth initialization: No user data after token refresh, clearing auth');
            this.clearAuth();
          }
        } else {
          console.log('Auth initialization: No refresh token found');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        this.clearAuth();
      } finally {
        this.isInitialized = true;
      }
    },

    // Login with credentials
    async login(credentials: LoginRequest): Promise<void> {
      this.isLoading = true;

      try {
        const config = useRuntimeConfig();

        const response = await $fetch<{
          access: string;
          refresh: string;
        }>(`${config.public.apiBase}/api/token/`, {
          method: 'POST',
          body: credentials,
        });

        // Store tokens
        this.setTokens(response.access, response.refresh);

        // Fetch user data
        await this.fetchUser();

        // Verify we have user data before proceeding
        if (!this.user) {
          throw new Error('Failed to load user data after login');
        }

        // Success notification
        const toast = useToast();
        toast.add({
          title: 'Welcome Back',
          description: 'You have successfully logged in.',
          color: 'success',
          icon: 'mdi:checkbox-multiple-marked',
          duration: 2000,
        });

        // Navigate to dashboard
        await navigateTo('/');

      } catch (error: any) {
        this.clearAuth();

        const toast = useToast();
        let errorMessage = 'Login failed. Please try again.';

        if (error?.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (error?.status === 429) {
          errorMessage = 'Too many login attempts. Please wait a moment.';
        } else if (error?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        toast.add({
          title: 'Login Failed',
          description: errorMessage,
          color: 'error',
          icon: 'mdi:close-box-multiple',
          duration: 5000,
        });

        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Logout
    async logout(): Promise<void> {
      try {
        // Clear local state
        this.clearAuth();

        // Show logout success notification
        const toast = useToast();
        toast.add({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
          color: 'success',
          icon: 'mdi:logout',
          duration: 2000,
        });

        // Navigate to login
        await navigateTo('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    // Refresh access token
    async refreshAccessToken(): Promise<void> {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const config = useRuntimeConfig();
        const response = await $fetch<{
          access: string;
        }>(`${config.public.apiBase}/api/token/refresh/`, {
          method: 'POST',
          body: { refresh: this.refreshToken },
        });

        this.accessToken = response.access;
        await this.fetchUser();

        // Verify we have user data after refresh
        if (!this.user) {
          throw new Error('Failed to load user data after token refresh');
        }

      } catch (error: any) {
        console.error('Token refresh failed:', error);
        this.clearAuth();

        if (import.meta.client) {
          await navigateTo('/login');
        }

        throw error;
      }
    },

    // Fetch current user data
    async fetchUser(): Promise<void> {
      if (!this.accessToken) {
        return;
      }

      try {
        const config = useRuntimeConfig();
        const apiUrl = `${config.public.apiBase}/api/users/get-current-user/`;

        const user = await $fetch<User>(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });

        this.user = user;
      } catch (error: any) {
        console.error('Failed to fetch user:', error);

        // Only clear auth if it's not a 401 (which would cause a loop)
        if (error?.status !== 401) {
          this.clearAuth();
        }

        throw error;
      }
    },

    // Set tokens and store in cookies
    setTokens(accessToken: string, refreshToken: string): void {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      // Store refresh token in secure cookie (remove httpOnly for client-side access)
      const refreshTokenCookie = useCookie<string>('refresh_token', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      refreshTokenCookie.value = refreshToken;
    },

    // Clear all auth data
    clearAuth(): void {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      // Clear cookie
      const refreshTokenCookie = useCookie<string | null>('refresh_token');
      refreshTokenCookie.value = null;

      // Clear any intervals or timeouts
      if (import.meta.client) {
        // Stop notification polling if it exists (async operation)
        import('~/stores/notification').then(({ useUnreadNotificationStore }) => {
          const notificationStore = useUnreadNotificationStore();
          notificationStore.stopPolling();
        }).catch(() => {
          // Ignore if notification store doesn't exist or fails
        });
      }
    },

    // Check if token is expired or will expire soon
    isTokenExpiringSoon(): boolean {
      if (!this.accessToken) return true;

      try {
        const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        return (exp - now) < fiveMinutes;
      } catch (error) {
        console.error('Failed to decode token:', error);
        return true;
      }
    },

    // Get authorization header
    getAuthHeader(): string | null {
      return this.accessToken ? `Bearer ${this.accessToken}` : null;
    },


  },
});