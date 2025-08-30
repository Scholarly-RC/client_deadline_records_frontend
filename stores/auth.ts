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
      console.log('🔑 AUTH DEBUG: initializeAuth called');
      console.log('🔑 AUTH DEBUG: Already initialized:', this.isInitialized);

      if (this.isInitialized) {
        console.log('🔑 AUTH DEBUG: Already initialized, skipping');
        return;
      }

      try {
        const refreshTokenCookie = useCookie<string>('refresh_token');
        const storedRefreshToken = refreshTokenCookie.value;

        console.log('🔑 AUTH DEBUG: Refresh token from cookie:', !!storedRefreshToken);

        if (storedRefreshToken) {
          console.log('🔑 AUTH DEBUG: Found refresh token, attempting to refresh access token');
          this.refreshToken = storedRefreshToken;
          await this.refreshAccessToken();

          // Verify we have user data after initialization
          if (!this.user) {
            console.warn('🔑 AUTH DEBUG: Failed to load user data during initialization, clearing auth');
            this.clearAuth();
          } else {
            console.log('🔑 AUTH DEBUG: Initialization successful');
          }
        } else {
          console.log('🔑 AUTH DEBUG: No refresh token found in cookie');
        }
      } catch (error) {
        console.error('🔑 AUTH DEBUG: Auth initialization failed:', error);
        this.clearAuth();
      } finally {
        this.isInitialized = true;
        console.log('🔑 AUTH DEBUG: Initialization process completed');
      }
    },

    // Login with credentials
    async login(credentials: LoginRequest): Promise<void> {
      console.log('🔑 AUTH DEBUG: Login started');
      this.isLoading = true;

      try {
        const config = useRuntimeConfig();
        console.log('🔑 AUTH DEBUG: Making login request to:', `${config.public.apiBase}/api/token/`);

        const response = await $fetch<{
          access: string;
          refresh: string;
        }>(`${config.public.apiBase}/api/token/`, {
          method: 'POST',
          body: credentials,
        });

        console.log('🔑 AUTH DEBUG: Login API response received');
        console.log('🔑 AUTH DEBUG: Access token received:', !!response.access);
        console.log('🔑 AUTH DEBUG: Refresh token received:', !!response.refresh);

        // Store tokens
        this.setTokens(response.access, response.refresh);

        // Fetch user data
        console.log('🔑 AUTH DEBUG: Fetching user data');
        await this.fetchUser();

        // Verify we have user data before proceeding
        if (!this.user) {
          console.log('🔑 AUTH DEBUG: User data fetch failed');
          throw new Error('Failed to load user data after login');
        }

        console.log('🔑 AUTH DEBUG: Login successful, user:', this.user.username);

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
        console.log('🔑 AUTH DEBUG: Navigating to dashboard');
        await navigateTo('/');

      } catch (error: any) {
        console.log('🔑 AUTH DEBUG: Login failed');
        console.log('🔑 AUTH DEBUG: Error status:', error?.status);
        console.log('🔑 AUTH DEBUG: Error message:', error?.message);

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
        console.log('🔑 AUTH DEBUG: Login process completed');
      }
    },

    // Logout
    async logout(): Promise<void> {
      try {
        // Clear local state
        this.clearAuth();

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
      console.log('🔑 AUTH DEBUG: fetchUser called');
      console.log('🔑 AUTH DEBUG: Has access token:', !!this.accessToken);

      if (!this.accessToken) {
        console.log('🔑 AUTH DEBUG: No access token, skipping user fetch');
        return;
      }

      try {
        const config = useRuntimeConfig();
        const apiUrl = `${config.public.apiBase}/api/users/get-current-user/`;
        console.log('🔑 AUTH DEBUG: Making user fetch request to:', apiUrl);

        const user = await $fetch<User>(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });

        console.log('🔑 AUTH DEBUG: User fetch successful');
        console.log('🔑 AUTH DEBUG: User data:', { id: user.id, username: user.username });

        this.user = user;
      } catch (error: any) {
        console.log('🔑 AUTH DEBUG: User fetch failed');
        console.log('🔑 AUTH DEBUG: Error status:', error?.status);
        console.log('🔑 AUTH DEBUG: Error message:', error?.message);
        console.error('Failed to fetch user:', error);

        // Only clear auth if it's not a 401 (which would cause a loop)
        if (error?.status !== 401) {
          console.log('🔑 AUTH DEBUG: Clearing auth due to non-401 error');
          this.clearAuth();
        } else {
          console.log('🔑 AUTH DEBUG: Not clearing auth due to 401 error (to prevent loop)');
        }

        throw error;
      }
    },

    // Set tokens and store in cookies
    setTokens(accessToken: string, refreshToken: string): void {
      console.log('🔑 AUTH DEBUG: Setting tokens');
      console.log('🔑 AUTH DEBUG: Access token length:', accessToken?.length);
      console.log('🔑 AUTH DEBUG: Refresh token length:', refreshToken?.length);

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      // Store refresh token in secure cookie
      const refreshTokenCookie = useCookie<string>('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      refreshTokenCookie.value = refreshToken;

      console.log('🔑 AUTH DEBUG: Tokens set successfully');
      console.log('🔑 AUTH DEBUG: Current auth state:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        hasUser: !!this.user,
        isAuthenticated: this.isAuthenticated
      });
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
      const header = this.accessToken ? `Bearer ${this.accessToken}` : null;
      console.log('🔑 AUTH DEBUG: getAuthHeader called');
      console.log('🔑 AUTH DEBUG: Has access token:', !!this.accessToken);
      console.log('🔑 AUTH DEBUG: Header length:', header?.length || 0);
      console.log('🔑 AUTH DEBUG: Header starts with:', header?.substring(0, 20) + '...');
      return header;
    },

    // Debug method to check current auth state
    debugAuthState(): void {
      console.log('🔍 AUTH STATE DEBUG:');
      console.log('  - isAuthenticated:', this.isAuthenticated);
      console.log('  - isInitialized:', this.isInitialized);
      console.log('  - isLoading:', this.isLoading);
      console.log('  - hasAccessToken:', !!this.accessToken);
      console.log('  - hasRefreshToken:', !!this.refreshToken);
      console.log('  - hasUser:', !!this.user);
      console.log('  - userId:', this.user?.id);
      console.log('  - username:', this.user?.username);
      console.log('  - accessTokenLength:', this.accessToken?.length || 0);
      console.log('  - refreshTokenLength:', this.refreshToken?.length || 0);
    },
  },
});