<script setup>
// Components
import EditDeadlineType from "./EditDeadlineType.vue";

// Props
const props = defineProps({
  deadlineType: Object,
});

// Stores
const confirmationStore = useConfirmationStore();
const alertStore = useAlertStore();
const deadlineTypesStore = useDeadlineTypesStore();

// State
const showEditDeadlineType = ref(false);

// Methods
const toggleShowEditDeadlineType = () => {
  showEditDeadlineType.value = !showEditDeadlineType.value;
};

const deleteConfirmation = async () => {
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
      deadlineTypesStore.getAllDeadlineTypes();
      alertStore.success(
        "Success!",
        "Selected Deadline Type successfully deleted.",
        3.5
      );
    } catch (error) {
      alertStore.danger("Error!", error.details, 5);
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
    class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
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
            >Priority:</span
          >
          {{ deadlineType.default_priority }}
        </div>
        <div>
          <span class="font-medium text-gray-900 dark:text-white"
            >Reminder Days:</span
          >
          {{ deadlineType.default_reminder_days }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="toggleShowEditDeadlineType"
        class="text-blue-600 hover:underline text-sm"
      >
        Edit
      </button>
      <button
        @click="deleteConfirmation"
        class="text-red-600 hover:underline text-sm"
      >
        Delete
      </button>
    </div>
  </div>
</template>
