<script setup>
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Redirecting...",
});

// Redirect to tasks page
const router = useRouter()

// Redirect non-admin users
if (!authStore.isAdmin) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Admin privileges required."
  });
}

// Redirect to tasks page as deadlines is now called tasks
onMounted(() => {
  router.replace('/tasks')
})
</script>

<template>
  <div class="flex items-center justify-center h-64">
    <div class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Redirecting to Tasks...</p>
    </div>
  </div>
</template>
