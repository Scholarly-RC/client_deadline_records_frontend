import { defineStore } from "pinia";

export const useFinanceImplementationTableStore = defineStore(
  "financeImplementationTable",
  {
    state: () => ({
      financeImplementations: [],
      pagination: {},
      isLoading: false,
      page: null,
    }),

    actions: {
      async getAllFinanceImplementations() {
        try {
          this.isLoading = true;
          const { $apiFetch } = useNuxtApp();
          let url = `/api/finance-implementations/?`;
          const params = new URLSearchParams();
          if (this.page) {
            params.append("page", this.page);
          }
          url += params.toString();
          const response = await $apiFetch(url, {
            method: "GET",
          });
          const { results, ...pagination } = response;
          this.financeImplementations = results;
          this.pagination = pagination;
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      async setPage(page) {
        this.page = page;
        await this.getAllFinanceImplementations();
      },
    },
  }
);
