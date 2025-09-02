<script setup lang="ts">
import TaskTabs from "~/components/tasks/TaskTabs.vue";
</script>

<template>
  <UModal title="All My Tasks" description="View and manage all tasks assigned to you" fullscreen>
    <UButton label="View All" size="lg" />
    <template #body>
      <TaskTabs :show-user-tasks-only="true" />
    </template>
  </UModal>
</template>