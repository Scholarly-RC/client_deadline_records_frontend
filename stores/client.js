import { defineStore } from "pinia";

export const useClientStore = defineStore("clientStore", {
  state: () => ({
    clients: [],
    pagination: {},
    page: null,
    search: null,
    isLoading: false,
  }),

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
    async getClient(id) {
      const alertStore = useAlertStore();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(`/api/clients/${id}/`, {
          method: "GET",
        });
        return response;
      } catch (error) {
        alertStore.warning("Not Found!", error.detail, 5);
        await navigateTo("/clients");
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

export const useViewClientStore = defineStore("viewClientStore", {
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
      this.isLoading = true;
      const alertStore = useAlertStore();
      const clientStore = useClientStore();
      try {
        this.client = await clientStore.getClient(id);
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
      this.isLoading = true;
      const alertStore = useAlertStore();
      const clientStore = useClientStore();
      try {
        this.client = await clientStore.getClient(id);
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
