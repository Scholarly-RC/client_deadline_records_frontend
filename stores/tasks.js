import { defineStore } from "pinia";
import { TASK_CATEGORIES } from "~/constants/choices.js";

export const useTaskStore = defineStore("taskStore", {
  state: () => ({
    // Core task data
    tasks: [],
    currentTask: null,
    pagination: {},

    // Loading states
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    // Approval states
    isInitiatingApproval: false,
    isProcessingApproval: false,
    pendingApprovals: [],
    approvalHistory: {},
    statusHistory: {},

    // Filter states
    filters: {
      category: null,
      status: null,
      priority: null,
      assigned_to: null,
      deadline__lte: null,
      page: 1,
      search: null,
    },

    // Modal states
    showAddModal: false,
    showEditModal: false,
    showFilterModal: false,
    showApprovalModal: false,
    showApprovalHistoryModal: false,

    // Statistics
    statistics: null,
    overdueTasks: [],
    tasksDueSoon: [],
  }),

  getters: {
    /**
     * Get tasks filtered by category
     */
    tasksByCategory: (state) => (category) => {
      return state.tasks.filter((task) => task.category === category);
    },

    /**
     * Get tasks by status
     */
    tasksByStatus: (state) => (status) => {
      return state.tasks.filter((task) => task.status === status);
    },

    /**
     * Get tasks assigned to specific user
     */
    tasksByUser: (state) => (userId) => {
      return state.tasks.filter((task) => task.assigned_to === userId);
    },

    /**
     * Get tasks requiring approval
     */
    tasksRequiringApproval: (state) => {
      return state.tasks.filter((task) => task.requires_approval);
    },

    /**
     * Get tasks pending approval for current user
     */
    tasksPendingMyApproval: (state) => {
      const authStore = useAuthStore();
      return state.tasks.filter(
        (task) =>
          task.requires_approval &&
          task.pending_approver?.id === authStore.user?.id
      );
    },

    /**
     * Check if user can approve specific task
     */
    canApproveTask: (state) => (task) => {
      const authStore = useAuthStore();
      return (
        authStore.user?.is_admin &&
        task.pending_approver?.id === authStore.user?.id &&
        task.requires_approval
      );
    },

    /**
     * Check if user can initiate approval for task
     */
    canInitiateApproval: (state) => (task) => {
      const authStore = useAuthStore();
      return (
        (task.assigned_to === authStore.user?.id || authStore.user?.is_admin) &&
        !task.requires_approval &&
        (task.status === "for_revision" || task.status === "on_going")
      );
    },

    /**
     * Check if admin user can mark their own task as complete
     */
    canMarkTaskComplete: (state) => (task) => {
      const authStore = useAuthStore();
      return (
        authStore.user?.is_admin &&
        task.assigned_to === authStore.user?.id &&
        task.status === "on_going" &&
        !task.requires_approval
      );
    },

    /**
     * Get completed tasks count
     */
    completedTasksCount: (state) => {
      return state.tasks.filter((task) => task.status === "completed").length;
    },

    /**
     * Get pending tasks count
     */
    pendingTasksCount: (state) => {
      return state.tasks.filter((task) =>
        ["pending", "not_yet_started", "on_going"].includes(task.status)
      ).length;
    },

    /**
     * Get pending approvals count
     */
    pendingApprovalsCount: (state) => {
      return state.pendingApprovals.length;
    },

    /**
     * Category-specific getters for backward compatibility
     */
    complianceTasks: (state) =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.COMPLIANCE
      ),
    accountingAuditTasks: (state) =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.ACCOUNTING_AUDIT
      ),
    taxTasks: (state) =>
      state.tasks.filter((task) => task.category === TASK_CATEGORIES.TAX_CASE),
    financialStatementTasks: (state) =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.FINANCIAL_STATEMENT
      ),
    financeImplementationTasks: (state) =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.FINANCE_IMPLEMENTATION
      ),
    hrImplementationTasks: (state) =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.HR_IMPLEMENTATION
      ),
    miscellaneousTasks: (state) =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.MISCELLANEOUS
      ),

    /**
     * Check if any category has loading state
     */
    hasActiveLoading: (state) => {
      return (
        state.isLoading ||
        state.isCreating ||
        state.isUpdating ||
        state.isDeleting ||
        state.isInitiatingApproval ||
        state.isProcessingApproval
      );
    },
  },

  actions: {
    /**
     * Fetch all tasks with current filters
     */
    async fetchTasks() {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        const response = await taskService.getTasks(this.filters);

        if (response.results) {
          this.tasks = response.results;
          const { results, ...paginationData } = response;
          this.pagination = paginationData;
        } else {
          this.tasks = response;
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Don't show toast for fetch errors - these are often called during refresh
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fetch tasks by specific category
     */
    async fetchTasksByCategory(category, additionalFilters = {}) {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        const response = await taskService.getTasksByCategory(category, {
          ...this.filters,
          ...additionalFilters,
        });

        if (response.results) {
          this.tasks = response.results;
          const { results, ...paginationData } = response;
          this.pagination = paginationData;
        } else {
          this.tasks = response;
        }
      } catch (error) {
        console.error(`Error fetching ${category} tasks:`, error);
        // Don't show toast for fetch errors - these are often called during refresh
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Create a new task
     */
    async createTask(taskData) {
      this.isCreating = true;
      try {
        const taskService = useTaskService();
        const newTask = await taskService.createTask(taskData);

        this.tasks.unshift(newTask);
        this.showAddModal = false;

        return newTask;
      } catch (error) {
        console.error("Error creating task:", error);
        // Don't show toast here - let the component handle error display
        throw error;
      } finally {
        this.isCreating = false;
      }
    },

    /**
     * Update an existing task
     */
    async updateTask(taskId, taskData) {
      this.isUpdating = true;
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.updateTask(taskId, taskData);

        const index = this.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }

        this.showEditModal = false;
        this.currentTask = null;

        const toast = useToast();
        toast.add({
          title: "Success",
          description: "Task updated successfully",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });

        return updatedTask;
      } catch (error) {
        console.error("Error updating task:", error);
        // Don't show toast here - let the component handle error display
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
      this.isDeleting = true;
      try {
        const taskService = useTaskService();
        await taskService.deleteTask(taskId);

        this.tasks = this.tasks.filter((task) => task.id !== taskId);

        const toast = useToast();
        toast.add({
          title: "Success",
          description: "Task deleted successfully",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        this.handleError(error, "Failed to delete task");
      } finally {
        this.isDeleting = false;
      }
    },

    /**
     * Get single task by ID
     */
    async fetchTask(taskId) {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        const task = await taskService.getTask(taskId);
        this.currentTask = task;
        return task;
      } catch (error) {
        console.error("Error fetching task:", error);
        this.handleError(error, "Failed to fetch task");
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Mark task as completed
     */
    async markCompleted(taskId, completionData) {
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.markTaskCompleted(
          taskId,
          completionData
        );

        const index = this.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }

        const toast = useToast();
        toast.add({
          title: "Success",
          description: "Task marked as completed",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });

        return updatedTask;
      } catch (error) {
        console.error("Error marking task completed:", error);
        this.handleError(error, "Failed to mark task as completed");
      }
    },

    /**
     * Update task deadline/status
     */
    async updateDeadline(taskId, updateData) {
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.updateTaskDeadline(
          taskId,
          updateData
        );

        const index = this.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }

        const toast = useToast();
        toast.add({
          title: "Success",
          description: "Task deadline updated successfully",
          color: "success",
          icon: "mdi:checkbox-multiple-marked",
          duration: 2000,
        });

        return updatedTask;
      } catch (error) {
        console.error("Error updating task deadline:", error);
        this.handleError(error, "Failed to update task deadline");
      }
    },

    /**
     * Fetch task statistics
     */
    async fetchStatistics() {
      try {
        const taskService = useTaskService();
        this.statistics = await taskService.getTaskStatistics();
      } catch (error) {
        console.error("Error fetching statistics:", error);
        this.handleError(error, "Failed to fetch task statistics");
      }
    },

    /**
     * Fetch overdue tasks
     */
    async fetchOverdueTasks() {
      try {
        const taskService = useTaskService();
        this.overdueTasks = await taskService.getOverdueTasks();
      } catch (error) {
        console.error("Error fetching overdue tasks:", error);
        this.handleError(error, "Failed to fetch overdue tasks");
      }
    },

    /**
     * Fetch tasks due soon
     */
    async fetchTasksDueSoon() {
      try {
        const taskService = useTaskService();
        this.tasksDueSoon = await taskService.getTasksDueSoon();
      } catch (error) {
        console.error("Error fetching tasks due soon:", error);
        this.handleError(error, "Failed to fetch tasks due soon");
      }
    },

    /**
     * APPROVAL WORKFLOW ACTIONS
     */

    /**
     * Initiate approval workflow for a task
     */
    async initiateApproval(taskId, approvers) {
      this.isInitiatingApproval = true;
      try {
        const taskService = useTaskService();
        await taskService.initiateApproval(taskId, {
          approvers: approvers.map((approver) => approver.id),
        });

        // Update the task in the local state
        const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          // Refresh the task data to get updated approval fields
          const updatedTask = await taskService.getTask(taskId);
          this.tasks[taskIndex] = updatedTask;
        }

        this.showApprovalModal = false;

        const toast = useToast();
        toast.add({
          title: "Success",
          description: "Approval workflow initiated successfully",
          color: "success",
          icon: "mdi:check-circle",
          duration: 3000,
        });

        return true;
      } catch (error) {
        console.error("Error initiating approval:", error);
        this.handleError(error, "Failed to initiate approval workflow");
        throw error;
      } finally {
        this.isInitiatingApproval = false;
      }
    },

    /**
     * Process approval decision
     */
    async processApproval(taskId, action, comments = null) {
      this.isProcessingApproval = true;
      try {
        const taskService = useTaskService();
        const decisionData = { action, comments };

        await taskService.processApproval(taskId, decisionData);

        // Update the task in the local state
        const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          const updatedTask = await taskService.getTask(taskId);
          this.tasks[taskIndex] = updatedTask;
        }

        // Refresh pending approvals
        await this.fetchPendingApprovals();

        const toast = useToast();
        toast.add({
          title: "Success",
          description: `Task ${action} successfully`,
          color: "success",
          icon: action === "approved" ? "mdi:check-circle" : "mdi:close-circle",
          duration: 3000,
        });

        return true;
      } catch (error) {
        console.error("Error processing approval:", error);
        this.handleError(error, `Failed to ${action} task`);
        throw error;
      } finally {
        this.isProcessingApproval = false;
      }
    },

    /**
     * Fetch approval history for a task
     */
    async fetchApprovalHistory(taskId) {
      try {
        const taskService = useTaskService();
        const history = await taskService.getApprovalHistory(taskId);
        this.approvalHistory[taskId] = history;
        return history;
      } catch (error) {
        console.error("Error fetching approval history:", error);
        this.handleError(error, "Failed to fetch approval history");
      }
    },

    /**
     * Fetch status history for a task
     */
    async fetchStatusHistory(taskId) {
      try {
        const taskService = useTaskService();
        const history = await taskService.getStatusHistory(taskId);
        this.statusHistory[taskId] = history;
        return history;
      } catch (error) {
        console.error("Error fetching status history:", error);
        this.handleError(error, "Failed to fetch status history");
      }
    },

    /**
     * Fetch pending approvals for current user
     */
    async fetchPendingApprovals() {
      try {
        const taskService = useTaskService();
        this.pendingApprovals = await taskService.getPendingApprovals();
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
        this.handleError(error, "Failed to fetch pending approvals");
      }
    },

    /**
     * Set page for pagination
     */
    async setPage(page) {
      this.filters.page = page;
      await this.fetchTasks();
    },

    /**
     * Update filters and refetch
     */
    async updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters, page: 1 };
      await this.fetchTasks();
    },

    /**
     * Clear all filters
     */
    async clearFilters() {
      this.filters = {
        category: null,
        status: null,
        priority: null,
        assigned_to: null,
        deadline__lte: null,
        page: 1,
        search: null,
      };
      await this.fetchTasks();
    },

    /**
     * Modal management
     */
    openAddModal() {
      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
    },

    openEditModal(task) {
      this.currentTask = task;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.currentTask = null;
    },

    openFilterModal() {
      this.showFilterModal = true;
    },

    closeFilterModal() {
      this.showFilterModal = false;
    },

    openApprovalModal(task) {
      this.currentTask = task;
      this.showApprovalModal = true;
    },

    closeApprovalModal() {
      this.showApprovalModal = false;
      this.currentTask = null;
    },

    openApprovalHistoryModal(task) {
      this.currentTask = task;
      this.showApprovalHistoryModal = true;
    },

    closeApprovalHistoryModal() {
      this.showApprovalHistoryModal = false;
      this.currentTask = null;
    },

    /**
     * Error handling
     */
    handleError(error, defaultMessage) {
      const toast = useToast();
      const errorMessage = getErrorMessage
        ? getErrorMessage(error)
        : defaultMessage;

      toast.add({
        title: "Error",
        description: errorMessage,
        color: "error",
        icon: "mdi:close-box-multiple",
        duration: 5000,
      });
    },

    /**
     * Legacy compatibility methods
     */
    async getAllCompliances() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.COMPLIANCE);
    },

    async getAllTaxCases() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.TAX_CASE);
    },

    async getAllAccountingAudits() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.ACCOUNTING_AUDIT);
    },

    async getAllFinancialStatements() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.FINANCIAL_STATEMENT);
    },

    async getAllFinanceImplementations() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.FINANCE_IMPLEMENTATION);
    },

    async getAllHRImplementations() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.HR_IMPLEMENTATION);
    },

    async getAllMiscellaneousTasks() {
      await this.fetchTasksByCategory(TASK_CATEGORIES.MISCELLANEOUS);
    },
  },
});