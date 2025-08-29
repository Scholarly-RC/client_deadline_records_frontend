<script setup lang="ts">
// Components
import Documents from "~/components/documents/Documents.vue";

// Page Metadata
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Documents",
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
  <Documents />
</template>