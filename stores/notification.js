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
    async getNotifications() {
      const alertStore = useAlertStore();
      const authStore = useAuthStore();
      const { userProfile } = storeToRefs(authStore);
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/notifications/?`;

        const params = new URLSearchParams();
        params.append("recipient", userProfile.value.id);
        params.append("page_size", 5);

        if (this.pagination["next"]) {
          params.append("page", this.pagination["current_page"] + 1);
        }

        url += params.toString();

        const response = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;

        for (const result of results) {
          const exists = this.notifications.some(
            (item) => item.id === result.id
          );

          if (!exists) {
            this.notifications.push(result);
          }
        }

        this.pagination = pagination;
      } catch (error) {
        alertStore.danger(
          "Notifications Unavailable",
          getErrorMessage(error),
          5
        );
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async markNotificationAsRead(id) {
      const alertStore = useAlertStore();
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
        alertStore.danger("Update Failed", getErrorMessage(error), 5);
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
        const alertStore = useAlertStore();
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
          alertStore.danger(
            "Notifications Count Unavailable",
            getErrorMessage(error),
            5
          );
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      async startPolling(interval = 30000) {
        // 5 minutes by default
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
