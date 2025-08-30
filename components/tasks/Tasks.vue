<script setup lang="ts">
// Components
import PageHeader from "~/components/ui/PageHeader.vue";
import UnifiedTaskFormModal from "~/components/tasks/UnifiedTaskFormModal.vue";
import TaskTabs from "~/components/tasks/TaskTabs.vue";

// Stores
const clientStore = useClientStore();
const userStore = useUserStore();

// State
const showAddTaskModal = ref(false);
const taskTabsRef = ref<any>(null);

// Fetch initial data
onMounted(async () => {
  await clientStore.getAllClients();
  await userStore.getUserChoices();
});

const openAddTaskModal = () => {
  showAddTaskModal.value = true;
};

const handleModalClose = () => {
  showAddTaskModal.value = false;
};

const handleModalSuccess = async () => {
  showAddTaskModal.value = false;
  // The toast is already shown by the UnifiedTaskFormModal
  // Refresh the task tables to show the new task
  if (taskTabsRef.value?.refreshAllTables) {
    await taskTabsRef.value.refreshAllTables();
  }
};
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Tasks" />
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="flex justify-end">
        <UButton
          @click="openAddTaskModal"
          icon="mdi:plus-circle"
          label="Add Task"
          size="md"
        />
      </div>
      <TaskTabs ref="taskTabsRef" />
    </main>

    <!-- Unified Task Form Modal -->
    <UnifiedTaskFormModal
      :is-open="showAddTaskModal"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>
