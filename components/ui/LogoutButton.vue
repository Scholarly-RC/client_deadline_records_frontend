<script setup>
// Stores
const authStore = useAuthStore();

// Methods
const handleLogout = async () => {
  authStore.clearAuth();
  await navigateTo("/login");
};
</script>

<template>
  <button
    @click="handleLogout"
    id="logout-button"
    class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg dark:text-red-400 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-gray-600 transition-colors duration-200"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
    Log Out
  </button>
</template>
