import { defineStore } from "pinia";
import { TASK_CATEGORIES } from "~/constants/choices.js";

export const useMiscellaneousTableStore = defineStore(
  "miscellaneousTableStore",
  {
    state: () => ({
      miscellaneousTasks: [],
      pagination: {},
      isLoading: false,
      page: null,
      filters: {},
    }),

    actions: {
      async getAllMiscellaneousTasks() {
        try {
          this.isLoading = true;
          const taskService = useTaskService();
          
          const params = {
            category: TASK_CATEGORIES.MISCELLANEOUS,
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
            this.miscellaneousTasks = response.results;
            const { results, ...pagination } = response;
            this.pagination = pagination;
          } else {
            this.miscellaneousTasks = response;
            this.pagination = {};
          }
        } catch (error) {
          console.error("Error fetching miscellaneous tasks:", error);
          this.handleError(error, "Failed to fetch miscellaneous tasks");
        } finally {
          this.isLoading = false;
        }
      },
      
      async setPage(page) {
        this.page = page;
        await this.getAllMiscellaneousTasks();
      },
      
      async updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.page = 1;
        await this.getAllMiscellaneousTasks();
      },
      
      async clearFilters() {
        this.filters = {};
        this.page = 1;
        await this.getAllMiscellaneousTasks();
      },
      
      async refresh() {
        await this.getAllMiscellaneousTasks();
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
