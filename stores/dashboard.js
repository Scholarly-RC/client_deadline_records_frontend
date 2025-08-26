import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboardStore", {
  state: () => ({
    // Legacy stats from /api/stats/
    stats: false,
    
    // New unified task statistics from /api/tasks/statistics/
    taskStatistics: null,
    
    // Additional dashboard data
    overdueTasks: [],
    tasksDueSoon: [],
    
    // Loading states
    isLoading: false,
    isLoadingTaskStats: false,
    isLoadingOverdue: false,
    isLoadingDueSoon: false,
  }),
  
  getters: {
    /**
     * Get total tasks count from task statistics
     */
    totalTasks: (state) => {
      return state.taskStatistics?.total_tasks || 0;
    },
    
    /**
     * Get completed tasks count
     */
    completedTasks: (state) => {
      return state.taskStatistics?.completed_tasks || 0;
    },
    
    /**
     * Get pending tasks count
     */
    pendingTasks: (state) => {
      return state.taskStatistics?.pending_tasks || 0;
    },
    
    /**
     * Get overdue tasks count
     */
    overdueTasksCount: (state) => {
      return state.overdueTasks?.length || 0;
    },
    
    /**
     * Get tasks due soon count
     */
    tasksDueSoonCount: (state) => {
      return state.tasksDueSoon?.length || 0;
    },
    
    /**
     * Get task statistics by category
     */
    taskStatsByCategory: (state) => {
      return state.taskStatistics?.by_category || {};
    },
    
    /**
     * Get task statistics by status
     */
    taskStatsByStatus: (state) => {
      return state.taskStatistics?.by_status || {};
    },
    
    /**
     * Get task statistics by priority
     */
    taskStatsByPriority: (state) => {
      return state.taskStatistics?.by_priority || {};
    },
    
    /**
     * Check if any data is loading
     */
    isAnyLoading: (state) => {
      return state.isLoading || state.isLoadingTaskStats || state.isLoadingOverdue || state.isLoadingDueSoon;
    },
  },
  
  actions: {
    /**
     * Get legacy dashboard data (backward compatibility)
     */
    async getDashboardData() {
      const toast = useToast();
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/stats/", {
          method: "GET",
        });
        this.stats = response;
      } catch (error) {
        toast.add({
          title: "Dashboard Data Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Get new task statistics
     */
    async getTaskStatistics() {
      const toast = useToast();
      try {
        this.isLoadingTaskStats = true;
        const taskService = useTaskService();
        this.taskStatistics = await taskService.getTaskStatistics();
      } catch (error) {
        toast.add({
          title: "Task Statistics Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoadingTaskStats = false;
      }
    },
    
    /**
     * Get overdue tasks
     */
    async getOverdueTasks() {
      const toast = useToast();
      try {
        this.isLoadingOverdue = true;
        const taskService = useTaskService();
        this.overdueTasks = await taskService.getOverdueTasks();
      } catch (error) {
        toast.add({
          title: "Overdue Tasks Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoadingOverdue = false;
      }
    },
    
    /**
     * Get tasks due soon
     */
    async getTasksDueSoon() {
      const toast = useToast();
      try {
        this.isLoadingDueSoon = true;
        const taskService = useTaskService();
        this.tasksDueSoon = await taskService.getTasksDueSoon();
      } catch (error) {
        toast.add({
          title: "Tasks Due Soon Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
      } finally {
        this.isLoadingDueSoon = false;
      }
    },
    
    /**
     * Load all dashboard data
     */
    async loadAllDashboardData() {
      try {
        // Load data in parallel for better performance
        await Promise.allSettled([
          this.getTaskStatistics(),
          this.getOverdueTasks(),
          this.getTasksDueSoon(),
          this.getDashboardData(), // Keep legacy for backward compatibility
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    },
    
    /**
     * Refresh dashboard data
     */
    async refreshDashboard() {
      await this.loadAllDashboardData();
    },
    
    /**
     * Clear all dashboard data
     */
    clearDashboard() {
      this.stats = false;
      this.taskStatistics = null;
      this.overdueTasks = [];
      this.tasksDueSoon = [];
    },
  },
});
