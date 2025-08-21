<script setup>
// Components
import AddDeadlineModal from "./AddDeadlineModal.vue";
import ClientDeadline from "./ClientDeadline.vue";
import ClientDeadlineFilterModal from "./ClientDeadlineFilterModal.vue";
import DeadlineTypesModal from "./DeadlineTypesModal.vue";

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const deadlineStore = useDeadlineStore();
const addDeadlineStore = useAddDeadlineStore();
const deadlineTypesStore = useDeadlineTypesStore();

const columns = [
  {
    accessorKey: "client.name",
    header: "Client",
  },
  {
    accessorKey: "deadline_type.name",
    header: "Deadline Type",
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "assigned_to.fullname",
    header: "Assigned To",
  },
  {
    accessorKey: "actions",
    header: "",
  },
];

// Methods
const handleSetPage = async (page) => {
  await deadlineStore.setPage(page);
};

// Reactive variables
const { deadlines, pagination, isLoading } = storeToRefs(deadlineStore);
</script>

<template>
  <div>
    <!-- Filter/Add buttons -->
    <div
      class="flex flex-row justify-between items-end sm:items-center mb-6 gap-4"
    >
      <div>
        <ClientDeadlineFilterModal />
      </div>
      <div v-if="isAdmin" class="flex flex-row gap-2">
        <DeadlineTypesModal />
        <AddDeadlineModal />
      </div>
    </div>

    <!-- Table Section -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <UTable
        :data="deadlines"
        :columns="columns"
        :loading="isLoading"
        class="flex-1 h-[calc(100vh-15rem)]"
        :ui="{
          tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        }"
      >
        <template #actions-cell="{ row }">
          <UButton
            :to="`/deadlines/${row.original.id}`"
            icon="mdi:eye-arrow-right-outline"
            label="View"
            color="info"
            size="lg"
          >
            View
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Pagination with Loading State -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4"
    >
      <div
        v-if="isLoading"
        class="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"
      ></div>
      <div
        v-else-if="pagination"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        Showing <span class="font-medium">{{ pagination.item_range }}</span> of
        <span class="font-medium">{{ pagination.count }}</span> results
      </div>

      <div v-if="isLoading" class="flex space-x-2">
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-20"
        ></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-8"
        ></div>
        <div
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-20"
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
