<script setup>
import PageHeader from "../ui/PageHeader.vue";
import DeadlineCard from "./DeadlineCard.vue";
import { useUserDeadlinesStore } from "~/stores/userDeadlines";
import { useAuthStore } from "~/stores/auth";
import UpdateDeadlineModal from "./UpdateDeadlineModal.vue";
import DeadlinesFilterModal from "./DeadlinesFilterModal.vue";
import AllMyDeadlines from "./AllMyDeadlines.vue";

const userDeadlinesStore = useUserDeadlinesStore();
const authStore = useAuthStore();

const categorizedDeadlines = computed(() => userDeadlinesStore.deadlines);
const isLoading = computed(() => userDeadlinesStore.isLoading);

const hasDeadlines = computed(() => {
  return Object.values(categorizedDeadlines.value).some(
    (category) => category.length > 0
  );
});

onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    await userDeadlinesStore.fetchUserDeadlines(authStore.user.id);
  }
});
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
          v-for="(deadlines, category) in categorizedDeadlines"
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
