import { defineStore } from 'pinia';
import type { Task, TaskList, TaskFilters, PaginatedResponse, TaskCompletionRequest, ApprovalRequest, StatusHistoryEntry, ApprovalHistoryEntry, TaskStatus, TaskPriority } from '~/types';
import { TASK_CATEGORIES, type TaskCategory } from '~/constants/choices.js';

interface TaskState {
  // Core task data
  tasks: TaskList[];
  currentTask: Task | null;
  pagination: {
    count?: number;
    next?: string | null;
    previous?: string | null;
    current_page?: number;
    total_pages?: number;
    item_range?: string;
  };

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Approval states
  isInitiatingApproval: boolean;
  isProcessingApproval: boolean;
  pendingApprovals: TaskList[];
  approvalHistory: Record<number, ApprovalHistoryEntry[]>;
  statusHistory: Record<number, StatusHistoryEntry[]>;

  // Filter states
  filters: TaskFilters;

  // Modal states
  showAddModal: boolean;
  showEditModal: boolean;
  showFilterModal: boolean;
  showApprovalModal: boolean;
  showApprovalHistoryModal: boolean;

  // Statistics
  statistics: any | null;
  overdueTasks: TaskList[];
  tasksDueSoon: TaskList[];
}

export const useTaskStore = defineStore('taskStore', {
  state: (): TaskState => ({
    // Core task data
    tasks: [],
    currentTask: null,
    pagination: {
      count: undefined,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      item_range: undefined,
    },

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
      category: undefined,
      status: undefined,
      priority: undefined,
      assigned_to: undefined,
      deadline__lte: undefined,
      page: 1,
      search: undefined,
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
    tasksByCategory: (state) => (category: string) => {
      return state.tasks.filter((task) => task.category === category);
    },

    /**
     * Get tasks by status
     */
    tasksByStatus: (state) => (status: string) => {
      return state.tasks.filter((task) => task.status === status);
    },

    /**
     * Get tasks assigned to specific user
     */
    tasksByUser: (state) => (userId: number) => {
      return state.tasks.filter((task) => task.assigned_to === userId);
    },

    /**
     * Get tasks requiring approval
     */
    tasksRequiringApproval: (state): TaskList[] => {
      return state.tasks.filter((task) => task.requires_approval);
    },

    /**
     * Get tasks pending approval for current user
     */
    tasksPendingMyApproval: (state): TaskList[] => {
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
    canApproveTask: (state) => (task: TaskList): boolean => {
      const authStore = useAuthStore();
      return Boolean(
        authStore.user?.is_admin &&
        task.pending_approver?.id === authStore.user?.id &&
        task.requires_approval
      );
    },

    /**
     * Check if user can initiate approval for task
     */
    canInitiateApproval: (state) => (task: TaskList): boolean => {
      const authStore = useAuthStore();
      return Boolean(
        (task.assigned_to === authStore.user?.id || authStore.user?.is_admin) &&
        !task.requires_approval &&
        (task.status === 'for_revision' || task.status === 'on_going')
      );
    },

    /**
     * Check if admin user can mark their own task as complete
     */
    canMarkTaskComplete: (state) => (task: TaskList): boolean => {
      const authStore = useAuthStore();
      return Boolean(
        authStore.user?.is_admin &&
        task.assigned_to === authStore.user?.id &&
        task.status === 'on_going' &&
        !task.requires_approval
      );
    },

    /**
     * Get completed tasks count
     */
    completedTasksCount: (state): number => {
      return state.tasks.filter((task) => task.status === 'completed').length;
    },

    /**
     * Get pending tasks count
     */
    pendingTasksCount: (state): number => {
      return state.tasks.filter((task) =>
        ['pending', 'not_yet_started', 'on_going'].includes(task.status)
      ).length;
    },

    /**
     * Get pending approvals count
     */
    pendingApprovalsCount: (state): number => {
      return state.pendingApprovals.length;
    },

    /**
     * Category-specific getters for backward compatibility
     */
    complianceTasks: (state): TaskList[] =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.COMPLIANCE
      ),
    accountingAuditTasks: (state): TaskList[] =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.ACCOUNTING_AUDIT
      ),
    taxTasks: (state): TaskList[] =>
      state.tasks.filter((task) => task.category === TASK_CATEGORIES.TAX_CASE),
    financialStatementTasks: (state): TaskList[] =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.FINANCIAL_STATEMENT
      ),
    financeImplementationTasks: (state): TaskList[] =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.FINANCE_IMPLEMENTATION
      ),
    hrImplementationTasks: (state): TaskList[] =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.HR_IMPLEMENTATION
      ),
    miscellaneousTasks: (state): TaskList[] =>
      state.tasks.filter(
        (task) => task.category === TASK_CATEGORIES.MISCELLANEOUS
      ),

    /**
     * Check if any category has loading state
     */
    hasActiveLoading: (state): boolean => {
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
    async fetchTasks(): Promise<void> {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        const response: PaginatedResponse<TaskList> = await taskService.getTasks(this.filters);
        
        this.tasks = response.results;

        // Calculate pagination properties
        const pageSize = 10; // Default page size
        const currentPage = this.filters.page || 1;
        const totalPages = Math.ceil(response.count / pageSize);

        this.pagination = {
          count: response.count,
          next: response.next,
          previous: response.previous,
          current_page: currentPage,
          total_pages: totalPages,
          item_range: `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, response.count)}`,
        };
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fetch pending approvals
     */
    async fetchPendingApprovals(): Promise<void> {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        // Use dedicated endpoint for pending approvals
        this.pendingApprovals = await taskService.getPendingApprovals();
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Create a new task
     */
    async createTask(taskData: any): Promise<Task> {
      this.isCreating = true;
      try {
        const taskService = useTaskService();
        const newTask = await taskService.createTask(taskData);
        await this.fetchTasks(); // Refresh the list
        return newTask;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      } finally {
        this.isCreating = false;
      }
    },

    /**
     * Update an existing task
     */
    async updateTask(taskId: number, taskData: any): Promise<Task> {
      this.isUpdating = true;
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.updateTask(taskId, taskData);
        await this.fetchTasks(); // Refresh the list
        return updatedTask;
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId: number): Promise<void> {
      this.isDeleting = true;
      try {
        const taskService = useTaskService();
        await taskService.deleteTask(taskId);
        await this.fetchTasks(); // Refresh the list
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      } finally {
        this.isDeleting = false;
      }
    },

    /**
     * Get a single task by ID
     */
    async fetchTask(taskId: number): Promise<Task> {
      try {
        const taskService = useTaskService();
        const task = await taskService.getTask(taskId);
        this.currentTask = task;
        return task;
      } catch (error) {
        console.error('Error fetching task:', error);
        throw error;
      }
    },

    /**
     * Set filter and refetch tasks
     */
    async setFilter(filterKey: keyof TaskFilters, value: any): Promise<void> {
      (this.filters as any)[filterKey] = value;
      this.filters.page = 1; // Reset to first page
      await this.fetchTasks();
    },

    /**
     * Fetch tasks by category
     */
    async fetchTasksByCategory(category: string): Promise<void> {
      this.isLoading = true;
      try {
        const taskService = useTaskService();
        // Set category filter and fetch tasks
        // Ensure the category is a valid TaskCategory value
        this.filters.category = category as TaskCategory;
        this.filters.page = 1; // Reset to first page
        await this.fetchTasks();
      } catch (error) {
        console.error('Error fetching tasks by category:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Clear all filters
     */
    async clearFilters(keepCategory: boolean = false): Promise<void> {
      this.filters = {
        category: keepCategory ? this.filters.category : undefined,
        status: undefined,
        priority: undefined,
        assigned_to: undefined,
        deadline__lte: undefined,
        page: 1,
        search: undefined,
      };
      await this.fetchTasks();
    },

    /**
     * Fetch status history for a task
     */
    async fetchStatusHistory(taskId: number): Promise<void> {
      try {
        const taskService = useTaskService();
        const history = await taskService.getStatusHistory(taskId);
        this.statusHistory[taskId] = history;
      } catch (error) {
        console.error('Error fetching status history:', error);
      }
    },

    /**
     * Fetch approval history for a task
     */
    async fetchApprovalHistory(taskId: number): Promise<void> {
      try {
        const taskService = useTaskService();
        const history = await taskService.getApprovalHistory(taskId);
        this.approvalHistory[taskId] = history;
      } catch (error) {
        console.error('Error fetching approval history:', error);
      }
    },

    /**
     * Mark task as completed
     */
    async markCompleted(taskId: number, completionData: TaskCompletionRequest): Promise<Task> {
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.markTaskCompleted(taskId, completionData);
        await this.fetchTasks(); // Refresh the list
        return updatedTask;
      } catch (error) {
        console.error('Error marking task as completed:', error);
        throw error;
      }
    },

    /**
     * Initiate approval workflow
     */
    async initiateApproval(taskId: number, approvalData: ApprovalRequest): Promise<Task> {
      this.isInitiatingApproval = true;
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.initiateApproval(taskId, approvalData);
        await this.fetchTasks(); // Refresh the list
        return updatedTask;
      } catch (error) {
        console.error('Error initiating approval:', error);
        throw error;
      } finally {
        this.isInitiatingApproval = false;
      }
    },

    /**
     * Process approval step
     */
    async processApproval(taskId: number, approvalData: { action: 'approve' | 'reject'; remarks?: string }): Promise<Task> {
      this.isProcessingApproval = true;
      try {
        const taskService = useTaskService();
        const updatedTask = await taskService.processApproval(taskId, approvalData);
        await this.fetchTasks(); // Refresh the list
        return updatedTask;
      } catch (error) {
        console.error('Error processing approval:', error);
        throw error;
      } finally {
        this.isProcessingApproval = false;
      }
    },

    /**
     * Get overdue tasks
     */
    async fetchOverdueTasks(): Promise<void> {
      try {
        const taskService = useTaskService();
        this.overdueTasks = await taskService.getOverdueTasks();
      } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        throw error;
      }
    },

    /**
     * Get tasks due soon
     */
    async fetchTasksDueSoon(): Promise<void> {
      try {
        const taskService = useTaskService();
        this.tasksDueSoon = await taskService.getTasksDueSoon();
      } catch (error) {
        console.error('Error fetching tasks due soon:', error);
        throw error;
      }
    },

    /**
     * Get task statistics
     */
    async fetchStatistics(): Promise<void> {
      try {
        const taskService = useTaskService();
        this.statistics = await taskService.getTaskStatistics();
      } catch (error) {
        console.error('Error fetching task statistics:', error);
        throw error;
      }
    },

    /**
     * Set page and refetch
     */
    async setPage(page: number): Promise<void> {
      this.filters.page = page;
      await this.fetchTasks();
    },

    /**
     * Set search and refetch
     */
    async setSearch(search: string): Promise<void> {
      this.filters.search = search;
      this.filters.page = 1;
      await this.fetchTasks();
    },

    /**
     * Set status filter and refetch
     */
    async setStatusFilter(status: TaskStatus | undefined): Promise<void> {
      this.filters.status = status;
      this.filters.page = 1;
      await this.fetchTasks();
    },

    /**
     * Set priority filter and refetch
     */
    async setPriorityFilter(priority: TaskPriority | undefined): Promise<void> {
      this.filters.priority = priority;
      this.filters.page = 1;
      await this.fetchTasks();
    },

    /**
     * Set assignee filter and refetch
     */
    async setAssigneeFilter(assigneeId: number | undefined): Promise<void> {
      this.filters.assigned_to = assigneeId;
      this.filters.page = 1;
      await this.fetchTasks();
    },

    /**
     * Set category filter and refetch
     */
    async setCategoryFilter(category: string | undefined): Promise<void> {
      this.filters.category = category as TaskCategory;
      this.filters.page = 1;
      await this.fetchTasks();
    },
  },
});