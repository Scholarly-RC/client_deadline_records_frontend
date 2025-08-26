import { defineStore } from "pinia";
import { TASK_CATEGORIES } from "~/constants/choices.js";

export const useComplianceTableStore = defineStore("complianceTable", {
  state: () => ({
    compliances: [],
    pagination: {},
    isLoading: false,
    page: null,
    filters: {},
  }),

  actions: {
    async getAllCompliances() {
      try {
        this.isLoading = true;
        const taskService = useTaskService();
        
        // Build parameters for the API call
        const params = {
          category: TASK_CATEGORIES.COMPLIANCE,
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
          this.compliances = response.results;
          const { results, ...pagination } = response;
          this.pagination = pagination;
        } else {
          // Handle case where response is direct array
          this.compliances = response;
          this.pagination = {};
        }
      } catch (error) {
        console.error("Error fetching compliance tasks:", error);
        this.handleError(error, "Failed to fetch compliance tasks");
      } finally {
        this.isLoading = false;
      }
    },
    
    async setPage(page) {
      this.page = page;
      await this.getAllCompliances();
    },
    
    /**
     * Update filters and refetch data
     */
    async updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      this.page = 1; // Reset to first page when filters change
      await this.getAllCompliances();
    },
    
    /**
     * Clear all filters
     */
    async clearFilters() {
      this.filters = {};
      this.page = 1;
      await this.getAllCompliances();
    },
    
    /**
     * Refresh data
     */
    async refresh() {
      await this.getAllCompliances();
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
});
