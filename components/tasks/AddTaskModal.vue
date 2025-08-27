<script setup>
import { ref, computed, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { categoryChoices } from "~/constants/choices";
import UnifiedTaskFormModal from "~/components/tasks/UnifiedTaskFormModal.vue";

// Define emits
const emit = defineEmits(["success"]);

// Stores
const clientStore = useClientStore();
const userStore = useUserStore();

// State
const showAddTaskModal = ref(false);
const showUnifiedTaskFormModal = ref(false);
const selectedClient = ref(null);
const selectedCategory = ref(null);

// Fetch initial data
onMounted(async () => {
  await clientStore.getAllClients();
  await userStore.getUserChoices();
});

const { activeClients } = storeToRefs(clientStore);

// Form validation
const validationSchema = toTypedSchema(
  z.object({
    client: z.number().min(1, "Client is required."),
    category: z.string().nonempty("Category is required."),
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
} = useForm({
  validationSchema,
  initialValues: {
    client: null,
    category: "",
  },
});

const [client, clientAttrs] = defineField("client");
const [category, categoryAttrs] = defineField("category");

const clientItems = computed(() =>
  activeClients.value.map((client) => ({
    label: client.name,
    id: client.id,
  }))
);

const disableSubmit = computed(() => {
  return !formMeta.value.valid || isSubmitting.value;
});

const openAddTaskModal = () => {
  resetForm();
  showAddTaskModal.value = true;
};

const handleNext = handleSubmit((formValues) => {
  selectedClient.value = formValues.client;
  selectedCategory.value = formValues.category;
  showAddTaskModal.value = false;
  showUnifiedTaskFormModal.value = true;
});

const handleUnifiedModalClose = () => {
  showUnifiedTaskFormModal.value = false;
  selectedClient.value = null;
  selectedCategory.value = null;
};

const handleUnifiedModalSuccess = () => {
  handleUnifiedModalClose();
  // The toast is already shown by the UnifiedTaskFormModal
  // Emit success event to parent component
  emit("success");
};
</script>

<template>
  <div>
    <UButton
      @click="openAddTaskModal"
      icon="i-heroicons-plus-circle"
      label="Add Task"
      size="md"
    />

    <UModal v-model="showAddTaskModal" prevent-close>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Add Task - Step 1 of 2</h2>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showAddTaskModal = false"
            />
          </div>
          <p class="text-sm text-gray-500">
            Select a client and a category to create a new task.
          </p>
        </template>

        <UForm :state="values" @submit="handleNext" class="space-y-4">
          <UFormGroup
            label="Client"
            name="client"
            :error="errors.client"
            required
          >
            <USelectMenu
              v-model="client"
              v-bind="clientAttrs"
              :options="clientItems"
              value-attribute="id"
              option-attribute="label"
              placeholder="Select a client"
              searchable
            />
          </UFormGroup>

          <UFormGroup
            label="Category"
            name="category"
            :error="errors.category"
            required
          >
            <URadioGroup
              v-model="category"
              v-bind="categoryAttrs"
              :options="categoryChoices"
              :ui="{ fieldset: 'space-y-2' }"
            />
          </UFormGroup>

          <div class="flex justify-end pt-4">
            <UButton
              type="submit"
              label="Next"
              :loading="isSubmitting"
              :disabled="disableSubmit"
            />
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UnifiedTaskFormModal
      :is-open="showUnifiedTaskFormModal"
      :selected-client="selectedClient"
      :selected-category="selectedCategory"
      @close="handleUnifiedModalClose"
      @success="handleUnifiedModalSuccess"
    />
  </div>
</template>
