<script setup>
// Components
import Deadlines from "~/components/deadlines/Deadlines.vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Deadlines",
});

// Redirect non-admin users
if (!authStore.isAdmin) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Admin privileges required."
  });
}
</script>

<template>
  <Deadlines />
</template>
