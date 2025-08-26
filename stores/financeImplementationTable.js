import { defineStore } from "pinia";
import { TASK_CATEGORIES } from "~/constants/choices.js";

export const useFinanceImplementationTableStore = defineStore(
  "financeImplementationTable",
  {
    state: () => ({
      financeImplementations: [],
      pagination: {},
      isLoading: false,
      page: null,
      filters: {},
    }),

    actions: {
      async getAllFinanceImplementations() {
        try {
          this.isLoading = true;
          const taskService = useTaskService();
          
          const params = {
            category: TASK_CATEGORIES.FINANCE_IMPLEMENTATION,
          };
          
          if (this.page) {
            params.page = this.page;
          }
          
          Object.entries(this.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              params[key] = value;
            }
          });
          
          const response = await taskService.getTasks(params);
          
          if (response.results) {
            this.financeImplementations = response.results;
            const { results, ...pagination } = response;
            this.pagination = pagination;
          } else {
            this.financeImplementations = response;
            this.pagination = {};
          }
        } catch (error) {
          console.error("Error fetching finance implementation tasks:", error);
          this.handleError(error, "Failed to fetch finance implementation tasks");
        } finally {
          this.isLoading = false;
        }
      },
      
      async setPage(page) {
        this.page = page;
        await this.getAllFinanceImplementations();
      },
      
      async updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.page = 1;
        await this.getAllFinanceImplementations();
      },
      
      async clearFilters() {
        this.filters = {};
        this.page = 1;
        await this.getAllFinanceImplementations();
      },
      
      async refresh() {
        await this.getAllFinanceImplementations();
      },
      
      handleError(error, defaultMessage) {
        const toast = useToast();
        const errorMessage = getErrorMessage ? getErrorMessage(error) : defaultMessage;
        
        toast.add({
          title: "Error",
          description: errorMessage,
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
      },
    },
  }
);
