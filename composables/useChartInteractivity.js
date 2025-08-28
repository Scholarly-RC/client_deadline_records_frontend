/**
 * Chart Interactivity Composable
 * Provides reactive chart interactivity features for dashboard components
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { createChartInteractivity } from '~/utils/dashboard/chartInteractivity.js'

export const useChartInteractivity = (options = {}) => {
  const router = useRouter()
  const dashboardStore = useDashboardStore()
  
  // Reactive state
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const zoomLevel = ref(1)
  const isPanning = ref(false)
  
  // Chart interactivity manager
  let interactivityManager = null
  
  onMounted(() => {
    interactivityManager = createChartInteractivity(router, dashboardStore)
    
    // Register custom drill handlers if provided
    if (options.customDrillHandlers) {
      Object.entries(options.customDrillHandlers).forEach(([chartType, handler]) => {
        interactivityManager.driller.registerDrillHandler(chartType, handler)
      })
    }
  })
  
  onUnmounted(() => {
    interactivityManager = null
  })
  
  /**
   * Initialize interactivity for a chart instance
   */
  const initializeChartInteractivity = (chartInstance, chartType, chartOptions = {}) => {
    if (!interactivityManager || !chartInstance) return null
    
    const defaultOptions = {
      enableDrilling: true,
      enableZoomPan: chartOptions.enableZoomPan || false,
      enableAnimations: chartOptions.enableAnimations !== false,
      animationType: chartOptions.animationType || 'scale',
      drillContext: chartOptions.drillContext || {},
      ...chartOptions
    }
    
    return interactivityManager.initializeChart(chartInstance, chartType, defaultOptions)
  }
  
  /**
   * Handle chart click events with data drilling
   */
  const handleChartClick = async (chartType, params, context = {}) => {
    if (!interactivityManager) return
    
    try {
      const result = await interactivityManager.driller.handleChartClick(chartType, params, context)
      return result
    } catch (error) {
      console.error('Chart click handling failed:', error)
      const toast = useToast()
      toast.add({
        title: 'Navigation Error',
        description: 'Failed to navigate to detailed view',
        color: 'error'
      })
    }
  }
  
  /**
   * Export chart with progress tracking
   */
  const exportChart = async (chartInstance, format, filename, chartData = null) => {
    if (!interactivityManager || isExporting.value) return
    
    try {
      isExporting.value = true
      exportProgress.value = 0
      
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        if (exportProgress.value < 90) {
          exportProgress.value += 10
        }
      }, 100)
      
      const result = await interactivityManager.exportChart(chartInstance, format, filename, chartData)
      
      clearInterval(progressInterval)
      exportProgress.value = 100
      
      // Show success message
      const toast = useToast()
      toast.add({
        title: 'Export Successful',
        description: `Chart exported as ${format.toUpperCase()}`,
        color: 'success'
      })
      
      return result
    } catch (error) {
      console.error('Chart export failed:', error)
      const toast = useToast()
      toast.add({
        title: 'Export Failed',
        description: 'Failed to export chart data',
        color: 'error'
      })
      throw error
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }
  
  /**
   * Reset chart zoom to original level
   */
  const resetChartZoom = (chartInstance) => {
    if (!interactivityManager || !chartInstance) return
    
    interactivityManager.zoomPan.resetZoom(chartInstance)
    zoomLevel.value = 1
  }
  
  /**
   * Animate chart data update
   */
  const animateChartUpdate = (chartInstance, newOption, animationOptions = {}) => {
    if (!interactivityManager || !chartInstance) return
    
    interactivityManager.animator.animateDataUpdate(chartInstance, newOption, animationOptions)
  }
  
  /**
   * Enable real-time chart updates with animations
   */
  const enableRealTimeUpdates = (chartInstance, updateInterval = 30000) => {
    if (!chartInstance) return null
    
    const interval = setInterval(async () => {
      try {
        // Refresh dashboard data
        await dashboardStore.fetchEnhancedDashboardData()
        
        // Animate the update
        if (interactivityManager) {
          interactivityManager.animator.animateDataUpdate(chartInstance, {
            animation: true,
            animationDuration: 500,
            animationEasing: 'cubicOut'
          })
        }
      } catch (error) {
        console.error('Real-time update failed:', error)
      }
    }, updateInterval)
    
    // Return cleanup function
    return () => clearInterval(interval)
  }
  
  /**
   * Create chart tooltip formatter with enhanced information
   */
  const createEnhancedTooltipFormatter = (chartType, additionalData = {}) => {
    return (params) => {
      let tooltipContent = ''
      
      if (Array.isArray(params)) {
        // Multiple series tooltip
        const title = params[0]?.axisValueLabel || params[0]?.name || ''
        tooltipContent = `<div class="chart-tooltip-title">${title}</div>`
        
        params.forEach(param => {
          const color = param.color || '#666'
          const marker = `<span style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>`
          tooltipContent += `<div class="chart-tooltip-item">${marker}${param.seriesName}: ${param.value}</div>`
        })
      } else {
        // Single series tooltip
        const color = params.color || '#666'
        const marker = `<span style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>`
        tooltipContent = `<div class="chart-tooltip-item">${marker}${params.name}: ${params.value}</div>`
        
        // Add percentage for pie charts
        if (chartType === 'pie' && params.percent) {
          tooltipContent += `<div class="chart-tooltip-percent">(${params.percent}%)</div>`
        }
      }
      
      // Add additional context information
      if (additionalData.showClickHint) {
        tooltipContent += '<div class="chart-tooltip-hint">💡 Click to view details</div>'
      }
      
      return `<div class="chart-tooltip">${tooltipContent}</div>`
    }
  }
  
  /**
   * Create contextual chart options based on screen size
   */
  const createResponsiveChartOptions = (baseOptions = {}) => {
    const { width, height } = useWindowSize()
    
    const isMobile = computed(() => width.value < 768)
    const isTablet = computed(() => width.value >= 768 && width.value < 1024)
    const isDesktop = computed(() => width.value >= 1024)
    
    return computed(() => {
      let responsiveOptions = { ...baseOptions }
      
      if (isMobile.value) {
        responsiveOptions = {
          ...responsiveOptions,
          grid: {
            left: '5%',
            right: '5%',
            top: '10%',
            bottom: '10%',
            ...responsiveOptions.grid
          },
          legend: {
            orient: 'horizontal',
            bottom: 0,
            ...responsiveOptions.legend
          }
        }
      } else if (isTablet.value) {
        responsiveOptions = {
          ...responsiveOptions,
          grid: {
            left: '8%',
            right: '8%',
            top: '8%',
            bottom: '15%',
            ...responsiveOptions.grid
          }
        }
      }
      
      return responsiveOptions
    })
  }
  
  return {
    // State
    isExporting: readonly(isExporting),
    exportProgress: readonly(exportProgress),
    zoomLevel: readonly(zoomLevel),
    isPanning: readonly(isPanning),
    
    // Methods
    initializeChartInteractivity,
    handleChartClick,
    exportChart,
    resetChartZoom,
    animateChartUpdate,
    enableRealTimeUpdates,
    createEnhancedTooltipFormatter,
    createResponsiveChartOptions,
    
    // Direct access to managers (for advanced usage)
    getInteractivityManager: () => interactivityManager
  }
}

/**
 * Pre-configured chart interactivity for common dashboard charts
 */
export const useDashboardChartInteractivity = () => {
  const baseInteractivity = useChartInteractivity()
  
  /**
   * Initialize standard dashboard chart
   */
  const initializeDashboardChart = (chartInstance, chartType, options = {}) => {
    const defaultOptions = {
      enableDrilling: true,
      enableZoomPan: ['line', 'bar'].includes(chartType),
      enableAnimations: true,
      animationType: 'scale',
      ...options
    }
    
    return baseInteractivity.initializeChartInteractivity(chartInstance, chartType, defaultOptions)
  }
  
  /**
   * Create standard dashboard tooltip
   */
  const createDashboardTooltip = (chartType) => {
    return baseInteractivity.createEnhancedTooltipFormatter(chartType, {
      showClickHint: true
    })
  }
  
  return {
    ...baseInteractivity,
    initializeDashboardChart,
    createDashboardTooltip
  }
}