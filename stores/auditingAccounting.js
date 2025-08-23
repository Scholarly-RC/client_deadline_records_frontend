export const useAuditingAccountingModalStore = defineStore(
  "auditing-accounting-modal",
  {
    state: () => ({
      showModal: false,
    }),
    actions: {
      open() {
        const addDeadlineStore = useAddDeadlineStore();
        addDeadlineStore.close();
        this.showModal = true;
      },
      close() {
        this.showModal = false;
      },
    },
  }
);
