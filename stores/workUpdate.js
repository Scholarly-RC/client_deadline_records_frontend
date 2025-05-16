export const useAddWorkUpdateStore = defineStore("addWorkUpdateStore", {
  state: () => ({
    showModal: false,
  }),

  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
  },
});

export const useWorkUpdateStore = defineStore("workUpdateStore", {
  state: () => ({
    workUpdates: {},
    pagination: {},
    showModal: false,
    isLoading: false,
  }),

  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
  },
});
