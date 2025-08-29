<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const documentStore = useDocumentStore();
const editDocumentStore = useEditDocumentStore();
const { document, showModal, isLoading } = storeToRefs(editDocumentStore);

// Form Schema
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Document name is required"),
    description: z.string().min(1, "Description is required"),
  })
);

// Form Setup
const {
  values,
  errors,
  defineField,
  meta: formMeta,
  handleSubmit,
  resetForm,
  setValues,
} = useForm({
  validationSchema,
  initialValues: {
    name: '',
    description: '',
  }
});

// Form Fields
const [name, nameAttr] = defineField("name");
const [description, descriptionAttr] = defineField("description");

// Computed
const disableSubmit = computed<boolean>(() => {
  return !formMeta.value.dirty || !formMeta.value.valid || isLoading.value;
});

const fileTypeIcon = computed(() => {
  if (!document.value) return 'mdi:file-outline';
  
  const ext = document.value.file_extension.toLowerCase();
  if (ext === '.pdf') return 'mdi:file-pdf-box';
  if (['.doc', '.docx'].includes(ext)) return 'mdi:file-word-box';
  if (['.xls', '.xlsx'].includes(ext)) return 'mdi:file-excel-box';
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'mdi:file-image-box';
  if (ext === '.txt') return 'mdi:file-document-outline';
  return 'mdi:file-outline';
});

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Form submission
const onSubmit = handleSubmit(async (values) => {
  if (!document.value) return;
  
  try {
    await documentStore.updateDocument(
      document.value.client,
      document.value.id,
      {
        name: values.name,
        description: values.description,
      }
    );
    
    editDocumentStore.close();
  } catch (error) {
    console.error('Update failed:', error);
  }
});

// Modal lifecycle
const handleModalClose = (): void => {
  editDocumentStore.close();
  resetForm();
};

// Watch for document changes to populate form
watch(document, (newDocument) => {
  if (newDocument) {
    setValues({
      name: newDocument.name,
      description: newDocument.description,
    });
  }
}, { immediate: true });

// Reset form when modal opens/closes
watch(showModal, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Edit Document"
    description="Update document information"
    :ui="{ content: 'min-w-xl max-w-2xl' }"
  >
    <template #body>
      <form @submit.prevent="onSubmit" id="edit-document-form">
        <div class="space-y-6">
          <!-- Document Info Display -->
          <div v-if="document" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-3">
              <UIcon
                :name="fileTypeIcon"
                class="h-8 w-8 text-blue-500"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ document.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ document.file_extension.toUpperCase().replace('.', '') }} • {{ formatFileSize(document.file_size) }}
                </p>
              </div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Uploaded by: {{ document.uploaded_by.fullname }}</p>
              <p>Uploaded: {{ document.uploaded_at }}</p>
              <p>Last updated: {{ document.updated_at }}</p>
            </div>
          </div>

          <!-- Editable Fields -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Name <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="name"
                placeholder="Enter document name"
                size="lg"
                :disabled="isLoading"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ errors.name }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span class="text-red-500">*</span>
              </label>
              <UTextarea
                v-model="description"
                placeholder="Enter document description"
                :rows="4"
                size="lg"
                :disabled="isLoading"
              />
              <p v-if="errors.description" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ errors.description }}
              </p>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          @click="handleModalClose"
          variant="outline"
          :disabled="isLoading"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          form="edit-document-form"
          :disabled="disableSubmit"
          :loading="isLoading"
          icon="mdi:content-save"
        >
          Save Changes
        </UButton>
      </div>
    </template>
  </UModal>
</template>