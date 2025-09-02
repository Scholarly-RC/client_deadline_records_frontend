<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { ref, computed, type Ref } from "vue";

import { statusChoices } from "~/constants/choices";
import { useToast } from "#imports";

const filteredStatusChoices = statusChoices
  .filter((choice) =>
    ["not_yet_started", "pending", "on_going"].includes(choice.value)
  )
  .map((choice) => ({
    ...choice,
    value: choice.value.toString(),
  }));

const taskUpdate = useTaskUpdate();
const { showModal, task, category } = storeToRefs(taskUpdate);
const userTaskStore = useUserTasksStore();

const initialValues = computed(() => ({
  status: task.value?.status?.toString() || '',
  remarks: '',
}));

const validationSchema = toTypedSchema(
  z.object({
    status: z.preprocess(
      (val) => val || "",
      z.string().trim().min(1, { message: "Status cannot be empty." })
    ),
    remarks: z.preprocess(
      (val) => val || "",
      z.string().trim().min(1, { message: "Remarks cannot be empty." })
    ),
  })
);

const {
  values,
  errors,
  defineField,
  meta: formMeta,
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm({
  initialValues: initialValues.value,
  validationSchema,
});

const [status] = defineField("status") as [Ref<string>, any];
const [remarks] = defineField("remarks") as [Ref<string>, any];

const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

const onSubmit = async () => {
  // Check if form is valid
  if (!formMeta.value.valid) {
    return
  }

  try {
    const data = {
      status: values.status,
      remarks: values.remarks,
    };
    await userTaskStore.updateTask(category.value, task.value?.id, data);

    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Task Status Updated",
      description: "Task status has been updated successfully.",
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 3000,
    });

    resetForm();
    taskUpdate.close();
  } catch (error) {
    console.error('Update failed:', error);

    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Status Update Failed",
      description: "Failed to update task status. Please try again.",
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  }
};

watch(initialValues, (val) => {
  resetForm({ values: initialValues.value });
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Update"
    description="Update status of task"
  >
    <template #body>
      <UForm :state="values" @submit="onSubmit">
        <div class="flex flex-col gap-2">
          <UFormField
            label="Status"
            name="status"
            :error="errors.status"
            required
            help="Select the client for whom you want to add a task"
          >
            <USelect
              v-model="status"
              :items="filteredStatusChoices"
              option-attribute="label"
              value-attribute="value"
              size="lg"
              placeholder="Select Status"
              class="w-full"
              :disabled="isSubmitting"
            />
          </UFormField>
          <UFormField
            label="Remarks"
            name="remarks"
            :error="errors.remarks"
            required
          >
            <UTextarea
              v-model="remarks"
              size="lg"
              placeholder="Add Remarks"
              class="w-full"
              :disabled="isSubmitting"
            />
          </UFormField>
          <div class="self-center">
            <UButton
              type="submit"
              icon="mdi:calendar-sync"
              label="Update"
              size="lg"
              :disabled="disableSubmit"
            />
          </div>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
