import { defineStore } from "pinia";
import { TASK_CATEGORIES } from "~/constants/choices.js";

export const useAuditingAccountingTableStore = defineStore(
  "auditingAccountingTable",
  {
    state: () => ({
      auditingAccountings: [],
      pagination: {},
      isLoading: false,
      page: null,
      filters: {},
    }),

    actions: {
      async getAllAuditingAccountings() {
        try {
          this.isLoading = true;
          const taskService = useTaskService();
          
          // Build parameters for the API call
          const params = {
            category: TASK_CATEGORIES.ACCOUNTING_AUDIT,
          };
          
          if (this.page) {
            params.page = this.page;
          }
          
          // Add any additional filters
          Object.entries(this.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              params[key] = value;
            }
          });
          
          const response = await taskService.getTasks(params);
          
          if (response.results) {
            this.auditingAccountings = response.results;
            const { results, ...pagination } = response;
            this.pagination = pagination;
          } else {
            // Handle case where response is direct array
            this.auditingAccountings = response;
            this.pagination = {};
          }
        } catch (error) {
          console.error("Error fetching accounting audit tasks:", error);
          this.handleError(error, "Failed to fetch accounting audit tasks");
        } finally {
          this.isLoading = false;
        }
      },
      
      async setPage(page) {
        this.page = page;
        await this.getAllAuditingAccountings();
      },
      
      /**
       * Update filters and refetch data
       */
      async updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.page = 1; // Reset to first page when filters change
        await this.getAllAuditingAccountings();
      },
      
      /**
       * Clear all filters
       */
      async clearFilters() {
        this.filters = {};
        this.page = 1;
        await this.getAllAuditingAccountings();
      },
      
      /**
       * Refresh data
       */
      async refresh() {
        await this.getAllAuditingAccountings();
      },
      
      /**
       * Error handling
       */
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
