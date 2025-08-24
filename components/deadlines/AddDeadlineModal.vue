<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { categoryChoices } from "~/constants/choices";
import { z } from "zod";
import ComplianceFormModal from "./ComplianceFormModal.vue";
import FinancialStatementFormModal from "./FinancialStatementFormModal.vue";
import HrImplementationFormModal from "./HrImplementationFormModal.vue";
import FinanceImplementationFormModal from "./FinanceImplementationFormModal.vue";
import AuditingAccountingFormModal from "./AuditingAccountingFormModal.vue";
import MiscellaneousFormModal from "./MiscellaneousFormModal.vue";
import TaxFormModal from "./TaxFormModal.vue";

// Stores
const clientStore = useClientStore();
const addDeadlineStore = useAddDeadlineStore();
const userStore = useUserStore();

// Reactive Variables
const { activeClients } = storeToRefs(clientStore);
const { showModal } = storeToRefs(addDeadlineStore);

// Form initial values
const initialValues = computed(() => ({
  client: null,
  category: "",
}));

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    client: z.number().min(1, "Client is required."),
    category: z.string().nonempty("Category is required."),
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
const [client] = defineField("client");
const [category] = defineField("category");

// Computed items for client select
const clientItems = computed(() => {
  return activeClients.value.map((client) => ({
    label: client.name,
    id: client.id,
  }));
});

// Disable submit button
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid || isSubmitting.value;
});

// Form submission handler
const handleNext = handleSubmit(() => {
  addDeadlineStore.handleNext();
});

const handleClearAddDeadlineForm = () => {
  resetForm();
};

watch(client, (value) => {
  addDeadlineStore.setClient(value);
});

watch(category, (value) => {
  addDeadlineStore.setCategory(value);
});

onMounted(async () => {
  await clientStore.getAllClients();
  await userStore.getUserChoices();
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Add Deadline - Step 1 of 2"
    description="Enter the details to create a new client deadline."
    :ui="{ content: 'min-w-3xl' }"
  >
    <UButton icon="mdi:calendar-plus-outline" label="Add Deadline" size="xl" />

    <template #body>
      <UForm :state="values" @submit.prevent="handleNext" class="space-y-4">
        <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
          <!-- Client -->
          <div class="sm:col-span-6">
            <UFormField
              label="Client"
              name="client"
              :error="errors.client"
              required
              help="Select the client for whom you want to add a deadline"
            >
              <USelect
                v-model="client"
                :items="clientItems"
                value-key="id"
                size="lg"
                placeholder="Select Client"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Category -->
          <div class="sm:col-span-6">
            <UFormField
              label="Category"
              name="category"
              :error="errors.category"
              required
              help="Choose the type of deadline you want to create"
            >
              <URadioGroup
                v-model="category"
                :items="categoryChoices"
                variant="card"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </div>

        <!-- Form actions -->
        <div class="mt-6 flex items-center justify-end">
          <UButton
            type="submit"
            icon="mdi:arrow-right"
            label="Next"
            size="xl"
            :loading="isSubmitting"
            :disabled="disableSubmit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
  <ComplianceFormModal @clearAddDeadlineForm="handleClearAddDeadlineForm" />
  <FinancialStatementFormModal
    @clearAddDeadlineForm="handleClearAddDeadlineForm"
  />
  <FinanceImplementationFormModal
    @clearAddDeadlineForm="handleClearAddDeadlineForm"
  />
  <HrImplementationFormModal
    @clearAddDeadlineForm="handleClearAddDeadlineForm"
  />
  <AuditingAccountingFormModal
    @clearAddDeadlineForm="handleClearAddDeadlineForm"
  />
  <MiscellaneousFormModal @clearAddDeadlineForm="handleClearAddDeadlineForm" />
  <TaxFormModal @clearAddDeadlineForm="handleClearAddDeadlineForm" />
</template>
