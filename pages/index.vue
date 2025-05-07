<script setup>
// Components
import Dashboard from "~/components/index/Dashboard.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Dashboard />
</template>
