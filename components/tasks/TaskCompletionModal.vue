<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { TaskList } from "~/types";

interface Props {
  modelValue?: boolean;
  task: TaskList;
  isSubmitting?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "complete", completionData: { remarks: string }): void;
}>();

// Form data
const remarks = ref<string>("");

// Computed properties
const isOpen = computed<boolean>({
  get: () => props.modelValue ?? false,
  set: (value: boolean) => emit("update:modelValue", value),
});

// Set default values when modal opens
const resetForm = (): void => {
  remarks.value = "";
};

// Form validation
const isFormValid = computed<boolean>(() => {
  return remarks.value.trim().length > 0;
});

// Handle form submission
const handleSubmit = (): void => {
  if (!isFormValid.value) return;

  const completionData = {
    remarks: remarks.value.trim(),
  };

  emit("complete", completionData);
};

// Handle modal close
const handleClose = (): void => {
  if (!props.isSubmitting) {
    isOpen.value = false;
    resetForm();
  }
};

// Watch for modal opening to reset form
watch(
  () => props.modelValue,
  (newValue: boolean | undefined) => {
    if (newValue) {
      resetForm();
    }
  }
);
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Mark Task as Complete"
    description="Confirm that this task has been completed successfully"
    :ui="{ footer: 'justify-end' }"
    :prevent-close="isSubmitting"
    :close="false"
  >
    <template #body>
      <!-- Task Info -->
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Task Details
        </h4>
        <div class="space-y-1 text-sm">
          <div>
            <span class="font-medium">Client:</span>
            {{ task.client_name || task.client_detail?.name }}
          </div>
          <div>
            <span class="font-medium">Description:</span> {{ task.description }}
          </div>
          <div>
            <span class="font-medium">Category:</span>
            {{ task.category_display || task.category }}
          </div>
          <div>
            <span class="font-medium">Deadline:</span> {{ task.deadline }}
          </div>
        </div>
      </div>

      <!-- Completion Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Completion Remarks -->
        <UFormField
          label="Completion Remarks"
          name="remarks"
          description="Please provide details about how the task was completed"
          required
        >
          <UTextarea
            v-model="remarks"
            placeholder="Describe how the task was completed, any important notes, or relevant details..."
            :disabled="isSubmitting"
            :rows="4"
            required
            class="w-full"
          />
        </UFormField>

        <!-- Info message -->
        <div
          class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div class="flex">
            <UIcon
              name="i-heroicons-information-circle"
              class="h-5 w-5 text-blue-400 mr-2 mt-0.5"
            />
            <div class="text-sm text-blue-700 dark:text-blue-300">
              <p class="font-medium mb-1">Completing this task will:</p>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>Change the task status to "Completed"</li>
                <li>Record your completion remarks</li>
                <li>Remove the task from active deadline tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="handleClose"
          :disabled="isSubmitting"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!isFormValid"
        >
          Mark as Complete
        </UButton>
      </div>
    </template>
  </UModal>
</template>