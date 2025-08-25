export const useAddDeadlineStore = defineStore("addDeadlineModal", {
  state: () => ({
    showModal: false,
    selectedClient: null,
    selectedCategory: null,
  }),

  actions: {
    open() {
      this.showModal = true;
    },

    close() {
      this.showModal = false;
    },
    setClient(client) {
      this.selectedClient = client;
    },
    setCategory(category) {
      this.selectedCategory = category;
    },
    reset() {
      this.selectedClient = null;
      this.selectedCategory = null;
    },
    handleNext() {
      this.close();
      const toast = useToast();
      switch (this.selectedCategory) {
        case "compliance":
          const complianceModalStore = useComplianceModalStore();
          complianceModalStore.open();
          break;
        case "financial_statement_prep":
          const financialStatementModalStore =
            useFinancialStatementModalStore();
          financialStatementModalStore.open();
          break;
        case "accounting_auditing":
          const auditingAccountingModalStore =
            useAuditingAccountingModalStore();
          auditingAccountingModalStore.open();
          break;
        case "finance_implementation":
          const financeImplementationModalStore =
            useFinanceImplementationModalStore();
          financeImplementationModalStore.open();
          break;
        case "hr_implementation":
          const hrImplementationModalStore = useHrImplementationModalStore();
          hrImplementationModalStore.open();
          break;
        case "miscellaneous":
          const miscellaneousModalStore = useMiscellaneousStore();
          miscellaneousModalStore.open();
          break;
        case "tax":
          const taxModalStore = useTaxStore();
          taxModalStore.open();
          break;
        default:
          toast.add({
            title: "Invalid Category",
            description: "Please select a valid category.",
            color: "error",
            icon: "mdi:alert-circle",
            duration: 3000,
          });
          return;
      }
    },
  },
});
