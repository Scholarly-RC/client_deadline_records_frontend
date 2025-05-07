<script setup>
import PageHeader from "../ui/PageHeader.vue";
import ClientDeadlines from "./ClientDeadlines.vue";
import DeadlineTypes from "./DeadlineTypes.vue";
</script>

<template>
  <div class="flex flex-col flex-1">
    <PageHeader page="Deadlines" />
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <DeadlineTypes />
      <ClientDeadlines />
    </main>
  </div>
</template>
