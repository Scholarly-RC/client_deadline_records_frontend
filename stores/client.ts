import { defineStore } from "pinia";
import type { Client, PaginatedResponse, ClientBirthdaysData } from "~/types";

interface ClientState {
  clients: Client[];
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

interface AddClientState {
  showModal: boolean;
}

interface EditClientState {
  client: Client | null;
  showModal: boolean;
  isLoading: boolean;
}

interface ClientBirthdaysState {
  data: ClientBirthdaysData | null;
  isLoading: boolean;
}

export const useClientStore = defineStore("clientStore", {
  state: (): ClientState => ({
    clients: [],
    pagination: {},
    page: null,
    search: null,
    isLoading: false,
  }),

  getters: {
    activeClients: (state): Client[] => {
      return state.clients.filter((client) => client.is_active === true);
    },
  },

  actions: {
    async getAllClients(): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/clients/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page.toString());
        }
        if (this.search) {
          params.append("search", this.search);
        }
        url += params.toString();

        const response = await $apiFetch<PaginatedResponse<Client>>(url, {
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

    async setPage(page: number | null = null): Promise<void> {
      this.page = page;
      await this.getAllClients();
    },

    async setSearch(search: string | null = null): Promise<void> {
      this.search = search;
      this.page = 1; // Reset to first page when searching
      await this.getAllClients();
    },

    async getClientWithDeadline(): Promise<any> {
      const toast = useToast();
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<any>(
          `api/clients/client-with-deadlines`,
          {
            method: "GET",
          }
        );
        return response;
      } catch (error: any) {
        toast.add({
          title: "Retrieving Failed",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      }
    },

    async getUsersWithDeadline(): Promise<any> {
      const toast = useToast();
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<any>(
          `api/users/users-with-deadlines`,
          {
            method: "GET",
          }
        );
        return response;
      } catch (error: any) {
        toast.add({
          title: "Retrieving Failed",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      }
    },
  },
});

export const useAddClientStore = defineStore("addClientStore", {
  state: (): AddClientState => ({
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

export const useEditClientStore = defineStore("editClientStore", {
  state: (): EditClientState => ({
    client: null,
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
    async getClient(id: number): Promise<void> {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<Client>(`/api/clients/${id}/`, {
          method: "GET",
        });
        this.client = response;
      } catch (error: any) {
        toast.add({
          title: "Client Not Found",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
        await navigateTo("/clients");
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export const useClientBirthdays = defineStore("clientBirthdays", {
  state: (): ClientBirthdaysState => ({
    data: null,
    isLoading: false,
  }),

  actions: {
    async getClientBirthdays(): Promise<void> {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<ClientBirthdaysData>(
          `/api/clients/birthdays/`,
          {
            method: "GET",
          }
        );
        this.data = response;
      } catch (error: any) {
        toast.add({
          title: "Failed To Load Client Birthdays",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
