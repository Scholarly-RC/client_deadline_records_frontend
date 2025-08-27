import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notificationStore", {
  state: () => ({
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
    open() {
      this.showNotification = true;
    },
    close() {
      this.showNotification = false;
    },
    toggle() {
      this.showNotification = !this.showNotification;
    },
    // Method to clear notifications
    clear() {
      this.notifications = [];
      this.pagination = {};
    },
    // Method to refresh notifications (clear and fetch new ones)
    async refreshNotifications() {
      this.clear();
      await this.getNotifications();
    },
    async getNotifications() {
      const authStore = useAuthStore();
      const { userProfile } = storeToRefs(authStore);
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/notifications/?`;

        const params = new URLSearchParams();
        params.append("recipient", userProfile.value.id);
        params.append("page_size", 5);
        // Add ordering by created_at descending to get latest notifications first
        params.append("ordering", "-created_at");

        // For loading more notifications, we need to preserve the existing notifications
        // and append new ones. For initial load, we should clear the list.
        const isLoadMore = this.pagination && this.pagination["next"];
        
        if (isLoadMore) {
          params.append("page", this.pagination["current_page"] + 1);
        }

        url += params.toString();

        const response = await $apiFetch(url, {
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
      } catch (error) {
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
    async markNotificationAsRead(id) {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(
          `/api/notifications/${id}/mark-as-read/`,
          {
            method: "POST",
          }
        );

        this.notifications = this.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        );
      } catch (error) {
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
  },
});

export const useUnreadNotificationStore = defineStore(
  "unreadNotificationStore",
  {
    state: () => ({
      unreadNotificationCount: 0,
      pollingInterval: null,
      isLoading: false,
    }),
    actions: {
      async getUnreadNotificationCount() {
        const toast = useToast();
        const authStore = useAuthStore();
        const { userProfile } = storeToRefs(authStore);
        try {
          this.isLoading = true;
          const { $apiFetch } = useNuxtApp();
          const response = await $apiFetch(
            `/api/notifications/?recipient=${userProfile.value.id}&is_read=False`,
            {
              method: "GET",
            }
          );
          this.unreadNotificationCount = response["count"] || 0;
        } catch (error) {
          toast.add({
            title: "Notifications Count Unavailable",
            description: getErrorMessage(error),
            color: "error",
            icon: "mdi:close-box-multiple",
            duration: 5000,
          });
          console.error('Error fetching unread notifications:', error);
        } finally {
          this.isLoading = false;
        }
      },
      async startPolling(interval = 120000) {
        // 2 minutes by default
        this.stopPolling();
        this.pollingInterval = setInterval(async () => {
          await this.getUnreadNotificationCount();
        }, interval);

        // Get initial count immediately
        await this.getUnreadNotificationCount();
      },

      stopPolling() {
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
      },
    },
  }
);
