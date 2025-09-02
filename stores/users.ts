import { defineStore } from 'pinia';
import type { User, UserMini, PaginatedResponse } from '~/types';

interface UserState {
  users: User[];
  usersWithLogsData: UserMini[]; // Separate storage for users with logs
  pagination: {
    count?: number;
    next?: string | null;
    previous?: string | null;
    current_page?: number;
    total_pages?: number;
    page_size?: number;
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

interface ChangePasswordState {
  user: User | null;
  showModal: boolean;
}

export const useUserStore = defineStore('userStore', {
  state: (): UserState => ({
    users: [],
    usersWithLogsData: [],
    pagination: {},
    page: null,
    search: null,
    isLoading: false,
  }),

  getters: {
    usersWithLogs: (state): UserMini[] => {
      // Return the dedicated usersWithLogsData when using getUsersWithLogs()
      // This contains the specific data from /api/app-logs/users/
      return state.usersWithLogsData;
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

    async getUsersWithLogs(): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<UserMini[]>('/api/app-logs/users/', {
          method: 'GET',
        });
        this.usersWithLogsData = response;
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
      this.page = 1; // Reset to first page when searching
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

export const useChangePasswordStore = defineStore('changePasswordStore', {
  state: (): ChangePasswordState => ({
    user: null,
    showModal: false,
  }),

  actions: {
    open(user: User): void {
      this.user = user;
      this.showModal = true;
    },
    close(): void {
      this.showModal = false;
      this.user = null;
    },
  },
});