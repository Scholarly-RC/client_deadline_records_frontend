import { defineStore } from "pinia";

export const useClientStore = defineStore("clientStore", {
  state: () => ({
    clients: [],
    isLoading: false,
  }),

  actions: {
    async getAllClients() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/clients/", {
          method: "GET",
        });
        this.clients = response;
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
  },
});

export const useEditClientStore = defineStore("editClientStore", {
  state: () => ({
    client: [],
    isLoading: false,
  }),

  actions: {
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
