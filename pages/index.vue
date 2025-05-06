<script setup>
import Dashboard from "~/components/index/Dashboard.vue";

definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Dashboard />
</template>
