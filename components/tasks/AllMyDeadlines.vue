<script setup lang="ts">
import TaskTabs from "./TaskTabs.vue";
</script>

<template>
  <UModal title="All My Deadlines" description="TODO:" fullscreen>
    <UButton label="View All" size="lg" />
    <template #body>
      <TaskTabs :show-user-tasks-only="true" />
    </template>
  </UModal>
</template>