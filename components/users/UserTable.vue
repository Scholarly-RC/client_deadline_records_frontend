<script setup lang="ts">
// Components
import { watchDebounced } from "@vueuse/core";
import AddUserModal from "./AddUserModal.vue";
import Pagination from "~/components/ui/Pagination.vue";
import type { User } from "~/types";

const search = ref<string>("");
const isSearching = ref<boolean>(false);

// Stores
const userStore = useUserStore();
const { users, pagination, isLoading } = storeToRefs(userStore);
const confirmationStore = useConfirmationStore();
const editUserStore = useEditUserStore();

interface Column {
  accessorKey: string;
  header: string;
}

const columns: Column[] = [
  {
    accessorKey: "fullname",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "is_active",
    header: "Status",
  },
  {
    accessorKey: "actions",
    header: "",
  },
];

// Methods
const clearSearch = (): void => {
  search.value = "";
};

const goToFirstPage = async (): Promise<void> => {
  await handleSetPage(1);
};

const goToLastPage = async (): Promise<void> => {
  if (pagination.value.total_pages) {
    await handleSetPage(pagination.value.total_pages);
  }
};

const goToPreviousPage = async (): Promise<void> => {
  const currentPage = pagination.value.current_page || 1;
  if (currentPage > 1) {
    await handleSetPage(currentPage - 1);
  }
};

const goToNextPage = async (): Promise<void> => {
  const currentPage = pagination.value.current_page || 1;
  const totalPages = pagination.value.total_pages || 1;
  if (currentPage < totalPages) {
    await handleSetPage(currentPage + 1);
  }
};

const handleSetPage = async (page: number): Promise<void> => {
  await userStore.setPage(page);
};

const handleOpenEditModal = async (id: number): Promise<void> => {
  await editUserStore.editUser(id);
  editUserStore.open();
};

const deleteConfirmation = async (id: number): Promise<void> => {
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this user?"
  );

  if (confirmed) {
    const toast = useToast();
    try {
      const { $apiFetch } = useNuxtApp();
      await $apiFetch(`/api/users/${id}/`, {
        method: "DELETE",
        responseType: "json",
      });
      await userStore.getAllUsers();
      toast.add({
        title: "Success",
        description: "The selected user has been deleted successfully.",
        color: "success",
        icon: "mdi:checkbox-multiple-marked",
        duration: 2000,
      });
    } catch (error: any) {
      toast.add({
        title: "Deletion Failed",
        description: getErrorMessage(error),
        color: "error",
        icon: "mdi:close-box-multiple",
        duration: 5000,
      });
      console.error(error);
    }
  }
};

// Watchers
watchDebounced(
  search,
  async (value: string) => {
    isSearching.value = true;
    await userStore.setSearch(value || null);
    isSearching.value = false;
  },
  { debounce: 500, maxWait: 3000 }
);
</script>

<template>
  <div class="space-y-4">
    <!-- Search and Add User -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
    >
      <div class="w-full sm:w-96 relative">
        <UInput
          type="search"
          v-model="search"
          icon="mdi:account-search-outline"
          size="xl"
          variant="outline"
          placeholder="Search users by name, email, or role..."
          :loading="isSearching"
        />
      </div>
      <AddUserModal />
    </div>

    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <!-- Users Table -->
      <UTable
        :data="users"
        :columns="columns"
        :loading="isLoading"
        class="flex-1 h-[calc(100vh-15rem)]"
        :ui="{
          tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        }"
      >
        <template #fullname-cell="{ row }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-8 w-8">
              <div
                class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center"
              >
                <span
                  class="text-sm font-medium text-primary-600 dark:text-primary-300"
                >
                  {{ row.original.fullname?.charAt(0).toUpperCase() || "U" }}
                </span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ row.original.fullname }}
              </div>
            </div>
          </div>
        </template>

        <template #email-cell="{ row }">
          <div class="text-sm text-gray-900 dark:text-gray-100">
            {{ row.original.email }}
          </div>
        </template>

        <template #role-cell="{ row }">
          <UBadge
            :label="row.original.role"
            variant="soft"
            :color="row.original.role === 'admin' ? 'error' : 'primary'"
          />
        </template>

        <template #is_active-cell="{ row }">
          <UBadge
            :label="row.original.is_active ? 'Active' : 'Inactive'"
            variant="soft"
            :color="row.original.is_active ? 'success' : 'error'"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton
              @click="handleOpenEditModal(row.original.id)"
              label="Edit"
              leading-icon="mdi:account-edit-outline"
              color="info"
              size="lg"
            />
            <UButton
              @click="deleteConfirmation(row.original.id)"
              label="Delete"
              leading-icon="mdi:account-minus"
              color="error"
              size="lg"
            />
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pagination Component -->
    <Pagination
      :pagination="pagination"
      :is-loading="isLoading"
      item-name="user"
      @first-page="goToFirstPage"
      @previous-page="goToPreviousPage"
      @next-page="goToNextPage"
      @last-page="goToLastPage"
    />
  </div>
</template>