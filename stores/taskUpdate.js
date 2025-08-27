export const useTaskUpdate = defineStore("taskUpdate", {
  state: () => ({
    showModal: false,
    category: null,
    task: null,
  }),
  actions: {
    open(category, task) {
      this.category = category;
      this.task = task;
      this.showModal = true;
    },
    close() {
      this.category = null;
      this.task = null;
      this.showModal = false;
    },
  },
});
