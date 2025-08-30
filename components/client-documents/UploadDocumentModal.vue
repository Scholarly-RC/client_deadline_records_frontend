<script setup lang="ts">
// Composables
import { watch } from 'vue';

// Stores
const clientDocumentsStore = useClientDocumentsStore();
const uploadDocumentStore = useUploadDocumentStore();

const { selectedClientId } = storeToRefs(clientDocumentsStore);
const { showModal, isUploading } = storeToRefs(uploadDocumentStore);

// Form data
const form = reactive({
  title: "",
  description: "",
});

const originalTitle = ref<string>("");

const selectedFile = ref<File | null>(null);
const error = ref<string>("");
const isDragOver = ref<boolean>(false);

// Computed
const fileSize = computed(() => {
  if (!selectedFile.value) return "";
  const sizeInMB = selectedFile.value.size / 1024 / 1024;
  return sizeInMB < 1
    ? `${(selectedFile.value.size / 1024).toFixed(1)} KB`
    : `${sizeInMB.toFixed(2)} MB`;
});

const isValidFile = computed(() => {
  return selectedFile.value && !error.value;
});

const fileTypeIcon = computed(() => {
  if (!selectedFile.value) return 'i-lucide-file';
  const type = selectedFile.value.type;
  if (type.includes('pdf')) return 'i-lucide-file-text';
  if (type.includes('image')) return 'i-lucide-image';
  if (type.includes('word')) return 'i-lucide-file-text';
  return 'i-lucide-file';
});

// Watch for title changes to track if user modified auto-generated title
watch(() => form.title, (newTitle) => {
  if (newTitle !== originalTitle.value && originalTitle.value) {
    // User has modified the auto-generated title
    originalTitle.value = "";
  }
});

// Methods
const generateTitleFromFileName = (fileName: string): string => {
  // Remove file extension
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

  // Replace underscores and hyphens with spaces
  let title = nameWithoutExtension.replace(/[_-]/g, " ");

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, (char) => char.toUpperCase());

  // Clean up multiple spaces
  title = title.replace(/\s+/g, " ").trim();

  return title;
};

const setAutoTitle = (file: File) => {
  const autoTitle = generateTitleFromFileName(file.name);

  // Only set the title if it's empty or if it matches the previously auto-generated title
  if (!form.title || form.title === originalTitle.value) {
    form.title = autoTitle;
    originalTitle.value = autoTitle;
  }
};

const validateFile = (file: File): boolean => {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = "File size must be less than 10MB";
    return false;
  }

  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    error.value = "File type not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.";
    return false;
  }

  return true;
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (validateFile(file)) {
    selectedFile.value = file;
    setAutoTitle(file);
    error.value = "";
  } else {
    selectedFile.value = null;
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (validateFile(file)) {
    selectedFile.value = file;
    setAutoTitle(file);
    error.value = "";
  } else {
    selectedFile.value = null;
  }
};

const handleSubmit = async () => {
  if (!selectedFile.value || !form.title.trim()) {
    error.value = "Please fill all required fields and select a file";
    return;
  }

  if (!selectedClientId.value) {
    error.value = "No client selected";
    return;
  }

  uploadDocumentStore.setUploading(true);
  error.value = "";

  try {
    const formData = new FormData();
    formData.append("client", selectedClientId.value.toString());
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("document_file", selectedFile.value);

    await clientDocumentsStore.uploadDocument(formData);

    // Reset form
    form.title = "";
    form.description = "";
    originalTitle.value = "";
    selectedFile.value = null;
    error.value = "";

    // Show success notification
    const toast = useToast();
    toast.add({
      title: "Document Uploaded",
      description: "Document uploaded successfully.",
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 3000,
    });

    // Close modal
    uploadDocumentStore.closeModal();
  } catch (err: any) {
    const errorMessage = err.response?.data?.detail || err.message || "Upload failed";
    error.value = errorMessage;

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Upload Failed",
      description: errorMessage,
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  } finally {
    uploadDocumentStore.setUploading(false);
  }
};

const handleClose = () => {
  if (isUploading.value) return;

  // Reset form
  form.title = "";
  form.description = "";
  originalTitle.value = "";
  selectedFile.value = null;
  error.value = "";

  uploadDocumentStore.closeModal();
};

// Watch for title changes to track if user modified auto-generated title
watch(() => form.title, (newTitle) => {
  if (newTitle !== originalTitle.value && originalTitle.value) {
    // User has modified the auto-generated title
    originalTitle.value = "";
  }
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    :ui="{
      content: 'max-w-lg w-full',
    }"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-upload-cloud" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Document
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload a new document for the selected client
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <!-- Loading overlay -->
      <div v-if="isUploading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
        <div class="text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">Uploading document...</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Please wait while we process your file</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6 relative">
        <!-- Title -->
        <UFormField label="Document Title" required>
          <UInput
            v-model="form.title"
            placeholder="Enter a descriptive title for your document"
            required
            :disabled="isUploading"
            icon="i-lucide-file-text"
            class="text-sm"
          />
          <div v-if="originalTitle" class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
            <UIcon
              :name="form.title === originalTitle ? 'i-lucide-sparkles' : 'i-lucide-edit'"
              class="h-3 w-3"
            />
            <span>{{ form.title === originalTitle ? 'Auto-generated from file name' : 'Custom title' }}</span>
          </div>
        </UFormField>

        <!-- Description -->
        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Add a brief description (optional)"
            :disabled="isUploading"
            :rows="3"
            class="text-sm resize-none"
          />
        </UFormField>

        <!-- File Upload Area -->
        <UFormField label="Select File" required>
          <div class="space-y-3">
            <!-- Drag & Drop Zone -->
            <div
              class="relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
                     hover:border-blue-400 focus-within:border-blue-500
                     dark:border-gray-600 dark:hover:border-blue-400 dark:focus-within:border-blue-500"
              :class="{
                'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10': error,
                'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10': selectedFile && !error,
                'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10': isDragOver,
                'border-gray-300 dark:border-gray-600': !selectedFile && !error && !isDragOver
              }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <input
                ref="fileInput"
                type="file"
                @change="handleFileChange"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
                :disabled="isUploading"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div class="text-center">
                <UIcon
                  name="i-lucide-upload"
                  class="mx-auto h-12 w-12 text-gray-400 mb-4"
                  :class="{
                    'text-red-400': error,
                    'text-green-500': selectedFile && !error,
                    'text-blue-500': !selectedFile && !error
                  }"
                />

                <div v-if="!selectedFile" class="space-y-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Drop your file here, or click to browse
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, JPG, PNG up to 10MB
                  </p>
                </div>

                <div v-else class="space-y-3">
                  <div class="flex items-center justify-center space-x-2">
                    <UIcon :name="fileTypeIcon" class="h-5 w-5 text-green-500" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {{ selectedFile.name }}
                    </span>
                  </div>

                  <div class="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span class="flex items-center space-x-1">
                      <UIcon name="i-lucide-hard-drive" class="h-3 w-3" />
                      <span>{{ fileSize }}</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <UIcon name="i-lucide-tag" class="h-3 w-3" />
                      <span>{{ selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE' }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- File Requirements -->
            <div class="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-1">
                <UIcon name="i-lucide-check-circle" class="h-3 w-3 text-green-500" />
                <span>Max 10MB</span>
              </div>
              <div class="flex items-center space-x-1">
                <UIcon name="i-lucide-check-circle" class="h-3 w-3 text-green-500" />
                <span>PDF, DOC, DOCX, JPG, PNG</span>
              </div>
            </div>
          </div>
        </UFormField>

        <!-- Error Message -->
        <div
          v-if="error"
          class="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <UIcon name="i-lucide-alert-circle" class="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div
          v-if="selectedFile && !error"
          class="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <UIcon name="i-lucide-check-circle" class="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p class="text-sm text-green-700 dark:text-green-400">
            File ready for upload! Click "Upload Document" to proceed.
          </p>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-info" class="h-3 w-3" />
          <span>All uploads are securely encrypted</span>
        </div>

        <div class="flex space-x-3">
          <UButton
            @click="handleClose"
            variant="ghost"
            :disabled="isUploading"
            size="sm"
          >
            Cancel
          </UButton>

          <UButton
            @click="handleSubmit"
            :loading="isUploading"
            :disabled="!selectedFile || !form.title.trim() || isUploading"
            size="sm"
            class="min-w-[120px]"
          >
            <template #leading>
              <UIcon
                :name="isUploading ? 'i-lucide-loader-2' : 'i-lucide-upload'"
                :class="isUploading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'"
              />
            </template>
            {{ isUploading ? 'Uploading...' : 'Upload Document' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>