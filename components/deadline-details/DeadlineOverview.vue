<script setup>
import { getPriorityLabel } from "@/utils/getPriorityLabel";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Components
import PageHeader from "../ui/PageHeader.vue";
import WorkUpdatesTable from "../work-updates/WorkUpdatesTable.vue";
import ClientDocuments from "../client-documents/ClientDocuments.vue";

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const alertStore = useAlertStore();
const deadlineStore = useDeadlineStore();
const viewDeadlineStore = useViewDeadlineStore();
const { deadline, isLoading } = storeToRefs(viewDeadlineStore);
const addWorkUpdateStore = useAddWorkUpdateStore();
const userStore = useUserStore();
const { users } = storeToRefs(userStore);

// Reactive Variables
const editMode = ref(false);

// Form initial values
const initialValues = computed(() => ({
  dueDate: deadline.value?.due_date || "",
  priority: deadline.value?.priority || "",
  assignedTo: deadline.value?.assigned_to.id || "",
}));

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    dueDate: z.string().nonempty("Due Date is required."),
    priority: z.number(),
    assignedTo: z.number().min(1, "Assigned To is required."),
  })
);

// Toggle edit mode
const toggleEditMode = () => {
  editMode.value = !editMode.value;

  if (!editMode.value) {
    resetForm();
  }
};

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
const [dueDate] = defineField("dueDate");
const [priority] = defineField("priority");
const [assignedTo] = defineField("assignedTo");

// Disable submit button
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(
      `/api/client-deadlines/${deadline.value.id}/`,
      {
        method: "PATCH",
        body: {
          due_date: values.dueDate,
          priority: values.priority,
          assigned_to_id: values.assignedTo,
        },
      }
    );
    await viewDeadlineStore.getDeadline(deadline.value.id);
    toggleEditMode();
    alertStore.success(
      "Deadline Updated",
      "The deadline has been updated successfully.",
      3.5
    );
  } catch (error) {
    alertStore.danger("Update Failed", getErrorMessage(error), 3.5);
    console.error(error);
  }
});

// Delete confirmation
const confirmationStore = useConfirmationStore();

const deleteConfirmation = async () => {
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this client deadline?"
  );

  if (confirmed) {
    try {
      const { $apiFetch } = useNuxtApp();
      const response = await $apiFetch(
        `/api/client-deadlines/${deadline.value.id}/`,
        {
          method: "DELETE",
        }
      );
      await deadlineStore.getAllDeadlines();
      await navigateTo("/deadlines");
      alertStore.success(
        "Deadline Deleted",
        "The client deadline has been removed successfully.",
        3.5
      );
    } catch (error) {
      alertStore.danger(
        "Deletion Failed",
        "Could not delete the deadline. " + getErrorMessage(error),
        5
      );
      console.error(error);
    }
  }
};

// Watchers
watch(deadline, () => {
  resetForm({ values: initialValues.value });
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Deadline Details" />

    <!-- Content -->
    <main class="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900 space-y-6">
      <div v-if="deadline">
        <!-- Client Info and Edit Button -->
        <div class="flex items-center gap-1 justify-between">
          <template v-if="isLoading">
            <div
              class="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          </template>
          <template v-else>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ deadline.client.name }} - {{ deadline.deadline_type.name }}
            </h2>
          </template>
          <div class="flex flex-col lg:flex-row gap-2">
            <div v-if="isAdmin" class="flex flex-row gap-2 justify-evenly">
              <button
                v-if="editMode & !disableSubmit"
                @click="onSubmit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                @click="toggleEditMode"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {{ editMode ? "Close" : "Edit" }}
              </button>
              <button
                @click="deleteConfirmation"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
            <button
              @click="addWorkUpdateStore.open()"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Add Work Update
            </button>
          </div>
        </div>
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Due Date -->
          <div
            class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Due Date
                </p>
                <div>
                  <input
                    v-if="editMode"
                    v-model="dueDate"
                    type="date"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                  />
                  <template v-else>
                    <div v-if="isLoading" class="mt-1">
                      <div
                        class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      ></div>
                    </div>
                    <p
                      v-else
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {{ deadline.due_date }}
                    </p>
                  </template>
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Priority -->
          <div
            class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Priority
                </p>
                <div>
                  <select
                    v-if="editMode"
                    v-model="priority"
                    class="mt-1 block w-full rounded-md appearance-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                  >
                    <option :value="1">Lowest</option>
                    <option :value="2">Low</option>
                    <option :value="3">Medium</option>
                    <option :value="4">High</option>
                    <option :value="5">Highest</option>
                  </select>
                  <template v-else>
                    <div v-if="isLoading" class="mt-1">
                      <div
                        class="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      ></div>
                    </div>
                    <p
                      v-else
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {{ getPriorityLabel(deadline.priority) }}
                    </p>
                  </template>
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.658-1.14 1.106-2.033L13.106 4.993c-.527-.84-1.686-.84-2.212 0L3.976 16.967c-.552.893.052 2.033 1.106 2.033z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div
            class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <div>
                  <template v-if="isLoading">
                    <div class="mt-1">
                      <div
                        class="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      ></div>
                    </div>
                  </template>
                  <p
                    v-else
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {{ $convertToTitleCase(deadline.status) }}
                  </p>
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 4v8m0 4h.01"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Assignee -->
          <div
            class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assignee
                </p>
                <div>
                  <select
                    v-if="editMode"
                    v-model="assignedTo"
                    class="mt-1 block w-full rounded-md appearance-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:text-white"
                  >
                    <option
                      v-for="user in users"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.fullname }}
                    </option>
                  </select>
                  <template v-else>
                    <div v-if="isLoading" class="mt-1">
                      <div
                        class="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      ></div>
                    </div>
                    <p
                      v-else
                      class="text-lg font-semibold capitalize text-gray-900 dark:text-white"
                    >
                      {{ deadline.assigned_to.fullname }}
                    </p>
                  </template>
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 10-6 0 3 3 0 006 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </form>
        <WorkUpdatesTable />
        <ClientDocuments />
      </div>
    </main>
  </div>
</template>
