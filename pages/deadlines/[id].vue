<script setup>
// Components
import DeadlineDetails from "~/components/deadline-details/DeadlineDetails.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <DeadlineDetails />
</template>
