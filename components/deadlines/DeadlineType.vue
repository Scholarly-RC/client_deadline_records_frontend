<script setup>
// Components
import EditDeadlineType from "./EditDeadlineType.vue";

// Props
const props = defineProps({
  deadlineType: Object,
});

// Stores
const confirmationStore = useConfirmationStore();
const deadlineTypesStore = useDeadlineTypesStore();

// State
const showEditDeadlineType = ref(false);

// Methods
const toggleShowEditDeadlineType = () => {
  showEditDeadlineType.value = !showEditDeadlineType.value;
};

const deleteConfirmation = async () => {
  const toast = useToast();
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this deadline type?"
  );

  if (confirmed) {
    try {
      const { $apiFetch } = useNuxtApp();
      const response = await $apiFetch(
        `/api/deadline-types/${props.deadlineType.id}/`,
        {
          method: "DELETE",
        }
      );
      await deadlineTypesStore.getAllDeadlineTypes();
      toast.add({
        title: "Deadline Type Deleted",
        description: "The deadline type has been removed successfully.",
        color: "success",
        icon: "mdi:checkbox-multiple-marked",
        duration: 2000,
      });
    } catch (error) {
      toast.add({
        title: "Deletion Failed",
        description: getErrorMessage(error),
        color: "error",
        icon: "mdi:close-box-multiple",
        duration: 5000,
      });
      console.error(error);
    }
  }
};
</script>

<template>
  <EditDeadlineType
    @toggle-show-edit="toggleShowEditDeadlineType"
    v-if="showEditDeadlineType"
    :deadline-type="deadlineType"
  />
  <div
    v-else
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
  >
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ deadlineType.name }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        {{ deadlineType.description }}
      </p>
      <div
        class="flex flex-wrap gap-4 mt-2 text-sm text-gray-700 dark:text-gray-300"
      >
        <div>
          <span class="font-medium text-gray-900 dark:text-white"
            >Default Reminder Day/s:</span
          >
          {{ deadlineType.default_reminder_days }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 w-auto">
      <button
        @click="toggleShowEditDeadlineType"
        class="flex-1 inline-flex justify-center items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
      >
        Edit
      </button>
      <button
        @click="deleteConfirmation"
        class="flex-1 inline-flex justify-center items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
      >
        Delete
      </button>
    </div>
  </div>
</template>
