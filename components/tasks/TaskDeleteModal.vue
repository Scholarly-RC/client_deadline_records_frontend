<script setup lang="ts">
import { categoryChoices } from "~/constants/choices";
import type { TaskList } from "~/types";
import StatusBadge from "../ui/StatusBadge.vue";
import PriorityBadge from "../ui/PriorityBadge.vue";

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
const isDeleting = ref<boolean>(false);

// Helper function to get category label
const getCategoryLabel = (categoryValue: string): string => {
  const choice = categoryChoices.find((c) => c.value === categoryValue);
  return choice ? choice.label : categoryValue;
};

// Handle task deletion
const handleDelete = async (): Promise<void> => {
  try {
    isDeleting.value = true;
    
    // Send notification to assigned user before deletion
    await sendDeleteNotification();
    
    // Delete the task
    await taskStore.deleteTask(props.task.id);
    
    // Emit success event to parent
    emit("success", props.task);
    
    // Close modal
    isOpen.value = false;
    
    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Task Deleted",
      description: `Task "${props.task.description}" has been deleted successfully.`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
    
  } catch (error) {
    console.error("Error deleting task:", error);
    
    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Delete Failed",
      description: "Failed to delete the task. Please try again.",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Handle modal close
const handleCancel = (): void => {
  isOpen.value = false;
};

// Send notification to assigned user
const sendDeleteNotification = async (): Promise<void> => {
  try {
    const authStore = useAuthStore();
    
    // Only send notification if task is assigned to someone other than the current user
    if (props.task.assigned_to && props.task.assigned_to !== authStore.user?.id) {
      const notificationData = {
        type: "task_deleted",
        title: "Task Deleted",
        message: `Task "${props.task.description}" has been deleted by ${authStore.user?.fullname}`,
        task_id: props.task.id,
        recipient_id: props.task.assigned_to,
        data: {
          task_id: props.task.id,
          task_description: props.task.description,
          client_name: props.task.client_name,
          deleted_by: {
            id: authStore.user?.id,
            fullname: authStore.user?.fullname,
          },
          action: "deleted",
        },
      };
      
      await notificationStore.createNotification(notificationData);
    }
  } catch (error) {
    console.error("Error sending delete notification:", error);
    // Don't throw error here as we still want to proceed with deletion
  }
};

// Format deadline for display
const formatDate = (dateString: string): string => {
  if (!dateString) return "Not specified";
  
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};
</script>

<template>
  <UModal 
    v-model:open="isOpen" 
    title="Delete Task"
    description="This action cannot be undone"
    :ui="{ content: 'w-full max-w-lg' }"
  >

    <template #body>
      <div class="space-y-4">
        <!-- Warning Message -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div class="flex">
            <div class="flex-shrink-0">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="h-5 w-5 text-red-400"
              />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                Warning
              </h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  You are about to permanently delete this task. This action cannot be undone.
                </p>
                <p v-if="task.assigned_to_name" class="mt-1">
                  <strong>{{ task.assigned_to_name }}</strong> will be notified of this deletion.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Details -->
        <div class="bg-gray-50 rounded-lg p-4 dark:bg-gray-800">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Task Details
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">ID:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ task.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Client:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ task.client_name || "Not specified" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Category:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ getCategoryLabel(task.category) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Description:</span>
              <span class="font-medium text-gray-900 dark:text-white text-right max-w-xs truncate">
                {{ task.description }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Assigned To:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ task.assigned_to_name || "Not assigned" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Deadline:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatDate(task.deadline) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Status:</span>
              <StatusBadge :status="task.status" />
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Priority:</span>
              <PriorityBadge :priority="task.priority" />
            </div>
          </div>
        </div>

        <!-- Confirmation Text -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Type <strong>DELETE</strong> to confirm this action:
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          @click="handleCancel"
          :disabled="isDeleting"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          variant="solid"
          @click="handleDelete"
          :loading="isDeleting"
          :disabled="isDeleting"
        >
          Delete Task
        </UButton>
      </div>
    </template>
  </UModal>
</template>