import { defineStore } from "pinia";

export const useComplianceModalStore = defineStore("complianceModal", {
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
