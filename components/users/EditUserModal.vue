<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const alertStore = useAlertStore();
const editUserStore = useEditUserStore();
const userStore = useUserStore();
const confirmationStore = useConfirmationStore();
const authStore = useAuthStore();

// Store Refs
const { showModal, user } = storeToRefs(editUserStore);
const { user: authUser } = storeToRefs(authStore);

// State
const isActive = ref(false);

// Computed
const showStatusToggle = computed(() => {
  return user.value.id !== authUser.value.id;
});

const initialValues = computed(() => ({
  firstName: user.value?.first_name || "",
  middleName: user.value?.middle_name || "",
  lastName: user.value?.last_name || "",
  username: user.value?.username || "",
  email: user.value?.email || "",
  role: user.value?.role || "",
  password: "",
  confirmPassword: "",
}));

// Form Schema
const validationSchema = toTypedSchema(
  z
    .object({
      firstName: z.string().nonempty("First Name is required."),
      middleName: z.string().nonempty("Middle Name is required."),
      lastName: z.string().nonempty("Last Name is required."),
      username: z.string().nonempty("Username is required."),
      email: z
        .string()
        .nonempty("Email is required.")
        .email("Invalid email format."),
      role: z.string().nonempty("Role is required."),
      password: z
        .string()
        .refine((val) => val.length === 0 || val.length >= 8, {
          message: "Password must be at least 8 characters.",
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    })
);

// Form Setup
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

// Form Fields
const [firstName] = defineField("firstName");
const [middleName] = defineField("middleName");
const [lastName] = defineField("lastName");
const [username] = defineField("username");
const [email] = defineField("email");
const [role] = defineField("role");
const [password] = defineField("password");
const [confirmPassword] = defineField("confirmPassword");

// Computed
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const onSubmit = handleSubmit(async (values) => {
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch(`/api/users/${user.value.id}/`, {
      method: "PATCH",
      body: {
        first_name: values.firstName,
        middle_name: values.middleName,
        last_name: values.lastName,
        username: values.username,
        email: values.email,
        role: values.role,
        ...(values.password ? { password: values.password } : {}),
      },
    });
    alertStore.success("Success!", "Selected user successfully updated.", 3.5);
    await editUserStore.editUser(user.value.id);
    await userStore.getAllUsers();
    resetForm({ values: initialValues.value });
  } catch (error) {
    alertStore.danger("Error!", getErrorMessage(error), 3.5);
    console.error(error);
  }
});

// Watchers
watch(initialValues, () => {
  resetForm({ values: initialValues.value });
});

watch(user, () => {
  isActive.value = user.value.is_active;
});

watch(isActive, async (value, oldValue) => {
  if (value !== user.value.is_active) {
    const confirmed = await confirmationStore.confirm(
      `Are you sure you want to ${
        isActive.value ? "activate" : "deactivate"
      } this user?`
    );
    if (confirmed) {
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(
          `/api/users/${user.value.id}/toggle-active-status/`,
          {
            method: "POST",
          }
        );
        await editUserStore.editUser(user.value.id);
        alertStore.success(
          "Success!",
          `User successfully ${isActive.value ? "activated" : "deactivated"}.`,
          3.5
        );
      } catch (error) {
        alertStore.danger("Error!", getErrorMessage(error), 5);
        console.error(error);
      }
    } else {
      isActive.value = oldValue;
    }
  }
});

watch(showModal, async () => {
  if (!showModal.value) {
    await userStore.getAllUsers();
  }
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
        class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full dark:bg-gray-900"
      >
        <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h1
              class="text-2xl font-bold text-gray-900 dark:text-white"
              id="modal-title"
            >
              Edit User
            </h1>
            <button
              @click="editUserStore.close()"
              type="button"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          <form @submit.prevent="onSubmit" class="px-6 py-5 space-y-8">
            <div>
              <h3
                class="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4"
              >
                User Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label
                    for="first-name"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >First Name<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="firstName"
                    id="first-name"
                    name="first-name"
                    type="text"
                    class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p
                    v-if="errors.firstName"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.firstName }}
                  </p>
                </div>
                <div>
                  <label
                    for="middle-name"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Middle Name<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="middleName"
                    id="middle-name"
                    name="middle-name"
                    type="text"
                    class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p
                    v-if="errors.middleName"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.middleName }}
                  </p>
                </div>
                <div>
                  <label
                    for="last-name"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Last Name<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="lastName"
                    id="last-name"
                    name="last-name"
                    type="text"
                    class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p
                    v-if="errors.lastName"
                    class="mt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {{ errors.lastName }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  for="username"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Username<span class="text-red-500">*</span></label
                >
                <input
                  v-model="username"
                  id="username"
                  name="username"
                  type="text"
                  class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                />
                <p
                  v-if="errors.username"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.username }}
                </p>
              </div>
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Email<span class="text-red-500">*</span></label
                >
                <input
                  v-model="email"
                  id="email"
                  name="email"
                  type="email"
                  class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                />
                <p
                  v-if="errors.email"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.email }}
                </p>
              </div>
            </div>

            <div>
              <label
                for="role"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Role<span class="text-red-500">*</span></label
              >
              <select
                v-model="role"
                id="role"
                name="role"
                class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              <p
                v-if="errors.role"
                class="mt-1 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.role }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  for="password1"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Password<span class="text-red-500">*</span></label
                >
                <input
                  v-model="password"
                  id="password1"
                  name="password1"
                  type="password"
                  class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                />
                <p
                  v-if="errors.password"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.password }}
                </p>
              </div>
              <div>
                <label
                  for="password2"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Confirm Password<span class="text-red-500">*</span></label
                >
                <input
                  v-model="confirmPassword"
                  id="password2"
                  name="password2"
                  type="password"
                  class="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                />
                <p
                  v-if="errors.confirmPassword"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.confirmPassword }}
                </p>
              </div>
            </div>
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <!-- Toggle: Active / Inactive -->
              <div v-if="showStatusToggle" class="flex items-center space-x-4">
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Status:</span
                >
                <label
                  for="active_status"
                  class="relative inline-flex items-center cursor-pointer"
                >
                  <input
                    id="active_status"
                    type="checkbox"
                    v-model="isActive"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300 ease-in-out"
                  ></div>
                  <div
                    class="absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300 ease-in-out"
                  ></div>
                </label>
                <span
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >{{ isActive ? "Active" : "Inactive" }}</span
                >
              </div>
              <div v-else></div>

              <!-- Submit Button -->
              <button
                :disabled="disableSubmit"
                type="submit"
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Edit User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
