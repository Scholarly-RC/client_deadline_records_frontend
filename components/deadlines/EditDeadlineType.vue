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
const alertStore = useAlertStore();
const deadlineTypesStore = useDeadlineTypesStore();

// State
const currentDeadline = ref(props.deadlineType);

// Form Initial Values
const initialValues = computed(() => ({
  name: currentDeadline.value.name,
  description: currentDeadline.value.description,
  defaultPriority: currentDeadline.value.default_priority,
  defaultReminderDays: currentDeadline.value.default_reminder_days,
}));

// Form Validation Schema
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().nonempty("Name is required."),
    description: z.string(),
    defaultPriority: z
      .number()
      .gt(0, "Priority must be greater than 0")
      .lte(5, "Priority must be 5 or less"),
    defaultReminderDays: z.number().min(0, "Reminder days cannot be negative"),
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
const [defaultPriority] = defineField("defaultPriority");
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
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(
      `/api/deadline-types/${currentDeadline.value.id}/`,
      {
        method: "PATCH",
        body: {
          name: values.name,
          description: values.description,
          default_priority: values.defaultPriority,
          default_reminder_days: values.defaultReminderDays,
        },
      }
    );
    currentDeadline.value = response;
    deadlineTypesStore.getAllDeadlineTypes();
    resetForm({ values: initialValues.value });
    alertStore.success(
      "Success!",
      "The selected deadline type has been updated.",
      3.5
    );
  } catch (error) {
    alertStore.danger("Error!", error.detail, 3.5);
    console.error(error);
  }
});
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    class="flex flex-col gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
  >
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >Deadline Name</label
      >
      <input
        v-model="name"
        type="text"
        class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value="Contract Expiration"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-200"
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
          >Default Priority</label
        >
        <input
          v-model="defaultPriority"
          type="number"
          min="1"
          max="5"
          class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p
          v-if="errors.defaultPriority"
          class="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {{ errors.defaultPriority }}
        </p>
      </div>
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
      <button
        @click="toggleShowEdit"
        type="button"
        class="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        {{ !disableSubmit ? "Cancel" : "Close" }}
      </button>
      <button
        type="submit"
        :disabled="disableSubmit"
        class="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Update
      </button>
    </div>
  </form>
</template>
