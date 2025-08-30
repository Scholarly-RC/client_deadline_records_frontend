import type {
  Task,
  TaskList,
  TaskFilters,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskCompletionRequest,
  ApprovalRequest,
  PaginatedResponse,
  StatusHistoryEntry,
  ApprovalHistoryEntry
} from '~/types';
import { TASK_CATEGORIES } from '~/constants/choices.js';

export const useTaskService = () => {
  const { $apiFetch } = useNuxtApp();

  /**
    * Get all tasks with optional filtering
    */
  const getTasks = async (filters: TaskFilters = {}): Promise<PaginatedResponse<TaskList>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const url = `/api/tasks/${params.toString() ? '?' + params.toString() : ''}`;
    return await $apiFetch<PaginatedResponse<TaskList>>(url, { method: 'GET' });
  };

  /**
   * Get tasks by specific category
   */
  const getTasksByCategory = async (
    category: string, 
    additionalFilters: Partial<TaskFilters> = {}
  ): Promise<PaginatedResponse<TaskList>> => {
    return await getTasks({ category, ...additionalFilters } as TaskFilters);
  };

  /**
   * Helper methods for specific categories (backward compatibility)
   */
  const getComplianceTasks = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.COMPLIANCE, filters);
  const getAccountingAudits = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.ACCOUNTING_AUDIT, filters);
  const getTaxCases = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.TAX_CASE, filters);
  const getFinancialStatements = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.FINANCIAL_STATEMENT, filters);
  const getFinanceImplementations = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.FINANCE_IMPLEMENTATION, filters);
  const getHRImplementations = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.HR_IMPLEMENTATION, filters);
  const getMiscellaneousTasks = (filters: Partial<TaskFilters> = {}) =>
    getTasksByCategory(TASK_CATEGORIES.MISCELLANEOUS, filters);

  /**
    * Create a new task
    */
  const createTask = async (taskData: TaskCreateRequest): Promise<Task> => {
    return await $apiFetch<Task>('/api/tasks/', {
      method: 'POST',
      body: taskData,
    });
  };

  /**
    * Update an existing task
    */
  const updateTask = async (taskId: number, taskData: TaskUpdateRequest): Promise<Task> => {
    return await $apiFetch<Task>(`/api/tasks/${taskId}/`, {
      method: 'PUT',
      body: taskData,
    });
  };

  /**
    * Partially update a task
    */
  const patchTask = async (taskId: number, taskData: Partial<TaskUpdateRequest>): Promise<Task> => {
    return await $apiFetch<Task>(`/api/tasks/${taskId}/`, {
      method: 'PATCH',
      body: taskData,
    });
  };

  /**
    * Delete a task
    */
  const deleteTask = async (taskId: number): Promise<void> => {
    return await $apiFetch<void>(`/api/tasks/${taskId}/`, {
      method: 'DELETE',
    });
  };

  /**
    * Get a single task by ID
    */
  const getTask = async (taskId: number): Promise<Task> => {
    return await $apiFetch<Task>(`/api/tasks/${taskId}/`, {
      method: 'GET',
    });
  };

  /**
    * Get overdue tasks
    */
  const getOverdueTasks = async (): Promise<TaskList[]> => {
    return await $apiFetch<TaskList[]>('/api/tasks/overdue/', { method: 'GET' });
  };

  /**
    * Get tasks due soon (next 7 days)
    */
  const getTasksDueSoon = async (): Promise<TaskList[]> => {
    return await $apiFetch<TaskList[]>('/api/tasks/due_soon/', { method: 'GET' });
  };

  /**
     * Get task statistics with optional date range filtering
     */
   const getTaskStatistics = async (filters?: { start_date?: string; end_date?: string }): Promise<any> => {
     const params = new URLSearchParams();

     if (filters?.start_date) {
       params.append('start_date', filters.start_date);
     }
     if (filters?.end_date) {
       params.append('end_date', filters.end_date);
     }

     const url = `/api/tasks/statistics/${params.toString() ? '?' + params.toString() : ''}`;
     return await $apiFetch<any>(url, { method: 'GET' });
   };

  /**
    * Mark task as completed
    */
  const markTaskCompleted = async (
    taskId: number,
    completionData: TaskCompletionRequest
  ): Promise<Task> => {
    return await $apiFetch<Task>(`/api/tasks/${taskId}/mark_completed/`, {
      method: 'POST',
      body: completionData,
    });
  };

  /**
    * Update task deadline/status
    */
  const updateTaskDeadline = async (taskId: number, updateData: any): Promise<Task> => {
    return await $apiFetch<Task>(`/api/tasks/${taskId}/update-deadline/`, {
      method: 'POST',
      body: updateData,
    });
  };

  /**
    * Initiate approval workflow for a task
    */
  const initiateApproval = async (
    taskId: number,
    approvalData: ApprovalRequest
  ): Promise<Task> => {
    return await $apiFetch<Task>(`/api/tasks/${taskId}/initiate-approval/`, {
      method: 'POST',
      body: approvalData,
    });
  };

  /**
    * Process approval step
    */
  const processApproval = async (
    taskId: number,
    approvalData: { action: 'approve' | 'reject'; remarks?: string }
  ): Promise<Task> => {
    // Map frontend action values to backend expected values
    const backendApprovalData = {
      ...approvalData,
      action: approvalData.action === 'approve' ? 'approved' : 'rejected'
    };

    return await $apiFetch<Task>(`/api/tasks/${taskId}/process-approval/`, {
      method: 'POST',
      body: backendApprovalData,
    });
  };

  /**
     * Get approval history for a task
     */
  const getApprovalHistory = async (taskId: number): Promise<ApprovalHistoryEntry[]> => {
    return await $apiFetch<ApprovalHistoryEntry[]>(`/api/tasks/${taskId}/task-approvals/`, {
      method: 'GET',
    });
  };

  /**
    * Get status history for a task
    */
  const getStatusHistory = async (taskId: number): Promise<StatusHistoryEntry[]> => {
    return await $apiFetch<StatusHistoryEntry[]>(`/api/tasks/${taskId}/status-history/`, {
      method: 'GET',
    });
  };

  /**
    * Get pending approvals for current user
    */
  const getPendingApprovals = async (): Promise<TaskList[]> => {
    return await $apiFetch<TaskList[]>('/api/tasks/pending-approvals/', {
      method: 'GET',
    });
  };

  return {
    // Core CRUD operations
    getTasks,
    getTasksByCategory,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
    getTask,

    // Category-specific methods (backward compatibility)
    getComplianceTasks,
    getAccountingAudits,
    getTaxCases,
    getFinancialStatements,
    getFinanceImplementations,
    getHRImplementations,
    getMiscellaneousTasks,

    // Special operations
    getOverdueTasks,
    getTasksDueSoon,
    getTaskStatistics,
    markTaskCompleted,
    updateTaskDeadline,

    // Approval workflow
    initiateApproval,
    processApproval,
    getApprovalHistory,
    getStatusHistory,
    getPendingApprovals,
  };
};