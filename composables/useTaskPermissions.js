// ~/composables/useTaskPermissions.js
export const useTaskPermissions = () => {
  const authStore = useAuthStore()
  const route = useRoute()
  
  /**
   * Get comprehensive permissions for a task based on current context
   * @param {Object} task - The task object
   * @returns {Object} Permissions object with canView, canEdit, canDelete flags
   */
  const getTaskPermissions = (task) => {
    if (!task || !authStore.user) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false
      }
    }
    
    const isMyTasksRoute = route.path === '/my-tasks'
    const isTasksRoute = route.path === '/tasks'
    const isAdmin = authStore.isAdmin
    const isNotYetStarted = task.status === 'not_yet_started'
    
    // Permission rules based on requirements:
    // - /my-tasks: only view action allowed (for all users)
    // - /tasks: all actions allowed for admins, but edit/delete only if status is 'not_yet_started'
    
    const permissions = {
      // Everyone can view tasks
      canView: true,
      // Edit: only admins on /tasks route and only if status is not_yet_started
      canEdit: isTasksRoute && isAdmin && isNotYetStarted,
      // Delete: only admins on /tasks route and only if status is not_yet_started
      canDelete: isTasksRoute && isAdmin && isNotYetStarted
    }
    
    return permissions
  }
  
  /**
   * Check if user can view task details
   * @param {Object} task - The task object
   * @returns {Boolean}
   */
  const canViewTask = (task) => {
    return getTaskPermissions(task).canView
  }
  
  /**
   * Check if user can edit task
   * @param {Object} task - The task object
   * @returns {Boolean}
   */
  const canEditTask = (task) => {
    return getTaskPermissions(task).canEdit
  }
  
  /**
   * Check if user can delete task
   * @param {Object} task - The task object
   * @returns {Boolean}
   */
  const canDeleteTask = (task) => {
    return getTaskPermissions(task).canDelete
  }
  
  /**
   * Get route context information
   * @returns {Object} Route context details
   */
  const getRouteContext = () => {
    return {
      isMyTasksRoute: route.path === '/my-tasks',
      isTasksRoute: route.path === '/tasks',
      currentPath: route.path
    }
  }
  
  /**
   * Get user context information
   * @returns {Object} User context details
   */
  const getUserContext = () => {
    return {
      isAuthenticated: authStore.isAuthenticated,
      isAdmin: authStore.isAdmin,
      userId: authStore.user?.id,
      userFullname: authStore.user?.fullname
    }
  }
  
  return {
    getTaskPermissions,
    canViewTask,
    canEditTask,
    canDeleteTask,
    getRouteContext,
    getUserContext
  }
}