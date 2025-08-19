<script setup>
import { watchDebounced } from "@vueuse/core";

const clientStore = useClientStore();

const categoryItems = ref([
  { label: "TOE", description: "Tax (One Engagement)", id: "TOE" },
  { label: "TRP", description: "Tax (Regular Processing)", id: "TRP" },
  { label: "CMP", description: "Compliance", id: "CMP" },
  { label: "ACC", description: "Accounting", id: "ACC" },
  { label: "AUD", description: "Auditing", id: "AUD" },
  { label: "OCC", description: "Other Consultancy Client", id: "OCC" },
]);
const statusItems = ref([
  { label: "All", value: "", id: "all" },
  { label: "Active", value: "active", id: "active" },
  { label: "Inactive", value: "inactive", id: "inactive" },
]);
const categoryValue = ref([]);
const statusValue = ref("");

watchDebounced(
  categoryValue,
  async (value) => {
    await clientStore.setCategory(value);
  },
  { debounce: 750, maxWait: 5000 }
);

watchDebounced(
  statusValue,
  async (value) => {
    await clientStore.setStatus(value);
  },
  { debounce: 750, maxWait: 5000 }
);
</script>

<template>
  <UModal
    title="Filter Client"
    description="Select criteria below to quickly find specific clients."
  >
    <UButton label="Filter" size="xl" variant="solid" />
    <template #body>
      <div class="flex flex-col gap-2">
        <UCheckboxGroup
          legend="Category"
          v-model="categoryValue"
          value-key="id"
          :items="categoryItems"
          variant="card"
          size="xs"
          :ui="{ legend: 'text-base font-semibold' }"
        />
        <URadioGroup
          legend="Status"
          v-model="statusValue"
          value-key="value"
          :items="statusItems"
          variant="card"
          size="xs"
          orientation="horizontal"
          :ui="{ legend: 'text-base font-semibold' }"
        />
      </div>
    </template>
  </UModal>
</template>
