<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import ClientBirthdays from "./ClientBirthdays.vue";
import Stats from "./Stats.vue";
import UpcomingDeadlines from "./UpcomingDeadlines.vue";

const dashboardStore = useDashboardStore();

onMounted(async () => {
  await dashboardStore.getDashboardData();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Dashboard" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="space-y-6">
        <!-- Stats cards -->
        <Stats />
        <!-- <UpcomingDeadlines /> -->
        <ClientBirthdays />
      </div>
    </main>
  </div>
</template>
