<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import UploadDocumentModal from "./UploadDocumentModal.vue";
import EditDocumentModal from "./EditDocumentModal.vue";
import Pagination from "~/components/ui/Pagination.vue";
import type { Document, Client } from "~/types";

const search = ref<string>("");
const isSearching = ref<boolean>(false);

// Stores
const documentStore = useDocumentStore();
const uploadDocumentStore = useUploadDocumentStore();
const editDocumentStore = useEditDocumentStore();
const clientStore = useClientStore();
const confirmationStore = useConfirmationStore();

const { documents, pagination, isLoading, selectedClient } =
  storeToRefs(documentStore);
const { clients } = storeToRefs(clientStore);

interface Column {
  accessorKey: string;
  header: string;
}

const columns: Column[] = [
  {
    accessorKey: "name",
    header: "Document Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "file_extension",
    header: "Type",
  },
  {
    accessorKey: "file_size",
    header: "Size",
  },
  {
    accessorKey: "uploaded_by.fullname",
    header: "Uploaded by",
  },
  {
    accessorKey: "uploaded_at",
    header: "Uploaded",
  },
  {
    accessorKey: "actions",
    header: "",
  },
];

watch(documents, (documents) => {
  console.log(documents);
});

// Computed
const clientOptions = computed(() => [
  { label: "All Clients", value: null },
  ...clients.value.map((client) => ({
    label: client.client_name || client.name,
    value: client.id,
  })),
]);

const hasSelectedClient = computed(() => selectedClient.value !== null);
const selectedClientName = computed(() => {
  if (!selectedClient.value) return "All Clients";
  const client = clients.value.find((c) => c.id === selectedClient.value);
  return client ? client.client_name || client.name : "Unknown Client";
});

// Methods
const clearSearch = (): void => {
  search.value = "";
};

const goToFirstPage = async (): Promise<void> => {
  await handleSetPage(1);
};

const goToLastPage = async (): Promise<void> => {
  if (pagination.value.total_pages) {
    await handleSetPage(pagination.value.total_pages);
  }
};

const goToPreviousPage = async (): Promise<void> => {
  const currentPage = pagination.value.current_page || 1;
  if (currentPage > 1) {
    await handleSetPage(currentPage - 1);
  }
};

const goToNextPage = async (): Promise<void> => {
  const currentPage = pagination.value.current_page || 1;
  const totalPages = pagination.value.total_pages || 1;
  if (currentPage < totalPages) {
    await handleSetPage(currentPage + 1);
  }
};

const handleSetPage = async (page: number): Promise<void> => {
  await documentStore.setPage(page);
};

const handleClientChange = async (value: any): Promise<void> => {
  const clientId = value === null || value === undefined ? null : Number(value);
  await documentStore.setSelectedClient(clientId);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileTypeIcon = (extension: string): string => {
  const ext = extension.toLowerCase();
  if (ext === ".pdf") return "mdi:file-pdf-box";
  if ([".doc", ".docx"].includes(ext)) return "mdi:file-word-box";
  if ([".xls", ".xlsx"].includes(ext)) return "mdi:file-excel-box";
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext))
    return "mdi:file-image-box";
  if (ext === ".txt") return "mdi:file-document-outline";
  return "mdi:file-outline";
};

const getFileTypeColor = (
  extension: string
):
  | "error"
  | "warning"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "neutral" => {
  const ext = extension.toLowerCase();
  if (ext === ".pdf") return "error";
  if ([".doc", ".docx"].includes(ext)) return "primary";
  if ([".xls", ".xlsx"].includes(ext)) return "success";
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return "secondary";
  return "neutral";
};

const handleDownload = async (document: Document): Promise<void> => {
  if (!selectedClient.value) return;
  await documentStore.downloadDocument(selectedClient.value, document.id);
};

const handleEdit = (document: Document): void => {
  editDocumentStore.setDocument(document);
  editDocumentStore.open();
};

const handleDelete = async (document: Document): Promise<void> => {
  if (!selectedClient.value) return;

  const confirmed = await confirmationStore.confirm(
    `Are you sure you want to delete "${document.name}"? This action cannot be undone.`
  );

  if (confirmed) {
    await documentStore.deleteDocument(selectedClient.value, document.id);
  }
};

// Watchers
watchDebounced(
  search,
  async (value: string) => {
    isSearching.value = true;
    await documentStore.setSearch(value || null);
    isSearching.value = false;
  },
  { debounce: 500, maxWait: 3000 }
);

// Load clients on mount
onMounted(async () => {
  await clientStore.getAllClients();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Client Selection and Controls -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
    >
      <!-- Client Selector -->
      <div class="w-full sm:w-80">
        <UFormField label="Select Client">
          <USelectMenu
            v-model="selectedClient"
            @update:model-value="handleClientChange"
            :items="clientOptions"
            value-key="value"
            placeholder="Choose a client to view documents"
            size="xl"
            :loading="clientStore.isLoading"
            class="min-w-60"
          />
        </UFormField>
      </div>

      <!-- Upload Button - Only show when client is selected -->
      <div v-if="hasSelectedClient" class="flex items-end">
        <UButton
          @click="uploadDocumentStore.open()"
          label="Upload Document"
          icon="mdi:upload"
          size="xl"
        />
      </div>
    </div>

    <!-- Search and Info -->
    <div
      v-if="hasSelectedClient"
      class="flex flex-col sm:flex-row justify-between items-center gap-4"
    >
      <div class="w-full sm:w-96">
        <UInput
          type="search"
          v-model="search"
          icon="mdi:magnify"
          size="xl"
          variant="outline"
          placeholder="Search documents"
          :loading="isSearching"
          class="min-w-60"
        />
      </div>
    </div>

    <!-- Documents Table -->
    <div
      v-if="hasSelectedClient"
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <UTable
        :data="documents"
        :columns="columns"
        :loading="isLoading"
        class="flex-1"
        :ui="{
          tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        }"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center space-x-3">
            <UIcon
              :name="getFileTypeIcon(row.original.file_extension)"
              :class="`text-${getFileTypeColor(
                row.original.file_extension
              )}-500`"
              class="h-6 w-6"
            />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ row.original.name }}
              </div>
            </div>
          </div>
        </template>

        <template #description-cell="{ row }">
          <div
            class="max-w-xs truncate text-gray-600 dark:text-gray-300"
            :title="row.original.description"
          >
            {{ row.original.description }}
          </div>
        </template>

        <template #file_extension-cell="{ row }">
          <UBadge
            :label="row.original.file_extension.toUpperCase().replace('.', '')"
            :color="getFileTypeColor(row.original.file_extension)"
            variant="soft"
          />
        </template>

        <template #file_size-cell="{ row }">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ formatFileSize(row.original.file_size) }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton
              @click="handleDownload(row.original)"
              label="Download"
              icon="mdi:download"
              color="primary"
              size="lg"
              variant="soft"
            />
            <UButton
              @click="handleEdit(row.original)"
              label="Edit"
              icon="mdi:pencil"
              color="success"
              size="lg"
              variant="soft"
            />
            <UButton
              @click="handleDelete(row.original)"
              label="Delete"
              icon="mdi:delete"
              color="error"
              size="lg"
              variant="soft"
            />
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pagination Component -->
    <Pagination
      v-if="hasSelectedClient"
      :pagination="pagination"
      :is-loading="isLoading"
      item-name="document"
      @first-page="goToFirstPage"
      @previous-page="goToPreviousPage"
      @next-page="goToNextPage"
      @last-page="goToLastPage"
    />

    <!-- Empty state -->
    <div
      v-if="!hasSelectedClient"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <UIcon
        name="mdi:folder-outline"
        class="mx-auto h-12 w-12 text-gray-400 mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Select a client
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Choose a client from the dropdown above to view and manage their
        documents.
      </p>
    </div>

    <!-- Modals -->
    <UploadDocumentModal />
    <EditDocumentModal />
  </div>
</template>