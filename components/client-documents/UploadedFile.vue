<script setup>
// Props
const props = defineProps({
  file: Object,
});

// Stores
const alertStore = useAlertStore();
const viewDeadlineStore = useViewDeadlineStore();
const { deadline } = storeToRefs(viewDeadlineStore);
const confirmationStore = useConfirmationStore();

// Computed
const fileDownloadUrl = computed(() => {
  const config = useRuntimeConfig();
  return `${config.public.apiBase}/core/download-client-document/${props.file.id}`;
});

// Delete confirmation
const deleteConfirmation = async () => {
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this file?"
  );

  if (confirmed) {
    try {
      const { $apiFetch } = useNuxtApp();

      const response = await $apiFetch(
        `/api/client-documents/${props.file.id}/`,
        {
          method: "DELETE",
        }
      );
      await viewDeadlineStore.getDeadline(deadline.value.id);
      alertStore.success(
        "File Deleted",
        "The file has been deleted successfully.",
        3.5
      );
    } catch (error) {
      alertStore.danger("Deletion Failed", getErrorMessage(error), 5);
      console.error(error);
    }
  }
};
</script>

<template>
  <div
    class="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
  >
    <div class="flex-shrink-0 mr-4">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V10l-6-6z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v6h6"
          />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-w-0 overflow-hidden">
      <a
        :href="fileDownloadUrl"
        :title="file.name"
        class="block text-sm font-medium text-gray-900 dark:text-white truncate whitespace-nowrap overflow-hidden"
      >
        {{ file.name }}
      </a>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ file.size }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500">
        Uploaded by {{ file.uploaded_by.fullname }}
      </p>
    </div>
    <div class="ml-4 flex-shrink-0">
      <button
        class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        @click="deleteConfirmation"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>
