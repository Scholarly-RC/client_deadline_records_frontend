import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [],
    isLoading: false,
  }),

  actions: {
    async getAllUsers() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/users/", {
          method: "GET",
        });
        this.users = response;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export const useEditUserStore = defineStore("editUserStore", {
  state: () => ({
    user: null,
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
    async editUser(id) {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(`/api/users/${id}/`, {
          method: "GET",
        });
        this.user = response;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
