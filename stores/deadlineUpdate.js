export const useDeadlineUpdate = defineStore("deadlineUpdate", {
  state: () => ({
    showModal: false,
    category: null,
    deadline: null,
  }),
  actions: {
    open(category, deadline) {
      this.category = category;
      this.deadline = deadline;
      this.showModal = true;
    },
    close() {
      this.category = null;
      this.deadline = null;
      this.showModal = false;
    },
  },
});
