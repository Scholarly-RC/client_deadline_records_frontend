<script setup>
import TaskTabs from "./TaskTabs.vue";
</script>

<template>
  <UModal title="All My Tasks" description="TODO:" fullscreen>
    <UButton label="View All" size="lg" />
    <template #body>
      <TaskTabs :show-user-tasks-only="true" />
    </template>
  </UModal>
</template>
