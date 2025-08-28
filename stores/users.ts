import { defineStore } from 'pinia';
import type { User, PaginatedResponse } from '~/types';

interface UserState {
  users: User[];
  pagination: {
    count?: number;
    next?: string | null;
    previous?: string | null;
  };
  page: number | null;
  search: string | null;
  isLoading: boolean;
}

interface AddUserState {
  showModal: boolean;
}

interface EditUserState {
  user: User | null;
  showModal: boolean;
  isLoading: boolean;
}

export const useUserStore = defineStore('userStore', {
  state: (): UserState => ({
    users: [],
    pagination: {},
    page: null,
    search: null,
    isLoading: false,
  }),

  getters: {
    usersWithLogs: (state): User[] => {
      return state.users.filter((user) => user.has_logs === true);
    },
  },

  actions: {
    async getAllUsers(): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/users/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append('page', this.page.toString());
        }
        if (this.search) {
          params.append('search', this.search);
        }
        url += params.toString();

        const response = await $apiFetch<PaginatedResponse<User>>(url, {
          method: 'GET',
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

    async getUserChoices(): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<User[]>('/api/users/user-choices', {
          method: 'GET',
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

    async setPage(page: number | null = null): Promise<void> {
      this.page = page;
      await this.getAllUsers();
    },

    async setSearch(search: string | null = null): Promise<void> {
      this.search = search;
      this.page = null;
      await this.getAllUsers();
    },
  },
});

export const useAddUserStore = defineStore('addUserStore', {
  state: (): AddUserState => ({
    showModal: false,
  }),

  actions: {
    open(): void {
      this.showModal = true;
    },
    close(): void {
      this.showModal = false;
    },
  },
});

export const useEditUserStore = defineStore('editUserStore', {
  state: (): EditUserState => ({
    user: null,
    showModal: false,
    isLoading: false,
  }),

  actions: {
    open(): void {
      this.showModal = true;
    },
    close(): void {
      this.showModal = false;
    },
    async editUser(id: number): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<User>(`/api/users/${id}/`, {
          method: 'GET',
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