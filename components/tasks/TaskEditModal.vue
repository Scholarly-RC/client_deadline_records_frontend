<script setup lang="ts">
import UnifiedTaskFormModal from "~/components/tasks/UnifiedTaskFormModal.vue";
import type { Task, TaskList } from "~/types";

interface Props {
  modelValue?: boolean;
  task: TaskList;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success", task: Task): void;
}>();

// Computed for modal state
const isOpen = computed<boolean>({
  get: () => props.modelValue ?? false,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Reactive state
const isSubmitting = ref<boolean>(false);

// Handle form submission
const handleFormSuccess = async (updatedTask: Task): Promise<void> => {
  try {
    isSubmitting.value = true;

    // Emit success event to parent
    emit("success", updatedTask);

    // Close modal
    isOpen.value = false;
  } catch (error) {
    console.error("Error updating task:", error);

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Task Update Failed",
      description: "Failed to update the task. Please try again.",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Handle modal close
const handleModalClose = (): void => {
  isOpen.value = false;
};
</script>

<template>
  <UnifiedTaskFormModal
    :is-open="isOpen"
    :edit-task-id="task.id"
    @close="handleModalClose"
    @success="handleFormSuccess"
  />
</template>
