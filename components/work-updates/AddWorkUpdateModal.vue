<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const alertStore = useAlertStore();

const viewDeadlineStore = useViewDeadlineStore();
const { deadline } = storeToRefs(viewDeadlineStore);

const addWorkUpdateStore = useAddWorkUpdateStore();
const { showModal } = storeToRefs(addWorkUpdateStore);

// Initial Values
const initialValues = computed(() => ({
  status: deadline.value?.status || "",
}));

// Validation Schema
const validationSchema = toTypedSchema(
  z.object({
    status: z.string().nonempty("Status is required."),
    notes: z.string().nonempty("Notes is required."),
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
  setFieldValue,
} = useForm({
  initialValues: initialValues.value,
  validationSchema,
});

// Form Fields
const [status] = defineField("status");
const [notes] = defineField("notes");

// Computed
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const onSubmit = handleSubmit(async (values) => {
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch("/api/work-updates/", {
      method: "POST",
      body: {
        deadline_id: deadline.value.id,
        status: values.status,
        notes: values.notes,
      },
    });
    await viewDeadlineStore.getDeadline(deadline.value.id);
    addWorkUpdateStore.close();
    alertStore.success("Success!", "A new work update has been created.", 3.5);
  } catch (error) {
    alertStore.danger("Error!", getErrorMessage(error), 3.5);
    console.error(error);
  }
});

// Watchers
watch(deadline, (value) => {
  resetForm({ values: initialValues.value });
});
</script>

<template>
  <!-- Modal -->
  <div
    v-if="showModal"
    id="deadline-modal"
    class="fixed inset-0 z-50 overflow-y-auto"
  >
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

    <!-- Modal container (centering container) -->
    <div
      class="flex items-center justify-center min-h-screen px-4 relative z-10"
    >
      <!-- Modal panel -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700"
      >
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <!-- Modal header -->
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Work Update
                </h3>
                <button
                  @click="addWorkUpdateStore.close()"
                  type="button"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span class="sr-only">Close</span>
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Form -->
              <form @submit.prevent="onSubmit">
                <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                  <!-- Status -->
                  <div class="sm:col-span-6">
                    <label
                      for="status"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >Status<span class="text-red-500">*</span></label
                    >
                    <select
                      v-model="status"
                      id="status"
                      name="status"
                      class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <p
                      v-if="errors.status"
                      class="mt-1 text-xs text-red-600 dark:text-red-400"
                    >
                      {{ errors.status }}
                    </p>
                  </div>

                  <!-- Description -->
                  <div class="sm:col-span-6">
                    <label
                      for="notes"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >Notes<span class="text-red-500">*</span></label
                    >
                    <textarea
                      v-model="notes"
                      id="notes"
                      name="notes"
                      rows="3"
                      class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                    ></textarea>
                    <p
                      v-if="errors.notes"
                      class="mt-1 text-xs text-red-600 dark:text-red-400"
                    >
                      {{ errors.notes }}
                    </p>
                  </div>
                </div>

                <!-- Form actions -->
                <div class="mt-6 flex items-center justify-center space-x-3">
                  <button
                    :disabled="disableSubmit"
                    type="submit"
                    class="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
