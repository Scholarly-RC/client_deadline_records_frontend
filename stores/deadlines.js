export const useDeadlineTypesStore = defineStore("deadlineTypesStore", {
  state: () => ({
    deadlineTypes: [],
    showModal: false,
    isLoading: false,
  }),
  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
    async getAllDeadlineTypes() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/deadline-types/", {
          method: "GET",
        });
        this.deadlineTypes = response;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export const useDeadlineStore = defineStore("deadlineStore", {
  state: () => ({
    deadlines: [],
    pagination: {},
    page: null,
    search: null,
    filters: {},
    showFilter: false,
    isLoading: false,
  }),
  actions: {
    openFilter() {
      this.showFilter = true;
    },
    closeFilter() {
      this.showFilter = false;
    },
    async getAllDeadlines() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        let url = `/api/client-deadlines/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page);
        }
        if (this.search) {
          params.append("search", this.search);
        }
        if ("client" in this.filters) {
          params.append("client", this.filters["client"]);
        }
        if ("deadlineType" in this.filters) {
          params.append("deadline_type", this.filters["deadlineType"]);
        }
        if ("priority" in this.filters) {
          params.append("priority", this.filters["priority"]);
        }
        if ("status" in this.filters) {
          params.append("status", this.filters["status"]);
        }
        if ("assignedTo" in this.filters) {
          params.append("assigned_to", this.filters["assignedTo"]);
        }
        url += params.toString();

        const response = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;
        this.deadlines = results;
        this.pagination = pagination;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page = null) {
      this.page = page;
      await this.getAllDeadlines();
    },
    async setSearch(search = null) {
      this.search = search;
      this.page = null;
      await this.getAllDeadlines();
    },
    async setFilters(filters = {}) {
      this.filters = filters;
      this.page = null;
      await this.getAllDeadlines();
    },
    async clearFilters() {
      this.filters = {};
      this.page = null;
      await this.getAllDeadlines();
    },
    async getDeadline(id) {
      const alertStore = useAlertStore();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(`/api/client-deadlines/${id}/`, {
          method: "GET",
        });
        return response;
      } catch (error) {
        debugger;
        alertStore.warning("Not Found!", error.detail, 5);
        await navigateTo("/deadlines");
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export const useAddDeadlineStore = defineStore("addDeadlineStore", {
  state: () => ({
    showModal: false,
  }),

  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
  },
});

export const useViewDeadlineStore = defineStore("viewDeadlineStore", {
  state: () => ({
    deadline: null,
    showModal: false,
    isLoading: false,
  }),

  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
    async getDeadline(id) {
      this.isLoading = true;
      const alertStore = useAlertStore();
      const deadlineStore = useDeadlineStore();
      try {
        this.deadline = await deadlineStore.getDeadline(id);
      } catch (error) {
        alertStore.warning("Not Found!", error.detail, 5);
        await navigateTo("/clients");
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export const useUpcomingDeadlineStore = defineStore("upcomingDeadlineStore", {
  state: () => ({
    deadlines: false,
    isLoading: false,
  }),
  actions: {
    async getUpcomingDeadlines() {
      const alertStore = useAlertStore();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(
          `/api/client-deadlines/upcoming-deadlines/`,
          {
            method: "GET",
          }
        );
        this.deadlines = response;
      } catch (error) {
        alertStore.warning(
          "Error!",
          "Something went wrong while retrieving the upcoming deadlines.",
          5
        );
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
