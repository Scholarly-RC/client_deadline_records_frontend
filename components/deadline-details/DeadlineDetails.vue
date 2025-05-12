<script setup>
// Components
import AddWorkUpdateModal from "../work-updates/AddWorkUpdateModal.vue";
import DeadlineOverview from "./DeadlineOverview.vue";

// Stores
const viewDeadlineStore = useViewDeadlineStore();
const userStore = useUserStore();

// Router
const route = useRoute();
const deadlineId = route.params.id;

// Lifecycle Hooks
onMounted(async () => {
  await viewDeadlineStore.getDeadline(deadlineId);
  await userStore.getUserChoices();
});
</script>

<template>
  <DeadlineOverview />
  <AddWorkUpdateModal />
</template>
