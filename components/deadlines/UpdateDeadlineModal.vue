<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

import { statusChoices } from "~/constants/choices";

const filteredStatusChoices = statusChoices.filter((choice) =>
  ["not_yet_started", "pending", "on_going"].includes(choice.value)
);

const deadlineUpdate = useDeadlineUpdate();
const { showModal, deadline, category } = storeToRefs(deadlineUpdate);
const userDeadlineStore = useUserDeadlinesStore();

const initialValues = computed(() => ({
  status: deadline.value?.status,
  remarks: null,
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

const [status] = defineField("status");
const [remarks] = defineField("remarks");

const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

const onSubmit = handleSubmit(async (values) => {
  const data = {
    status: values.status,
    remarks: values.remarks,
  };
  userDeadlineStore.updateDeadline(category.value, deadline.value?.id, data);
  resetForm();
  deadlineUpdate.close();
});

watch(initialValues, (val) => {
  resetForm({ values: initialValues.value });
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Update"
    description="Update status of deadline"
  >
    <template #body>
      <UForm :state="values" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-2">
          <UFormField
            label="Status"
            name="status"
            :error="errors.status"
            required
            help="Select the client for whom you want to add a deadline"
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
