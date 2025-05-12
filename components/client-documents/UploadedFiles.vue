<script setup>
// Components
import UploadedFile from "./UploadedFile.vue";

// Stores
const viewDeadlineStore = useViewDeadlineStore();
const { deadline } = storeToRefs(viewDeadlineStore);

// Computed Properties
const uploadedFiles = computed(() => deadline.value.documents);
</script>

<template>
  <!-- Uploaded Files List -->
  <div v-if="uploadedFiles.length > 0">
    <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">
      Uploaded Files
    </h4>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UploadedFile
        v-for="(file, index) in uploadedFiles"
        :key="index"
        :file="file"
      />
    </div>
  </div>
</template>
