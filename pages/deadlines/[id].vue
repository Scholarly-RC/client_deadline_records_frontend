<script setup>
// Components
import DeadlineDetails from "~/components/deadline-details/DeadlineDetails.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Deadline View",
});
</script>

<template>
  <DeadlineDetails />
</template>
