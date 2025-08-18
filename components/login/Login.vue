<script setup>
// Components
import LoginDarkModeToggle from "./LoginDarkModeToggle.vue";
import LoginForm from "./LoginForm.vue";
import LoginHeader from "./LoginHeader.vue";
</script>

<template>
  <div
    class="h-screen min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <LoginHeader />
    <LoginForm />
    <div class="w-full flex justify-center mt-1">
      <LoginDarkModeToggle />
    </div>
  </div>
</template>
