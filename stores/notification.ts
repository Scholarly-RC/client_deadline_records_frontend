import { defineStore } from "pinia";
import { useToast } from '../node_modules/@nuxt/ui/dist/runtime/composables/useToast'
import { useNuxtApp } from '#app/nuxt'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './auth'
import { getErrorMessage } from '~/utils/errorHandler'
import type { Notification } from '~/types';

interface NotificationState {
  showNotification: boolean;
  notifications: Notification[];
  pagination: Record<string, any>;
  isLoading: boolean;
}

interface UnreadNotificationState {
  unreadNotificationCount: number;
  pollingInterval: any;
  isLoading: boolean;
}

export const useNotificationStore = defineStore("notificationStore", {
  state: (): NotificationState => ({
    showNotification: false,
    notifications: [],
    pagination: {},
    isLoading: false,
  }),
  getters: {
    showMoreNotification: (state) => {
      return (
        state.pagination &&
        state.notifications.length < (state.pagination["count"] || 0)
      );
    },
  },
  actions: {
    open(): void {
      this.showNotification = true;
    },
    close(): void {
      this.showNotification = false;
    },
    toggle(): void {
      this.showNotification = !this.showNotification;
    },
    // Method to clear notifications
    clear(): void {
      this.notifications = [];
      this.pagination = {};
    },
    // Method to refresh notifications (clear and fetch new ones)
    async refreshNotifications(): Promise<void> {
      this.clear();
      await this.getNotifications();
    },
    async getNotifications(): Promise<void> {
      const authStore = useAuthStore();
      const { userProfile } = storeToRefs(authStore);
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/notifications/?`;

        const params = new URLSearchParams();
        if (userProfile.value) {
          params.append("recipient", userProfile.value.id.toString());
        }
        params.append("page_size", "5");
        // Add ordering by created_at descending to get latest notifications first
        params.append("ordering", "-created_at");

        // For loading more notifications, we need to preserve the existing notifications
        // and append new ones. For initial load, we should clear the list.
        const isLoadMore = this.pagination && this.pagination["next"];
        
        if (isLoadMore) {
          params.append("page", (this.pagination["current_page"] + 1).toString());
        }

        url += params.toString();

        const response: any = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;

        if (isLoadMore) {
          // For loading more, append to existing notifications
          let updatedNotifications = [...this.notifications];
          
          for (const result of results) {
            const exists = updatedNotifications.some(
              (item) => item.id === result.id
            );

            if (!exists) {
              // For load more, we add to the end
              updatedNotifications.push(result);
            }
          }
          
          this.notifications = updatedNotifications;
        } else {
          // For initial load, replace notifications with new ones (already sorted by API)
          this.notifications = results;
        }

        this.pagination = pagination;
      } catch (error: any) {
        toast.add({
          title: "Notifications Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error('Error fetching notifications:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async markNotificationAsRead(id: number): Promise<void> {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response: any = await $apiFetch(
          `/api/notifications/${id}/mark-as-read/`,
          {
            method: "POST",
          }
        );

        this.notifications = this.notifications.map((notification: Notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        );
      } catch (error: any) {
        toast.add({
          title: "Update Failed",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async createNotification(notificationData: any): Promise<any> {
      try {
        const { $apiFetch } = useNuxtApp();
        const response: any = await $apiFetch(
          `/api/notifications/`,
          {
            method: "POST",
            body: notificationData,
          }
        );
        
        // Optionally refresh notifications if the current user is the recipient
        const authStore = useAuthStore();
        if (notificationData.recipient_id === authStore.user?.id) {
          await this.refreshNotifications();
        }
        
        return response;
      } catch (error: any) {
        console.error('Error creating notification:', error);
        throw error;
      }
    },
  },
});

export const useUnreadNotificationStore = defineStore(
  "unreadNotificationStore",
  {
    state: (): UnreadNotificationState => ({
      unreadNotificationCount: 0,
      pollingInterval: null,
      isLoading: false,
    }),
    actions: {
      async getUnreadNotificationCount(): Promise<void> {
        const toast = useToast();
        const authStore = useAuthStore();

        console.log('🔔 NOTIFICATION DEBUG: getUnreadNotificationCount called');
        console.log('🔔 NOTIFICATION DEBUG: Auth state:', {
          isAuthenticated: authStore.isAuthenticated,
          hasUser: !!authStore.user,
          isInitialized: authStore.isInitialized,
          userId: authStore.user?.id
        });

        // Don't make API calls if not fully authenticated or still initializing
        if (!authStore.isAuthenticated || !authStore.user || !authStore.isInitialized) {
          console.log('🔔 NOTIFICATION DEBUG: Skipping API call - auth not ready');
          return;
        }

        console.log('🔔 NOTIFICATION DEBUG: Making API call for user:', authStore.user.id);

        try {
          this.isLoading = true;
          const { $apiFetch } = useNuxtApp();
          const response: any = await $apiFetch(
            `/api/notifications/?recipient=${authStore.user.id}&is_read=False`,
            {
              method: "GET",
            }
          );
          this.unreadNotificationCount = response["count"] || 0;
          console.log('🔔 NOTIFICATION DEBUG: API call successful, count:', this.unreadNotificationCount);
        } catch (error: any) {
          console.log('🔔 NOTIFICATION DEBUG: API call failed');
          console.log('🔔 NOTIFICATION DEBUG: Error status:', error?.status);
          console.log('🔔 NOTIFICATION DEBUG: Error message:', error?.message);

          // Only show error toast if it's not an authentication error
          if (error?.status !== 401 && error?.status !== 403) {
            toast.add({
              title: "Notifications Count Unavailable",
              description: getErrorMessage(error),
              color: "error",
              icon: "mdi:close-box-multiple",
              duration: 5000,
            });
          }
          console.error('Error fetching unread notifications:', error);
        } finally {
          this.isLoading = false;
        }
      },
      async startPolling(interval: number = 120000): Promise<void> {
        const authStore = useAuthStore();

        console.log('🔔 NOTIFICATION DEBUG: startPolling called');
        console.log('🔔 NOTIFICATION DEBUG: Auth state for polling:', {
          isAuthenticated: authStore.isAuthenticated,
          isInitialized: authStore.isInitialized,
          hasUser: !!authStore.user
        });

        // Don't start polling if not fully authenticated
        if (!authStore.isAuthenticated || !authStore.isInitialized) {
          console.log('🔔 NOTIFICATION DEBUG: Not starting polling - auth not ready');
          return;
        }

        console.log('🔔 NOTIFICATION DEBUG: Starting notification polling');

        // 2 minutes by default
        this.stopPolling();
        this.pollingInterval = setInterval(async () => {
          console.log('🔔 NOTIFICATION DEBUG: Polling interval triggered');
          await this.getUnreadNotificationCount();
        }, interval);

        // Get initial count after a short delay to ensure stability
        setTimeout(async () => {
          console.log('🔔 NOTIFICATION DEBUG: Initial polling call after delay');
          await this.getUnreadNotificationCount();
        }, 500);
      },

      stopPolling(): void {
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
      },
    },
  }
);
