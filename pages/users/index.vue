<script setup>
import Users from "~/components/users/Users.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <Users />
</template>
