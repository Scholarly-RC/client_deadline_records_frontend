<script setup>
// Components
import Deadlines from "~/components/deadlines/Deadlines.vue";
import UserDeadlines from "~/components/deadlines/UserDeadlines.vue";
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
</script>

<template>
  <Deadlines v-if="authStore.isAdmin" />
  <UserDeadlines v-else />
</template>
