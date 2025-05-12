<script setup>
// Components
import FileUpload from "./FileUpload.vue";
import UploadedFiles from "./UploadedFiles.vue";
</script>

<template>
  <div
    class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
  >
    <div>
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          File Uploads
        </h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Upload and manage your files here
        </p>
      </div>
      <FileUpload />
    </div>
    <UploadedFiles />
  </div>
</template>
