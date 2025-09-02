<script setup lang="ts">
// Components
import PageHeader from "~/components/ui/PageHeader.vue";
import ClientTable from "~/components/clients/ClientTable.vue";
import EditClientModal from "~/components/clients/EditClientModal.vue";

// Stores
const clientStore = useClientStore();

// Lifecycle Hooks
onMounted(async () => {
  await clientStore.getAllClients();
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
      <EditClientModal />
    </main>
  </div>
</template>