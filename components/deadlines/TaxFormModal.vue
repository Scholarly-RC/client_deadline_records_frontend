<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  priorityChoices,
  taxCaseCategoryChoices,
  birFormChoices,
  typeOfTaxCaseChoices,
} from "~/constants/choices";
import { taxSchema } from "~/schema/tax.schema";

const emit = defineEmits(["clearAddDeadlineForm"]);

// Stores
const userStore = useUserStore();
const clientStore = useClientStore();
const addDeadlineStore = useAddDeadlineStore();
const taxModalStore = useTaxStore();

// Store refs
const { users } = storeToRefs(userStore);
const { activeClients } = storeToRefs(clientStore);
const { showModal } = storeToRefs(taxModalStore);
const { selectedClient } = storeToRefs(addDeadlineStore);

// Form initial values
const initialValues = computed(() => ({
  category: null,
  tax_type: null,
  form: null,
  working_paper: "",
  tax_payable: 0,
  period_covered: "",
  assigned_to: null,
  priority: "medium",
  engagement_date: "",
  deadline: "",
  remarks: null,
  date_complied: null,
  completion_date: null,
}));

// Form validation schema
const validationSchema = toTypedSchema(taxSchema);

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
const [category] = defineField("category"); // New field
const [tax_type] = defineField("tax_type"); // New field
const [form] = defineField("form");
const [working_paper] = defineField("working_paper");
const [tax_payable] = defineField("tax_payable");

const [period_covered] = defineField("period_covered");
const [assigned_to] = defineField("assigned_to");
const [priority] = defineField("priority");
const [engagement_date] = defineField("engagement_date");
const [deadline] = defineField("deadline");

// Computed items for user select
const userItems = computed(() => {
  return users.value.map((user) => ({
    label: user.fullname,
    id: user.id,
  }));
});

const selectedClientName = computed(() => {
  if (!selectedClient.value) return "";
  const client = activeClients.value.find((c) => c.id === selectedClient.value);
  return client ? client.name : "";
});

// Disable submit button
const disableSubmit = computed(() => {
  return !formMeta.value.valid || isSubmitting.value;
});

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  const toast = useToast();

  if (!selectedClient.value) {
    toast.add({
      title: "Error",
      description: "No client selected. Please start over.",
      color: "error",
      icon: "mdi:alert-circle",
      duration: 5000,
    });
    return;
  }

  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch("/api/tax-cases/", {
      method: "POST",
      body: {
        client: selectedClient.value,
        category: values.category,
        type: values.tax_type,
        form: values.form,
        working_paper: values.working_paper,
        tax_payable: values.tax_payable,
        period_covered: values.period_covered,
        assigned_to: values.assigned_to,
        priority: values.priority,
        engagement_date: values.engagement_date,
        deadline: values.deadline,
        remarks: values.remarks || null,
        date_complied: values.date_complied || null,
        completion_date: values.completion_date || null,
        last_update: new Date().toISOString(),
      },
    });

    toast.add({
      title: "Success",
      description: "Tax task has been created successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 3000,
    });

    // Reset form and close modal
    resetForm();
    taxModalStore.close();
    emit("clearAddDeadlineForm");
  } catch (error) {
    console.error("Error creating Tax task:", error);
    toast.add({
      title: "Creation Failed",
      description: getErrorMessage(error),
      color: "error",
      icon: "mdi:close-box-multiple",
      duration: 5000,
    });
  }
});

const handleClose = () => {
  taxModalStore.close();
  addDeadlineStore.open();
};
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Tax Task Details - Step 2 of 2"
    :description="`Creating task for ${selectedClientName}`"
    :ui="{ content: 'min-w-4xl max-w-6xl' }"
    :close="{ onClick: () => handleClose() }"
  >
    <template #body>
      <UForm :state="values" @submit.prevent="onSubmit" class="space-y-8">
        <!-- Tax Information Section -->
        <div class="bg-primary-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Tax Information
          </h3>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Category -->
            <UFormField
              label="Category"
              name="category"
              :error="errors.category"
              required
              help="Select the tax category"
            >
              <USelect
                v-model="category"
                :items="taxCaseCategoryChoices"
                value-key="value"
                placeholder="Select Category"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Type -->
            <UFormField
              label="Type"
              name="type"
              :error="errors.tax_type"
              required
              help="Select the type of tax"
            >
              <USelect
                v-model="tax_type"
                :items="typeOfTaxCaseChoices"
                value-key="value"
                placeholder="Select Type"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Form -->
            <UFormField
              label="Form"
              name="form"
              :error="errors.form"
              required
              help="Select the BIR form"
            >
              <USelect
                v-model="form"
                :items="birFormChoices"
                value-key="value"
                placeholder="Select Form"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Working Paper -->
            <UFormField
              label="Working Paper"
              name="working_paper"
              :error="errors.working_paper"
              required
              help="Reference to working paper"
            >
              <UInput
                v-model="working_paper"
                placeholder="Enter working paper reference"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Tax Payable -->
            <UFormField
              label="Tax Payable"
              name="tax_payable"
              :error="errors.tax_payable"
              required
              help="Amount of tax payable"
            >
              <UInput
                v-model="tax_payable"
                type="number"
                step="0.01"
                placeholder="Enter tax payable amount"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </div>

        <!-- Task Assignment Section -->
        <div class="bg-primary-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Assignment & Priority
          </h3>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <UFormField
              label="Assigned To"
              name="assigned_to"
              :error="errors.assigned_to"
              required
            >
              <USelect
                v-model="assigned_to"
                :items="userItems"
                value-key="id"
                placeholder="Select User"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField
              label="Priority"
              name="priority"
              :error="errors.priority"
              required
            >
              <USelect
                v-model="priority"
                :items="priorityChoices"
                placeholder="Select Priority"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </div>

        <!-- Timeline Section -->
        <div class="bg-primary-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Timeline & Period
          </h3>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <UFormField
              label="Period Covered"
              name="period_covered"
              :error="errors.period_covered"
              required
              help="e.g., Q1 2024, January 2024, etc."
            >
              <UInput
                v-model="period_covered"
                placeholder="e.g. Q1 2024, January 2024"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField
              label="Engagement Date"
              name="engagement_date"
              :error="errors.engagement_date"
              required
              help="When the task begins"
            >
              <UInput
                v-model="engagement_date"
                type="date"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField
              label="Deadline"
              name="deadline"
              :error="errors.deadline"
              required
              help="Task completion deadline"
            >
              <UInput
                v-model="deadline"
                type="date"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </div>

        <!-- Form Actions -->
        <div
          class="flex items-center justify-end pt-6 border-t border-gray-200"
        >
          <UButton
            type="submit"
            icon="mdi:content-save"
            label="Create Task"
            size="lg"
            :loading="isSubmitting"
            :disabled="disableSubmit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
