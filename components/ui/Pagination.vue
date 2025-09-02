<script setup lang="ts">
import type { PaginationInfo } from "~/types";

interface Props {
  pagination: PaginationInfo | null;
  isLoading?: boolean;
  style?: "simple" | "enhanced";
  itemName?: string;
  showResultsInfo?: boolean;
  onPageChange?: (page: number) => void | Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  style: "enhanced",
  itemName: "items",
  showResultsInfo: true,
});

// Computed properties
const currentPage = computed(() => props.pagination?.current_page || 1);
const totalPages = computed(() => props.pagination?.total_pages || 1);
const totalCount = computed(() => props.pagination?.count || 0);
const pageSize = computed(() => {
  // Calculate page size from total count and pages, fallback to 10
  if (totalCount.value && totalPages.value > 1) {
    return Math.ceil(totalCount.value / totalPages.value);
  }
  return 10;
});

const hasMultiplePages = computed(() => totalPages.value > 1);

// Methods
const goToFirstPage = async (): Promise<void> => {
  if (props.onPageChange) {
    await props.onPageChange(1);
  }
};

const goToLastPage = async (): Promise<void> => {
  if (props.onPageChange && totalPages.value) {
    await props.onPageChange(totalPages.value);
  }
};

const goToPreviousPage = async (): Promise<void> => {
  if (props.onPageChange && currentPage.value > 1) {
    await props.onPageChange(currentPage.value - 1);
  }
};

const goToNextPage = async (): Promise<void> => {
  if (props.onPageChange && currentPage.value < totalPages.value) {
    await props.onPageChange(currentPage.value + 1);
  }
};

const handlePageChange = async (page: number): Promise<void> => {
  if (props.onPageChange) {
    await props.onPageChange(page);
  }
};

// Results info
const resultsInfo = computed(() => {
  if (!totalCount.value) return `No ${props.itemName} found`;

  const start = ((currentPage.value - 1) * pageSize.value) + 1;
  const end = Math.min(currentPage.value * pageSize.value, totalCount.value);

  return `Showing ${start} to ${end} of ${totalCount.value} ${totalCount.value === 1 ? props.itemName.replace(/s$/, '') : props.itemName}`;
});
</script>

<template>
  <div v-if="pagination && (totalCount > 0 || isLoading)" class="space-y-4 w-full">
    <!-- Simple Style -->
    <div v-if="style === 'simple'" class="flex justify-center">
      <UPagination
        v-if="hasMultiplePages"
        :page-count="totalPages"
        :total="totalCount"
        :model-value="currentPage"
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- Enhanced Style -->
    <div
      v-else
      class="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <!-- Results Info -->
      <div
        v-if="showResultsInfo"
        :class="[
          'text-sm text-gray-600 dark:text-gray-300',
          isLoading ? 'h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse' : ''
        ]"
      >
        <span v-if="!isLoading">{{ resultsInfo }}</span>
      </div>

      <!-- Pagination Controls -->
      <div v-if="isLoading" class="flex space-x-2">
        <div
          v-for="i in 5"
          :key="i"
          class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-8 animate-pulse"
        />
      </div>
      <div
        v-else-if="hasMultiplePages"
        class="flex items-center space-x-2"
      >
        <!-- First Page -->
        <UButton
          :disabled="currentPage <= 1"
          icon="mdi:chevron-double-left"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToFirstPage"
          :loading="isLoading"
        />

        <!-- Previous Page -->
        <UButton
          :disabled="currentPage <= 1"
          icon="mdi:chevron-left"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToPreviousPage"
          :loading="isLoading"
        />

        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          <span class="text-sm text-gray-600 dark:text-gray-300 px-2">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
        </div>

        <!-- Next Page -->
        <UButton
          :disabled="currentPage >= totalPages"
          icon="mdi:chevron-right"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToNextPage"
          :loading="isLoading"
        />

        <!-- Last Page -->
        <UButton
          :disabled="currentPage >= totalPages"
          icon="mdi:chevron-double-right"
          size="sm"
          color="neutral"
          variant="outline"
          @click="goToLastPage"
          :loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>