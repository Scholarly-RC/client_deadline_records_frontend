<script setup lang="ts">
// Components
import { watchDebounced } from "@vueuse/core";
import Pagination from "~/components/ui/Pagination.vue";
import type { ClientDocument } from "~/types";

const search = ref<string>("");
const isSearching = ref<boolean>(false);
const deletingDocumentId = ref<number | null>(null);

// Stores
const clientDocumentsStore = useClientDocumentsStore();
const confirmationStore = useConfirmationStore();
const editDocumentStore = useEditDocumentStore();

const { documents, pagination, isLoading } = storeToRefs(clientDocumentsStore);

// Watch for search changes with debounce
watchDebounced(
  search,
  async (newSearch) => {
    isSearching.value = true;
    await clientDocumentsStore.setSearch(newSearch || null);
    isSearching.value = false;
  },
  { debounce: 500 }
);

// Methods
const handleDownload = async (document: ClientDocument) => {
  try {
    await clientDocumentsStore.downloadDocument(document.id, document.title);
  } catch (error) {
    console.error("Download failed:", error);

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Download Failed",
      description: `Failed to download "${document.title}". Please try again.`,
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  }
};

const handleEdit = (document: ClientDocument) => {
  editDocumentStore.openModal(document);
};

const handleDelete = async (document: ClientDocument) => {
  const confirmed = await confirmationStore.confirm(
    `Are you sure you want to delete "${document.title}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  deletingDocumentId.value = document.id;

  try {
    await clientDocumentsStore.deleteDocument(document.id);

    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Document Deleted",
      description: `"${document.title}" has been deleted successfully.`,
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 3000,
    });
  } catch (error) {
    console.error("Delete failed:", error);

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Document Deletion Failed",
      description: `Failed to delete "${document.title}". Please try again.`,
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  } finally {
    deletingDocumentId.value = null;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <div class="flex justify-between items-center">
      <div class="flex-1 max-w-md">
        <UInput
          v-model="search"
          placeholder="Search documents..."
          :loading="isSearching"
          icon="i-lucide-search"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Documents List -->
    <div v-else-if="documents.length > 0" class="space-y-4">
      <div
        v-for="document in documents"
        :key="document.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon
                name="i-lucide-file-text"
                class="h-5 w-5 text-gray-400 flex-shrink-0"
              />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">
                {{ document.title }}
              </h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ document.file_extension }}
              </span>
            </div>

            <p v-if="document.description" class="text-gray-600 dark:text-gray-400 mb-2">
              {{ document.description }}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Size: {{ document.file_size }}</span>
              <span>Uploaded: {{ formatDate(document.uploaded_at) }}</span>
              <span>By: {{ document.uploaded_by_name }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-2 ml-4">
            <UButton
              @click="handleDownload(document)"
              icon="i-lucide-download"
              variant="ghost"
              size="sm"
              title="Download"
            />

            <UButton
              @click="handleEdit(document)"
              icon="i-lucide-edit"
              variant="ghost"
              size="sm"
              title="Edit"
            />

            <UButton
              @click="handleDelete(document)"
              :icon="deletingDocumentId === document.id ? 'i-lucide-loader-2' : 'i-lucide-trash-2'"
              :loading="deletingDocumentId === document.id"
              color="error"
              variant="ghost"
              size="sm"
              title="Delete"
              :disabled="deletingDocumentId === document.id"
            />
          </div>
        </div>
      </div>
    </div>

     <!-- Pagination -->
     <Pagination
       :pagination="pagination"
       :is-loading="isLoading"
       :style="'simple'"
       :item-name="'documents'"
       :on-page-change="clientDocumentsStore.setPage"
     />

    <!-- Empty State -->
    <div
      v-if="!isLoading && documents.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-file-x"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No documents
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Get started by uploading a new document.
      </p>
    </div>
  </div>
</template>