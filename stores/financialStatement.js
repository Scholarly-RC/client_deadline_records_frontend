import { defineStore } from "pinia";

export const useFinancialStatementModalStore = defineStore("financialStatementModal", {
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
