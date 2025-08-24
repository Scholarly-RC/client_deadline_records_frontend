import { defineStore } from "pinia";

export const useTaxTableStore = defineStore("taxTableStore", {
  state: () => ({
    taxCases: [],
    pagination: {},
    isLoading: false,
    page: null,
  }),

  actions: {
    async getAllTaxCases() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        let url = `/api/tax-cases/?`;
        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page);
        }
        url += params.toString();
        const response = await $apiFetch(url, {
          method: "GET",
        });
        const { results, ...pagination } = response;
        this.taxCases = results;
        this.pagination = pagination;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page) {
      this.page = page;
      await this.getAllTaxCases();
    },
  },
});
