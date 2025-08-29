<script setup lang="ts">
// Components
import PageHeader from "../ui/PageHeader.vue";
import DocumentTable from "./DocumentTable.vue";

// Clear any existing document state when component mounts
const documentStore = useDocumentStore();
onMounted(() => {
  documentStore.clearDocuments();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Documents" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <DocumentTable />
    </main>
  </div>
</template>