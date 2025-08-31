<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { User } from '~/types/entities'
import ChangePasswordModal from "./ChangePasswordModal.vue";

// Stores
const editUserStore = useEditUserStore();
const userStore = useUserStore();
const confirmationStore = useConfirmationStore();
const authStore = useAuthStore();
const changePasswordStore = useChangePasswordStore();

// Store Refs
const { showModal, user } = storeToRefs(editUserStore);
const { user: authUser } = storeToRefs(authStore);





const initialValues = computed(() => ({
  firstName: user.value?.first_name || "",
  middleName: user.value?.middle_name || "",
  lastName: user.value?.last_name || "",
  username: user.value?.username || "",
  email: user.value?.email || "",
  role: user.value?.role || "",
}));

// Form Schema
const validationSchema = toTypedSchema(
  z.object({
    firstName: z.string().nonempty("First Name is required."),
    middleName: z.string().nonempty("Middle Name is required."),
    lastName: z.string().nonempty("Last Name is required."),
    username: z.string().nonempty("Username is required."),
    email: z
      .string()
      .nonempty("Email is required.")
      .email("Invalid email format."),
    role: z.string().nonempty("Role is required."),
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
  initialValues: {
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    role: "",
  },
  validationSchema,
});

// Form Fields
const [firstName] = defineField("firstName");
const [middleName] = defineField("middleName");
const [lastName] = defineField("lastName");
const [username] = defineField("username");
const [email] = defineField("email");
const [role] = defineField("role");

// Computed
const disableSubmit = computed(() => {
  return !formMeta.value.dirty || !formMeta.value.valid;
});

const canToggleStatus = computed<boolean>(() => {
  return user.value?.id !== authUser.value?.id;
});

// Methods
const openChangePasswordModal = () => {
  if (user.value) {
    changePasswordStore.open(user.value);
  }
};

const toggleUserStatus = async () => {
  if (!user.value) return;

  const toast = useToast();
  const newStatus = !user.value.is_active;

  const confirmed = await confirmationStore.confirm(
    `Are you sure you want to ${
      newStatus ? "activate" : "deactivate"
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
      await userStore.getAllUsers();
      toast.add({
        title: newStatus ? "User Activated" : "User Deactivated",
        description: `The user account has been ${
          newStatus ? "activated" : "deactivated"
        } successfully.`,
        color: "success",
        icon: "mdi:checkbox-multiple-marked",
        duration: 2000,
      });
    } catch (error) {
      toast.add({
        title: newStatus ? "Activation Failed" : "Deactivation Failed",
        description: `Could not ${
          newStatus ? "activate" : "deactivate"
        } user account. ${getErrorMessage(error as any)}`,
        color: "error",
        icon: "mdi:close-box-multiple",
        duration: 5000,
      });
      console.error(error);
    }
  }
};

const onSubmit = handleSubmit(async (values) => {
  if (!user.value) return
  
  const toast = useToast();
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
      },
    });
    toast.add({
      title: "User Updated",
      description: "User profile has been updated successfully.",
      color: "success",
      icon: "mdi:checkbox-multiple-marked",
      duration: 2000,
    });
    await editUserStore.editUser(user.value.id);
    await userStore.getAllUsers();
    resetForm({ values: initialValues.value });
  } catch (error) {
    toast.add({
      title: "User Update Failed",
      description: `Could not update user profile. ${getErrorMessage(error as any)}`,
      color: "error",
      icon: "mdi:close-box-multiple",
      duration: 5000,
    });
    console.error(error);
  }
});

// Watchers
watch(showModal, (newValue) => {
  if (newValue && user.value) {
    resetForm({ values: initialValues.value });
  }
});

watch(user, (newUser) => {
  if (newUser && showModal.value) {
    resetForm({ values: initialValues.value });
  }
});

watch(showModal, async (newValue) => {
  if (!newValue) {
    await userStore.getAllUsers();
  }
});





watch(showModal, async () => {
  if (!showModal.value) {
    await userStore.getAllUsers();
  }
});
</script>

<template>
  <UModal
    v-model:open="showModal"
    title="Edit User"
    description="Update the user's information below."
    :ui="{ content: 'min-w-3xl' }"
  >
    <template #body>
      <form @submit.prevent="onSubmit" id="edit-user-form">
        <div class="space-y-4">
          <!-- User Information Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              User Information
            </h3>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  for="first-name"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="firstName"
                  type="text"
                  id="first-name"
                  name="first-name"
                  required
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Middle Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="middleName"
                  type="text"
                  id="middle-name"
                  name="middle-name"
                  required
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="lastName"
                  type="text"
                  id="last-name"
                  name="last-name"
                  required
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

          <!-- Account Information Section -->
          <div>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  for="username"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Username <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="username"
                  type="text"
                  id="username"
                  name="username"
                  required
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  name="email"
                  required
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p
                  v-if="errors.email"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Role Section -->
          <div>
            <label
              for="role"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Role <span class="text-red-500">*</span>
            </label>
            <select
              v-model="role"
              id="role"
              name="role"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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




        </div>
        
        <!-- Submit Button Area -->
        <div class="flex justify-between py-3">
          <div class="flex items-center space-x-2">
            <UButton
              @click="openChangePasswordModal"
              color="primary"
              label="Change Password"
              size="sm"
              variant="outline"
            />
            <div v-if="canToggleStatus" class="flex items-center space-x-2">
              <UButton
                @click="toggleUserStatus"
                :color="user?.is_active ? 'error' : 'success'"
                :label="user?.is_active ? 'Deactivate User' : 'Activate User'"
                size="sm"
                variant="outline"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Current status: {{ user?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <UButton
            type="submit"
            :disabled="disableSubmit"
            :loading="isSubmitting"
            label="Update User"
            size="lg"
          />
        </div>
      </form>
    </template>
  </UModal>

  <!-- Change Password Modal -->
  <ChangePasswordModal />
</template>
