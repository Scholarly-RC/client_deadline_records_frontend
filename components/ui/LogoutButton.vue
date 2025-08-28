<script setup lang="ts">
// Stores
const authStore = useAuthStore();

// Methods
const handleLogout = async (): Promise<void> => {
  await authStore.logout();
};
</script>

<template>
  <UButton
    @click="handleLogout"
    label="Logout"
    icon="mdi:logout"
    size="xl"
    variant="soft"
    color="error"
    class="w-full"
    :ui="{ base: 'flex justify-center' }"
  />
</template>