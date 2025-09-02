import { defineStore } from "pinia";
import { useToast } from '../node_modules/@nuxt/ui/dist/runtime/composables/useToast'
import { useNuxtApp } from '#app/nuxt'
import { useAuthStore } from './auth'
import { useTaskService } from '~/composables/useTaskService'
import { getErrorMessage } from '~/utils/errorHandler'
import type { TaskList, TaskFilters, PaginatedResponse } from '~/types';
import { TASK_CATEGORIES, CATEGORY_DISPLAY_MAPPING } from "~/constants/choices";

interface UserTasksState {
  tasks: TaskList[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    total_pages: number;
    current_page: number;
    item_range: string;
  };
  currentPage: number;
  searchQuery: string;
  filters: {
    category: string;
    status: string;
    priority: string;
  };
  tasks_by_category: Record<string, TaskList[]>;
  isLoading: boolean;
}

export const useUserTasksStore = defineStore("userTasksStore", {
  state: (): UserTasksState => ({
    // New unified structure
    tasks: [],
    // Pagination state
    pagination: {
      count: 0,
      next: null,
      previous: null,
      page_size: 10,
      total_pages: 1,
      current_page: 1,
      item_range: "0-0"
    },
    currentPage: 1,
    searchQuery: "",
    filters: {
      category: "",
      status: "",
      priority: ""
    },
    // Legacy structure for backward compatibility
    tasks_by_category: {
      compliance: [],
      accounting_audits: [],
      financial_statement_preparations: [],
      finance_implementations: [],
      human_resource_implementations: [],
      miscellaneous_tasks: [],
      tax_cases: [],
    },
    isLoading: false,
  }),
  
  getters: {
    /**
     * Get tasks by category for backward compatibility
     */
    tasksByCategory: (state) => (category: string): TaskList[] => {
      return state.tasks.filter((task: TaskList) => task.category === category);
    },
    
    /**
     * Pagination getters
     */
    hasNextPage: (state) => state.pagination.next !== null,
    hasPreviousPage: (state) => state.pagination.previous !== null,
    totalPages: (state) => state.pagination.total_pages,
    totalItems: (state) => state.pagination.count,
    
    /**
     * Legacy getters for backward compatibility
     */
    complianceTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.COMPLIANCE);
    },
    accountingAuditTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.ACCOUNTING_AUDIT);
    },
    financialStatementTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.FINANCIAL_STATEMENT);
    },
    financeImplementationTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.FINANCE_IMPLEMENTATION);
    },
    hrImplementationTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.HR_IMPLEMENTATION);
    },
    miscellaneousTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.MISCELLANEOUS);
    },
    taxCaseTasks: (state) => {
      const getter = (category: string): TaskList[] => {
        return state.tasks.filter((task: TaskList) => task.category === category);
      };
      return getter(TASK_CATEGORIES.TAX_CASE);
    },
    
    /**
     * Check if admin user can mark their own task as complete
     */
    canMarkTaskComplete: (state) => (task: TaskList) => {
      const authStore = useAuthStore();
      return (
        authStore.user?.is_admin &&
        task.assigned_to === authStore.user?.id &&
        task.status === "on_going" &&
        !task.requires_approval
      );
    },
  },
  
  actions: {
    async fetchUserTasks(userId: number, options: any = {}): Promise<void> {
      this.isLoading = true;
      try {
        const {
          page = this.currentPage,
          page_size = this.pagination.page_size,
          search = this.searchQuery,
          category = this.filters.category,
          status = this.filters.status,
          priority = this.filters.priority,
          append = false  // Whether to append results to existing tasks (for infinite scroll)
        } = options;
        
        const taskService = useTaskService();
        const filters = {
          page,
          page_size,
          search,
          category,
          status,
          priority
        };
        
        const response = await taskService.getTasks({
          assigned_to: userId,
          page,
          page_size,
          search,
          category,
          status,
          priority
        });
        
        // Handle paginated API response structure
        if (response.results && Array.isArray(response.results)) {
          // Extract pagination metadata
          const { results, ...paginationData } = response;
          const paginationInfo = paginationData as any; // Type assertion for additional pagination fields
          this.pagination = {
            count: paginationInfo.count || 0,
            next: paginationInfo.next || null,
            previous: paginationInfo.previous || null,
            page_size: paginationInfo.page_size || 10,
            total_pages: paginationInfo.total_pages || 1,
            current_page: paginationInfo.current_page || 1,
            item_range: paginationInfo.item_range || "0-0"
          };
          
          // Update current page
          this.currentPage = this.pagination.current_page;
          
          // Handle tasks - append or replace
          if (append) {
            this.tasks = [...this.tasks, ...results];
          } else {
            this.tasks = results;
          }
          
          // Update legacy structure for backward compatibility
          this.updateLegacyTasks(this.tasks);
        } else {
          // Fallback for old structure if still returned (should not happen with new API)
          console.warn('Received non-paginated response from user tasks API');
          this.tasks = this.convertLegacyToTasks(response as any);
          this.tasks_by_category = response as any;
          // Reset pagination for legacy response
          this.pagination = {
            count: this.tasks.length,
            next: null,
            previous: null,
            page_size: this.tasks.length,
            total_pages: 1,
            current_page: 1,
            item_range: `1-${this.tasks.length}`
          };
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error);
        this.handleError(error, "Failed to fetch user tasks");
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Update legacy tasks structure for backward compatibility
     */
    updateLegacyTasks(tasks: TaskList[]): void {
      // Reset all categories
      Object.keys(this.tasks_by_category).forEach(key => {
        this.tasks_by_category[key] = [];
      });
      
      // Group tasks by category into legacy structure
      tasks.forEach(task => {
        const legacyKey = CATEGORY_DISPLAY_MAPPING[task.category];
        if (legacyKey && this.tasks_by_category[legacyKey]) {
          this.tasks_by_category[legacyKey].push(task);
        }
      });
    },
    
    /**
     * Convert legacy response structure to unified tasks array
     */
    convertLegacyToTasks(legacyResponse: any): TaskList[] {
      const tasks: TaskList[] = [];
      
      Object.entries(legacyResponse).forEach(([legacyKey, taskList]) => {
        if (Array.isArray(taskList)) {
          taskList.forEach(task => {
            // Add category field based on legacy key
            const category = Object.entries(CATEGORY_DISPLAY_MAPPING)
              .find(([cat, key]) => key === legacyKey)?.[0];
            
            tasks.push({
              ...task,
              category: category || legacyKey
            });
          });
        }
      });
      
      return tasks;
    },
    
    async updateTask(categoryOrTask: any, task: any, values: any): Promise<any> {
      try {
        let taskId;
        
        // Handle both legacy and new calling patterns
        if (typeof categoryOrTask === 'string') {
          // Legacy pattern: updateTask(category, task, values)
          taskId = task;
        } else {
          // New pattern: updateTask(task, values)
          taskId = categoryOrTask.id;
          values = task; // Second parameter is values in new pattern
        }
        
        const taskService = useTaskService();
        const response: any = await taskService.updateTaskDeadline(taskId, values);
        
        // Update the task in both structures
        this.updateTaskInState(taskId, response);

        return response;
      } catch (error: any) {
        console.error(error);
        throw error;
      }
    },
    
    /**
     * Fetch and update a specific task by ID without refreshing all data
     */
    async refreshSingleTask(taskId: number): Promise<any> {
      try {
        const taskService = useTaskService();
        const updatedTask: any = await taskService.getTask(taskId);
        
        // Update the task in both structures
        this.updateTaskInState(taskId, updatedTask);
        
        return updatedTask;
      } catch (error: any) {
        console.error(`Error refreshing task ${taskId}:`, error);
        // Silently fail for refresh operations to avoid disrupting UX
        throw error;
      }
    },

    /**
     * Update task in both new and legacy state structures
     */
    updateTaskInState(taskId: number, updatedTask: any): void {
      // Update in new tasks array
      const taskIndex = this.tasks.findIndex((task: TaskList) => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = updatedTask;
      }
      
      // Update in legacy tasks structure
      const legacyKey = CATEGORY_DISPLAY_MAPPING[updatedTask.category as keyof typeof CATEGORY_DISPLAY_MAPPING];
      if (legacyKey && this.tasks_by_category[legacyKey]) {
        const legacyIndex = this.tasks_by_category[legacyKey].findIndex((item: TaskList) => item.id === taskId);
        if (legacyIndex !== -1) {
          this.tasks_by_category[legacyKey][legacyIndex] = updatedTask;
        }
      }
    },
    
    /**
     * Mark task as completed
     */
    async markTaskCompleted(taskId: number, completionData: any): Promise<any> {
      try {
        const taskService = useTaskService();
        const response: any = await taskService.markTaskCompleted(taskId, completionData);

        this.updateTaskInState(taskId, response);

        return response;
      } catch (error: any) {
        console.error(error);
        throw error;
      }
    },
    
    /**
     * Error handling
     */
    handleError(error: any, defaultMessage: string): void {
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
    
    /**
     * Pagination methods
     */
    async loadNextPage(userId: number): Promise<void> {
      if (this.hasNextPage && !this.isLoading) {
        await this.fetchUserTasks(userId, {
          page: this.currentPage + 1,
          append: true
        });
      }
    },
    
    async loadPreviousPage(userId: number): Promise<void> {
      if (this.hasPreviousPage && !this.isLoading && this.currentPage > 1) {
        await this.fetchUserTasks(userId, {
          page: this.currentPage - 1
        });
      }
    },
    
    async goToPage(userId: number, page: number): Promise<void> {
      if (page >= 1 && page <= this.totalPages && !this.isLoading) {
        await this.fetchUserTasks(userId, { page });
      }
    },
    
    /**
     * Filter and search methods
     */
    async setSearch(userId: number, searchQuery: string): Promise<void> {
      this.searchQuery = searchQuery;
      this.currentPage = 1; // Reset to first page when searching
      await this.fetchUserTasks(userId);
    },
    
    async setFilters(userId: number, filters: any = {}): Promise<void> {
      this.filters = { ...this.filters, ...filters };
      this.currentPage = 1; // Reset to first page when filtering
      await this.fetchUserTasks(userId);
    },
    
    async clearFilters(userId: number): Promise<void> {
      this.filters = {
        category: "",
        status: "",
        priority: ""
      };
      this.searchQuery = "";
      this.currentPage = 1;
      await this.fetchUserTasks(userId);
    },
  },
});
