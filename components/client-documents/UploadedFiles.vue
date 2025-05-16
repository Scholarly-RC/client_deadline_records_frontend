<script setup>
// Components
import UploadedFile from "./UploadedFile.vue";

// Stores
const viewDeadlineStore = useViewDeadlineStore();
const { deadline, isLoading } = storeToRefs(viewDeadlineStore);

// Computed Properties
const uploadedFiles = computed(() => deadline.value.documents);
</script>

<template>
  <!-- Uploaded Files List -->
  <div v-if="uploadedFiles.length > 0 || isLoading">
    <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">
      Uploaded Files
    </h4>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Loading state -->
      <template v-if="isLoading">
        <div
          v-for="i in 3"
          :key="`loading-file-${i}`"
          class="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 animate-pulse"
        >
          <div class="flex-shrink-0 mr-4">
            <div
              class="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-600"
            ></div>
          </div>
          <div class="flex-1 min-w-0 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
          <div class="ml-4 flex-shrink-0">
            <div class="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </template>

      <!-- Actual content -->
      <template v-else>
        <UploadedFile
          v-for="(file, index) in uploadedFiles"
          :key="index"
          :file="file"
        />
      </template>
    </div>
  </div>
</template>
