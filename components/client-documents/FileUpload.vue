<script setup>
// Stores
const alertStore = useAlertStore();
const viewDeadlineStore = useViewDeadlineStore();
const { deadline } = storeToRefs(viewDeadlineStore);

// Methods
const handleFiles = async (files) => {
  for (const file of files) {
    try {
      const { $apiFetch } = useNuxtApp();

      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("file", file);
      formData.append("client_id", deadline.value.client.id);
      formData.append("deadline_id", deadline.value.id);

      const response = await $apiFetch("/api/client-documents/", {
        method: "POST",
        body: formData,
      });
      await viewDeadlineStore.getDeadline(deadline.value.id);
      alertStore.success(
        "Success!",
        `${file.name} has been successfully uploaded.`,
        3.5
      );
    } catch (error) {
      alertStore.danger("Error!", getErrorMessage(error), 3.5);
      console.error(error);
    }
  }
};

const onFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }
};

const onDrop = (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }
};

const onDragOver = (event) => {
  event.preventDefault();
};
</script>

<template>
  <!-- Stylish File Upload Box -->
  <div class="mb-8">
    <label
      for="file-upload"
      @drop="onDrop"
      @dragover="onDragOver"
      class="flex flex-col items-center justify-center w-full h-48 px-4 bg-white border-2 border-dashed rounded-lg cursor-pointer dark:bg-gray-800 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400"
    >
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          class="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 15.75V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-2.25M12 3v12m0 0l4.5-4.5M12 15l-4.5-4.5"
          />
        </svg>
        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          PDF, DOCX, XLSX, or images (MAX. 10MB)
        </p>
      </div>
      <input
        id="file-upload"
        type="file"
        class="hidden"
        multiple
        accept=".pdf, .doc, .docx, .xls, .xlsx, image/*"
        @change="onFileChange"
      />
    </label>
  </div>
</template>
