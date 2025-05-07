<script setup>
// Components
import ClientOverview from "~/components/client-details/ClientOverview.vue";

// Page Metadata
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

// Stores
const editClientStore = useEditClientStore();

// Router
const route = useRoute();
const clientId = route.params.id;

// Lifecycle Hooks
onMounted(async () => {
  await editClientStore.getClient(clientId);
});
</script>

<template>
  <ClientOverview />
</template>
