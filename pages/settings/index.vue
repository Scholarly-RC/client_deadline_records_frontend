<script setup>
// Components
import Settings from "~/components/settings/Settings.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Settings />
</template>
