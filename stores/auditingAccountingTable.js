import { defineStore } from "pinia";

export const useAuditingAccountingTableStore = defineStore(
  "auditingAccountingTable",
  {
    state: () => ({
      auditingAccountings: [],
      pagination: {},
      isLoading: false,
      page: null,
    }),

    actions: {
      async getAllAuditingAccountings() {
        try {
          this.isLoading = true;
          const { $apiFetch } = useNuxtApp();
          let url = `/api/accounting-audits/?`;
          const params = new URLSearchParams();
          if (this.page) {
            params.append("page", this.page);
          }
          url += params.toString();
          const response = await $apiFetch(url, {
            method: "GET",
          });
          const { results, ...pagination } = response;
          this.auditingAccountings = results;
          this.pagination = pagination;
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      async setPage(page) {
        this.page = page;
        await this.getAllAuditingAccountings();
      },
    },
  }
);
