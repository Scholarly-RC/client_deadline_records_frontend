<script setup lang="ts">
import UnifiedTaskFormModal from "./UnifiedTaskFormModal.vue";
import type { TaskList } from "~/types";

interface Props {
  modelValue?: boolean;
  task: TaskList;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success", task: TaskList): void;
}>();

// Stores
const taskStore = useTaskStore();
const notificationStore = useNotificationStore();

// Computed for modal state
const isOpen = computed<boolean>({
  get: () => props.modelValue ?? false,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Reactive state
const isSubmitting = ref<boolean>(false);

// Handle form submission
const handleFormSuccess = async (updatedTask: TaskList): Promise<void> => {
  try {
    isSubmitting.value = true;
    
    // Update the task in the store
    await taskStore.updateTask(updatedTask.id, updatedTask);
    
    // Send notification to assigned user if they are different from current user
    await sendEditNotification(updatedTask);
    
    // Emit success event to parent
    emit("success", updatedTask);
    
    // Close modal
    isOpen.value = false;
    
    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Task Updated",
      description: `Task "${updatedTask.description}" has been updated successfully.`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
    
  } catch (error) {
    console.error("Error updating task:", error);
    
    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Update Failed",
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

// Send notification to assigned user
const sendEditNotification = async (updatedTask: TaskList): Promise<void> => {
  try {
    const authStore = useAuthStore();
    
    // Only send notification if task is assigned to someone other than the current user
    if (updatedTask.assigned_to && updatedTask.assigned_to !== authStore.user?.id) {
      const notificationData = {
        type: "task_edited",
        title: "Task Updated",
        message: `Task "${updatedTask.description}" has been updated by ${authStore.user?.fullname}`,
        task_id: updatedTask.id,
        recipient_id: updatedTask.assigned_to,
        data: {
          task_id: updatedTask.id,
          task_description: updatedTask.description,
          client_name: updatedTask.client_name,
          modified_by: {
            id: authStore.user?.id,
            fullname: authStore.user?.fullname,
          },
          action: "edited",
        },
      };
      
      await notificationStore.createNotification(notificationData);
    }
  } catch (error) {
    console.error("Error sending edit notification:", error);
    // Don't throw error here as we don't want to fail the task update
  }
};
</script>

<template>
  <UnifiedTaskFormModal
    :is-open="isOpen"
    :edit-task="task as any"
    @close="handleModalClose"
    @success="handleFormSuccess"
  />
</template>