<script setup lang="ts">
// Components
import { watchDebounced } from "@vueuse/core";
import AddClientModal from "~/components/clients/AddClientModal.vue";
import Pagination from "~/components/ui/Pagination.vue";
import type { Client } from "~/types";

const search = ref<string>("");
const isSearching = ref<boolean>(false);

// Stores
const clientStore = useClientStore();
const { clients, pagination, isLoading } = storeToRefs(clientStore);
const confirmationStore = useConfirmationStore();
const editClientStore = useEditClientStore();

interface Column {
  accessorKey: string;
  header: string;
}

const columns: Column[] = [
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
const clearSearch = (): void => {
  search.value = "";
};

const categoryMap: Record<string, string> = {
  TOE: "Tax (One Engagement)",
  TRP: "Tax (Regular Processing)",
  CMP: "Compliance",
  ACC: "Accounting",
  AUD: "Auditing",
  OCC: "Other Consultancy Client",
};

const getFullCategory = (category: string): string | null =>
  categoryMap[category] || null;

const handleSetPage = async (page: number): Promise<void> => {
  await clientStore.setPage(page);
};

const handleOpenEditModal = async (id: number): Promise<void> => {
  await editClientStore.getClient(id);
  editClientStore.open();
};

const deleteConfirmation = async (id: number): Promise<void> => {
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this client?"
  );

  if (confirmed) {
    const toast = useToast();
    try {
      const { $apiFetch } = useNuxtApp();
      await $apiFetch(`/api/clients/${id}/`, {
        method: "DELETE",
        responseType: "json",
      });
      await clientStore.getAllClients();
      toast.add({
        title: "Client Deleted",
        description: "The selected client has been deleted successfully.",
        color: "success",
        icon: "mdi:checkbox-multiple-marked",
        duration: 2000,
      });
    } catch (error: any) {
      toast.add({
        title: "Client Deletion Failed",
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
    await clientStore.setSearch(value || null);
    isSearching.value = false;
  },
  { debounce: 500, maxWait: 3000 }
);
</script>

<template>
  <div class="space-y-4">
    <!-- Search and Add Client -->
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
          placeholder="Search clients by name, contact person, or category..."
          :loading="isSearching"
        />
      </div>
      <AddClientModal />
    </div>
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <!-- Clients Table -->
      <UTable
        :data="clients"
        :columns="columns"
        :loading="isLoading"
        class="flex-1 h-[calc(100vh-15rem)]"
        :ui="{
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
          {{ getFullCategory(row.original.category || "") }}
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
    </div>

     <!-- Pagination -->
     <Pagination
       :pagination="pagination"
       :is-loading="isLoading"
       :style="'enhanced'"
       :item-name="'clients'"
       :on-page-change="handleSetPage"
     />
  </div>
</template>
