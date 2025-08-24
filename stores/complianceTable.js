import { defineStore } from "pinia";

export const useComplianceTableStore = defineStore("complianceTable", {
  state: () => ({
    compliances: [],
    pagination: {},
    isLoading: false,
    page: null,
  }),

  actions: {
    async getAllCompliances() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        let url = `/api/compliance/?`;
        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page);
        }
        url += params.toString();
        const response = await $apiFetch(url, {
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
