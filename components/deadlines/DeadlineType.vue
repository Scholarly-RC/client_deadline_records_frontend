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
  <UCard v-else variant="soft">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
        <UButton
          @click="toggleShowEditDeadlineType"
          icon="mdi:pencil"
          label="Edit"
          size="md"
          color="info"
        />
        <UButton
          @click="deleteConfirmation"
          icon="mdi:delete-outline"
          label="Delete"
          size="md"
          color="error"
        />
      </div>
    </div>
  </UCard>
</template>
