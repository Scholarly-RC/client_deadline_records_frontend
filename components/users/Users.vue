<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import EditUser from "./EditUser.vue";
import UserTable from "./UserTable.vue";

// Stores
const userStore = useUserStore();

// Lifecycle Hooks
onMounted(async () => {
  await userStore.getAllUsers();
});
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Users" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <UserTable />
      <EditUser />
    </main>
  </div>
</template>
