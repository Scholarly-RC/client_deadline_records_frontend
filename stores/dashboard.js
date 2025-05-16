import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboardStore", {
  state: () => ({
    stats: false,
    isLoading: false,
  }),
  actions: {
    async getDashboardData() {
      const alertStore = useAlertStore();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/stats/", {
          method: "GET",
        });
        this.stats = response;
      } catch (error) {
        alertStore.warning(
          "Dashboard Data Unavailable",
          getErrorMessage(error),
          5
        );
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
