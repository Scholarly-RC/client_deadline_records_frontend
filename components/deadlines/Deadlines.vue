<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddDeadlineModal from "./AddDeadlineModal.vue";
import DeadlineTabs from "./DeadlineTabs.vue";
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Deadlines" />
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="flex justify-end">
        <AddDeadlineModal />
      </div>
      <DeadlineTabs />
    </main>
  </div>
</template>
