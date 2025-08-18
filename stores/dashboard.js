import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboardStore", {
  state: () => ({
    stats: false,
    isLoading: false,
  }),
  actions: {
    async getDashboardData() {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/stats/", {
          method: "GET",
        });
        this.stats = response;
      } catch (error) {
        toast.add({
          title: "Dashboard Data Unavailable",
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
