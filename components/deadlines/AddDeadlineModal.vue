<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const deadlineStore = useDeadlineStore();
const clientStore = useClientStore();
const deadlineTypeStore = useDeadlineTypesStore();
const userStore = useUserStore();
const addDeadlineStore = useAddDeadlineStore();

// Reactive Variables
const { activeClients } = storeToRefs(clientStore);
const { deadlineTypes } = storeToRefs(deadlineTypeStore);
const { users } = storeToRefs(userStore);
const { showModal } = storeToRefs(addDeadlineStore);

// Form initial values
const initialValues = computed(() => ({
  client: 0,
  deadlineType: 0,
  priority: 1,
  assignedTo: 0,
}));

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    client: z.number().min(1, "Client is required."),
    deadlineType: z.number().min(1, "Deadline Type is required."),
    dueDate: z.string().nonempty("Due Date is required."),
    priority: z.number(),
    assignedTo: z.number().min(1, "Assigned To is required."),
    description: z.string().optional(),
  })
);

// Form setup
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

// Form fields
const [client] = defineField("client");
const [deadlineType] = defineField("deadlineType");
const [dueDate] = defineField("dueDate");
const [priority] = defineField("priority");
const [assignedTo] = defineField("assignedTo");
const [description] = defineField("description");

// Disable submit button
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  const toast = useToast();
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch("/api/client-deadlines/", {
      method: "POST",
      body: {
        client_id: values.client,
        deadline_type_id: values.deadlineType,
        due_date: values.dueDate,
        priority: values.priority,
        assigned_to_id: values.assignedTo,
        description: values.description,
      },
    });
    await deadlineStore.getAllDeadlines();
    resetForm();
    addDeadlineStore.close();
    toast.add({
      title: "Deadline Created",
      description: "New deadline has been added successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 2000,
    });
  } catch (error) {
    toast.add({
      title: "Creation Failed",
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
  <div
    v-if="showModal"
    class="fixed inset-0 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full dark:bg-gray-900"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all border border-gray-200 dark:border-gray-700"
        >
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <!-- Modal header -->
                <div class="flex items-center justify-between mb-4">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    Add New Deadline
                  </h3>
                  <button
                    @click="addDeadlineStore.close()"
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
                    <!-- Client -->
                    <div class="sm:col-span-3">
                      <label
                        for="client"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Client<span class="text-red-500">*</span></label
                      >
                      <select
                        v-model="client"
                        id="client"
                        name="client"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option :value="0">Select a client</option>
                        <option
                          v-for="client in activeClients"
                          :key="client.id"
                          :value="client.id"
                        >
                          {{ client.name }}
                        </option>
                      </select>
                      <p
                        v-if="errors.client"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.client }}
                      </p>
                    </div>

                    <!-- Deadline Type -->
                    <div class="sm:col-span-3">
                      <label
                        for="deadline_type"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Deadline Type<span class="text-red-500">*</span></label
                      >
                      <select
                        v-model="deadlineType"
                        id="deadline_type"
                        name="deadline_type"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 appearance-none shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option :value="0">Select a type</option>
                        <option
                          v-for="deadlineType in deadlineTypes"
                          :key="deadlineType.id"
                          :value="deadlineType.id"
                        >
                          {{ deadlineType.name }}
                        </option>
                      </select>
                      <p
                        v-if="errors.deadlineType"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.deadlineType }}
                      </p>
                    </div>

                    <!-- Due Date -->
                    <div class="sm:col-span-3">
                      <label
                        for="due_date"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Due Date<span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="dueDate"
                        type="date"
                        id="due_date"
                        name="due_date"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      />
                      <p
                        v-if="errors.dueDate"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.dueDate }}
                      </p>
                    </div>

                    <!-- Priority -->
                    <div class="sm:col-span-3">
                      <label
                        for="priority"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Priority<span class="text-red-500">*</span></label
                      >
                      <select
                        v-model="priority"
                        id="priority"
                        name="priority"
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option :value="1" selected>Lowest</option>
                        <option :value="2">Low</option>
                        <option :value="3">Medium</option>
                        <option :value="4">High</option>
                        <option :value="5">Highest</option>
                      </select>
                      <p
                        v-if="errors.priority"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.priority }}
                      </p>
                    </div>

                    <!-- Assigned To -->
                    <div class="sm:col-span-6">
                      <label
                        for="assigned_to"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Assigned To<span class="text-red-500">*</span></label
                      >
                      <select
                        v-model="assignedTo"
                        id="assigned_to"
                        name="assigned_to"
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option :value="0">Select a user</option>
                        <option
                          v-for="user in users"
                          :key="user.id"
                          :value="user.id"
                        >
                          {{ user.fullname }}
                        </option>
                      </select>
                      <p
                        v-if="errors.assignedTo"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.assignedTo }}
                      </p>
                    </div>

                    <!-- Description -->
                    <div class="sm:col-span-6">
                      <label
                        for="description"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Description</label
                      >
                      <textarea
                        v-model="description"
                        id="description"
                        name="description"
                        rows="3"
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Form actions -->
                  <div class="mt-6 flex items-center justify-end space-x-3">
                    <button
                      :disabled="disableSubmit"
                      type="submit"
                      class="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Deadline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
