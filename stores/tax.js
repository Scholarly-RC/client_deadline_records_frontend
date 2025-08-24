import { defineStore } from "pinia";

export const useTaxStore = defineStore("taxStore", {
  state: () => ({
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
