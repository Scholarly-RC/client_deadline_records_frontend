export const useHrImplementationModalStore = defineStore(
  "hr-implementation-modal",
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
