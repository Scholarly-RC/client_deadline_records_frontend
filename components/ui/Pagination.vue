<script setup lang="ts">
interface PaginationInfo {
  count?: number;
  current_page?: number;
  total_pages?: number;
  page_size?: number;
}

interface Props {
  pagination: PaginationInfo;
  isLoading?: boolean;
  itemName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  itemName: "item",
});

const emit = defineEmits<{
  (e: "first-page"): void;
  (e: "previous-page"): void;
  (e: "next-page"): void;
  (e: "last-page"): void;
}>();

const itemNamePlural = computed(() => {
  if (props.itemName.endsWith("y")) {
    return props.itemName.slice(0, -1) + "ies";
  }
  return props.itemName + "s";
});

const goToFirstPage = () => {
  emit("first-page");
};

const goToPreviousPage = () => {
  emit("previous-page");
};

const goToNextPage = () => {
  emit("next-page");
};

const goToLastPage = () => {
  emit("last-page");
};
</script>

<template>
  <div
    v-if="pagination.count || isLoading"
    class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
  >
    <!-- Results Info -->
    <div
      v-if="isLoading"
      class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"
    ></div>
    <div v-else class="text-sm text-gray-600 dark:text-gray-300">
      <span v-if="pagination.count">
        Showing
        <span class="font-semibold">{{
          ((pagination.current_page || 1) - 1) * (pagination.page_size || 10) +
          1
        }}</span>
        to
        <span class="font-semibold">{{
          Math.min(
            (pagination.current_page || 1) * (pagination.page_size || 10),
            pagination.count
          )
        }}</span>
        of
        <span class="font-semibold">{{ pagination.count }}</span>
        {{ pagination.count === 1 ? itemName : itemNamePlural }}
      </span>
      <span v-else>No {{ itemNamePlural }} found</span>
    </div>

    <!-- Pagination Controls -->
    <div v-if="isLoading" class="flex space-x-2">
      <div
        v-for="i in 5"
        :key="i"
        class="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-8 animate-pulse"
      ></div>
    </div>
    <div
      v-else-if="pagination.total_pages && pagination.total_pages > 1"
      class="flex items-center space-x-2"
    >
      <!-- First Page -->
      <UButton
        :disabled="(pagination.current_page || 1) <= 1"
        icon="mdi:chevron-double-left"
        size="sm"
        color="neutral"
        variant="outline"
        @click="goToFirstPage"
        :loading="isLoading"
      />

      <!-- Previous Page -->
      <UButton
        :disabled="(pagination.current_page || 1) <= 1"
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
          Page {{ pagination.current_page || 1 }} of
          {{ pagination.total_pages }}
        </span>
      </div>

      <!-- Next Page -->
      <UButton
        :disabled="
          (pagination.current_page || 1) >= (pagination.total_pages || 1)
        "
        icon="mdi:chevron-right"
        size="sm"
        color="neutral"
        variant="outline"
        @click="goToNextPage"
        :loading="isLoading"
      />

      <!-- Last Page -->
      <UButton
        :disabled="
          (pagination.current_page || 1) >= (pagination.total_pages || 1)
        "
        icon="mdi:chevron-double-right"
        size="sm"
        color="neutral"
        variant="outline"
        @click="goToLastPage"
        :loading="isLoading"
      />
    </div>
  </div>
</template>