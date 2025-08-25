<script setup>
import { convertToTitleCase } from "~/utils/convertToTitleCase";
import StatusBadge from "../ui/StatusBadge.vue";
import PriorityBadge from "../ui/PriorityBadge.vue";
// Stores
const auditingAccountingTableStore = useAuditingAccountingTableStore();

const columns = [
  {
    accessorKey: "client_name",
    header: "Client",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "assigned_to_name",
    header: "Assigned To",
  },

  {
    accessorKey: "engagement_date",
    header: "Engagement Date",
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
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
    accessorKey: "last_update",
    header: "Last Update",
  },
  {
    accessorKey: "completion_date",
    header: "Completion Date",
  },
  {
    accessorKey: "actions",
    header: "",
  },
];

// Methods
const handleSetPage = async (page) => {
  await auditingAccountingTableStore.setPage(page);
};

// Reactive variables
const { auditingAccountings, pagination, isLoading } = storeToRefs(
  auditingAccountingTableStore
);

onMounted(async () => {
  await auditingAccountingTableStore.getAllAuditingAccountings();
});
</script>

<template>
  <div>
    <!-- Table Section -->
    <div
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
      <UTable
        :data="auditingAccountings"
        :columns="columns"
        :loading="isLoading"
        class="flex-1 h-[calc(100vh-18rem)]"
        :ui="{
          tr: 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        }"
      >
        <template #status-cell="{ row }">
          <StatusBadge :status="row.original.status" />
        </template>
        <template #priority-cell="{ row }">
          <PriorityBadge :priority="row.original.priority" />
        </template>
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
          :page-count="pagination.page_size"
          variant="outline"
          @update:model-value="handleSetPage"
        />
      </div>
    </div>
  </div>
</template>
