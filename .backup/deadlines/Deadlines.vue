<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import UnifiedTaskFormModal from "../tasks/UnifiedTaskFormModal.vue";
import DeadlineTabs from "./DeadlineTabs.vue";

// Stores
const clientStore = useClientStore();
const userStore = useUserStore();

// State
const showAddTaskModal = ref(false);
const deadlineTabsRef = ref(null);

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
  if (deadlineTabsRef.value?.refreshAllTables) {
    await deadlineTabsRef.value.refreshAllTables();
  }
};
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Deadlines" />
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="flex justify-end">
        <UButton
          @click="openAddTaskModal"
          icon="mdi:plus-circle"
          label="Add Deadline"
          size="md"
        />
      </div>
      <DeadlineTabs ref="deadlineTabsRef" />
    </main>

    <!-- Unified Task Form Modal -->
    <UnifiedTaskFormModal
      :is-open="showAddTaskModal"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>
