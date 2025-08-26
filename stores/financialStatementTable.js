import { defineStore } from "pinia";
import { TASK_CATEGORIES } from "~/constants/choices.js";

export const useFinancialStatementTableStore = defineStore(
  "financialStatementTable",
  {
    state: () => ({
      financialStatements: [],
      pagination: {},
      isLoading: false,
      page: null,
      filters: {},
    }),

    actions: {
      async getAllFinancialStatements() {
        try {
          this.isLoading = true;
          const taskService = useTaskService();
          
          const params = {
            category: TASK_CATEGORIES.FINANCIAL_STATEMENT,
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
            this.financialStatements = response.results;
            const { results, ...pagination } = response;
            this.pagination = pagination;
          } else {
            this.financialStatements = response;
            this.pagination = {};
          }
        } catch (error) {
          console.error("Error fetching financial statement tasks:", error);
          this.handleError(error, "Failed to fetch financial statement tasks");
        } finally {
          this.isLoading = false;
        }
      },
      
      async setPage(page) {
        this.page = page;
        await this.getAllFinancialStatements();
      },
      
      async updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.page = 1;
        await this.getAllFinancialStatements();
      },
      
      async clearFilters() {
        this.filters = {};
        this.page = 1;
        await this.getAllFinancialStatements();
      },
      
      async refresh() {
        await this.getAllFinancialStatements();
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
