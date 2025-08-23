import { defineStore } from "pinia";

export const useComplianceTableStore = defineStore("complianceTable", {
  state: () => ({
    compliances: [],
    pagination: {},
    isLoading: false,
    page: 1,
  }),

  actions: {
    async getAllCompliances() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(`/api/compliance/?page=${this.page}`, {
          method: "GET",
        });
        const { results, ...pagination } = response;
        this.compliances = results;
        this.pagination = pagination;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page) {
      this.page = page;
      await this.getAllCompliances();
    },
  },
});
