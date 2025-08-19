<script setup>
// Components
import { watchDebounced } from "@vueuse/core";
import AddClientModal from "./AddClientModal.vue";
import ClientFilterModal from "./ClientFilterModal.vue";

const search = ref("");

// Stores
const clientStore = useClientStore();
const { clients, pagination, isLoading } = storeToRefs(clientStore);
const confirmationStore = useConfirmationStore();
const editClientStore = useEditClientStore();

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "is_active",
    header: "Status",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "contact_person",
    header: "Contact",
  },
  {
    accessorKey: "created_by.fullname",
    header: "Added by",
  },
  {
    accessorKey: "created_at",
    header: "Added",
  },
  {
    accessorKey: "actions",
    header: "",
  },
];

// Methods
const categoryMap = {
  TOE: "Tax (One Engagement)",
  TRP: "Tax (Regular Processing)",
  CMP: "Compliance",
  ACC: "Accounting",
  AUD: "Auditing",
  OCC: "Other Consultancy Client",
};

const getFullCategory = (category) => categoryMap[category] || null;

const handleSetPage = async (page) => {
  await clientStore.setPage(page);
};

const handleOpenEditModal = async (id) => {
  await editClientStore.getClient(id);
  editClientStore.open();
};

const deleteConfirmation = async (id) => {
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this client?"
  );

  if (confirmed) {
    const toast = useToast();
    try {
      const { $apiFetch } = useNuxtApp();
      await $apiFetch(`/api/clients/${id}/`, {
        method: "DELETE",
      });
      await clientStore.getAllClients();
      toast.add({
        title: "Success",
        description: "The selected client has been deleted successfully.",
        color: "success",
        icon: "mdi:checkbox-multiple-marked",
        duration: 2000,
      });
    } catch (error) {
      toast.add({
        title: "Deleteion Failed",
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
  async (value) => {
    await clientStore.setSearch(value);
  },
  { debounce: 750, maxWait: 5000 }
);
</script>

<template>
  <div class="space-y-4">
    <!-- Search and Add Client -->
    <div class="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
      <div class="w-full sm:w-80 flex flex-row gap-2">
        <UInput
          v-model="search"
          icon="mdi:account-search-outline"
          size="xl"
          variant="outline"
          placeholder="Search..."
        />
        <ClientFilterModal />
      </div>
      <AddClientModal />
    </div>

    <!-- Clients Table -->
    <UTable
      :data="clients"
      :columns="columns"
      :loading="isLoading"
      class="flex-1 h-[calc(100vh-15rem)]"
      :ui="{
        root: 'rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800',
        tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
      }"
    >
      <template #is_active-cell="{ row }">
        <UBadge
          :label="row.original.is_active ? 'Active' : 'Inactive'"
          variant="soft"
          :color="row.original.is_active ? 'success' : 'error'"
        />
      </template>
      <template #category-cell="{ row }">
        {{ getFullCategory(row.original.category) }}
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            @click="handleOpenEditModal(row.original.id)"
            label="View"
            leading-icon="mdi:account-arrow-right-outline"
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

    <!-- Pagination -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4"
    >
      <div
        v-if="isLoading"
        class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"
      ></div>
      <div v-else class="text-sm text-gray-500 dark:text-gray-400">
        Showing
        <span class="font-medium">{{ pagination?.item_range }}</span> of
        <span class="font-medium">{{ pagination?.count }}</span> results
      </div>

      <div v-if="isLoading" class="flex space-x-2">
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse"
        ></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-8 animate-pulse"
        ></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse"
        ></div>
      </div>
      <div v-else class="flex space-x-2">
        <UPagination
          v-if="pagination"
          v-model:page="pagination.current_page"
          :total="pagination.count"
          :items-per-page="pagination.page_size"
          variant="outline"
          v-on:update:page="handleSetPage"
        />
      </div>
    </div>
  </div>
</template>
