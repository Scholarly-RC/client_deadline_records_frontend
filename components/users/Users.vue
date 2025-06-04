<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddUserModal from "./AddUserModal.vue";
import EditUserModal from "./EditUserModal.vue";
import UserTable from "./UserTable.vue";

// Stores
const userStore = useUserStore();

// Lifecycle Hooks
onMounted(async () => {
  await userStore.getAllUsers();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Users" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <UserTable />
      <AddUserModal />
      <EditUserModal />
    </main>
  </div>
</template>
