<script setup>
import ClientOverview from "~/components/client-details/ClientOverview.vue";

definePageMeta({
  layout: "menu",
  middleware: "auth",
});

const editClientStore = useEditClientStore();

const route = useRoute();
const clientId = route.params.id;

onMounted(async () => {
  await editClientStore.getClient(clientId);
});
</script>

<template>
  <ClientOverview />
</template>
