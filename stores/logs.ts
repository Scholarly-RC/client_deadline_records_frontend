import { defineStore } from 'pinia';
import { useNuxtApp } from '#app/nuxt'
import type { AppLog } from '~/types';

interface LogsState {
  logs: AppLog[];
  pagination: Record<string, any>;
  page: number | null;
  user: number | null;
  isLoading: boolean;
}

export const useLogsStore = defineStore("logsStore", {
  state: (): LogsState => ({
    logs: [],
    pagination: {},
    page: null,
    user: null,
    isLoading: false,
  }),

  actions: {
    async getLogs(): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        let url = `/api/app-logs/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page.toString());
        }
        if (this.user) {
          params.append("user", this.user.toString());
        }
        url += params.toString();

        const response: any = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;
        this.logs = results;
        this.pagination = pagination;
      } catch (error: any) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    async setPage(page: number | null = null): Promise<void> {
      this.page = page;
      await this.getLogs();
    },
    async setUser(user: number | null = null): Promise<void> {
      this.user = user;
      this.page = null;
      await this.getLogs();
    },
  },
});
