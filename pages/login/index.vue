<script setup>
import Login from "~/components/login/Login.vue";

definePageMeta({
  middleware: "guest", // Create a guest middleware to redirect logged in users away from login
});
</script>

<template>
  <Login />
</template>
