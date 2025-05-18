<script setup>
// Components
import Deadlines from "~/components/deadlines/Deadlines.vue";

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
  <Deadlines />
</template>
