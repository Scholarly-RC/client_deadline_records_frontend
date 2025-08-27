// composables/useTaskService.js
import {
  TASK_CATEGORIES,
  LEGACY_CATEGORY_MAPPING,
} from "~/constants/choices.js";

/**
 * Unified Task Service for the new backend API
 * Replaces all category-specific services with a single task endpoint
 */
export const useTaskService = () => {
  const { $apiFetch } = useNuxtApp();

  /**
   * Get all tasks with optional filtering
   * @param {Object} filters - Filter parameters
   * @param {string} filters.category - Task category filter
   * @param {string} filters.status - Task status filter
   * @param {string} filters.priority - Task priority filter
   * @param {number} filters.assigned_to - User ID filter
   * @param {string} filters.deadline__lte - Deadline less than or equal filter
   * @param {number} filters.page - Page number for pagination
   * @returns {Promise} API response with tasks and pagination
   */
  const getTasks = async (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    const url = `/api/tasks/${
      params.toString() ? "?" + params.toString() : ""
    }`;
    return await $apiFetch(url, { method: "GET" });
  };

  /**
   * Get tasks by specific category
   * @param {string} category - Task category (COMPLIANCE, TAX_CASE, etc.)
   * @param {Object} additionalFilters - Additional filter parameters
   * @returns {Promise} API response with filtered tasks
   */
  const getTasksByCategory = async (category, additionalFilters = {}) => {
    return await getTasks({ category, ...additionalFilters });
  };

  /**
   * Helper methods for specific categories (backward compatibility)
   */
  const getComplianceTasks = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.COMPLIANCE, filters);
  const getAccountingAudits = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.ACCOUNTING_AUDIT, filters);
  const getTaxCases = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.TAX_CASE, filters);
  const getFinancialStatements = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.FINANCIAL_STATEMENT, filters);
  const getFinanceImplementations = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.FINANCE_IMPLEMENTATION, filters);
  const getHRImplementations = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.HR_IMPLEMENTATION, filters);
  const getMiscellaneousTasks = (filters = {}) =>
    getTasksByCategory(TASK_CATEGORIES.MISCELLANEOUS, filters);

  /**
   * Create a new task
   * @param {Object} taskData - Task data object
   * @returns {Promise} Created task response
   */
  const createTask = async (taskData) => {
    return await $apiFetch("/api/tasks/", {
      method: "POST",
      body: taskData,
    });
  };

  /**
   * Update an existing task
   * @param {number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} Updated task response
   */
  const updateTask = async (taskId, taskData) => {
    return await $apiFetch(`/api/tasks/${taskId}/`, {
      method: "PUT",
      body: taskData,
    });
  };

  /**
   * Partially update a task
   * @param {number} taskId - Task ID
   * @param {Object} taskData - Partial task data
   * @returns {Promise} Updated task response
   */
  const patchTask = async (taskId, taskData) => {
    return await $apiFetch(`/api/tasks/${taskId}/`, {
      method: "PATCH",
      body: taskData,
    });
  };

  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @returns {Promise} Delete response
   */
  const deleteTask = async (taskId) => {
    return await $apiFetch(`/api/tasks/${taskId}/`, {
      method: "DELETE",
    });
  };

  /**
   * Get a single task by ID
   * @param {number} taskId - Task ID
   * @returns {Promise} Task data
   */
  const getTask = async (taskId) => {
    return await $apiFetch(`/api/tasks/${taskId}/`, {
      method: "GET",
    });
  };

  /**
   * New custom actions from the updated backend
   */

  /**
   * Get overdue tasks
   * @returns {Promise} Overdue tasks
   */
  const getOverdueTasks = async () => {
    return await $apiFetch("/api/tasks/overdue/", { method: "GET" });
  };

  /**
   * Get tasks due soon (next 7 days)
   * @returns {Promise} Tasks due soon
   */
  const getTasksDueSoon = async () => {
    return await $apiFetch("/api/tasks/due_soon/", { method: "GET" });
  };

  /**
   * Get tasks by user
   * @param {number} userId - User ID
   * @returns {Promise} User's tasks
   */
  const getTasksByUser = async (userId) => {
    return await $apiFetch(`/api/tasks/by_user/?user_id=${userId}`, {
      method: "GET",
    });
  };

  /**
   * Get task statistics
   * @returns {Promise} Task statistics
   */
  const getTaskStatistics = async () => {
    return await $apiFetch("/api/tasks/statistics/", { method: "GET" });
  };

  /**
   * Mark task as completed
   * @param {number} taskId - Task ID
   * @param {Object} completionData - Completion data
   * @param {string} completionData.completion_date - Completion date
   * @param {string} completionData.date_complied - Date complied
   * @param {string} completionData.remarks - Completion remarks
   * @returns {Promise} Updated task
   */
  const markTaskCompleted = async (taskId, completionData) => {
    return await $apiFetch(`/api/tasks/${taskId}/mark_completed/`, {
      method: "POST",
      body: completionData,
    });
  };

  /**
   * Update task deadline/status
   * @param {number} taskId - Task ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.status - New status
   * @param {string} updateData.remarks - Update remarks
   * @returns {Promise} Updated task
   */
  const updateTaskDeadline = async (taskId, updateData) => {
    return await $apiFetch(`/api/tasks/${taskId}/update-deadline/`, {
      method: "POST",
      body: updateData,
    });
  };

  /**
   * APPROVAL WORKFLOW METHODS
   */

  /**
   * Initiate approval workflow for a task
   * @param {number} taskId - Task ID
   * @param {Object} approvalData - Approval initiation data
   * @param {number[]} approvalData.approvers - Array of admin user IDs in sequence order
   * @returns {Promise} Approval initiation response
   */
  const initiateApproval = async (taskId, approvalData) => {
    return await $apiFetch(`/api/tasks/${taskId}/initiate-approval/`, {
      method: "POST",
      body: approvalData,
    });
  };

  /**
   * Process approval decision for a task
   * @param {number} taskId - Task ID
   * @param {Object} decisionData - Approval decision data
   * @param {string} decisionData.action - "approved" or "rejected"
   * @param {string} decisionData.comments - Optional approval comments
   * @returns {Promise} Approval decision response
   */
  const processApproval = async (taskId, decisionData) => {
    return await $apiFetch(`/api/tasks/${taskId}/process-approval/`, {
      method: "POST",
      body: decisionData,
    });
  };

  /**
   * Get approval history for a task
   * @param {number} taskId - Task ID
   * @returns {Promise} Approval history with approvals and status history
   */
  const getApprovalHistory = async (taskId) => {
    return await $apiFetch(`/api/tasks/${taskId}/task-approvals/`, {
      method: "GET",
    });
  };

  /**
   * Get status history for a task
   * @param {number} taskId - Task ID
   * @returns {Promise} Status history
   */
  const getStatusHistory = async (taskId) => {
    return await $apiFetch(`/api/tasks/${taskId}/status-history/`, {
      method: "GET",
    });
  };

  /**
   * Get pending approvals for current user
   * @returns {Promise} Array of tasks pending current user's approval
   */
  const getPendingApprovals = async () => {
    return await $apiFetch("/api/tasks/pending-approvals/", {
      method: "GET",
    });
  };

  /**
   * Legacy compatibility method for user deadlines
   * Now supports pagination - returns paginated response
   * @param {number} userId - User ID
   * @param {Object} filters - Optional pagination and filter parameters
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.page_size - Items per page
   * @param {string} filters.search - Search query
   * @param {string} filters.category - Filter by category
   * @param {string} filters.status - Filter by status
   * @param {string} filters.priority - Filter by priority
   * @returns {Promise} Paginated user deadlines response with results array
   */
  const getUserDeadlines = async (userId, filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    const url = `/api/users/${userId}/deadlines-tasks/${
      params.toString() ? "?" + params.toString() : ""
    }`;
    
    return await $apiFetch(url, {
      method: "GET",
    });
  };

  /**
   * Convert legacy category to new category format
   * @param {string} legacyCategory - Legacy category name
   * @returns {string} New category format
   */
  const convertLegacyCategory = (legacyCategory) => {
    return LEGACY_CATEGORY_MAPPING[legacyCategory] || legacyCategory;
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

    // Category-specific getters (backward compatibility)
    getComplianceTasks,
    getAccountingAudits,
    getTaxCases,
    getFinancialStatements,
    getFinanceImplementations,
    getHRImplementations,
    getMiscellaneousTasks,

    // New custom actions
    getOverdueTasks,
    getTasksDueSoon,
    getTasksByUser,
    getTaskStatistics,
    markTaskCompleted,
    updateTaskDeadline,

    // Approval workflow methods
    initiateApproval,
    processApproval,
    getApprovalHistory,
    getStatusHistory,
    getPendingApprovals,

    // Legacy compatibility
    getUserDeadlines,
    convertLegacyCategory,
  };
};
