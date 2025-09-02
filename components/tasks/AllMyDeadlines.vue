<script setup lang="ts">
import TaskTabs from "~/components/tasks/TaskTabs.vue";
</script>

<template>
  <UModal title="All My Deadlines" description="View all upcoming deadlines for your assigned tasks" fullscreen>
    <UButton label="View All" size="lg" />
    <template #body>
      <TaskTabs :show-user-tasks-only="true" />
    </template>
  </UModal>
</template>