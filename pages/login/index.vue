<script setup lang="ts">
// Components
import Login from "~/components/login/Login.vue";

// Page Metadata
useHead({
  title: "Client Deadline Tracker | Login",
});

// Page Configuration
definePageMeta({
  middleware: "guest", // Redirects authenticated users away from login page
});
</script>

<template>
  <Login />
</template>
