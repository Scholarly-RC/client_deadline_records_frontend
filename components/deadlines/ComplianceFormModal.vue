<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { statusChoices, priorityChoices } from "~/constants/choices";
import { z } from "zod";

// Stores
const userStore = useUserStore();
const clientStore = useClientStore();
const complianceModalStore = useComplianceModalStore();

// Store refs
const { users } = storeToRefs(userStore);
const { activeClients } = storeToRefs(clientStore);
const { showModal, selectedClientId } = storeToRefs(complianceModalStore);

// Computed client name for display
const selectedClientName = computed(() => {
  if (!selectedClientId.value) return "";
  const client = activeClients.value.find(
    (c) => c.id === selectedClientId.value
  );
  return client ? client.name : "";
});

// Form initial values
const initialValues = computed(() => ({
  description: "",
  steps: "",
  requirements: "",
  status: "NOT_YET_STARTED",
  period_covered: "",
  assigned_to: 0,
  priority: "MEDIUM",
  engagement_date: "",
  deadline: "",
  remarks: "",
  date_complied: "",
  completion_date: "",
}));

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    description: z.string().nonempty("Description is required."),
    steps: z.string().nonempty("Steps are required."),
    requirements: z.string().nonempty("Requirements are required."),
    status: z.string().nonempty("Status is required."),
    period_covered: z.string().nonempty("Period covered is required."),
    assigned_to: z.number().min(1, "Assigned to is required."),
    priority: z.string().nonempty("Priority is required."),
    engagement_date: z.string().nonempty("Engagement date is required."),
    deadline: z.string().nonempty("Deadline is required."),
    remarks: z.string().optional(),
    date_complied: z.string().optional(),
    completion_date: z.string().optional(),
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
const [description] = defineField("description");
const [steps] = defineField("steps");
const [requirements] = defineField("requirements");
const [status] = defineField("status");
const [period_covered] = defineField("period_covered");
const [assigned_to] = defineField("assigned_to");
const [priority] = defineField("priority");
const [engagement_date] = defineField("engagement_date");
const [deadline] = defineField("deadline");
const [remarks] = defineField("remarks");
const [date_complied] = defineField("date_complied");
const [completion_date] = defineField("completion_date");

// Computed items for user select
const userItems = computed(() => {
  return users.value.map((user) => ({
    label: user.name,
    id: user.id,
  }));
});

// Disable submit button
const disableSubmit = computed(() => {
  return !formMeta.value.valid || isSubmitting.value;
});

// Helper function to get error message
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  const toast = useToast();

  if (!selectedClientId.value) {
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
    const response = await $apiFetch("/api/compliance/", {
      method: "POST",
      body: {
        client_id: selectedClientId.value,
        description: values.description,
        steps: values.steps,
        requirements: values.requirements,
        status: values.status,
        period_covered: values.period_covered,
        assigned_to_id: values.assigned_to,
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
      description: "Compliance task has been created successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 3000,
    });

    // Reset form and close modal
    resetForm();
    complianceModalStore.close();

    // Optionally refresh data or emit event to parent
    // You might want to refresh the compliance list here
  } catch (error) {
    console.error("Error creating compliance task:", error);
    toast.add({
      title: "Creation Failed",
      description: getErrorMessage(error),
      color: "error",
      icon: "mdi:close-box-multiple",
      duration: 5000,
    });
  }
});

// Handle modal close
const handleClose = () => {
  resetForm();
  complianceModalStore.close();
};

// Handle back button - reopen the first modal
const handleBack = () => {
  resetForm();
  complianceModalStore.close();
  // Small delay to ensure modal closes properly
  nextTick(() => {
    // Reopen the add deadline modal
    const addDeadlineStore = useAddDeadlineStore();
    addDeadlineStore.open();
  });
};
</script>

<template>
  <UModal
    :model-value="showModal"
    title="Compliance Task Details"
    :description="`Creating compliance task for ${selectedClientName}`"
    :ui="{ content: 'min-w-4xl max-w-6xl' }"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="mdi:clipboard-check-outline" class="h-5 w-5" />
        <div>
          <div class="font-medium">Compliance Task Details - Step 2 of 2</div>
          <div class="text-sm text-gray-500" v-if="selectedClientName">
            Client: {{ selectedClientName }}
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <UForm :state="values" @submit.prevent="onSubmit" class="space-y-6">
        <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
          <!-- Description -->
          <div class="sm:col-span-6">
            <UFormField
              label="Task Description"
              name="description"
              :error="errors.description"
              required
              help="Provide a clear description of the compliance task"
            >
              <UTextarea
                v-model="description"
                placeholder="Enter detailed task description"
                :rows="3"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Steps -->
          <div class="sm:col-span-3">
            <UFormField
              label="Required Steps"
              name="steps"
              :error="errors.steps"
              required
              help="List the steps needed to complete this task"
            >
              <UTextarea
                v-model="steps"
                placeholder="Enter required steps"
                :rows="3"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Requirements -->
          <div class="sm:col-span-3">
            <UFormField
              label="Requirements"
              name="requirements"
              :error="errors.requirements"
              required
              help="Specify documents or conditions needed"
            >
              <UTextarea
                v-model="requirements"
                placeholder="Enter requirements"
                :rows="3"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Status -->
          <div class="sm:col-span-2">
            <UFormField
              label="Status"
              name="status"
              :error="errors.status"
              required
            >
              <USelect
                v-model="status"
                :items="statusChoices"
                placeholder="Select Status"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Priority -->
          <div class="sm:col-span-2">
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

          <!-- Assigned To -->
          <div class="sm:col-span-2">
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
          </div>

          <!-- Period Covered -->
          <div class="sm:col-span-3">
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
          </div>

          <!-- Engagement Date -->
          <div class="sm:col-span-3">
            <UFormField
              label="Engagement Date"
              name="engagement_date"
              :error="errors.engagement_date"
              required
              help="When the task engagement begins"
            >
              <UInput
                v-model="engagement_date"
                type="date"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Deadline -->
          <div class="sm:col-span-2">
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

          <!-- Date Complied (Optional) -->
          <div class="sm:col-span-2">
            <UFormField
              label="Date Complied"
              name="date_complied"
              :error="errors.date_complied"
              help="Leave blank if not yet complied"
            >
              <UInput
                v-model="date_complied"
                type="date"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Completion Date (Optional) -->
          <div class="sm:col-span-2">
            <UFormField
              label="Completion Date"
              name="completion_date"
              :error="errors.completion_date"
              help="Leave blank if not completed"
            >
              <UInput
                v-model="completion_date"
                type="date"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>

          <!-- Remarks -->
          <div class="sm:col-span-6">
            <UFormField
              label="Additional Remarks"
              name="remarks"
              :error="errors.remarks"
              help="Any additional notes or comments (optional)"
            >
              <UTextarea
                v-model="remarks"
                placeholder="Enter any additional remarks (optional)"
                :rows="2"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </div>

        <!-- Form actions -->
        <div class="mt-8 flex items-center justify-between">
          <div class="flex gap-2">
            <UButton
              type="button"
              variant="ghost"
              size="xl"
              label="Back"
              icon="mdi:arrow-left"
              @click="handleBack"
              :disabled="isSubmitting"
            />
            <UButton
              type="button"
              variant="outline"
              size="xl"
              label="Cancel"
              icon="mdi:close"
              @click="handleClose"
              :disabled="isSubmitting"
            />
          </div>

          <UButton
            type="submit"
            icon="mdi:content-save"
            label="Create Compliance Task"
            size="xl"
            :loading="isSubmitting"
            :disabled="disableSubmit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
