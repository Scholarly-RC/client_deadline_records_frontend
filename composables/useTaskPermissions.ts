// ~/composables/useTaskPermissions.ts
import type { TaskList } from '~/types';

interface TaskPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface RouteContext {
  isMyTasksRoute: boolean;
  isTasksRoute: boolean;
  currentPath: string;
}

interface UserContext {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId?: number;
  userFullname?: string;
}

export const useTaskPermissions = () => {
  const authStore = useAuthStore();
  const route = useRoute();
  
  /**
   * Get comprehensive permissions for a task based on current context
   * @param task - The task object
   * @returns Permissions object with canView, canEdit, canDelete flags
   */
  const getTaskPermissions = (task: TaskList | null): TaskPermissions => {
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
   * @param task - The task object
   * @returns Boolean
   */
  const canViewTask = (task: TaskList | null): boolean => {
    return getTaskPermissions(task).canView;
  };
  
  /**
   * Check if user can edit task
   * @param task - The task object
   * @returns Boolean
   */
  const canEditTask = (task: TaskList | null): boolean => {
    return getTaskPermissions(task).canEdit;
  };
  
  /**
   * Check if user can delete task
   * @param task - The task object
   * @returns Boolean
   */
  const canDeleteTask = (task: TaskList | null): boolean => {
    return getTaskPermissions(task).canDelete;
  };
  
  /**
   * Get route context information
   * @returns Route context details
   */
  const getRouteContext = (): RouteContext => {
    return {
      isMyTasksRoute: route.path === '/my-tasks',
      isTasksRoute: route.path === '/tasks',
      currentPath: route.path
    };
  };
  
  /**
   * Get user context information
   * @returns User context details
   */
  const getUserContext = (): UserContext => {
    return {
      isAuthenticated: authStore.isAuthenticated,
      isAdmin: authStore.isAdmin,
      userId: authStore.user?.id,
      userFullname: authStore.user?.fullname
    };
  };
  
  return {
    getTaskPermissions,
    canViewTask,
    canEditTask,
    canDeleteTask,
    getRouteContext,
    getUserContext
  }
}