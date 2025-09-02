<script setup lang="ts">
import AppLogs from "~/components/logs/AppLogs.vue";

// Components

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Logs",
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
  <AppLogs />
</template>
