<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddClientModal from "./AddClientModal.vue";
import ClientTable from "./ClientTable.vue";

// Stores
const clientStore = useClientStore();

// Lifecycle Hooks
onMounted(() => {
  clientStore.getAllClients();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Clients" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <ClientTable />
      <AddClientModal />
    </main>
  </div>
</template>
