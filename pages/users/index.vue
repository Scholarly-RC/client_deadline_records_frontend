<script setup>
// Components
import Users from "~/components/users/Users.vue";

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);

// Lifecycle Hooks
onBeforeMount(async () => {
  if (!isAdmin.value) {
    await navigateTo("/");
  }
});
</script>

<template>
  <Users />
</template>
