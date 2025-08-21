<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { categoryChoices } from "~/constants/choices";
import { z } from "zod";

// Stores
const clientStore = useClientStore();
const addDeadlineStore = useAddDeadlineStore();
const complianceModalStore = useComplianceModalStore();

// Reactive Variables
const { activeClients } = storeToRefs(clientStore);
const { showModal } = storeToRefs(addDeadlineStore);

// Form initial values
const initialValues = computed(() => ({
  client: 0,
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
const handleNext = handleSubmit(async (values) => {
  const toast = useToast();

  try {
    // Close current modal first
    addDeadlineStore.close();

    // Small delay to ensure modal closes properly
    await nextTick();

    // Open the appropriate modal based on category selection
    switch (values.category) {
      case "compliance":
        complianceModalStore.open(values.client);
        break;
      case "accounting_auditing":
        // TODO: Create and open Accounting/Auditing Modal
        console.log(
          "Opening Accounting/Auditing Modal for client:",
          values.client
        );
        toast.add({
          title: "Coming Soon",
          description: "Accounting/Auditing form is not yet implemented.",
          color: "info",
          icon: "mdi:information",
          duration: 3000,
        });
        break;
      case "finance_implementation":
        // TODO: Create and open Finance Implementation Modal
        console.log(
          "Opening Finance Implementation Modal for client:",
          values.client
        );
        toast.add({
          title: "Coming Soon",
          description: "Finance Implementation form is not yet implemented.",
          color: "info",
          icon: "mdi:information",
          duration: 3000,
        });
        break;
      default:
        toast.add({
          title: "Invalid Category",
          description: "Please select a valid category.",
          color: "error",
          icon: "mdi:alert-circle",
          duration: 3000,
        });
        return;
    }

    // Reset the form after successful navigation
    resetForm();
  } catch (error) {
    console.error("Error in handleNext:", error);
    toast.add({
      title: "Navigation Error",
      description: "Failed to open the next form. Please try again.",
      color: "error",
      icon: "mdi:alert-circle",
      duration: 5000,
    });
  }
});

// Handle modal close
const handleClose = () => {
  resetForm();
  addDeadlineStore.close();
};
</script>

<template>
  <UModal
    v-model="showModal"
    title="Add Deadline"
    description="Enter the details to create a new client deadline."
    :ui="{ content: 'min-w-3xl' }"
    @close="handleClose"
  >
    <UButton icon="mdi:calendar-plus-outline" label="Add Deadline" size="xl" />

    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="mdi:calendar-plus-outline" class="h-5 w-5" />
        <span>Add Deadline - Step 1 of 2</span>
      </div>
    </template>

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
        <div class="mt-6 flex items-center justify-between">
          <UButton
            type="button"
            variant="ghost"
            size="xl"
            label="Cancel"
            icon="mdi:close"
            @click="handleClose"
            :disabled="isSubmitting"
          />

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
</template>
