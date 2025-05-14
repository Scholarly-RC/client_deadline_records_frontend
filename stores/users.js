import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [],
    pagination: {},
    page: null,
    search: null,
    isLoading: false,
  }),

  actions: {
    async getAllUsers() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/users/?`;

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
        this.users = results;
        this.pagination = pagination;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async getUserChoices() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/users/user-choices", {
          method: "GET",
        });
        this.users = response;
        this.pagination = {};
        this.page = null;
        this.search = null;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page = null) {
      this.page = page;
      await this.getAllUsers();
    },
    async setSearch(search = null) {
      this.search = search;
      this.page = null;
      await this.getAllUsers();
    },
  },
});

export const useAddUserStore = defineStore("addUserStore", {
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
