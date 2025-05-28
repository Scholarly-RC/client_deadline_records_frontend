import { defineStore } from "pinia";

export const useClientStore = defineStore("clientStore", {
  state: () => ({
    clients: [],
    pagination: {},
    page: null,
    search: null,
    isLoading: false,
  }),
  getters: {
    activeClients: (state) => {
      return state.clients.filter((client) => client.is_active === true);
    },
  },
  actions: {
    async getAllClients() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/clients/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page);
        }
        if (this.search) {
          params.append("search", this.search);
        }
        url += params.toString();

        const response = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;
        this.clients = results;
        this.pagination = pagination;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page = null) {
      this.page = page;
      await this.getAllClients();
    },
    async setSearch(search = null) {
      this.search = search;
      this.page = null;
      await this.getAllClients();
    },
  },
});

export const useAddClientStore = defineStore("addClientStore", {
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

export const useEditClientStore = defineStore("editClientStore", {
  state: () => ({
    client: null,
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
    async getClient(id) {
      const alertStore = useAlertStore();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(`/api/clients/${id}/`, {
          method: "GET",
        });
        this.client = response;
      } catch (error) {
        alertStore.warning("Client Not Found", getErrorMessage(error), 5);
        console.error(error);
        await navigateTo("/clients");
      } finally {
        this.isLoading = false;
      }
    },
  },
});
