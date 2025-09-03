<script setup lang="ts">
// Components
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const addUserStore = useAddUserStore();
const { showModal } = storeToRefs(addUserStore);
const userStore = useUserStore();

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
        .nonempty("Password is required.")
        .min(8, "Password must be at least 8 characters."),
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
  const toast = useToast();
  try {
    const { $apiFetch } = useNuxtApp();
    const response = await $apiFetch("/api/users/", {
      method: "POST",
      body: {
        first_name: values.firstName,
        middle_name: values.middleName,
        last_name: values.lastName,
        username: values.username,
        email: values.email,
        role: values.role,
        password: values.password,
      },
    });

    // Reset to first page and refresh the user list
    await userStore.setPage(1);

    // Close modal and reset form
    addUserStore.close();
    resetForm();

    toast.add({
      title: "User Created",
      description: "New user account has been created successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 2000,
    });
  } catch (error) {
    toast.add({
      title: "User Creation Failed",
      description: `Could not create user account. ${getErrorMessage(error as any)}`,
      color: "error",
      icon: "mdi:close-box-multiple",
      duration: 5000,
    });
    console.error(error);
  }
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Add New User"
    description="Fill in the required details to create a new user account."
    :ui="{ content: 'min-w-3xl' }"
  >
    <template #body>
      <form @submit.prevent="onSubmit" class="space-y-8">
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

        <!-- Submit Button Area -->
        <div class="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <UButton
            type="submit"
            :disabled="disableSubmit"
            :loading="isSubmitting"
            label="Save User"
            size="lg"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>
