<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useAuthStore } from "~/stores/auth";

// Stores
const authStore = useAuthStore();

// Form Validation Schema
const validationSchema = toTypedSchema(
  z.object({
    username: z.string().nonempty("Username is required."),
    password: z.string().nonempty("Password is required."),
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
const [username] = defineField("username");
const [password] = defineField("password");

// Computed
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const onSubmit = handleSubmit(async (values) => {
  await authStore.login({
    username: values.username,
    password: values.password,
  });
  resetForm();
});
</script>

<template>
  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div
      class="bg-white py-8 px-4 shadow rounded-lg sm:px-10 dark:bg-gray-800 dark:border dark:border-gray-700"
    >
      <form @submit.prevent="onSubmit" class="space-y-6" id="login-form">
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <div class="mt-1">
            <input
              v-model="username"
              id="username"
              name="username"
              type="username"
              autocomplete="username"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <div class="mt-1">
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <button
            :disabled="disableSubmit"
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
