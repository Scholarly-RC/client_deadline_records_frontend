<script setup lang="ts">
// Components
import ClientDocuments from "~/components/client-documents/ClientDocuments.vue";

// Page Metadata
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

// Page Head
useHead({
  title: "Client Deadline Tracker | Client Documents",
});

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);

// Redirect non-admin users
onBeforeMount(async () => {
  if (!isAdmin.value) {
    await navigateTo("/");
  }
});
</script>

<template>
  <ClientDocuments />
</template>