/**
 * Chart Interactivity Utilities
 * Provides comprehensive chart interaction features including data drilling,
 * export functionality, time range controls, and chart manipulation
 */

/**
 * Chart Data Drilling System
 */
export class ChartDataDriller {
  constructor(router, store) {
    this.router = router
    this.store = store
    this.drillHandlers = new Map()
  }

  /**
   * Register a drill-down handler for a specific chart type
   */
  registerDrillHandler(chartType, handler) {
    this.drillHandlers.set(chartType, handler)
  }

  /**
   * Handle chart click events and perform appropriate drill-down
   */
  async handleChartClick(chartType, params, context = {}) {
    console.log(`Chart click: ${chartType}`, params, context)

    const handler = this.drillHandlers.get(chartType)
    if (handler) {
      return await handler(params, context)
    }

    // Default drill-down behavior
    return this.defaultDrillDown(chartType, params, context)
  }

  /**
   * Default drill-down behavior for common chart types
   */
  async defaultDrillDown(chartType, params, context) {
    const { seriesName, dataIndex, value, name } = params

    switch (chartType) {
      case 'status_distribution':
        return this.drillToTasksByStatus(name || seriesName)
      
      case 'category_distribution':
        return this.drillToTasksByCategory(name || seriesName)
      
      case 'team_performance':
        return this.drillToUserTasks(params.name)
      
      case 'client_insights':
        return this.drillToClientTasks(params.data?.client_id)
      
      case 'weekly_trends':
        return this.drillToTasksByWeek(dataIndex, context.weekData)
      
      case 'priority_breakdown':
        return this.drillToTasksByPriority(name || seriesName)
      
      default:
        console.log('No drill-down handler for chart type:', chartType)
        return null
    }
  }

  /**
   * Drill down to tasks filtered by status
   */
  drillToTasksByStatus(status) {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
    this.router.push(`/tasks?filter=status&value=${normalizedStatus}`)
  }

  /**
   * Drill down to tasks filtered by category
   */
  drillToTasksByCategory(category) {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_')
    this.router.push(`/tasks?filter=category&value=${normalizedCategory}`)
  }

  /**
   * Drill down to tasks assigned to specific user
   */
  drillToUserTasks(userId) {
    this.router.push(`/tasks?filter=assigned_to&value=${userId}`)
  }

  /**
   * Drill down to tasks for specific client
   */
  drillToClientTasks(clientId) {
    if (clientId) {
      this.router.push(`/tasks?filter=client&value=${clientId}`)
    }
  }

  /**
   * Drill down to tasks for specific week
   */
  drillToTasksByWeek(weekIndex, weekData) {
    if (weekData && weekData[weekIndex]) {
      const weekStart = weekData[weekIndex].week_start
      this.router.push(`/tasks?filter=week&value=${weekStart}`)
    }
  }

  /**
   * Drill down to tasks filtered by priority
   */
  drillToTasksByPriority(priority) {
    const normalizedPriority = priority.toLowerCase().replace(/\s+/g, '_')
    this.router.push(`/tasks?filter=priority&value=${normalizedPriority}`)
  }
}

/**
 * Chart Export System
 */
export class ChartExporter {
  constructor() {
    this.exportFormats = ['png', 'jpg', 'svg', 'pdf']
    this.exportQuality = {
      png: { pixelRatio: 2, backgroundColor: '#ffffff' },
      jpg: { pixelRatio: 2, backgroundColor: '#ffffff', type: 'jpeg' },
      svg: { type: 'svg' },
      pdf: { pixelRatio: 2, backgroundColor: '#ffffff' }
    }
  }

  /**
   * Export chart as image
   */
  async exportChartAsImage(chartInstance, format = 'png', filename = 'chart') {
    if (!chartInstance) {
      throw new Error('Chart instance is required')
    }

    try {
      const options = this.exportQuality[format] || this.exportQuality.png
      const dataURL = chartInstance.getDataURL(options)
      
      this.downloadDataURL(dataURL, `${filename}.${format}`)
      
      return dataURL
    } catch (error) {
      console.error('Failed to export chart:', error)
      throw error
    }
  }

  /**
   * Export chart data as CSV
   */
  exportChartDataAsCSV(chartData, filename = 'chart_data') {
    try {
      const csv = this.convertToCSV(chartData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      this.downloadBlob(url, `${filename}.csv`)
      
      return csv
    } catch (error) {
      console.error('Failed to export CSV:', error)
      throw error
    }
  }

  /**
   * Export chart data as JSON
   */
  exportChartDataAsJSON(chartData, filename = 'chart_data') {
    try {
      const json = JSON.stringify(chartData, null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      this.downloadBlob(url, `${filename}.json`)
      
      return json
    } catch (error) {
      console.error('Failed to export JSON:', error)
      throw error
    }
  }

  /**
   * Convert chart data to CSV format
   */
  convertToCSV(data) {
    if (Array.isArray(data)) {
      // Handle array data (pie chart, etc.)
      const headers = Object.keys(data[0] || {})
      const csvHeaders = headers.join(',')
      const csvRows = data.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
      return [csvHeaders, ...csvRows].join('\n')
    } else if (data.categories && data.series) {
      // Handle series data (bar chart, line chart, etc.)
      const headers = ['Category', ...data.series.map(s => s.name)]
      const csvHeaders = headers.join(',')
      const csvRows = data.categories.map((category, index) => {
        const row = [category]
        data.series.forEach(series => {
          row.push(series.data[index] || '')
        })
        return row.map(cell => `"${cell}"`).join(',')
      })
      return [csvHeaders, ...csvRows].join('\n')
    } else {
      throw new Error('Unsupported data format for CSV export')
    }
  }

  /**
   * Download data URL as file
   */
  downloadDataURL(dataURL, filename) {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Download blob as file
   */
  downloadBlob(url, filename) {
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Chart Zoom and Pan System
 */
export class ChartZoomPan {
  constructor() {
    this.zoomHistory = []
    this.currentZoomLevel = 1
    this.maxZoomLevel = 10
    this.minZoomLevel = 0.1
  }

  /**
   * Enable zoom and pan for a chart
   */
  enableZoomPan(chartInstance, options = {}) {
    if (!chartInstance) return

    const defaultOptions = {
      zoomOnMouseWheel: true,
      panOnMouseMove: true,
      panOnMouseDrag: true,
      zoomSensitivity: 0.1,
      ...options
    }

    // Add data zoom component
    chartInstance.setOption({
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'filter'
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'filter',
          height: 20,
          bottom: 0
        }
      ]
    })

    this.bindZoomEvents(chartInstance, defaultOptions)
  }

  /**
   * Bind zoom and pan events
   */
  bindZoomEvents(chartInstance, options) {
    const chartDom = chartInstance.getDom()

    if (options.zoomOnMouseWheel) {
      chartDom.addEventListener('wheel', (event) => {
        event.preventDefault()
        this.handleWheel(chartInstance, event, options.zoomSensitivity)
      })
    }

    if (options.panOnMouseDrag) {
      this.bindPanEvents(chartInstance, chartDom)
    }
  }

  /**
   * Handle mouse wheel zoom
   */
  handleWheel(chartInstance, event, sensitivity) {
    const delta = event.deltaY > 0 ? -sensitivity : sensitivity
    const newZoomLevel = Math.max(this.minZoomLevel, 
      Math.min(this.maxZoomLevel, this.currentZoomLevel + delta))
    
    if (newZoomLevel !== this.currentZoomLevel) {
      this.currentZoomLevel = newZoomLevel
      this.applyZoom(chartInstance, newZoomLevel)
    }
  }

  /**
   * Apply zoom to chart
   */
  applyZoom(chartInstance, zoomLevel) {
    // Implementation depends on chart type and requirements
    console.log('Applying zoom level:', zoomLevel)
  }

  /**
   * Bind pan events
   */
  bindPanEvents(chartInstance, chartDom) {
    let isPanning = false
    let startX = 0
    let startY = 0

    chartDom.addEventListener('mousedown', (event) => {
      isPanning = true
      startX = event.clientX
      startY = event.clientY
      chartDom.style.cursor = 'grabbing'
    })

    chartDom.addEventListener('mousemove', (event) => {
      if (!isPanning) return

      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY

      this.handlePan(chartInstance, deltaX, deltaY)
      
      startX = event.clientX
      startY = event.clientY
    })

    chartDom.addEventListener('mouseup', () => {
      isPanning = false
      chartDom.style.cursor = 'grab'
    })

    chartDom.addEventListener('mouseleave', () => {
      isPanning = false
      chartDom.style.cursor = 'default'
    })
  }

  /**
   * Handle pan movement
   */
  handlePan(chartInstance, deltaX, deltaY) {
    // Implementation depends on chart type and requirements
    console.log('Panning:', deltaX, deltaY)
  }

  /**
   * Reset zoom to original level
   */
  resetZoom(chartInstance) {
    this.currentZoomLevel = 1
    chartInstance.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    })
  }
}

/**
 * Chart Animation Controller
 */
export class ChartAnimationController {
  constructor() {
    this.animationDuration = 1000
    this.animationEasing = 'cubicOut'
  }

  /**
   * Animate chart data update
   */
  animateDataUpdate(chartInstance, newOption, customAnimation = {}) {
    const animation = {
      animation: true,
      animationDuration: customAnimation.duration || this.animationDuration,
      animationEasing: customAnimation.easing || this.animationEasing,
      animationDelay: customAnimation.delay || 0,
      ...customAnimation
    }

    chartInstance.setOption({
      ...newOption,
      ...animation
    })
  }

  /**
   * Animate chart appearance
   */
  animateChartAppearance(chartInstance, animationType = 'scale') {
    const animations = {
      scale: {
        animation: true,
        animationDuration: 1000,
        animationEasing: 'elasticOut'
      },
      slide: {
        animation: true,
        animationDuration: 800,
        animationEasing: 'backOut'
      },
      fade: {
        animation: true,
        animationDuration: 600,
        animationEasing: 'linear'
      }
    }

    const animation = animations[animationType] || animations.scale
    chartInstance.setOption(animation)
  }
}

/**
 * Main Chart Interactivity Manager
 */
export class ChartInteractivityManager {
  constructor(router, store) {
    this.driller = new ChartDataDriller(router, store)
    this.exporter = new ChartExporter()
    this.zoomPan = new ChartZoomPan()
    this.animator = new ChartAnimationController()
  }

  /**
   * Initialize interactivity for a chart
   */
  initializeChart(chartInstance, chartType, options = {}) {
    // Enable data drilling
    if (options.enableDrilling !== false) {
      this.enableDataDrilling(chartInstance, chartType, options.drillContext)
    }

    // Enable zoom and pan
    if (options.enableZoomPan) {
      this.zoomPan.enableZoomPan(chartInstance, options.zoomPanOptions)
    }

    // Apply initial animations
    if (options.enableAnimations !== false) {
      this.animator.animateChartAppearance(chartInstance, options.animationType)
    }

    return {
      drill: this.driller,
      export: this.exporter,
      zoomPan: this.zoomPan,
      animate: this.animator
    }
  }

  /**
   * Enable data drilling for chart
   */
  enableDataDrilling(chartInstance, chartType, context) {
    chartInstance.on('click', (params) => {
      this.driller.handleChartClick(chartType, params, context)
    })
  }

  /**
   * Export chart with specified format
   */
  async exportChart(chartInstance, format, filename, chartData) {
    switch (format) {
      case 'png':
      case 'jpg':
      case 'svg':
        return await this.exporter.exportChartAsImage(chartInstance, format, filename)
      case 'csv':
        return this.exporter.exportChartDataAsCSV(chartData, filename)
      case 'json':
        return this.exporter.exportChartDataAsJSON(chartData, filename)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }
}

// Export default instance creator
export const createChartInteractivity = (router, store) => {
  return new ChartInteractivityManager(router, store)
}