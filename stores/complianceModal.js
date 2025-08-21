// stores/complianceModal.js
import { defineStore } from "pinia";

export const useComplianceModalStore = defineStore("complianceModal", {
  state: () => ({
    showModal: false,
    selectedClientId: null,
  }),

  getters: {
    isOpen: (state) => state.showModal,
    hasSelectedClient: (state) => state.selectedClientId !== null,
  },

  actions: {
    open(clientId) {
      if (!clientId) {
        console.error("Client ID is required to open compliance modal");
        return;
      }
      this.selectedClientId = clientId;
      this.showModal = true;
    },

    close() {
      this.showModal = false;
      this.selectedClientId = null;
    },

    setClient(clientId) {
      this.selectedClientId = clientId;
    },
  },
});
