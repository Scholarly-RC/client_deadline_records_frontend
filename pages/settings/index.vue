<script setup>
import Settings from "~/components/settings/Settings.vue";

definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Settings />
</template>
