<script setup>
// Components
import Login from "~/components/login/Login.vue";

// Page Configuration
definePageMeta({
  middleware: "guest", // Redirects authenticated users away from login page
});
</script>

<template>
  <Login />
</template>
