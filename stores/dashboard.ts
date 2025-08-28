import { defineStore } from "pinia";
import { useToast } from '../node_modules/@nuxt/ui/dist/runtime/composables/useToast'
import { useNuxtApp } from '#app/nuxt'
import { getErrorMessage } from '~/utils/errorHandler'
import { useTaskService } from '~/composables/useTaskService'

interface DashboardState {
  // Legacy stats from /api/stats/
  stats: boolean;
  
  // Enhanced statistics from /api/tasks/statistics/
  enhancedStats: any;
  
  // Chart data from enhanced API
  weeklyTrends: any[];
  categoryDistribution: Record<string, any>;
  statusBreakdown: Record<string, any>;
  priorityBreakdown: Record<string, any>;
  
  // Performance metrics
  performanceMetrics: Record<string, any>;
  teamAnalytics: Record<string, any>;
  clientInsights: Record<string, any>;
  businessIntelligence: Record<string, any>;
  quickActions: Record<string, any>;
  
  // Additional dashboard data
  overdueTasks: any[];
  tasksDueSoon: any[];
  
  // UI state for enhanced dashboard
  currentLayout: string;
  selectedTimeRange: string;
  chartLoadingStates: Record<string, boolean>;
  
  // Real-time data
  realtimeEnabled: boolean;
  lastUpdated: string | null;
  refreshInterval: any;
  
  // Loading states
  isLoading: boolean;
  isLoadingTaskStats: boolean;
  isLoadingOverdue: boolean;
  isLoadingDueSoon: boolean;
  isLoadingEnhanced: boolean;
}

export const useDashboardStore = defineStore("dashboardStore", {
  state: (): DashboardState => ({
    // Legacy stats from /api/stats/
    stats: false,
    
    // Enhanced statistics from /api/tasks/statistics/
    enhancedStats: null,
    
    // Chart data from enhanced API
    weeklyTrends: [],
    categoryDistribution: {},
    statusBreakdown: {},
    priorityBreakdown: {},
    
    // Performance metrics
    performanceMetrics: {},
    teamAnalytics: {},
    clientInsights: {},
    businessIntelligence: {},
    quickActions: {},
    
    // Additional dashboard data
    overdueTasks: [],
    tasksDueSoon: [],
    
    // UI state for enhanced dashboard
    currentLayout: 'operations', // executive, operations, analytics, personal
    selectedTimeRange: '7d',
    chartLoadingStates: {
      weeklyTrends: false,
      categoryDistribution: false,
      statusBreakdown: false,
      priorityBreakdown: false,
      teamPerformance: false,
      clientInsights: false
    },
    
    // Real-time data
    realtimeEnabled: false,
    lastUpdated: null,
    refreshInterval: null,
    
    // Loading states
    isLoading: false,
    isLoadingTaskStats: false,
    isLoadingOverdue: false,
    isLoadingDueSoon: false,
    isLoadingEnhanced: false,
  }),
  
  getters: {
    // Legacy getters for backward compatibility
    /**
     * Get total tasks count from task statistics
     */
    totalTasks: (state) => {
      return state.enhancedStats?.summary?.total || 0;
    },
    
    /**
     * Get completed tasks count
     */
    completedTasks: (state) => {
      return state.enhancedStats?.summary?.completed || 0;
    },
    
    /**
     * Get pending tasks count
     */
    pendingTasks: (state) => {
      return state.enhancedStats?.summary?.pending || 0;
    },
    
    /**
     * Get overdue tasks count
     */
    overdueTasksCount: (state) => {
      return state.enhancedStats?.summary?.overdue || state.overdueTasks?.length || 0;
    },
    
    /**
     * Get tasks due soon count
     */
    tasksDueSoonCount: (state) => {
      return state.enhancedStats?.summary?.due_this_week || state.tasksDueSoon?.length || 0;
    },
    
    // Enhanced getters for new dashboard features
    /**
     * Get overall completion rate
     */
    overallCompletionRate: (state) => {
      return state.performanceMetrics?.overall_completion_rate || 0;
    },
    
    /**
     * Get workload balance score
     */
    workloadBalanceScore: (state) => {
      return state.performanceMetrics?.workload_balance_score || 0;
    },
    
    /**
     * Get system health status
     */
    systemHealthStatus: (state) => {
      return state.businessIntelligence?.system_health?.system_load_indicator || 'unknown';
    },
    
    /**
     * Get chart data for weekly trends
     */
    weeklyTrendsChartData: (state) => {
      if (!state.weeklyTrends?.length) return { xAxis: [], completed: [], created: [] };
      
      return {
        xAxis: state.weeklyTrends.map(week => week.week_label),
        completed: state.weeklyTrends.map(week => week.completed),
        created: state.weeklyTrends.map(week => week.created)
      };
    },
    
    /**
     * Get chart data for category distribution
     */
    categoryDistributionChartData: (state) => {
      if (!state.categoryDistribution || Object.keys(state.categoryDistribution).length === 0) return [];
      
      return Object.entries(state.categoryDistribution).map(([key, value]) => ({
        name: value.display_name,
        value: value.count,
        key: key
      }));
    },
    
    /**
     * Get chart data for status breakdown
     */
    statusBreakdownChartData: (state) => {
      if (!state.statusBreakdown || Object.keys(state.statusBreakdown).length === 0) return [];
      
      return Object.entries(state.statusBreakdown).map(([key, value]) => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: value,
        key: key
      }));
    },
    
    /**
     * Get chart data for priority breakdown
     */
    priorityBreakdownChartData: (state) => {
      if (!state.priorityBreakdown || Object.keys(state.priorityBreakdown).length === 0) return [];
      
      return Object.entries(state.priorityBreakdown).map(([key, value]) => ({
        name: key.replace('_priority', '').toUpperCase(),
        value: value,
        key: key
      }));
    },
    
    /**
     * Get top performers from team analytics
     */
    topPerformers: (state) => {
      return state.teamAnalytics?.user_performance
        ?.sort((a: any, b: any) => b.completion_rate - a.completion_rate)
        ?.slice(0, 5) || [];
    },
    
    /**
     * Get top clients by task volume
     */
    topClients: (state) => {
      return state.clientInsights?.top_clients || [];
    },
    
    /**
     * Get critical alerts
     */
    criticalAlerts: (state) => {
      const alerts = [];
      
      if (state.enhancedStats?.summary?.overdue > 0) {
        alerts.push({
          type: 'error',
          title: 'Overdue Tasks',
          message: `${state.enhancedStats.summary.overdue} tasks are overdue`,
          action: 'View Tasks',
          count: state.enhancedStats.summary.overdue
        });
      }
      
      if (state.enhancedStats?.summary?.high_priority > 0) {
        alerts.push({
          type: 'warning',
          title: 'High Priority Tasks',
          message: `${state.enhancedStats.summary.high_priority} high priority tasks need attention`,
          action: 'View Tasks',
          count: state.enhancedStats.summary.high_priority
        });
      }
      
      return alerts;
    },
    
    /**
     * Get task statistics by category (legacy)
     */
    taskStatsByCategory: (state) => {
      return state.categoryDistribution || {};
    },
    
    /**
     * Get task statistics by status (legacy)
     */
    taskStatsByStatus: (state) => {
      return state.statusBreakdown || {};
    },
    
    /**
     * Get task statistics by priority (legacy)
     */
    taskStatsByPriority: (state) => {
      return state.priorityBreakdown || {};
    },
    
    /**
     * Check if any data is loading
     */
    isAnyLoading: (state) => {
      return state.isLoading || 
             state.isLoadingTaskStats || 
             state.isLoadingOverdue || 
             state.isLoadingDueSoon ||
             state.isLoadingEnhanced ||
             Object.values(state.chartLoadingStates).some(loading => loading);
    },
    
    /**
     * Check if specific chart is loading
     */
    isChartLoading: (state) => (chartId: string) => {
      return state.chartLoadingStates[chartId] || false;
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
        const response: boolean = await $apiFetch("/api/stats/", {
          method: "GET",
        });
        this.stats = response;
      } catch (error: any) {
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
     * Get new task statistics (legacy method for backward compatibility)
     */
    async getTaskStatistics() {
      const toast = useToast();
      try {
        this.isLoadingTaskStats = true;
        const taskService = useTaskService();
        const response = await taskService.getTaskStatistics();
        
        // Store in enhancedStats for compatibility
        this.enhancedStats = response;
        
        return response;
      } catch (error: any) {
        toast.add({
          title: "Task Statistics Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error(error);
        throw error;
      } finally {
        this.isLoadingTaskStats = false;
      }
    },
    
    /**
     * Fetch enhanced dashboard data from /api/tasks/statistics/
     */
    async fetchEnhancedDashboardData() {
      const toast = useToast();
      try {
        this.isLoadingEnhanced = true;
        this.setChartLoading('all', true);
        
        // Use the actual statistics endpoint
        const taskService = useTaskService();
        const response = await taskService.getTaskStatistics();
        
        // Store the complete enhanced statistics
        this.enhancedStats = response;
        
        // Extract chart data
        this.weeklyTrends = response.charts_data?.weekly_trends || [];
        this.categoryDistribution = response.charts_data?.category_distribution || {};
        this.statusBreakdown = response.charts_data?.status_breakdown || {};
        this.priorityBreakdown = response.charts_data?.priority_breakdown || {};
        
        // Extract analytics data
        this.performanceMetrics = response.performance_metrics || {};
        this.teamAnalytics = response.team_analytics || {};
        this.clientInsights = response.client_insights || {};
        this.businessIntelligence = response.business_intelligence || {};
        this.quickActions = response.quick_actions || {};
        
        this.lastUpdated = new Date().toISOString();
        
      } catch (error: any) {
        toast.add({
          title: "Enhanced Dashboard Data Unavailable",
          description: getErrorMessage(error),
          color: "error",
          icon: "mdi:close-box-multiple",
          duration: 5000,
        });
        console.error('Failed to fetch enhanced dashboard data:', error);
      } finally {
        this.setChartLoading('all', false);
        this.isLoadingEnhanced = false;
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
      } catch (error: any) {
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
      } catch (error: any) {
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
     * Load all dashboard data (enhanced version)
     */
    async loadAllDashboardData() {
      try {
        // Load enhanced data as primary source
        await Promise.allSettled([
          this.fetchEnhancedDashboardData(),
          this.getOverdueTasks(),
          this.getTasksDueSoon(),
          this.getDashboardData(), // Keep legacy for backward compatibility
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    },
    
    /**
     * Set chart loading state
     */
    setChartLoading(chartId: string, loading: boolean) {
      if (chartId === 'all') {
        Object.keys(this.chartLoadingStates).forEach(key => {
          this.chartLoadingStates[key] = loading;
        });
      } else {
        this.chartLoadingStates[chartId] = loading;
      }
    },
    
    /**
     * Switch dashboard layout
     */
    switchLayout(layout: string) {
      const validLayouts = ['executive', 'operations', 'analytics', 'personal'];
      if (validLayouts.includes(layout)) {
        this.currentLayout = layout;
      }
    },
    
    /**
     * Update time range and refresh data
     */
    async updateTimeRange(range: string) {
      const validRanges = ['1d', '7d', '30d', '90d', '1y'];
      if (validRanges.includes(range)) {
        this.selectedTimeRange = range;
        // Trigger data refresh with new time range
        await this.fetchEnhancedDashboardData();
      }
    },
    
    /**
     * Enable/disable real-time updates
     */
    toggleRealtime(enabled: boolean | null = null) {
      this.realtimeEnabled = enabled !== null ? enabled : !this.realtimeEnabled;
      
      if (this.realtimeEnabled) {
        this.startRealTimeUpdates();
      } else {
        this.stopRealTimeUpdates();
      }
    },
    
    /**
     * Start real-time updates with enhanced capabilities
     */
    startRealTimeUpdates(interval = 30000) {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
      
      console.log('Starting real-time updates with interval:', interval);
      
      // Refresh at specified interval
      this.refreshInterval = setInterval(async () => {
        try {
          await this.fetchEnhancedDashboardData();
          this.lastUpdated = new Date().toISOString();
        } catch (error) {
          console.error('Real-time update failed:', error);
          // Don't disable real-time on single failure, but log it
        }
      }, interval);
    },
    
    /**
     * Stop real-time updates
     */
    stopRealTimeUpdates() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },
    
    /**
     * Refresh dashboard data with loading indicators
     */
    async refreshDashboard(force = false) {
      const refreshStartTime = Date.now();
      
      try {
        if (force) {
          this.isLoading = true;
        }
        
        await this.loadAllDashboardData();
        
        this.lastUpdated = new Date().toISOString();
        
        const refreshTime = Date.now() - refreshStartTime;
        console.log(`Dashboard refreshed in ${refreshTime}ms`);
        
        if (force) {
          // Show success notification for manual refresh
          const toast = useToast();
          toast.add({
            title: 'Dashboard Updated',
            description: 'Data has been refreshed successfully',
            color: 'success',
            duration: 3000
          });
        }
        
        return true;
      } catch (error) {
        console.error('Dashboard refresh failed:', error);
        
        if (force) {
          // Show error notification for manual refresh
          const toast = useToast();
          toast.add({
            title: 'Refresh Failed',
            description: 'Failed to update dashboard data',
            color: 'error',
            duration: 5000
          });
        }
        
        throw error;
      } finally {
        if (force) {
          this.isLoading = false;
        }
      }
    },
    
    /**
     * Update specific chart data without full refresh
     */
    async updateChartData(chartType: string, newData: any) {
      switch (chartType) {
        case 'weekly_trends':
          this.weeklyTrends = newData;
          break;
        case 'category_distribution':
          this.categoryDistribution = newData;
          break;
        case 'status_breakdown':
          this.statusBreakdown = newData;
          break;
        case 'priority_breakdown':
          this.priorityBreakdown = newData;
          break;
        case 'team_performance':
          this.teamAnalytics = { ...this.teamAnalytics, user_performance: newData };
          break;
        case 'client_insights':
          this.clientInsights = newData;
          break;
        default:
          console.warn('Unknown chart type:', chartType);
      }
      
      this.lastUpdated = new Date().toISOString();
    },
    
    /**
     * Get data freshness status
     */
    getDataFreshness() {
      if (!this.lastUpdated) return 'never';
      
      const now = new Date();
      const lastUpdate = new Date(this.lastUpdated);
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      
      if (diffMinutes < 1) return 'fresh';
      if (diffMinutes < 5) return 'recent';
      if (diffMinutes < 15) return 'stale';
      return 'very-stale';
    },
    
    /**
     * Check if dashboard needs refresh
     */
    needsRefresh() {
      const freshness = this.getDataFreshness();
      return freshness === 'stale' || freshness === 'very-stale' || freshness === 'never';
    },
    clearDashboard() {
      // Legacy data
      this.stats = false;
      // Removed reference to non-existent taskStatistics property
      this.overdueTasks = [];
      this.tasksDueSoon = [];
      
      // Enhanced data
      this.enhancedStats = null;
      this.weeklyTrends = [];
      this.categoryDistribution = {};
      this.statusBreakdown = {};
      this.priorityBreakdown = {};
      this.performanceMetrics = {};
      this.teamAnalytics = {};
      this.clientInsights = {};
      this.businessIntelligence = {};
      this.quickActions = {};
      
      // UI state
      this.currentLayout = 'operations';
      this.selectedTimeRange = '7d';
      
      // Real-time state
      this.stopRealTimeUpdates();
      this.realtimeEnabled = false;
      this.lastUpdated = null;
      
      // Reset chart loading states
      Object.keys(this.chartLoadingStates).forEach(key => {
        this.chartLoadingStates[key] = false;
      });
    },
  },
});
