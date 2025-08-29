import { defineStore } from "pinia";
import type { Document, DocumentListResponse, DocumentDownloadResponse, PaginationInfo, Client } from "~/types";

interface DocumentState {
  documents: Document[];
  pagination: PaginationInfo;
  page: number | null;
  search: string | null;
  selectedClient: number | null;
  isLoading: boolean;
}

interface UploadDocumentState {
  showModal: boolean;
  isUploading: boolean;
}

interface EditDocumentState {
  document: Document | null;
  showModal: boolean;
  isLoading: boolean;
}

export const useDocumentStore = defineStore("documentStore", {
  state: (): DocumentState => ({
    documents: [],
    pagination: {},
    page: null,
    search: null,
    selectedClient: null,
    isLoading: false,
  }),

  getters: {
    hasDocuments: (state): boolean => state.documents.length > 0,
    documentCount: (state): number => state.pagination.count || 0,
  },

  actions: {
    async getDocuments(clientId?: number): Promise<void> {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();

        // If clientId is provided, use it; otherwise use selectedClient
        const targetClientId = clientId || this.selectedClient;
        if (!targetClientId) {
          throw new Error('Client ID is required to fetch documents');
        }

        let url = `/api/clients/${targetClientId}/documents/?`;

        const params = new URLSearchParams();
        if (this.page) {
          params.append("page", this.page.toString());
        }
        if (this.search) {
          params.append("search", this.search);
        }
        url += params.toString();

        const response = await $apiFetch<DocumentListResponse>(url, {
          method: "GET",
        });



        const { results, ...pagination } = response;
        this.documents = results;
        this.pagination = pagination;
      } catch (error) {
        console.error('Error fetching documents:', error);
        const toast = useToast();
        toast.add({
          title: "Error Loading Documents",
          description: getErrorMessage(error as any),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
      } finally {
        this.isLoading = false;
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

    async setSelectedClient(clientId: number | null): Promise<void> {
      this.selectedClient = clientId;
      this.page = 1; // Reset to first page when changing client
      this.search = null; // Clear search when changing client
      if (clientId) {
        await this.getDocuments(clientId);
      } else {
        this.documents = [];
        this.pagination = {};
      }
    },

    async uploadDocument(clientId: number, formData: FormData): Promise<Document> {
      const toast = useToast();
      const authStore = useAuthStore();
      

      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<Document>(`/api/clients/${clientId}/documents/`, {
          method: "POST",
          body: formData,
        });


        // Refresh the documents list
        await this.getDocuments(clientId);
        
        toast.add({
          title: "Document Uploaded",
          description: "Document has been uploaded successfully.",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 3000,
        });

        return response;
      } catch (error: any) {
        console.error('Error uploading document:', error);
        throw error;
      }
    },

    async downloadDocument(clientId: number, documentId: number): Promise<void> {
      const toast = useToast();
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<DocumentDownloadResponse>(
          `/api/clients/${clientId}/documents/${documentId}/download/`,
          {
            method: "GET",
          }
        );

        // Open download URL in new window/tab
        window.open(response.download_url, '_blank');
        
        toast.add({
          title: "Download Started",
          description: `Downloading ${response.filename}`,
          color: "success",
          icon: "mdi:download",
          duration: 2000,
        });
      } catch (error: any) {
        toast.add({
          title: "Download Failed",
          description: getErrorMessage(error as any),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error('Error downloading document:', error);
      }
    },

    async updateDocument(clientId: number, documentId: number, data: { name: string; description: string }): Promise<void> {
      const toast = useToast();
      try {
        const { $apiFetch } = useNuxtApp();
        await $apiFetch<Document>(`/api/clients/${clientId}/documents/${documentId}/`, {
          method: "PATCH",
          body: data,
        });

        // Refresh the documents list
        await this.getDocuments(clientId);
        
        toast.add({
          title: "Document Updated",
          description: "Document has been updated successfully.",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 3000,
        });
      } catch (error: any) {
        toast.add({
          title: "Update Failed",
          description: getErrorMessage(error as any),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error('Error updating document:', error);
        throw error;
      }
    },

    async deleteDocument(clientId: number, documentId: number): Promise<void> {
      const toast = useToast();
      try {
        const { $apiFetch } = useNuxtApp();
        await $apiFetch(`/api/clients/${clientId}/documents/${documentId}/`, {
          method: "DELETE",
        });

        // Refresh the documents list
        await this.getDocuments(clientId);
        
        toast.add({
          title: "Document Deleted",
          description: "Document has been deleted successfully.",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 3000,
        });
      } catch (error: any) {
        toast.add({
          title: "Delete Failed",
          description: getErrorMessage(error as any),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error('Error deleting document:', error);
        throw error;
      }
    },

    clearDocuments(): void {
      this.documents = [];
      this.pagination = {};
      this.selectedClient = null;
      this.page = null;
      this.search = null;
    },
  },
});

export const useUploadDocumentStore = defineStore("uploadDocumentStore", {
  state: (): UploadDocumentState => ({
    showModal: false,
    isUploading: false,
  }),

  actions: {
    open(): void {
      this.showModal = true;
    },
    close(): void {
      this.showModal = false;
    },
    setUploading(status: boolean): void {
      this.isUploading = status;
    },
  },
});

export const useEditDocumentStore = defineStore("editDocumentStore", {
  state: (): EditDocumentState => ({
    document: null,
    showModal: false,
    isLoading: false,
  }),

  actions: {
    open(): void {
      this.showModal = true;
    },
    close(): void {
      this.showModal = false;
      this.document = null;
    },
    async getDocument(clientId: number, documentId: number): Promise<void> {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch<Document>(`/api/clients/${clientId}/documents/${documentId}/`, {
          method: "GET",
        });
        this.document = response;
      } catch (error: any) {
        toast.add({
          title: "Document Not Found",
          description: getErrorMessage(error as any),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error('Error fetching document:', error);
      } finally {
        this.isLoading = false;
      }
    },
    setDocument(document: Document): void {
      this.document = document;
    },
  },
});