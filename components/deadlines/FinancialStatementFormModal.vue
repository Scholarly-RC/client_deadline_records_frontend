<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { priorityChoices, fsrTypeChoices } from "~/constants/choices";
import { financialStatementSchema } from "~/schema/task.schema";
import { TASK_CATEGORIES } from "~/constants/choices";

const emit = defineEmits(["clearAddDeadlineForm"]);

// Stores
const userStore = useUserStore();
const clientStore = useClientStore();
const addDeadlineStore = useAddDeadlineStore();
const financialStatementModalStore = useFinancialStatementModalStore();

// Store refs
const { users } = storeToRefs(userStore);
const { activeClients } = storeToRefs(clientStore);
const { showModal } = storeToRefs(financialStatementModalStore);
const { selectedClient } = storeToRefs(addDeadlineStore);

// Form initial values
const initialValues = computed(() => ({
  needed_data: "",
  fsr_type: "",
  assigned_to: null,
  priority: "medium",
  engagement_date: "",
  deadline: "",
}));

// Form validation schema
const validationSchema = toTypedSchema(financialStatementSchema);

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
const [needed_data] = defineField("needed_data");
const [fsr_type] = defineField("fsr_type");
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

  if (!selectedClient) {
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
    const taskService = useTaskService();
    const response = await taskService.createTask({
      client: selectedClient.value,
      category: TASK_CATEGORIES.FINANCIAL_STATEMENT,
      type: values.fsr_type,
      needed_data: values.needed_data,
      period_covered: values.period_covered,
      assigned_to: values.assigned_to,
      priority: values.priority,
      engagement_date: values.engagement_date,
      deadline: values.deadline,
      remarks: values.remarks || null,
      date_complied: values.date_complied || null,
      completion_date: values.completion_date || null,
      last_update: new Date().toISOString(),
    });

    toast.add({
      title: "Success",
      description: "Financial Statement task has been created successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 3000,
    });

    // Reset form and close modal
    resetForm();
    financialStatementModalStore.close();
    emit("clearAddDeadlineForm");
  } catch (error) {
    console.error("Error creating financial statement task:", error);
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
  financialStatementModalStore.close();
  addDeadlineStore.open();
};
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Financial Statement Task Details - Step 2 of 2"
    :description="`Creating financial statement task for ${selectedClientName}`"
    :ui="{ content: 'min-w-4xl max-w-6xl' }"
    :close="{ onClick: () => handleClose() }"
  >
    <template #body>
      <UForm :state="values" @submit.prevent="onSubmit" class="space-y-8">
        <!-- Task Information Section -->
        <div class="bg-primary-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Task Information
          </h3>
          <div class="space-y-6">
            <!-- Needed Data -->
            <UFormField
              label="Needed Data"
              name="needed_data"
              :error="errors.needed_data"
              required
              help="Provide a clear description of the needed data for the financial statement task"
            >
              <UTextarea
                v-model="needed_data"
                placeholder="Enter detailed needed data"
                :rows="4"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>
          </div>
        </div>

        <!-- FSR Details Section -->
        <div class="bg-primary-50 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">FSR Details</h3>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <UFormField
              label="Type"
              name="fsr_type"
              :error="errors.fsr_type"
              required
            >
              <USelect
                v-model="fsr_type"
                :items="fsrTypeChoices"
                placeholder="Select FSR Type"
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
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            label="Create Financial Statement Task"
            size="lg"
            :loading="isSubmitting"
            :disabled="disableSubmit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
