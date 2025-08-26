import { defineStore } from "pinia";
import { TASK_CATEGORIES, CATEGORY_DISPLAY_MAPPING } from "~/constants/choices.js";

export const useUserDeadlinesStore = defineStore("userDeadlinesStore", {
  state: () => ({
    // New unified structure
    tasks: [],
    // Legacy structure for backward compatibility
    deadlines: {
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
    tasksByCategory: (state) => (category) => {
      return state.tasks.filter(task => task.category === category);
    },
    
    /**
     * Legacy getters for backward compatibility
     */
    complianceTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.COMPLIANCE),
    accountingAuditTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.ACCOUNTING_AUDIT),
    financialStatementTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.FINANCIAL_STATEMENT),
    financeImplementationTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.FINANCE_IMPLEMENTATION),
    hrImplementationTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.HR_IMPLEMENTATION),
    miscellaneousTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.MISCELLANEOUS),
    taxCaseTasks: (state) => state.tasksByCategory(TASK_CATEGORIES.TAX_CASE),
  },
  
  actions: {
    async fetchUserDeadlines(userId) {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        const response = await taskService.getUserDeadlines(userId);
        
        // Handle new API response structure
        if (response.tasks && Array.isArray(response.tasks)) {
          this.tasks = response.tasks;
          
          // Update legacy structure for backward compatibility
          this.updateLegacyDeadlines(response.tasks);
        } else {
          // Fallback for old structure if still returned
          this.tasks = this.convertLegacyToTasks(response);
          this.deadlines = response;
        }
      } catch (error) {
        console.error("Error fetching user deadlines:", error);
        this.handleError(error, "Failed to fetch user deadlines");
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Update legacy deadlines structure for backward compatibility
     */
    updateLegacyDeadlines(tasks) {
      // Reset all categories
      Object.keys(this.deadlines).forEach(key => {
        this.deadlines[key] = [];
      });
      
      // Group tasks by category into legacy structure
      tasks.forEach(task => {
        const legacyKey = CATEGORY_DISPLAY_MAPPING[task.category];
        if (legacyKey && this.deadlines[legacyKey]) {
          this.deadlines[legacyKey].push(task);
        }
      });
    },
    
    /**
     * Convert legacy response structure to unified tasks array
     */
    convertLegacyToTasks(legacyResponse) {
      const tasks = [];
      
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
    
    async updateDeadline(categoryOrTask, deadline, values) {
      const toast = useToast();
      
      try {
        let taskId;
        
        // Handle both legacy and new calling patterns
        if (typeof categoryOrTask === 'string') {
          // Legacy pattern: updateDeadline(category, deadline, values)
          taskId = deadline;
        } else {
          // New pattern: updateDeadline(task, values)
          taskId = categoryOrTask.id;
          values = deadline; // Second parameter is values in new pattern
        }
        
        const taskService = useTaskService();
        const response = await taskService.updateTaskDeadline(taskId, values);
        
        // Update the task in both structures
        this.updateTaskInState(taskId, response);
        
        toast.add({
          title: "Success",
          description: "Update successfully added.",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });
        
        return response;
      } catch (error) {
        toast.add({
          title: "Update Failed",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
        throw error;
      }
    },
    
    /**
     * Update task in both new and legacy state structures
     */
    updateTaskInState(taskId, updatedTask) {
      // Update in new tasks array
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = updatedTask;
      }
      
      // Update in legacy deadlines structure
      const legacyKey = CATEGORY_DISPLAY_MAPPING[updatedTask.category];
      if (legacyKey && this.deadlines[legacyKey]) {
        const legacyIndex = this.deadlines[legacyKey].findIndex(item => item.id === taskId);
        if (legacyIndex !== -1) {
          this.deadlines[legacyKey][legacyIndex] = updatedTask;
        }
      }
    },
    
    /**
     * Mark task as completed
     */
    async markTaskCompleted(taskId, completionData) {
      const toast = useToast();
      
      try {
        const taskService = useTaskService();
        const response = await taskService.markTaskCompleted(taskId, completionData);
        
        this.updateTaskInState(taskId, response);
        
        toast.add({
          title: "Success",
          description: "Task marked as completed.",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });
        
        return response;
      } catch (error) {
        toast.add({
          title: "Completion Failed",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
        throw error;
      }
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
