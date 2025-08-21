<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Emits
const emit = defineEmits(["toggle-show-edit"]);

// Props
const props = defineProps({
  deadlineType: Object,
});

// Stores
const deadlineTypesStore = useDeadlineTypesStore();

// State
const currentDeadline = ref(props.deadlineType);

// Form Initial Values
const initialValues = computed(() => ({
  name: currentDeadline.value.name,
  description: currentDeadline.value.description,
  defaultReminderDays: currentDeadline.value.default_reminder_days,
}));

// Form Validation Schema
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().nonempty("Name is required."),
    description: z.string().optional(),
    defaultReminderDays: z
      .number()
      .min(0, "Reminder days must be zero or more")
      .int("Reminder days must be a whole number"),
  })
);

// Form Setup
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

// Form Fields
const [name] = defineField("name");
const [description] = defineField("description");
const [defaultReminderDays] = defineField("defaultReminderDays");

// Computed
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const toggleShowEdit = () => {
  emit("toggle-show-edit");
};

const onSubmit = handleSubmit(async (values) => {
  const toast = useToast();
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(
      `/api/deadline-types/${currentDeadline.value.id}/`,
      {
        method: "PATCH",
        body: {
          name: values.name,
          description: values.description,
          default_reminder_days: values.defaultReminderDays,
        },
      }
    );
    currentDeadline.value = response;
    await deadlineTypesStore.getAllDeadlineTypes();
    resetForm({ values: initialValues.value });
    toast.add({
      title: "Deadline Type Updated",
      description: "The deadline type has been updated successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 2000,
    });
  } catch (error) {
    toast.add({
      title: "Update Failed",
      description: getErrorMessage(error),
      color: "error",
      icon: "mdi:close-box-multiple",
      duration: 5000,
    });
    console.error(error);
  }
});
</script>

<template>
  <UCard variant="soft">
    <form @submit.prevent="onSubmit">
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >Deadline Name</label
        >
        <input
          v-model="name"
          type="text"
          class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value="Contract Expiration"
        />
        <p
          v-if="errors.name"
          class="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {{ errors.name }}
        </p>
      </div>

      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >Description</label
        >
        <textarea
          v-model="description"
          rows="2"
          class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
End of the contract period</textarea
        >
        <p
          v-if="errors.description"
          class="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {{ errors.description }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >Reminder Days</label
          >
          <input
            v-model="defaultReminderDays"
            type="number"
            min="0"
            class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="7"
          />
          <p
            v-if="errors.defaultReminderDays"
            class="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {{ errors.defaultReminderDays }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <UButton
          @click="toggleShowEdit"
          :disabled="disableSubmit"
          icon="mdi:content-save-edit-outline"
          label="Update"
          size="lg"
        />
        <UButton
          @click="toggleShowEdit"
          icon="mdi:close"
          :label="!disableSubmit ? 'Cancel' : 'Close'"
          variant="outline"
          color="neutral"
          size="lg"
        />
      </div>
    </form>
  </UCard>
</template>
