<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  TASK_CATEGORIES,
  categoryChoices,
  priorityChoices,
  taxCaseCategoryChoices,
  birFormChoices,
  typeOfTaxCaseChoices,
  fsrTypeChoices,
  CATEGORY_FIELDS,
} from "~/constants/choices";
import {
  getSchemaForCategory,
  getDefaultValuesForCategory,
  getFieldsForCategory,
  isFieldRequiredForCategory,
} from "~/schema/task.schema";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  editTask: {
    type: Object,
    default: null,
  },
  selectedClient: {
    type: Number,
    default: null,
  },
  selectedCategory: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["close", "success", "clearAddDeadlineForm"]);

// Stores
const userStore = useUserStore();
const clientStore = useClientStore();
const taskStore = useTaskStore();

// Store refs
const { users } = storeToRefs(userStore);
const { activeClients } = storeToRefs(clientStore);

// Reactive form state
const selectedCategory = ref(
  props.selectedCategory || props.editTask?.category || null
);

// Computed for modal open state
const modalOpen = computed({
  get: () => props.isOpen,
  set: (value) => {
    if (!value) {
      emit("close");
    }
  },
});

// Watch for category changes to update form validation
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    updateFormValidation(newCategory);
  }
});

// Form initial values - computed based on category and edit mode
const initialValues = computed(() => {
  if (props.editTask) {
    return { ...props.editTask };
  }

  if (selectedCategory.value) {
    return {
      ...getDefaultValuesForCategory(selectedCategory.value),
      client: props.selectedClient,
    };
  }

  return {
    client: props.selectedClient,
    category: null,
    description: "",
    assigned_to: null,
    priority: "medium",
    deadline: "",
    remarks: "",
    date_complied: null,
    completion_date: null,
  };
});

// Dynamic validation schema
const validationSchema = ref(null);

const updateFormValidation = (category) => {
  if (category) {
    validationSchema.value = toTypedSchema(getSchemaForCategory(category));
  }
};

// Initialize validation schema
if (selectedCategory.value) {
  updateFormValidation(selectedCategory.value);
}

// Form setup
const {
  values,
  errors,
  defineField,
  meta: formMeta,
  handleSubmit,
  isSubmitting,
  resetForm,
  setValues,
} = useForm({
  initialValues: initialValues.value,
  validationSchema: validationSchema.value,
});

// Base form fields
const [client] = defineField("client");
const [category] = defineField("category");
const [description] = defineField("description");
const [assigned_to] = defineField("assigned_to");
const [priority] = defineField("priority");
const [deadline] = defineField("deadline");
const [remarks] = defineField("remarks");
const [date_complied] = defineField("date_complied");
const [completion_date] = defineField("completion_date");

// Category-specific fields
const [steps] = defineField("steps");
const [requirements] = defineField("requirements");
const [type] = defineField("type");
const [needed_data] = defineField("needed_data");
const [tax_category] = defineField("tax_category");
const [tax_type] = defineField("tax_type");
const [form] = defineField("form");
const [working_paper] = defineField("working_paper");
const [tax_payable] = defineField("tax_payable");
const [last_followup] = defineField("last_followup");
const [area] = defineField("area");
const [period_covered] = defineField("period_covered");
const [engagement_date] = defineField("engagement_date");

// Computed values
const userItems = computed(() => {
  return users.value.map((user) => ({
    label: user.fullname,
    value: user.id,
  }));
});

const clientItems = computed(() => {
  return activeClients.value.map((client) => ({
    label: client.name,
    value: client.id,
  }));
});

const selectedClientName = computed(() => {
  if (!client.value) return "";
  const clientObj = activeClients.value.find((c) => c.id === client.value);
  return clientObj ? clientObj.name : "";
});

const disableSubmit = computed(() => {
  return !formMeta.value.valid || isSubmitting.value || !category.value;
});

const isEditMode = computed(() => !!props.editTask);

const modalTitle = computed(() => {
  if (isEditMode.value) {
    return "Edit Task";
  }
  return selectedCategory.value
    ? `Create ${getCategoryLabel(selectedCategory.value)} Task`
    : "Create Task";
});

const modalDescription = computed(() => {
  if (selectedClientName.value) {
    return `${isEditMode.value ? "Editing" : "Creating"} task for ${
      selectedClientName.value
    }`;
  }
  return isEditMode.value ? "Edit task details" : "Create a new task";
});

// Helper function to get category label
const getCategoryLabel = (categoryValue) => {
  const choice = categoryChoices.find((c) => c.value === categoryValue);
  return choice ? choice.label : categoryValue;
};

// Check if field should be shown for current category
const shouldShowField = (fieldName) => {
  if (!category.value) return false;
  const categoryFields = getFieldsForCategory(category.value);
  return categoryFields.includes(fieldName);
};

// Check if field is required for current category
const isFieldRequired = (fieldName) => {
  if (!category.value) return false;
  return isFieldRequiredForCategory(fieldName, category.value);
};

// Handle category change
const handleCategoryChange = (newCategory) => {
  selectedCategory.value = newCategory;
  category.value = newCategory;

  // Update form validation schema
  updateFormValidation(newCategory);

  // Update form values with category defaults
  const defaultValues = getDefaultValuesForCategory(newCategory);
  setValues({
    ...values,
    ...defaultValues,
    category: newCategory,
    client: client.value, // Preserve client selection
  });
};

// Form submission handler
const onSubmit = handleSubmit(async (formValues) => {
  const toast = useToast();

  if (!client.value) {
    toast.add({
      title: "Error",
      description: "No client selected. Please select a client.",
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
    return;
  }

  try {
    // Clean up form values - remove null/undefined category-specific fields
    const cleanedValues = { ...formValues };

    // Only include category-specific fields that are relevant
    if (category.value) {
      const relevantFields = getFieldsForCategory(category.value);
      Object.keys(cleanedValues).forEach((key) => {
        if (
          ![
            "client",
            "category",
            "description",
            "assigned_to",
            "priority",
            "deadline",
            "remarks",
            "date_complied",
            "completion_date",
          ].includes(key) &&
          !relevantFields.includes(key)
        ) {
          delete cleanedValues[key];
        }
      });
    }

    if (isEditMode.value) {
      await taskStore.updateTask(props.editTask.id, cleanedValues);
      toast.add({
        title: "Success",
        description: "Task updated successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
        duration: 3000,
      });
    } else {
      await taskStore.createTask({
        ...cleanedValues,
        last_update: new Date().toISOString(),
      });
      toast.add({
        title: "Success",
        description: "Task created successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
        duration: 3000,
      });
    }

    // Reset form and close modal
    resetForm();
    emit("success");
    emit("clearAddDeadlineForm");
    handleClose();
  } catch (error) {
    console.error("Error saving task:", error);
    toast.add({
      title: isEditMode.value ? "Update Failed" : "Creation Failed",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  }
});

const handleClose = () => {
  resetForm();
  emit("close");
};

// Initialize form when editing
onMounted(() => {
  if (props.editTask) {
    selectedCategory.value = props.editTask.category;
    updateFormValidation(props.editTask.category);
    // Set form values for edit mode
    setValues({
      ...props.editTask,
    });
  } else if (props.selectedCategory) {
    // Set initial category if provided
    selectedCategory.value = props.selectedCategory;
    category.value = props.selectedCategory;
    updateFormValidation(props.selectedCategory);
    // Set default values for the category
    const defaultValues = getDefaultValuesForCategory(props.selectedCategory);
    setValues({
      ...defaultValues,
      client: props.selectedClient,
    });
  }
});
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="modalTitle"
    :description="modalDescription"
    class="max-w-[90vw]"
    :close="false"
  >
    <template #body>
      <UForm
        id="unified-task-form"
        :state="values"
        @submit.prevent="onSubmit"
        class="space-y-8"
      >
        <!-- Basic Task Information -->
        <div class="bg-primary-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Task Information
          </h3>
          <div class="space-y-4">
            <!-- Client Selection (if not pre-selected) -->
            <UFormField
              v-if="!props.selectedClient"
              label="Client"
              name="client"
              :error="errors.client"
              required
            >
              <USelect
                v-model="client"
                :items="clientItems"
                value-key="value"
                placeholder="Select Client"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Category Selection (if not pre-selected) -->
            <UFormField
              v-if="!props.selectedCategory || isEditMode"
              label="Task Category"
              name="category"
              :error="errors.category"
              required
            >
              <USelect
                v-model="category"
                :items="categoryChoices"
                value-key="value"
                placeholder="Select Category"
                class="w-full"
                :disabled="isSubmitting"
                @update:model-value="handleCategoryChange"
              />
            </UFormField>

            <!-- Description -->
            <UFormField
              label="Task Description"
              name="description"
              :error="errors.description"
              required
              help="Provide a clear description of the task"
            >
              <UTextarea
                v-model="description"
                placeholder="Enter detailed task description"
                :rows="3"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Priority -->
            <UFormField
              label="Priority"
              name="priority"
              :error="errors.priority"
              required
            >
              <USelect
                v-model="priority"
                :items="priorityChoices"
                value-key="value"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Assignment, Deadline and Engagement Date -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <UFormField
                label="Assigned To"
                name="assigned_to"
                :error="errors.assigned_to"
                required
              >
                <USelect
                  v-model="assigned_to"
                  :items="userItems"
                  value-key="value"
                  placeholder="Select User"
                  class="w-full"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <UFormField
                v-if="shouldShowField('engagement_date')"
                label="Engagement Date"
                name="engagement_date"
                :error="errors.engagement_date"
                :required="isFieldRequired('engagement_date')"
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
        </div>

        <!-- Category-Specific Fields -->
        <div v-if="category" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ getCategoryLabel(category) }} Details
          </h3>
          <div class="space-y-4">
            <!-- Compliance Fields -->
            <template v-if="category === TASK_CATEGORIES.COMPLIANCE">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <UFormField
                  label="Steps"
                  name="steps"
                  :error="errors.steps"
                  :required="isFieldRequired('steps')"
                  help="Office / Steps"
                >
                  <UTextarea
                    v-model="steps"
                    placeholder="Enter required steps"
                    :rows="4"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField
                  label="Requirements"
                  name="requirements"
                  :error="errors.requirements"
                  :required="isFieldRequired('requirements')"
                  help="Requirements / Forms to comply"
                >
                  <UTextarea
                    v-model="requirements"
                    placeholder="Enter requirements"
                    :rows="4"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>
              </div>
            </template>

            <!-- Financial Statement Fields -->
            <template v-if="category === TASK_CATEGORIES.FINANCIAL_STATEMENT">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <UFormField
                  label="Type"
                  name="type"
                  :error="errors.type"
                  :required="isFieldRequired('type')"
                >
                  <USelect
                    v-model="type"
                    :items="fsrTypeChoices"
                    value-key="value"
                    placeholder="Select Type"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField
                  label="Needed Data"
                  name="needed_data"
                  :error="errors.needed_data"
                  :required="isFieldRequired('needed_data')"
                >
                  <UTextarea
                    v-model="needed_data"
                    placeholder="Enter needed data"
                    :rows="3"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>
              </div>
            </template>

            <!-- Tax Case Fields -->
            <template v-if="category === TASK_CATEGORIES.TAX_CASE">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <UFormField
                  label="Tax Category"
                  name="tax_category"
                  :error="errors.tax_category"
                  :required="isFieldRequired('tax_category')"
                >
                  <USelect
                    v-model="tax_category"
                    :items="taxCaseCategoryChoices"
                    value-key="value"
                    placeholder="Select Category"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField
                  label="Tax Type"
                  name="tax_type"
                  :error="errors.tax_type"
                  :required="isFieldRequired('tax_type')"
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

                <UFormField
                  label="BIR Form"
                  name="form"
                  :error="errors.form"
                  :required="isFieldRequired('form')"
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

                <UFormField
                  label="Working Paper"
                  name="working_paper"
                  :error="errors.working_paper"
                  :required="isFieldRequired('working_paper')"
                >
                  <UInput
                    v-model="working_paper"
                    placeholder="Enter working paper reference"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField
                  label="Tax Payable"
                  name="tax_payable"
                  :error="errors.tax_payable"
                  :required="isFieldRequired('tax_payable')"
                >
                  <UInput
                    v-model="tax_payable"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField
                  label="Last Follow-up"
                  name="last_followup"
                  :error="errors.last_followup"
                >
                  <UInput
                    v-model="last_followup"
                    type="date"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>
              </div>
            </template>

            <!-- Miscellaneous Fields -->
            <template v-if="category === TASK_CATEGORIES.MISCELLANEOUS">
              <UFormField
                label="Area"
                name="area"
                :error="errors.area"
                :required="isFieldRequired('area')"
                help="Task area/domain"
              >
                <UInput
                  v-model="area"
                  placeholder="Enter task area"
                  class="w-full"
                  :disabled="isSubmitting"
                />
              </UFormField>
            </template>

            <!-- Common Fields for Most Categories -->
            <template v-if="shouldShowField('period_covered')">
              <UFormField
                label="Period Covered"
                name="period_covered"
                :error="errors.period_covered"
                :required="isFieldRequired('period_covered')"
              >
                <UInput
                  v-model="period_covered"
                  placeholder="Enter period covered (e.g., 2024 Q1)"
                  class="w-full"
                  :disabled="isSubmitting"
                />
              </UFormField>
            </template>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Additional Information
          </h3>
          <div class="space-y-4">
            <!-- Remarks -->
            <UFormField
              label="Remarks"
              name="remarks"
              :error="errors.remarks"
              help="Optional additional notes"
            >
              <UTextarea
                v-model="remarks"
                placeholder="Enter any additional remarks or notes"
                :rows="3"
                class="w-full"
                :disabled="isSubmitting"
              />
            </UFormField>

            <!-- Completion Fields (for edit mode) -->
            <template v-if="isEditMode">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <UFormField
                  label="Date Complied"
                  name="date_complied"
                  :error="errors.date_complied"
                >
                  <UInput
                    v-model="date_complied"
                    type="date"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>

                <UFormField
                  label="Completion Date"
                  name="completion_date"
                  :error="errors.completion_date"
                >
                  <UInput
                    v-model="completion_date"
                    type="date"
                    class="w-full"
                    :disabled="isSubmitting"
                  />
                </UFormField>
              </div>
            </template>
          </div>
        </div>
      </UForm>
    </template>

    <template #footer="{ close }">
      <div class="w-full flex justify-end space-x-3">
        <UButton
          color="gray"
          variant="ghost"
          @click="handleClose"
          :disabled="isSubmitting"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          form="unified-task-form"
          :loading="isSubmitting"
          :disabled="disableSubmit"
        >
          {{ isEditMode ? "Update" : "Create" }} Task
        </UButton>
      </div>
    </template>
  </UModal>
</template>
