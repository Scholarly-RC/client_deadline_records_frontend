import { defineStore } from "pinia";
import type { ClientDocument, PaginatedResponse } from "~/types";

interface ClientDocumentsState {
  documents: ClientDocument[];
  pagination: {
    count?: number;
    next?: string | null;
    previous?: string | null;
    current_page?: number;
    total_pages?: number;
    page_size?: number;
  };
  selectedClientId: number | null;
  page: number | null;
  search: string | null;
  isLoading: boolean;
}

interface UploadDocumentState {
  showModal: boolean;
  isUploading: boolean;
}

interface EditDocumentState {
  document: ClientDocument | null;
  showModal: boolean;
  isUpdating: boolean;
}

export const useClientDocumentsStore = defineStore("clientDocumentsStore", {
  state: (): ClientDocumentsState => ({
    documents: [],
    pagination: {},
    selectedClientId: null,
    page: null,
    search: null,
    isLoading: false,
  }),

  getters: {
    hasSelectedClient: (state): boolean => state.selectedClientId !== null,
  },

  actions: {
    async getDocuments(): Promise<void> {
      if (!this.selectedClientId) return;

      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        let url = `/api/client-documents/?`;

        const params = new URLSearchParams();
        params.append("client", this.selectedClientId.toString());

        if (this.page) {
          params.append("page", this.page.toString());
        }
        if (this.search) {
          params.append("search", this.search);
        }
        url += params.toString();

        const response = await $apiFetch<PaginatedResponse<ClientDocument>>(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;
        this.documents = results;
        this.pagination = pagination;
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async setSelectedClient(clientId: number | null): Promise<void> {
      this.selectedClientId = clientId;
      this.page = 1; // Reset to first page
      this.search = null; // Clear search
      if (clientId) {
        await this.getDocuments();
      } else {
        this.documents = [];
        this.pagination = {};
      }
    },

    async setPage(page: number | null = null): Promise<void> {
      this.page = page;
      await this.getDocuments();
    },

    async setSearch(search: string | null = null): Promise<void> {
      this.search = search;
      this.page = 1; // Reset to first page when searching
      await this.getDocuments();
    },

    async uploadDocument(formData: FormData): Promise<ClientDocument> {
      try {
        const { $apiFetch } = useNuxtApp();

        const response = await $apiFetch<ClientDocument>("/api/client-documents/", {
          method: "POST",
          body: formData,
        });

        // Refresh documents list
        await this.getDocuments();
        return response;
      } catch (error) {
        console.error("Failed to upload document:", error);
        throw error;
      }
    },

    async updateDocument(id: number, data: Partial<ClientDocument>): Promise<ClientDocument> {
      try {
        const { $apiFetch } = useNuxtApp();

        const response = await $apiFetch<ClientDocument>(`/api/client-documents/${id}/`, {
          method: "PATCH",
          body: data,
        });

        // Update document in local state
        const index = this.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          this.documents[index] = response;
        }

        return response;
      } catch (error) {
        console.error("Failed to update document:", error);
        throw error;
      }
    },

    async deleteDocument(id: number): Promise<void> {
      try {
        const { $apiFetch } = useNuxtApp();

        await $apiFetch(`/api/client-documents/${id}/`, {
          method: "DELETE",
        });

        // Remove document from local state
        this.documents = this.documents.filter(doc => doc.id !== id);
      } catch (error) {
        console.error("Failed to delete document:", error);
        throw error;
      }
    },

    async downloadDocument(id: number, filename: string): Promise<void> {
      try {
        const { $apiFetch } = useNuxtApp();

        const response = await $apiFetch(`/api/client-documents/${id}/download/`, {
          method: "GET",
          responseType: "blob",
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response as Blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download document:", error);
        throw error;
      }
    },
  },
});

export const useUploadDocumentStore = defineStore("uploadDocumentStore", {
  state: (): UploadDocumentState => ({
    showModal: false,
    isUploading: false,
  }),

  actions: {
    openModal(): void {
      this.showModal = true;
    },

    closeModal(): void {
      this.showModal = false;
    },

    setUploading(uploading: boolean): void {
      this.isUploading = uploading;
    },
  },
});

export const useEditDocumentStore = defineStore("editDocumentStore", {
  state: (): EditDocumentState => ({
    document: null,
    showModal: false,
    isUpdating: false,
  }),

  actions: {
    openModal(document: ClientDocument): void {
      this.document = document;
      this.showModal = true;
    },

    closeModal(): void {
      this.showModal = false;
      this.document = null;
    },

    setUpdating(updating: boolean): void {
      this.isUpdating = updating;
    },
  },
});