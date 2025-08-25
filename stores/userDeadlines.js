import { defineStore } from "pinia";

export const useUserDeadlinesStore = defineStore("userDeadlinesStore", {
  state: () => ({
    deadlines: {},
    isLoading: false,
  }),
  actions: {
    async fetchUserDeadlines(userId) {
      this.isLoading = true;
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(
          `/api/users/${userId}/deadlines-tasks/`,
          {
            method: "GET",
          }
        );
        this.deadlines = response;
      } catch (error) {
        console.error("Error fetching user deadlines:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async updateDeadline(category, deadline, values) {
      const toast = useToast();
      let url = "";
      switch (category) {
        case "compliance":
          url = "compliance";
          break;
        case "accounting_audits":
          url = "accounting-audits";
          break;
        case "financial_statement_preparations":
          url = "financial-statement-preparations";
          break;
        case "finance_implementations":
          url = "finance-implementations";
          break;
        case "human_resource_implementations":
          url = "human-resource-implementations";
          break;
        case "miscellaneous_tasks":
          url = "miscellaneous-tasks";
          break;
        case "tax_cases":
          url = "tax-cases";
          break;
        default:
          toast.add({
            title: "Invalid",
            description: "Invalid category selected.",
            color: "error",
            icon: "mdi:close-box-multiple",
            duration: 5000,
          });
          break;
      }
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(
          `/api/${url}/${deadline}/update-deadline/`,
          {
            method: "POST",
            body: values,
          }
        );

        function updateDeadline(deadlines, key, response) {
          if (!deadlines[key]) return deadlines; // key doesn't exist

          deadlines[key] = deadlines[key].map((item) =>
            item.id === response.id ? { ...item, ...response } : item
          );

          return deadlines;
        }

        this.deadlines = updateDeadline(this.deadlines, category, response);

        toast.add({
          title: "Success",
          description: "Update successfully added.",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });
      } catch (error) {
        toast.add({
          title: "Update Failed",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      }
    },
  },
});
