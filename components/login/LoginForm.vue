<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

// Stores
const authStore = useAuthStore();
const { isLoading } = storeToRefs(authStore);

// Form Validation Schema
const validationSchema = toTypedSchema(
  z.object({
    username: z.string().min(1, "Username is required.").max(150, "Username is too long."),
    password: z.string().min(1, "Password is required."),
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
  setErrors,
} = useForm({
  validationSchema,
  initialValues: {
    username: '',
    password: '',
  },
});

// Form Fields
const [username] = defineField("username");
const [password] = defineField("password");

// Computed
const disableSubmit = computed((): boolean => {
  return !formMeta.value.dirty || !formMeta.value.valid || isLoading.value;
});

// Methods
const onSubmit = handleSubmit(async (values): Promise<void> => {
  try {
    await authStore.login({
      username: values.username.trim(),
      password: values.password,
    });

    // Clear form on successful login
    resetForm();
  } catch (error: any) {
    // Handle server-side validation errors
    if (error?.data) {
      const serverErrors = error.data;

      // Handle field-specific errors
      if (serverErrors.username) {
        setErrors({ username: Array.isArray(serverErrors.username) ? serverErrors.username[0] : serverErrors.username });
      }
      if (serverErrors.password) {
        setErrors({ password: Array.isArray(serverErrors.password) ? serverErrors.password[0] : serverErrors.password });
      }

      // Handle non-field errors
      if (serverErrors.non_field_errors) {
        const nonFieldError = Array.isArray(serverErrors.non_field_errors)
          ? serverErrors.non_field_errors[0]
          : serverErrors.non_field_errors;
        setErrors({ username: nonFieldError, password: nonFieldError });
      }
    }
  }
});

// Clear errors when user starts typing
watch(username, () => {
  if (errors.value.username) {
    setErrors({ username: undefined });
  }
});

watch(password, () => {
  if (errors.value.password) {
    setErrors({ password: undefined });
  }
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
              :readonly="isLoading"
              :disabled="isLoading"
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              :class="{
                'border-red-300 dark:border-red-600': errors.username,
                'border-gray-300 dark:border-gray-600': !errors.username
              }"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.username }}
            </p>
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
              :readonly="isLoading"
              :disabled="isLoading"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              :class="{
                'border-red-300 dark:border-red-600': errors.password,
                'border-gray-300 dark:border-gray-600': !errors.password
              }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div>
          <UButton
            type="submit"
            label="Sign In"
            loading-auto
            :disabled="disableSubmit || isLoading"
            class="w-full"
            size="xl"
            :ui="{ base: 'flex justify-center' }"
          />
        </div>
      </form>
    </div>
  </div>
</template>
