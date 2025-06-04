<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import LogTable from "./LogTable.vue";
// import AddUserModal from "./AddUserModal.vue";
// import EditUserModal from "./EditUserModal.vue";
// import UserTable from "./UserTable.vue";

// Stores
const logsStore = useLogsStore();
const userStore = useUserStore();

// Lifecycle Hooks
onMounted(async () => {
  await logsStore.getLogs();
  await userStore.getAllUsers();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="App Logs" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <LogTable />
    </main>
  </div>
</template>
