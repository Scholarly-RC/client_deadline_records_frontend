// stores/addDeadlineModal.js
import { defineStore } from "pinia";

export const useAddDeadlineStore = defineStore("addDeadlineModal", {
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
