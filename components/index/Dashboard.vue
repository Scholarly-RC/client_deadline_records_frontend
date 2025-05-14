<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import Stats from "./Stats.vue";
import UpcomingDeadlines from "./UpcomingDeadlines.vue";

const dashboardStore = useDashboardStore();
const upcomingDeadlineStore = useUpcomingDeadlineStore();

onMounted(async () => {
  await dashboardStore.getDashboardData();
  await upcomingDeadlineStore.getUpcomingDeadlines();
});
</script>

<template>
  <div class="flex flex-col flex-1">
    <PageHeader page="Dashboard" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="space-y-6">
        <!-- Stats cards -->
        <Stats />
        <UpcomingDeadlines />
      </div>
    </main>
  </div>
</template>
