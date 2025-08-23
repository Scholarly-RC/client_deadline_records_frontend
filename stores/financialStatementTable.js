import { defineStore } from "pinia";

export const useFinancialStatementTableStore = defineStore(
  "financialStatementTable",
  {
    state: () => ({
      financialStatements: [],
      pagination: {},
      isLoading: false,
      page: 1,
    }),

    actions: {
      async getAllFinancialStatements() {
        try {
          this.isLoading = true;
          const { $apiFetch } = useNuxtApp();
          const response = await $apiFetch(
            `/api/financial-statement-preparations/`,
            {
              method: "GET",
            }
          );
          const { results, ...pagination } = response;
          this.financialStatements = results;
          this.pagination = pagination;
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      async setPage(page) {
        this.page = page;
        await this.getAllFinancialStatements();
      },
    },
  }
);
