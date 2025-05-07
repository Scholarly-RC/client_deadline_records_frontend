<script setup>
// Components
import Deadlines from "~/components/deadlines/Deadlines.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Deadlines />
</template>
