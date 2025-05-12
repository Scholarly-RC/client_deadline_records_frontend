<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddDeadlineModal from "./AddDeadlineModal.vue";
import ClientDeadlineTable from "./ClientDeadlineTable.vue";
import DeadlineTypesModal from "./DeadlineTypesModal.vue";
import ClientDeadlineFilterModal from "./ClientDeadlineFilterModal.vue";

// Stores
const deadlineTypeStore = useDeadlineTypesStore();
const deadlineStore = useDeadlineStore();
const clientStore = useClientStore();
const userStore = useUserStore();

// Lifecycle Hooks
onMounted(async () => {
  await deadlineStore.getAllDeadlines();
  await deadlineTypeStore.getAllDeadlineTypes();
  await clientStore.getAllClients();
  await userStore.getUserChoices();
});
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Deadlines" />
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <ClientDeadlineTable />
      <DeadlineTypesModal />
      <AddDeadlineModal />
      <ClientDeadlineFilterModal />
    </main>
  </div>
</template>
