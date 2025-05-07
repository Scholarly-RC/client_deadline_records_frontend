<script setup>
// Components
import AddDeadlineType from "./AddDeadlineType.vue";
import DeadlineType from "./DeadlineType.vue";

// Stores
const deadlineTypeStore = useDeadlineTypesStore();
const { deadlineTypes } = storeToRefs(deadlineTypeStore);

// State
const showSection = ref(true);
const showAddDeadlineType = ref(false);

// Methods
const toggleShowSection = () => {
  showSection.value = !showSection.value;

  if (!showSection.value) {
    showAddDeadlineType.value = false;
  }
};

const toggleAddDeadlineSection = () => {
  showAddDeadlineType.value = !showAddDeadlineType.value;
};

// Lifecycle Hooks
onMounted(async () => {
  await deadlineTypeStore.getAllDeadlineTypes();
});
</script>

<template>
  <div class="w-full flex justify-end">
    <div v-if="!showSection">
      <button
        @click="toggleShowSection"
        class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
      >
        Deadline Types
      </button>
    </div>
    <section
      v-else
      class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Deadline Types
        </h2>
        <div class="flex items-center space-x-2">
          <button
            v-if="!showAddDeadlineType"
            @click="toggleAddDeadlineSection"
            class="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            + Add Deadline Type
          </button>
          <button
            @click="toggleShowSection"
            class="text-sm px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>

      <!-- Deadline Type List -->
      <div class="space-y-4">
        <!-- Deadline Type Item -->
        <AddDeadlineType
          v-if="showAddDeadlineType"
          @toggle-modal="toggleAddDeadlineSection"
        />
        <DeadlineType
          v-for="deadlineType in deadlineTypes"
          :key="deadlineType.id"
          :deadline-type="deadlineType"
        />
      </div>
    </section>
  </div>
</template>
