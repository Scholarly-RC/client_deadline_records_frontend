<script setup lang="ts">
// Components
import Clients from "~/components/clients/Clients.vue";

// Page Metadata
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Clients",
});

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);

// Lifecycle Hooks
onBeforeMount(async () => {
  if (!isAdmin.value) {
    await navigateTo("/");
  }
});
</script>

<template>
  <Clients />
</template>
