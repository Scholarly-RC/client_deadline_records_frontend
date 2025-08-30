<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { ClientFormData } from '~/types/entities';
import type { Client } from "~/types";

// Stores
const editClientStore = useEditClientStore();
const { client, showModal } = storeToRefs(editClientStore);
const clientStore = useClientStore();

// Form initial values
const initialValues = computed(() => ({
  name: client.value?.client_name || client.value?.name || "",
  status: client.value?.status || "",
  category: client.value?.category || "",
  contactPerson: client.value?.contact_person || "",
  email: client.value?.email || "",
  phone: client.value?.phone_number || client.value?.phone || "",
  dateOfBirth: client.value?.birthday || client.value?.date_of_birth || "",
  address: client.value?.address || "",
  notes: client.value?.notes || "",
}));

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().nonempty("Client Name is required."),
    status: z.string().nonempty("Status is required."),
    category: z.string().nonempty("Category is required."),
    contactPerson: z.string().nonempty("Contact Person is required."),
    email: z
      .string()
      .nonempty("Email is required.")
      .email("Invalid email format."),
    phone: z.string().nonempty("Phone is required."),
    dateOfBirth: z.string().optional(),
    address: z.string().nonempty("Address is required."),
    notes: z.string().optional(),
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
} = useForm<ClientFormData>({
  initialValues: initialValues.value,
  validationSchema,
});

// Form fields
const [name, nameAttr] = defineField("name");
const [status, statusAttr] = defineField("status");
const [category, categoryAttr] = defineField("category");
const [contactPerson, contactPersonAttr] = defineField("contactPerson");
const [email, emailAttr] = defineField("email");
const [phone, phoneAttr] = defineField("phone");
const [dateOfBirth, dateOfBirthAttr] = defineField("dateOfBirth");
const [address, addressAttr] = defineField("address");
const [notes, notesAttr] = defineField("notes");

// Computed properties
const disableSubmit = computed<boolean>(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const onSubmit = handleSubmit(async (values: ClientFormData) => {
  const toast = useToast();
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(`/api/clients/${client.value?.id}/`, {
      method: "PATCH",
      body: {
        name: values.name,
        status: values.status,
        category: values.category,
        contact_person: values.contactPerson,
        email: values.email,
        phone: values.phone,
        date_of_birth: values.dateOfBirth || null,
        address: values.address,
        notes: values.notes,
      },
    });
    if (client.value?.id) {
      await editClientStore.getClient(client.value.id);
      await clientStore.getAllClients();
    }
    toast.add({
      title: "Client Updated",
      description: "Client information has been updated successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 2000,
    });
    resetForm({
      values: initialValues.value,
    });
  } catch (error: any) {
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

// Watchers
watch(initialValues, () => {
  resetForm({ values: initialValues.value });
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Edit Client"
    description="Update the client’s information below."
    :ui="{ content: 'min-w-3xl' }"
  >
    <template #body>
      <!-- Loading overlay -->
      <div v-if="isSubmitting" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
        <div class="text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">Updating client...</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Please wait while we update the client information</p>
        </div>
      </div>

      <form @submit.prevent="onSubmit" id="add-client-form" class="relative">
        <div class="space-y-4">
          <!-- Basic Information Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
              <div>
                <label
                  for="date-of-birth"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Birthday <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="dateOfBirth"
                  type="date"
                  id="date-of-birth"
                  name="date-of-birth"
                  class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                />
                <p
                  v-if="errors.dateOfBirth"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.dateOfBirth }}
                </p>
              </div>
            </div>
          </div>

          <!-- Category Section -->
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="category"
              id="client-category"
              name="client-category"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Category</option>
              <option value="TOE">Tax (One Engagement)</option>
              <option value="TRP">Tax (Regular Processing)</option>
              <option value="CMP">Compliance</option>
              <option value="ACC">Accounting</option>
              <option value="AUD">Auditing</option>
              <option value="OCC">Other Consultancy Client</option>
            </select>
            <p
              v-if="errors.address"
              class="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.address }}
            </p>
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
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
        <div class="flex justify-center px-6 py-3">
          <UButton
            type="submit"
            :disabled="disableSubmit || isSubmitting"
            :loading="isSubmitting"
            size="lg"
            class="min-w-[140px]"
          >
            <template #leading>
              <UIcon
                :name="isSubmitting ? 'i-lucide-loader-2' : 'i-lucide-save'"
                :class="isSubmitting ? 'h-4 w-4 animate-spin' : 'h-4 w-4'"
              />
            </template>
            {{ isSubmitting ? 'Updating...' : 'Update Client' }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
