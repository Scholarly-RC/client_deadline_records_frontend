export const useLogsStore = defineStore("logsStore", {
  state: () => ({
    logs: [],
    pagination: {},
    page: null,
    user: null,
    isLoading: false,
  }),

  actions: {
    async getLogs() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        let url = `/api/app-logs/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page);
        }
        if (this.user) {
          params.append("user", this.user);
        }
        url += params.toString();

        const response = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;
        this.logs = results;
        this.pagination = pagination;
        console.log(results);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page = null) {
      this.page = page;
      await this.getLogs();
    },
    async setUser(user = null) {
      this.user = user;
      this.page = null;
      await this.getLogs();
    },
  },
});
