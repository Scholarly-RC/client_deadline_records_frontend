<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const editClientStore = useEditClientStore();
const alertStore = useAlertStore();
const { client, showModal } = storeToRefs(editClientStore);
const clientStore = useClientStore();

// Form initial values
const initialValues = computed(() => ({
  name: client.value?.name || "",
  status: client.value?.status || "",
  contactPerson: client.value?.contact_person || "",
  email: client.value?.email || "",
  phone: client.value?.phone || "",
  address: client.value?.address || "",
  notes: client.value?.notes || "",
}));

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().nonempty("Client Name is required."),
    status: z.string().nonempty("Status is required."),
    contactPerson: z.string().nonempty("Contact Person is required."),
    email: z
      .string()
      .nonempty("Email is required.")
      .email("Invalid email format."),
    phone: z.string().nonempty("Phone is required."),
    address: z.string().nonempty("Address is required."),
    notes: z.string(),
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
} = useForm({
  initialValues: initialValues.value,
  validationSchema,
});

// Form fields
const [name] = defineField("name");
const [status] = defineField("status");
const [contactPerson] = defineField("contactPerson");
const [email] = defineField("email");
const [phone] = defineField("phone");
const [address] = defineField("address");
const [notes] = defineField("notes");

// Computed properties
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const onSubmit = handleSubmit(async (values) => {
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(`/api/clients/${client.value.id}/`, {
      method: "PATCH",
      body: {
        name: values.name,
        status: values.status,
        contact_person: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address,
        notes: values.notes,
      },
    });
    await editClientStore.getClient(client.value.id);
    await clientStore.getAllClients();
    alertStore.success(
      "Client Updated",
      "Client information has been updated successfully.",
      3.5
    );
    resetForm({
      values: initialValues.value,
    });
  } catch (error) {
    alertStore.danger("Update Failed", getErrorMessage(error), 3.5);
    console.error(error);
  }
});

// Watchers
watch(initialValues, () => {
  resetForm({ values: initialValues.value });
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
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full dark:bg-gray-900"
      >
        <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-6">
            <h1
              class="text-2xl font-bold text-gray-900 dark:text-white"
              id="modal-title"
            >
              Edit Client
            </h1>
            <button
              @click="editClientStore.close()"
              type="button"
              class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
            >
              <!-- Heroicon name: outline/x -->
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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

          <div
            class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
          >
            <form @submit.prevent="onSubmit" id="add-client-form">
              <div class="p-6 space-y-6">
                <!-- Basic Information Section -->
                <div>
                  <h3
                    class="text-lg font-medium text-gray-900 dark:text-white mb-4"
                  >
                    Basic Information
                  </h3>
                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        for="client-name"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Client Name <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="name"
                        type="text"
                        id="client-name"
                        name="client-name"
                        required
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p
                        v-if="errors.name"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.name }}
                      </p>
                    </div>
                    <div>
                      <label
                        for="client-status"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Status <span class="text-red-500">*</span>
                      </label>
                      <select
                        v-model="status"
                        id="client-status"
                        name="client-status"
                        required
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <p
                        v-if="errors.status"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.status }}
                      </p>
                    </div>
                    <div>
                      <label
                        for="contact-person"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Contact Person <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="contactPerson"
                        type="text"
                        id="contact-person"
                        name="contact-person"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p
                        v-if="errors.contactPerson"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.contactPerson }}
                      </p>
                    </div>
                    <div>
                      <label
                        for="email"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="email"
                        type="email"
                        id="email"
                        name="email"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p
                        v-if="errors.email"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.email }}
                      </p>
                    </div>
                    <div>
                      <label
                        for="phone"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Phone <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="phone"
                        type="tel"
                        id="phone"
                        name="phone"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p
                        v-if="errors.phone"
                        class="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {{ errors.phone }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Address Section -->
                <div>
                  <label
                    for="notes"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Address <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="address"
                    id="notes"
                    name="notes"
                    rows="3"
                    class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                  <p
                    v-if="errors.address"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.address }}
                  </p>
                </div>

                <!-- Additional Information Section -->
                <div>
                  <h3
                    class="text-lg font-medium text-gray-900 dark:text-white mb-4"
                  >
                    Additional Information
                  </h3>
                  <div>
                    <label
                      for="notes"
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Notes
                    </label>
                    <textarea
                      v-model="notes"
                      id="notes"
                      name="notes"
                      rows="3"
                      class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div
                class="flex justify-center px-6 py-3 bg-gray-50 dark:bg-gray-700 text-right border-t border-gray-200 dark:border-gray-600"
              >
                <button
                  :disabled="disableSubmit"
                  type="submit"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
