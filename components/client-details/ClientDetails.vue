<script setup>
// Components
import ClientOverview from "./ClientOverview.vue";
import EditClientModal from "./EditClientModal.vue";

// Stores
const viewClientStore = useViewClientStore();

// Router
const route = useRoute();
const clientId = route.params.id;

// Lifecycle Hooks
onMounted(async () => {
  await viewClientStore.getClient(clientId);
});
</script>

<template>
  <ClientOverview />
  <EditClientModal />
</template>
