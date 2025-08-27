<script setup>
import PageHeader from "~/components/ui/PageHeader.vue";
import DeadlineCard from "~/components/deadlines/DeadlineCard.vue";
import { useUserDeadlinesStore } from "~/stores/userDeadlines";
import { useAuthStore } from "~/stores/auth";
import UpdateDeadlineModal from "~/components/deadlines/UpdateDeadlineModal.vue";
import AllMyDeadlines from "~/components/deadlines/AllMyDeadlines.vue";

const userDeadlinesStore = useUserDeadlinesStore();
const authStore = useAuthStore();

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | My Deadlines",
});

const categorizedDeadlines = computed(() => userDeadlinesStore.deadlines);
const isLoading = computed(() => userDeadlinesStore.isLoading);

// Filter out completed and cancelled deadlines
const filteredCategorizedDeadlines = computed(() => {
  const filtered = {};
  Object.entries(categorizedDeadlines.value).forEach(([category, deadlines]) => {
    filtered[category] = deadlines.filter(deadline => 
      deadline.status !== 'completed' && deadline.status !== 'cancelled'
    );
  });
  return filtered;
});

const hasDeadlines = computed(() => {
  return Object.values(filteredCategorizedDeadlines.value).some(
    (category) => category.length > 0
  );
});

onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    await userDeadlinesStore.fetchUserDeadlines(authStore.user.id);
  }
});

// Handle task updates from DeadlineCard components
const handleTaskUpdate = async (taskId) => {
  try {
    // Refresh only the specific task without affecting page scroll or other tasks
    await userDeadlinesStore.refreshSingleTask(taskId);
  } catch (error) {
    console.error('Error refreshing task:', error);
    // If single task refresh fails, fallback to full refresh as last resort
    if (authStore.user && authStore.user.id) {
      await userDeadlinesStore.fetchUserDeadlines(authStore.user.id);
    }
  }
};
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="My Deadlines" />
    <main
      class="overflow-y-auto px-10 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="mt-2 flex justify-end">
        <AllMyDeadlines />
      </div>
      <div v-if="isLoading" class="text-center py-12">
        <UIcon
          name="mdi:gamepad-circle-up"
          class="w-10 h-10 animate-spin bg-primary"
        />
        <p class="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
          Loading your deadlines
        </p>
      </div>
      <div v-else-if="!hasDeadlines" class="text-center py-12">
        <UIcon
          name="mdi:inbox-outline"
          class="w-10 h-10 text-gray-400 mx-auto"
        />
        <p class="text-lg text-gray-600 dark:text-gray-300">
          No active deadlines assigned to you.
        </p>
      </div>
      <div v-else>
        <div
          v-for="(deadlines, category) in filteredCategorizedDeadlines"
          :key="category"
        >
          <div v-if="deadlines.length > 0" class="mb-8">
            <h2
              class="text-2xl font-bold capitalize mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            >
              {{ category.replace(/_/g, " ") }}
            </h2>
            <TransitionGroup
              name="deadline-card"
              tag="div"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <DeadlineCard
                v-for="deadline in deadlines"
                :key="deadline.id"
                :deadline="deadline"
                :category="category"
                @task-updated="handleTaskUpdate"
                @approval-initiated="handleTaskUpdate"
              />
            </TransitionGroup>
          </div>
        </div>
      </div>
    </main>
    <UpdateDeadlineModal />
  </div>
</template>

<style scoped>
.deadline-card-enter-active,
.deadline-card-leave-active {
  transition: all 0.5s ease;
}
.deadline-card-enter-from,
.deadline-card-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.deadline-card-move {
  transition: transform 0.5s ease;
}
</style>