<template>
  <div class="executive-dashboard-layout space-y-6">
    <!-- KPI Hero Section -->
    <section class="kpi-hero-section">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Overall Completion Rate -->
        <MetricCard
          title="Overall Completion Rate"
          :value="dashboardStore.overallCompletionRate"
          format="percentage"
          icon="mdi:chart-line-variant"
          icon-color="green"
          :trend="{ direction: 'up', percentage: 5.2 }"
          :is-loading="dashboardStore.isAnyLoading"
          variant="success"
          subtitle="Last 30 days performance"
        />
        
        <!-- System Health Score -->
        <MetricCard
          title="System Health"
          :value="dashboardStore.workloadBalanceScore"
          format="percentage"
          icon="mdi:heart-pulse"
          icon-color="blue"
          :trend="{ direction: 'stable', percentage: 0 }"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getSystemHealthVariant()"
          subtitle="Workload balance indicator"
        />
        
        <!-- Active Clients -->
        <MetricCard
          title="Active Clients"
          :value="businessIntelligence?.system_health?.active_clients || 0"
          icon="mdi:account-group"
          icon-color="purple"
          :trend="{ direction: 'up', percentage: 2.1 }"
          :is-loading="dashboardStore.isAnyLoading"
          subtitle="Currently engaged clients"
          action-label="View Clients"
          action-icon="mdi:open-in-new"
          @action="navigateToClients"
        />
        
        <!-- Revenue Impact -->
        <MetricCard
          title="Critical Tasks"
          :value="enhancedStats?.summary?.high_priority || 0"
          icon="mdi:alert-circle"
          icon-color="red"
          :trend="{ direction: 'down', percentage: 8.5 }"
          :is-loading="dashboardStore.isAnyLoading"
          :variant="getCriticalTasksVariant()"
          subtitle="High priority items"
          action-label="Review"
          action-icon="mdi:eye"
          @action="navigateToTasks"
        />
      </div>
    </section>
    
    <!-- System Health Gauges -->
    <section class="system-health-section">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Completion Rate Gauge -->
        <GaugeChartComponent
          title="Completion Rate"
          :value="dashboardStore.overallCompletionRate"
          :min="0"
          :max="100"
          unit="%"
          :is-loading="dashboardStore.isChartLoading('completion_rate')"
          :thresholds="[
            { value: 25, color: '#EF4444', label: 'Critical' },
            { value: 50, color: '#F59E0B', label: 'Needs Attention' },
            { value: 75, color: '#10B981', label: 'Good' },
            { value: 90, color: '#059669', label: 'Excellent' }
          ]"
        />
        
        <!-- Workload Balance Gauge -->
        <GaugeChartComponent
          title="Workload Balance"
          :value="dashboardStore.workloadBalanceScore"
          :min="0"
          :max="100"
          unit="%"
          :is-loading="dashboardStore.isChartLoading('workload_balance')"
        />
        
        <!-- System Load Indicator -->
        <div class="system-load-indicator">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">System Load</h3>
            </template>
            <div class="text-center">
              <div :class="getSystemLoadClasses()" class="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <UIcon :name="getSystemLoadIcon()" class="w-10 h-10" />
              </div>
              <div class="text-2xl font-bold mb-2" :class="getSystemLoadTextColor()">
                {{ formatSystemLoad() }}
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Current system status</p>
            </div>
          </UCard>
        </div>
      </div>
    </section>
    
    <!-- Business Performance Charts -->
    <section class="business-performance-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Monthly Trends -->
        <LineChartComponent
          title="Performance Trends"
          :data="getPerformanceTrendsData()"
          :is-loading="dashboardStore.isChartLoading('weeklyTrends')"
          :colors="['#10B981', '#3B82F6', '#F59E0B']"
          @click="handleTrendsClick"
        />
        
        <!-- Category Distribution -->
        <PieChartComponent
          title="Work Category Distribution"
          :data="dashboardStore.categoryDistributionChartData"
          :is-loading="dashboardStore.isChartLoading('categoryDistribution')"
          @click="handleCategoryClick"
        />
      </div>
    </section>
    
    <!-- Critical Alerts Panel -->
    <section class="critical-alerts-section">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Critical Alerts -->
        <div class="alerts-panel space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Critical Alerts</h3>
          <template v-if="dashboardStore.criticalAlerts.length > 0">
            <AlertCard
              v-for="alert in dashboardStore.criticalAlerts"
              :key="alert.title"
              :title="alert.title"
              :message="alert.message"
              :type="alert.type as AlertType"
              severity="high"
              :actions="[
                {
                  label: alert.action,
                  variant: 'solid',
                  color: 'error',
                  icon: 'mdi:arrow-right',
                  action: alert.action
                }
              ]"
              @action="handleAlertAction(alert as CriticalAlert)"
            />
          </template>
          <template v-else>
            <div class="text-center py-8">
              <UIcon name="mdi:shield-check" class="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">All systems operating normally</p>
            </div>
          </template>
        </div>
        
        <!-- Executive Summary -->
        <div class="executive-summary">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Executive Summary</h3>
            </template>
            <div class="space-y-4">
              <!-- Key Metrics Summary -->
              <div class="summary-item">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Today's Highlights</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✅ {{ enhancedStats?.summary?.completed || 0 }} tasks completed</li>
                  <li>⏰ {{ enhancedStats?.summary?.due_today || 0 }} tasks due today</li>
                  <li>🔥 {{ enhancedStats?.summary?.high_priority || 0 }} high priority items</li>
                  <li>📊 {{ dashboardStore.overallCompletionRate?.toFixed(1) || 0 }}% completion rate</li>
                </ul>
              </div>
              
              <!-- Recommendations -->
              <div class="summary-item">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li v-if="enhancedStats?.summary?.overdue > 0">
                    🚨 Address {{ enhancedStats.summary.overdue }} overdue tasks
                  </li>
                  <li v-if="dashboardStore.workloadBalanceScore < 70">
                    ⚖️ Rebalance team workload distribution
                  </li>
                  <li v-if="dashboardStore.overallCompletionRate < 80">
                    📈 Focus on completion rate improvement
                  </li>
                  <li v-else>
                    🎯 Maintain current excellent performance
                  </li>
                </ul>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MetricCard from '../kpi/MetricCard.vue'
import GaugeChartComponent from '../charts/GaugeChartComponent.vue'
import LineChartComponent from '../charts/LineChartComponent.vue'
import PieChartComponent from '../charts/PieChartComponent.vue'
import AlertCard from '../kpi/AlertCard.vue'

// Define interfaces for type safety
type AlertType = 'info' | 'success' | 'warning' | 'error' | 'critical';
type AlertColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
type VariantType = 'success' | 'default' | 'warning' | 'error';
type SystemLoad = 'low' | 'medium' | 'high';

interface CriticalAlert {
  title: string;
  message: string;
  type: AlertType;
  action: string;
}

interface ChartDataset {
  name: string;
  data: number[];
  showArea: boolean;
}

interface PerformanceTrendsData {
  xAxis: string[];
  datasets: ChartDataset[];
}

const emit = defineEmits(['navigate', 'chartClick', 'alertAction'])

const dashboardStore = useDashboardStore()
const { enhancedStats, businessIntelligence } = storeToRefs(dashboardStore)

const getSystemHealthVariant = (): VariantType => {
  const score = dashboardStore.workloadBalanceScore
  if (score >= 80) return 'success'
  if (score >= 60) return 'default'
  if (score >= 40) return 'warning'
  return 'error'
}

const getCriticalTasksVariant = (): VariantType => {
  const critical = enhancedStats.value?.summary?.high_priority || 0
  if (critical === 0) return 'success'
  if (critical <= 2) return 'warning'
  return 'error'
}

const getSystemLoadClasses = (): string => {
  const load = businessIntelligence.value?.system_health?.system_load_indicator as SystemLoad
  const baseClasses = 'transition-all duration-200'
  
  const loadClasses: Record<SystemLoad, string> = {
    low: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
  }
  
  return `${baseClasses} ${loadClasses[load] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`
}

const getSystemLoadIcon = (): string => {
  const load = businessIntelligence.value?.system_health?.system_load_indicator as SystemLoad
  
  const loadIcons: Record<SystemLoad, string> = {
    low: 'mdi:speedometer-slow',
    medium: 'mdi:speedometer-medium',
    high: 'mdi:speedometer'
  }
  
  return loadIcons[load] || 'mdi:help-circle-outline'
}

const getSystemLoadTextColor = (): string => {
  const load = businessIntelligence.value?.system_health?.system_load_indicator as SystemLoad
  
  const loadColors: Record<SystemLoad, string> = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400'
  }
  
  return loadColors[load] || 'text-gray-600 dark:text-gray-400'
}

const formatSystemLoad = (): string => {
  const load = businessIntelligence.value?.system_health?.system_load_indicator as SystemLoad
  return load ? load.charAt(0).toUpperCase() + load.slice(1) : 'Unknown'
}

const getPerformanceTrendsData = (): PerformanceTrendsData => {
  const trendsData = dashboardStore.weeklyTrendsChartData
  
  if (!trendsData.xAxis?.length) {
    return {
      xAxis: [],
      datasets: []
    }
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
      }
    ]
  }
}

const navigateToClients = (): void => {
  emit('navigate', '/clients')
}

const navigateToTasks = (): void => {
  emit('navigate', '/tasks')
}

const handleTrendsClick = (params: any): void => {
  emit('chartClick', { type: 'trends', params })
}

const handleCategoryClick = (params: any): void => {
  emit('chartClick', { type: 'category', params })
}

const handleAlertAction = (alert: CriticalAlert): void => {
  emit('alertAction', alert)
}
</script>

<style scoped>
@reference "tailwindcss";

.executive-dashboard-layout {
  @apply p-4;
}

.kpi-hero-section {
  @apply mb-8;
}

.system-health-section {
  @apply mb-8;
}

.business-performance-section {
  @apply mb-8;
}

.critical-alerts-section {
  @apply mb-8;
}

.system-load-indicator {
  @apply flex items-center justify-center;
}

.alerts-panel {
  @apply h-fit;
}

.executive-summary {
  @apply h-fit;
}

.summary-item {
  @apply border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0 last:pb-0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .executive-dashboard-layout {
    @apply p-2 space-y-4;
  }
}
</style>