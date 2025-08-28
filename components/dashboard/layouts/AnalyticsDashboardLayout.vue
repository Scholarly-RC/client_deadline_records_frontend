<template>
  <div class="analytics-dashboard-layout space-y-6">
    <!-- Analytics Overview -->
    <section class="analytics-overview-section">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analytics & Insights</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Productivity Index -->
        <MetricCard
          title="Productivity Index"
          :value="calculateProductivityIndex()"
          format="percentage"
          icon="mdi:trending-up"
          icon-color="green"
          :trend="{ direction: 'up', percentage: 12.5 }"
          :is-loading="dashboardStore.isAnyLoading"
          variant="success"
          subtitle="Based on completion rates"
        />
        
        <!-- Average Completion Time -->
        <MetricCard
          title="Avg Completion Time"
          :value="performanceMetrics?.average_completion_days || 0"
          icon="mdi:clock-outline"
          icon-color="blue"
          :trend="{ direction: 'down', percentage: 8.2 }"
          :is-loading="dashboardStore.isAnyLoading"
          subtitle="Days per task"
        />
        
        <!-- Quality Score -->
        <MetricCard
          title="Quality Score"
          :value="calculateQualityScore()"
          format="percentage"
          icon="mdi:star"
          icon-color="yellow"
          :trend="{ direction: 'up', percentage: 5.1 }"
          :is-loading="dashboardStore.isAnyLoading"
          subtitle="Based on revisions needed"
        />
        
        <!-- Efficiency Rating -->
        <MetricCard
          title="Efficiency Rating"
          :value="performanceMetrics?.workload_balance_score || 0"
          format="percentage"
          icon="mdi:speedometer"
          icon-color="purple"
          :trend="{ direction: 'stable', percentage: 0 }"
          :is-loading="dashboardStore.isAnyLoading"
          subtitle="Resource utilization"
        />
      </div>
    </section>
    
    <!-- Trend Analysis -->
    <section class="trend-analysis-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Weekly Performance Trends -->
        <LineChartComponent
          title="Performance Trends Analysis"
          :data="getDetailedTrendsData()"
          :is-loading="dashboardStore.isChartLoading('weeklyTrends')"
          :colors="['#10B981', '#3B82F6', '#F59E0B', '#EF4444']"
          :smooth="true"
          @click="handleTrendsClick"
          @time-range-change="handleTimeRangeChange"
        />
        
        <!-- Workload Heatmap Simulation -->
        <div class="workload-heatmap">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Workload Patterns</h3>
            </template>
            <div class="heatmap-grid">
              <div class="grid grid-cols-7 gap-1 mb-4">
                <div v-for="day in weekDays" :key="day" class="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                  {{ day }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <div 
                  v-for="(intensity, index) in workloadIntensity" 
                  :key="index"
                  :class="getHeatmapCellClasses(intensity)"
                  class="aspect-square rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
                  :title="`${intensity} tasks`"
                ></div>
              </div>
              <div class="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <div class="flex gap-1">
                  <div class="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                  <div class="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded-sm"></div>
                  <div class="w-3 h-3 bg-blue-400 dark:bg-blue-600 rounded-sm"></div>
                  <div class="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-sm"></div>
                  <div class="w-3 h-3 bg-blue-800 dark:bg-blue-200 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
    
    <!-- Advanced Analytics -->
    <section class="advanced-analytics-section">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Client Analytics -->
        <ClientInsightsPanel
          :is-loading="dashboardStore.isAnyLoading"
          @view-all-clients="navigateToClients"
          @view-client="viewClientDetails"
          @chart-click="handleChartClick"
        />
        
        <!-- Performance Breakdown -->
        <div class="performance-breakdown space-y-6">
          <!-- Category Performance -->
          <BarChartComponent
            title="Category Performance"
            :data="getCategoryPerformanceData()"
            :is-loading="dashboardStore.isChartLoading('categoryDistribution')"
            :height="'300px'"
            :show-sort-options="true"
            @click="handleCategoryPerformanceClick"
          />
          
          <!-- Time Distribution -->
          <PieChartComponent
            title="Time Distribution"
            :data="getTimeDistributionData()"
            :is-loading="dashboardStore.isAnyLoading"
            :height="'250px'"
            :show-chart-type-toggle="false"
          />
        </div>
        
        <!-- Predictive Insights -->
        <div class="predictive-insights space-y-6">
          <!-- Forecast Card -->
          <TrendCard
            title="Workload Forecast"
            :value="getPredictedWorkload()"
            value-label="Predicted tasks next week"
            :trend="{ direction: 'up', percentage: 18.5 }"
            :chart-data="getForecastTrendData()"
            chart-type="line"
            :secondary-metrics="[
              { label: 'Confidence', value: '87%' },
              { label: 'Risk Level', value: 'Medium' }
            ]"
          />
          
          <!-- Capacity Planning -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Capacity Planning</h3>
            </template>
            <div class="space-y-4">
              <!-- Current Utilization -->
              <div class="utilization-meter">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-600 dark:text-gray-400">Team Utilization</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ getTeamUtilization() }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    :class="getUtilizationBarColor()"
                    :style="{ width: `${getTeamUtilization()}%` }"
                    class="h-3 rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
              
              <!-- Recommendations -->
              <div class="recommendations">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li v-for="rec in getCapacityRecommendations()" :key="rec" class="flex items-start gap-2">
                    <UIcon name="mdi:lightbulb-outline" class="w-4 h-4 mt-0.5 text-yellow-500" />
                    {{ rec }}
                  </li>
                </ul>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
    
    <!-- Data Export & Reports -->
    <section class="reports-section">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Analytics Reports</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UButton 
            label="Performance Report"
            icon="mdi:chart-line"
            variant="outline"
            class="justify-center"
            @click="generatePerformanceReport"
          />
          <UButton 
            label="Trend Analysis"
            icon="mdi:trending-up"
            variant="outline"
            class="justify-center"
            @click="generateTrendReport"
          />
          <UButton 
            label="Custom Analytics"
            icon="mdi:cog"
            variant="outline"
            class="justify-center"
            @click="openCustomAnalytics"
          />
        </div>
      </UCard>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricCard from '../kpi/MetricCard.vue'
import TrendCard from '../kpi/TrendCard.vue'
import LineChartComponent from '../charts/LineChartComponent.vue'
import BarChartComponent from '../charts/BarChartComponent.vue'
import PieChartComponent from '../charts/PieChartComponent.vue'
import ClientInsightsPanel from '../panels/ClientInsightsPanel.vue'

const emit = defineEmits(['navigate', 'chartClick', 'action', 'timeRangeChange'])

const dashboardStore = useDashboardStore()
const { performanceMetrics } = storeToRefs(dashboardStore)

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Mock workload intensity data for heatmap (28 days = 4 weeks)
const workloadIntensity = computed(() => {
  // Generate mock data for the last 4 weeks
  const data = []
  for (let i = 0; i < 28; i++) {
    data.push(Math.floor(Math.random() * 10) + 1) // 1-10 tasks per day
  }
  return data
})

const calculateProductivityIndex = () => {
  // Calculate based on completion rate and quality metrics
  const completionRate = dashboardStore.overallCompletionRate || 0
  const qualityScore = calculateQualityScore()
  return ((completionRate + qualityScore) / 2).toFixed(1)
}

const calculateQualityScore = () => {
  // Mock calculation based on revision rates
  const onTimeRate = performanceMetrics.value?.on_time_completion_rate || 100
  return onTimeRate.toFixed(1)
}

const getDetailedTrendsData = () => {
  const trendsData = dashboardStore.weeklyTrendsChartData
  
  if (!trendsData.xAxis?.length) {
    return { xAxis: [], datasets: [] }
  }
  
  return {
    xAxis: trendsData.xAxis,
    datasets: [
      {
        name: 'Completed',
        data: trendsData.completed,
        showArea: true
      },
      {
        name: 'Created',
        data: trendsData.created,
        showArea: false
      },
      {
        name: 'Quality Score',
        data: trendsData.xAxis.map(() => Math.floor(Math.random() * 20) + 80) // Mock quality data
      },
      {
        name: 'Efficiency',
        data: trendsData.xAxis.map(() => Math.floor(Math.random() * 15) + 75) // Mock efficiency data
      }
    ]
  }
}

const getCategoryPerformanceData = () => {
  const categoryData = dashboardStore.categoryDistributionChartData
  
  if (!categoryData?.length) {
    return { categories: [], series: [] }
  }
  
  return {
    categories: categoryData.map(item => item.name),
    series: [
      {
        name: 'Task Count',
        data: categoryData.map(item => item.value)
      },
      {
        name: 'Completion Rate',
        data: categoryData.map(() => Math.floor(Math.random() * 30) + 70) // Mock completion rates
      }
    ]
  }
}

const getTimeDistributionData = () => {
  // Mock time distribution data
  return [
    { name: 'Planning', value: 20, display_name: 'Planning & Research' },
    { name: 'Execution', value: 50, display_name: 'Task Execution' },
    { name: 'Review', value: 20, display_name: 'Review & QA' },
    { name: 'Communication', value: 10, display_name: 'Client Communication' }
  ]
}

const getPredictedWorkload = () => {
  // Mock prediction based on trends
  const currentTasks = dashboardStore.totalTasks || 0
  return Math.floor(currentTasks * 1.18) // 18% increase prediction
}

const getForecastTrendData = () => {
  // Mock forecast data for next 7 days
  return [12, 15, 14, 18, 16, 20, 17]
}

const getTeamUtilization = () => {
  return Math.floor(dashboardStore.workloadBalanceScore || 75)
}

const getUtilizationBarColor = () => {
  const utilization = getTeamUtilization()
  if (utilization >= 90) return 'bg-red-500'
  if (utilization >= 80) return 'bg-yellow-500'
  if (utilization >= 60) return 'bg-green-500'
  return 'bg-blue-500'
}

const getCapacityRecommendations = () => {
  const utilization = getTeamUtilization()
  
  if (utilization >= 90) {
    return [
      'Consider redistributing high-priority tasks',
      'Evaluate team capacity for new projects',
      'Schedule workload review meeting'
    ]
  } else if (utilization >= 80) {
    return [
      'Monitor team workload closely',
      'Prepare for potential capacity constraints',
      'Optimize task prioritization'
    ]
  } else {
    return [
      'Team has available capacity',
      'Consider taking on additional projects',
      'Focus on skill development initiatives'
    ]
  }
}

const getHeatmapCellClasses = (intensity) => {
  const baseClasses = 'w-full h-full'
  
  if (intensity === 0) return `${baseClasses} bg-gray-200 dark:bg-gray-700`
  if (intensity <= 2) return `${baseClasses} bg-blue-200 dark:bg-blue-800`
  if (intensity <= 4) return `${baseClasses} bg-blue-400 dark:bg-blue-600`
  if (intensity <= 6) return `${baseClasses} bg-blue-600 dark:bg-blue-400`
  return `${baseClasses} bg-blue-800 dark:bg-blue-200`
}

// Event handlers
const handleTrendsClick = (params) => emit('chartClick', { type: 'detailed_trends', params })
const handleCategoryPerformanceClick = (params) => emit('chartClick', { type: 'category_performance', params })
const handleTimeRangeChange = (range) => emit('timeRangeChange', range)
const handleChartClick = (data) => emit('chartClick', data)

// Navigation and actions
const navigateToClients = () => emit('navigate', '/clients')
const viewClientDetails = (client) => emit('navigate', `/clients/${client.id}`)
const generatePerformanceReport = () => emit('action', 'generatePerformanceReport')
const generateTrendReport = () => emit('action', 'generateTrendReport')
const openCustomAnalytics = () => emit('action', 'openCustomAnalytics')
</script>

<style scoped>
@reference "tailwindcss";

.analytics-dashboard-layout {
  @apply p-4;
}

.heatmap-grid {
  @apply p-4;
}

.utilization-meter {
  @apply mb-4;
}

.recommendations ul li {
  @apply text-xs;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .analytics-dashboard-layout {
    @apply p-2 space-y-4;
  }
}
</style>