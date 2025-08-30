<script setup lang="ts">
// Stores
const clientDocumentsStore = useClientDocumentsStore();
const editDocumentStore = useEditDocumentStore();

const { document, showModal, isUpdating } = storeToRefs(editDocumentStore);

// Form data
const form = reactive({
  title: "",
  description: "",
});

const error = ref<string>("");

// Watch for document changes
watch(
  () => document.value,
  (newDocument) => {
    if (newDocument) {
      form.title = newDocument.title;
      form.description = newDocument.description || "";
    }
  },
  { immediate: true }
);

// Methods
const handleSubmit = async () => {
  if (!document.value || !form.title.trim()) {
    error.value = "Title is required";
    return;
  }

  editDocumentStore.setUpdating(true);
  error.value = "";

  try {
    await clientDocumentsStore.updateDocument(document.value.id, {
      title: form.title.trim(),
      description: form.description.trim(),
    });

    // Close modal
    editDocumentStore.closeModal();

    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Document Updated",
      description: `"${form.title}" has been updated successfully.`,
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 3000,
    });
  } catch (err: any) {
    error.value = err.response?.data?.detail || "Update failed";

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Update Failed",
      description: error.value,
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  } finally {
    editDocumentStore.setUpdating(false);
  }
};

const handleClose = () => {
  if (isUpdating.value) return;

  // Reset form
  form.title = "";
  form.description = "";
  error.value = "";

  editDocumentStore.closeModal();
};
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Edit Document"
    description="Update document information and metadata"
    :ui="{
      content: 'max-w-md w-full',
    }"
    @close="handleClose"
  >

    <template #body>
      <!-- Loading overlay -->
      <div v-if="isUpdating" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
        <div class="text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">Updating document...</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Please wait while we save your changes</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 relative">
        <!-- Title -->
        <UFormField label="Document Title" required>
          <UInput
            v-model="form.title"
            placeholder="Enter document title"
            required
            :disabled="isUpdating"
          />
        </UFormField>

        <!-- Description -->
        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Enter document description (optional)"
            :disabled="isUpdating"
            :rows="3"
          />
        </UFormField>

        <!-- File Info (Read-only) -->
        <div v-if="document" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            File Information
          </h4>
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Type:</strong> {{ document.file_extension }}</p>
            <p><strong>Size:</strong> {{ document.file_size }}</p>
            <p><strong>Uploaded:</strong> {{ new Date(document.uploaded_at).toLocaleString() }}</p>
            <p><strong>By:</strong> {{ document.uploaded_by_name }}</p>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Note: File cannot be changed after upload. Only title and description can be edited.
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <UButton
          @click="handleClose"
          variant="ghost"
          :disabled="isUpdating"
        >
          Cancel
        </UButton>

        <UButton
          @click="handleSubmit"
          :loading="isUpdating"
          :disabled="!form.title.trim()"
        >
          Update Document
        </UButton>
      </div>
    </template>
  </UModal>
</template>