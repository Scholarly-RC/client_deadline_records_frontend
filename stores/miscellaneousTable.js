import { defineStore } from "pinia";

export const useMiscellaneousTableStore = defineStore(
  "miscellaneousTableStore",
  {
    state: () => ({
      miscellaneousTasks: [],
      pagination: {},
      isLoading: false,
      page: null,
    }),

    actions: {
      async getAllMiscellaneousTasks() {
        try {
          this.isLoading = true;
          const { $apiFetch } = useNuxtApp();
          let url = `/api/miscellaneous-tasks/?`;
          const params = new URLSearchParams();
          if (this.page) {
            params.append("page", this.page);
          }
          url += params.toString();
          const response = await $apiFetch(url, {
            method: "GET",
          });
          const { results, ...pagination } = response;
          this.miscellaneousTasks = results;
          this.pagination = pagination;
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      async setPage(page) {
        this.page = page;
        await this.getAllMiscellaneousTasks();
      },
    },
  }
);
