<script setup>
// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Task Tracker | Task View",
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      Task Details
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mt-2">
      This page is currently being redesigned.
    </p>
  </div>
</template>
