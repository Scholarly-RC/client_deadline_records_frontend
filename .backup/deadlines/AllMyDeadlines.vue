<script setup>
import DeadlineTabs from "./DeadlineTabs.vue";
</script>

<template>
  <UModal title="All My Deadlines" description="TODO:" fullscreen>
    <UButton label="View All" size="lg" />
    <template #body>
      <DeadlineTabs :show-user-tasks-only="true" />
    </template>
  </UModal>
</template>
