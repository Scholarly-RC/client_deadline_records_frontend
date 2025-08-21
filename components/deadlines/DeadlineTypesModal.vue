<script setup>
// Components
import AddDeadlineType from "./AddDeadlineType.vue";
import DeadlineType from "./DeadlineType.vue";

// Stores
const deadlineTypeStore = useDeadlineTypesStore();
const { deadlineTypes } = storeToRefs(deadlineTypeStore);

// State
const showAddDeadlineType = ref(false);

// Methods
const toggleAddDeadlineSection = () => {
  showAddDeadlineType.value = !showAddDeadlineType.value;
};
</script>

<template>
  <UModal
    title="Deadline Types"
    description="Manage and organize different types of deadlines."
    :ui="{ content: 'min-w-3xl' }"
  >
    <UButton
      icon="mdi:calendar-question-outline"
      label="Deadline Types"
      size="xl"
    />
    <template #body>
      <div class="max-h-[30rem] overflow-y-auto space-y-4">
        <AddDeadlineType
          v-if="showAddDeadlineType"
          @toggle-modal="toggleAddDeadlineSection"
        />
        <div class="w-full flex justify-center">
          <UButton
            v-if="!showAddDeadlineType"
            @click="toggleAddDeadlineSection"
            icon="mdi:plus"
            label="Add New"
            variant="link"
          />
        </div>
        <DeadlineType
          v-for="deadlineType in deadlineTypes"
          :key="deadlineType.id"
          :deadline-type="deadlineType"
        />
      </div>
    </template>
  </UModal>
</template>
