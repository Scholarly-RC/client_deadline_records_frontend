<script setup>
// Components
import AddDeadlineType from "./AddDeadlineType.vue";
import DeadlineType from "./DeadlineType.vue";

// Stores
const deadlineTypeStore = useDeadlineTypesStore();
const { deadlineTypes, showModal } = storeToRefs(deadlineTypeStore);

// State
const showAddDeadlineType = ref(false);

// Methods
const toggleAddDeadlineSection = () => {
  showAddDeadlineType.value = !showAddDeadlineType.value;
};

// Watchers
watch(showModal, (value) => {
  if (!value) {
    showAddDeadlineType.value = false;
  }
});
</script>

<template>
  <div
    v-if="showModal"
    id="deadline-modal"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
  >
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

    <!-- Modal panel -->
    <div
      class="relative bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700 z-10"
    >
      <section
        class="w-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4"
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
              Add Deadline Type
            </button>
            <button
              @click="deadlineTypeStore.close()"
              type="button"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span class="sr-only">Close</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Deadline Type List -->
        <div class="max-h-[25rem] overflow-y-auto space-y-4">
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
  </div>
</template>
