<script setup>
import PageHeader from "~/components/ui/PageHeader.vue";
import TaskCard from "~/components/tasks/TaskCard.vue";
import { useUserTasksStore } from "~/stores/userTasks";
import { useAuthStore } from "~/stores/auth";
import UpdateTaskModal from "~/components/tasks/UpdateTaskModal.vue";
import AllMyTasks from "~/components/tasks/AllMyTasks.vue";

const userTasksStore = useUserTasksStore();
const authStore = useAuthStore();

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | My Deadlines",
});

const categorizedTasks = computed(() => userTasksStore.tasks_by_category);
const isLoading = computed(() => userTasksStore.isLoading);

// Filter out completed and cancelled tasks
const filteredCategorizedTasks = computed(() => {
  const filtered = {};
  Object.entries(categorizedTasks.value).forEach(([category, tasks]) => {
    filtered[category] = tasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    );
  });
  return filtered;
});

const hasTasks = computed(() => {
  return Object.values(filteredCategorizedTasks.value).some(
    (category) => category.length > 0
  );
});

onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    await userTasksStore.fetchUserTasks(authStore.user.id);
  }
});

// Handle task updates from TaskCard components
const handleTaskUpdate = async (taskId) => {
  try {
    // Refresh only the specific task without affecting page scroll or other tasks
    await userTasksStore.refreshSingleTask(taskId);
  } catch (error) {
    console.error('Error refreshing task:', error);
    // If single task refresh fails, fallback to full refresh as last resort
    if (authStore.user && authStore.user.id) {
      await userTasksStore.fetchUserTasks(authStore.user.id);
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
        <AllMyTasks />
      </div>
      <div v-if="isLoading" class="text-center py-12">
        <UIcon
          name="mdi:gamepad-circle-up"
          class="w-10 h-10 animate-spin bg-primary"
        />
        <p class="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
          Loading your tasks
        </p>
      </div>
      <div v-else-if="!hasTasks" class="text-center py-12">
        <UIcon
          name="mdi:inbox-outline"
          class="w-10 h-10 text-gray-400 mx-auto"
        />
        <p class="text-lg text-gray-600 dark:text-gray-300">
          No active tasks assigned to you.
        </p>
      </div>
      <div v-else>
        <div
          v-for="(tasks, category) in filteredCategorizedTasks"
          :key="category"
        >
          <div v-if="tasks.length > 0" class="mb-8">
            <h2
              class="text-2xl font-bold capitalize mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            >
              {{ category.replace(/_/g, " ") }}
            </h2>
            <TransitionGroup
              name="task-card"
              tag="div"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <TaskCard
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                :category="category"
                @task-updated="handleTaskUpdate"
                @approval-initiated="handleTaskUpdate"
              />
            </TransitionGroup>
          </div>
        </div>
      </div>
    </main>
    <UpdateTaskModal />
  </div>
</template>

<style scoped>
.task-card-enter-active,
.task-card-leave-active {
  transition: all 0.5s ease;
}
.task-card-enter-from,
.task-card-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.task-card-move {
  transition: transform 0.5s ease;
}
</style>