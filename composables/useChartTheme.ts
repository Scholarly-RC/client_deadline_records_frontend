import { computed } from 'vue'

/**
 * Composable for providing theme-aware chart colors and styles
 * Automatically adjusts colors based on the current light/dark mode
 */
export const useChartTheme = () => {
  const colorMode = useColorMode()
  
  const isDark = computed(() => colorMode.value === 'dark')
  
  // Base color palette that works well in both themes
  const chartColors = computed(() => ({
    // Primary data colors - vibrant and accessible in both modes
    primary: [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#EC4899', // Pink
      '#6366F1'  // Indigo
    ],
    
    // Text colors based on theme
    text: {
      primary: isDark.value ? '#F9FAFB' : '#111827',
      secondary: isDark.value ? '#D1D5DB' : '#6B7280',
      tertiary: isDark.value ? '#9CA3AF' : '#9CA3AF'
    },
    
    // Background colors
    background: {
      primary: isDark.value ? '#1F2937' : '#FFFFFF',
      secondary: isDark.value ? '#374151' : '#F9FAFB',
      tertiary: isDark.value ? '#4B5563' : '#F3F4F6'
    },
    
    // Border and line colors
    border: {
      primary: isDark.value ? '#4B5563' : '#E5E7EB',
      secondary: isDark.value ? '#6B7280' : '#D1D5DB',
      grid: isDark.value ? '#374151' : '#F3F4F6'
    },
    
    // Chart-specific colors
    axis: {
      line: isDark.value ? '#4B5563' : '#E5E7EB',
      label: isDark.value ? '#D1D5DB' : '#6B7280',
      splitLine: isDark.value ? '#374151' : '#F3F4F6'
    }
  }))
  
  // Tooltip configuration that adapts to theme
  const tooltipConfig = computed(() => ({
    backgroundColor: isDark.value ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark.value ? '#4B5563' : '#E5E7EB',
    borderWidth: 1,
    textStyle: {
      color: isDark.value ? '#F9FAFB' : '#374151'
    },
    extraCssText: isDark.value 
      ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);'
      : 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);'
  }))
  
  // Legend configuration
  const legendConfig = computed(() => ({
    textStyle: {
      color: chartColors.value.text.secondary,
      fontSize: 12
    }
  }))
  
  // Axis configuration
  const axisConfig = computed(() => ({
    axisLine: {
      lineStyle: {
        color: chartColors.value.axis.line
      }
    },
    axisLabel: {
      color: chartColors.value.axis.label,
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: chartColors.value.axis.splitLine,
        type: 'dashed' as const
      }
    }
  }))
  
  // Grid configuration
  const gridConfig = computed(() => ({
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '5%',
    containLabel: true
  }))
  
  // Get a specific color with opacity
  const getColorWithOpacity = (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  // Get gradient colors for area charts
  const getGradientColors = (color: string) => ({
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      {
        offset: 0,
        color: getColorWithOpacity(color, 0.4)
      },
      {
        offset: 1,
        color: getColorWithOpacity(color, 0.1)
      }
    ]
  })
  
  return {
    isDark,
    chartColors,
    tooltipConfig,
    legendConfig,
    axisConfig,
    gridConfig,
    getColorWithOpacity,
    getGradientColors
  }
}