<script setup lang="ts">
// Components
import Tasks from "~/components/tasks/Tasks.vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Task Tracker | Tasks",
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
  <Tasks />
</template>
