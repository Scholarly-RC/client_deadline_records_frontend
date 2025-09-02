<script setup lang="ts">
import Dashboard from "~/components/dashboard/Dashboard.vue";

// Page Metadata
useHead({
  title: "Client Deadline Tracker | Dashboard",
});

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Dashboard />
</template>
