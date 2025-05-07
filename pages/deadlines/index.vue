<script setup>
import Deadlines from "~/components/deadlines/Deadlines.vue";

definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Deadlines />
</template>
