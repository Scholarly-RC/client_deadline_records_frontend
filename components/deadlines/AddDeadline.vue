<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

const initialValues = computed(() => ({
  client: "",
  deadlineType: "",
  assignedTo: "",
}));

const validationSchema = toTypedSchema(
  z.object({
    client: z.number().min(1, "Client is required."),
    deadlineType: z.number().min(1, "Deadline Type is required."),
    dueDate: z.string().nonempty("Due Date is required."),
    reminderDays: z
      .number()
      .min(0, "Reminder days must be zero or more")
      .int("Reminder days must be a whole number"),
    priority: z.number(),
    assignedTo: z.string().nonempty("Assigned to is required."),
    description: z.string(),
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
  setFieldValue,
} = useForm({
  initialValues: initialValues.value,
  validationSchema,
});

const [client] = defineField("client");
const [deadlineType] = defineField("deadlineType");
const [dueDate] = defineField("dueDate");
const [reminderDays] = defineField("reminderDays");
const [priority] = defineField("priority");
const [assignedTo] = defineField("assignedTo");
const [description] = defineField("description");

watchEffect(() => {
  if (values.deadlineType) {
    setFieldValue(
      "reminderDays",
      deadlineTypeStore.getDeadlineTypeDefaultReminderDays(values.deadlineType)
    );
  }
});

const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

const onSubmit = handleSubmit(async (values) => {
  // try {
  //   const { $apiFetch } = useNuxtApp();
  //   const response = await $apiFetch("/api/clients/", {
  //     method: "POST",
  //     body: {
  //       name: values.name,
  //       status: values.status,
  //       contact_person: values.contactPerson,
  //       email: values.email,
  //       phone: values.phone,
  //       address: values.address,
  //       notes: values.notes,
  //     },
  //   });
  //   alertStore.success("Success!", "A new client has been created.", 3.5);
  //   toggleModal();
  //   resetForm();
  // } catch (error) {
  //   alertStore.danger("Error!", error.data.detail, 3.5);
  //   console.error(error);
  // }
});

const showModal = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
};

// Stores
const clientStore = useClientStore();
const deadlineTypeStore = useDeadlineTypesStore();
const { clients } = storeToRefs(clientStore);
const { deadlineTypes } = storeToRefs(deadlineTypeStore);
</script>

<template>
  <div>
    <button
      @click="toggleModal"
      class="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
    >
      + Add Deadline
    </button>

    <!-- Modal -->
    <div
      v-if="showModal"
      id="deadline-modal"
      class="fixed inset-0 z-50 overflow-y-auto"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700"
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
                    @click="toggleModal"
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
                <form>
                  <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                    <!-- Client -->
                    <div class="sm:col-span-3">
                      <label
                        for="client"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Client</label
                      >
                      <select
                        v-model="client"
                        id="client"
                        name="client"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option value="">Select a client</option>
                        <option
                          v-for="client in clients"
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
                        >Deadline Type</label
                      >
                      <select
                        v-model="deadlineType"
                        id="deadline_type"
                        name="deadline_type"
                        required
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 appearance-none shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option value="">Select a type</option>
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
                        >Due Date</label
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

                    <!-- Reminder Days -->
                    <div class="sm:col-span-3">
                      <label
                        for="reminder_days"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Reminder Days</label
                      >
                      <input
                        v-model="reminderDays"
                        type="number"
                        id="reminder_days"
                        name="reminder_days"
                        min="0"
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      />
                      <p
                        v-if="errors.reminderDays"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.reminderDays }}
                      </p>
                    </div>

                    <!-- Priority -->
                    <div class="sm:col-span-3">
                      <label
                        for="priority"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Priority</label
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

                    <!-- Assigned To (Full Width) -->
                    <div class="sm:col-span-6">
                      <label
                        for="assigned_to"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Assigned To</label
                      >
                      <select
                        v-model="assignedTo"
                        id="assigned_to"
                        name="assigned_to"
                        class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 pr-10 shadow-sm appearance-none focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                      >
                        <option value="">Select a user</option>
                        <option value="1">John Doe</option>
                        <option value="2">Jane Smith</option>
                        <option value="3">Mike Johnson</option>
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
