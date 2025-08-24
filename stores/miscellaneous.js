import { defineStore } from "pinia";

export const useMiscellaneousStore = defineStore("miscellaneous", {
  state: () => ({
    showModal: false,
    loading: false,
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
