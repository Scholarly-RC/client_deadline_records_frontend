<script setup>
import Dashboard from "~/components/dashboard/Dashboard.vue";

// Components

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Dashboard />
</template>
