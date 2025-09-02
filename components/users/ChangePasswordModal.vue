<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { User } from '~/types/entities'

// Stores
const changePasswordStore = useChangePasswordStore();
const userStore = useUserStore();
const authStore = useAuthStore();

// Store Refs
const { showModal, user } = storeToRefs(changePasswordStore);
const { user: authUser } = storeToRefs(authStore);

// Computed
const isCurrentUserAdmin = computed(() => authUser.value?.role === 'admin');

// Form Schema
const validationSchema = computed(() => toTypedSchema(
  z
    .object({
      currentPassword: isCurrentUserAdmin.value
        ? z.string().optional()
        : z.string().nonempty("Current password is required."),
      newPassword: z
        .string()
        .nonempty("New password is required.")
        .min(8, "Password must be at least 8 characters."),
      confirmPassword: z.string().nonempty("Please confirm your new password."),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    })
));

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
  validationSchema: validationSchema.value,
});

// Form Fields
const [currentPassword] = defineField("currentPassword");
const [newPassword] = defineField("newPassword");
const [confirmPassword] = defineField("confirmPassword");

// Computed
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

// Methods
const onSubmit = handleSubmit(async (values) => {
  if (!user.value) return

  const toast = useToast();
  try {
    const { $apiFetch } = useNuxtApp();
    const body: any = {
      password: values.newPassword,
    };

    // Only include current_password if the user is not an admin
    if (!isCurrentUserAdmin.value) {
      body.current_password = values.currentPassword;
    }

    const response = await $apiFetch(`/api/users/${user.value.id}/`, {
      method: "PATCH",
      body,
    });
    toast.add({
      title: "Password Changed",
      description: "User password has been updated successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 2000,
    });
    changePasswordStore.close();
    resetForm();
  } catch (error) {
    toast.add({
      title: "Password Change Failed",
      description: `Could not update password. ${getErrorMessage(error as any)}`,
      color: "error",
      icon: "mdi:close-box-multiple",
      duration: 5000,
    });
    console.error(error);
  }
});

// Watchers
watch(showModal, () => {
  if (!showModal.value) {
    resetForm();
  }
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Change Password"
    description="Update the user's password below."
    :ui="{ content: 'min-w-md' }"
  >
    <template #body>
      <form @submit.prevent="onSubmit" id="change-password-form">
        <div class="space-y-4">
          <div v-if="!isCurrentUserAdmin">
            <label
              for="current-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Current Password <span class="text-red-500">*</span>
            </label>
            <input
              v-model="currentPassword"
              type="password"
              id="current-password"
              name="current-password"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p
              v-if="errors.currentPassword"
              class="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.currentPassword }}
            </p>
          </div>

          <div>
            <label
              for="new-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              New Password <span class="text-red-500">*</span>
            </label>
            <input
              v-model="newPassword"
              type="password"
              id="new-password"
              name="new-password"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p
              v-if="errors.newPassword"
              class="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.newPassword }}
            </p>
          </div>

          <div>
            <label
              for="confirm-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm New Password <span class="text-red-500">*</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              id="confirm-password"
              name="confirm-password"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
        <div class="flex justify-end py-3">
          <UButton
            type="submit"
            :disabled="disableSubmit"
            :loading="isSubmitting"
            label="Change Password"
            size="lg"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>