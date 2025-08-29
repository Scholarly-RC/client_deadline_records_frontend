<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { watchDebounced } from "@vueuse/core";
import type { Client } from "~/types";

// Stores
const documentStore = useDocumentStore();
const uploadDocumentStore = useUploadDocumentStore();
const clientStore = useClientStore();
const { showModal, isUploading } = storeToRefs(uploadDocumentStore);
const { clients } = storeToRefs(clientStore);

// File upload refs
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const uploadProgress = ref(0);

// Form Schema
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Document name is required"),
    description: z.string().min(1, "Description is required"),
    file: z
      .instanceof(File, { message: "Please select a file to upload" })
      .refine(
        (file) => file.size <= 50 * 1024 * 1024,
        "File size must be less than 50MB"
      )
      .refine((file) => {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/jpeg",
          "image/png",
          "image/gif",
          "text/plain",
        ];
        return allowedTypes.includes(file.type);
      }, "File type not allowed. Please upload PDF, Word, Excel, Image, or Text files."),
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
  setFieldValue,
} = useForm({
  validationSchema,
  initialValues: {
    name: "",
    description: "",
    file: undefined as File | undefined,
  },
});

// Form Fields
const [name, nameAttr] = defineField("name");
const [description, descriptionAttr] = defineField("description");
const [file, fileAttr] = defineField("file");

// Get selected client from document store
const { selectedClient } = storeToRefs(documentStore);

// Computed
const disableSubmit = computed<boolean>(() => {
  return !formMeta.value.dirty || !formMeta.value.valid || isUploading.value;
});

const fileTypeIcon = computed(() => {
  if (!file.value) return "mdi:file-outline";

  const type = file.value.type;
  if (!type) return "mdi:file-outline";
  if (type.includes("pdf")) return "mdi:file-pdf-box";
  if (type.includes("word") || type.includes("document"))
    return "mdi:file-word-box";
  if (type.includes("excel") || type.includes("sheet"))
    return "mdi:file-excel-box";
  if (type.includes("image")) return "mdi:file-image-box";
  if (type.includes("text")) return "mdi:file-document-outline";
  return "mdi:file-outline";
});

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// File handling methods
const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const selectedFile = target.files[0];
    setFieldValue("file", selectedFile);

    // Auto-populate name if empty
    if (!name.value) {
      const fileName = selectedFile.name.split(".")[0];
      setFieldValue("name", fileName);
    }
  }
};

const handleFileDrop = (event: DragEvent): void => {
  event.preventDefault();
  isDragOver.value = false;

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const droppedFile = event.dataTransfer.files[0];
    setFieldValue("file", droppedFile);

    // Auto-populate name if empty
    if (!name.value) {
      const fileName = droppedFile.name.split(".")[0];
      setFieldValue("name", fileName);
    }
  }
};

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (): void => {
  isDragOver.value = false;
};

const removeFile = (): void => {
  setFieldValue("file", undefined);
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Form submission
const onSubmit = handleSubmit(async (values) => {
  if (!values.file || !selectedClient.value) return;

  uploadDocumentStore.setUploading(true);
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append("file", values.file);
    formData.append("name", values.name);
    formData.append("description", values.description);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10;
      }
    }, 200);

    await documentStore.uploadDocument(selectedClient.value, formData);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    // Close modal and reset form
    setTimeout(() => {
      uploadDocumentStore.close();
      resetForm();
      uploadProgress.value = 0;
    }, 500);
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    uploadDocumentStore.setUploading(false);
  }
});

// Modal lifecycle
const handleModalClose = (): void => {
  if (!isUploading.value) {
    uploadDocumentStore.close();
    resetForm();
    uploadProgress.value = 0;
  }
};

// Computed for selected client name
const selectedClientName = computed(() => {
  if (!selectedClient.value) return "No client selected";
  const client = clients.value.find((c) => c.id === selectedClient.value);
  return client ? client.client_name || client.name : "Unknown client";
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Upload Document"
    description="Upload a new document for the selected client"
    :ui="{ content: 'min-w-2xl max-w-4xl' }"
    :prevent-close="isUploading"
  >
    <template #body>
      <form @submit.prevent="onSubmit" id="upload-document-form">
        <div class="space-y-6">
          <!-- Selected Client Info -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Uploading for Client
            </h3>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedClientName }}
            </p>
          </div>

          <!-- File Upload Area -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Document File <span class="text-red-500">*</span>
            </label>

            <!-- Drag and Drop Area -->
            <div
              @drop="handleFileDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              :class="[
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
              ]"
            >
              <UIcon
                :name="file ? fileTypeIcon : 'mdi:cloud-upload-outline'"
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
              />

              <div v-if="!file">
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Drop your file here, or
                  <button
                    type="button"
                    @click="fileInput?.click()"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PDF, Word, Excel, Image files up to 50MB
                </p>
              </div>

              <div v-else class="space-y-2">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ file.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ file?.size ? formatFileSize(file.size) : "Unknown size" }}
                </p>
                <UButton
                  @click="removeFile"
                  size="xs"
                  color="error"
                  variant="soft"
                  icon="mdi:close"
                  label="Remove"
                />
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              class="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
            />

            <p
              v-if="errors.file"
              class="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.file }}
            </p>
          </div>

          <!-- Document Details -->
          <div class="grid grid-cols-1 gap-4">
            <UFormField label="Document Name" :error="errors.name" required>
              <UInput
                v-model="name"
                placeholder="Enter document name"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Description"
              :error="errors.description"
              required
            >
              <UTextarea
                v-model="description"
                placeholder="Enter document description"
                :rows="3"
                size="lg"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Upload Progress -->
          <div v-if="isUploading" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-300">Uploading...</span>
              <span class="text-gray-600 dark:text-gray-300"
                >{{ Math.round(uploadProgress) }}%</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-3">
        <UButton
          type="submit"
          form="upload-document-form"
          :disabled="disableSubmit"
          :loading="isUploading"
          icon="mdi:upload"
        >
          {{ isUploading ? "Uploading..." : "Upload Document" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
