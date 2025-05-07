<script setup>
// Components
import Clients from "~/components/clients/Clients.vue";

// Page Metadata
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Clients />
</template>
