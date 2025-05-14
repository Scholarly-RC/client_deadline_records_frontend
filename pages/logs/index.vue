<script setup>
import AppLogs from "~/components/logs/AppLogs.vue";

// Components

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
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
