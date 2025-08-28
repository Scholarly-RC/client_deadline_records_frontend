<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Team Performance
        </h3>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Performance Chart Section -->
      <div>
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Completion Rates
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Completion rate comparison across team members
          </p>
        </div>

        <template v-if="isLoading">
          <div
            class="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center"
          >
            <div class="text-center">
              <div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-2"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </template>
        <template v-else-if="performanceChartData">
          <BarChartComponent
            :data="performanceChartData"
            :is-loading="isLoading"
            :height="'280px'"
            :show-export="false"
            :show-orientation-toggle="false"
            :show-sort-options="true"
            @click="handleChartClick"
          />
        </template>
        <template v-else>
          <div
            class="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <div class="text-center">
              <UIcon
                name="mdi:chart-bar"
                class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
              />
              <p class="text-gray-600 dark:text-gray-400 font-medium">
                No performance data available
              </p>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Check back later for team insights
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- Leaderboard Section -->
      <div>
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Top Performers
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Based on completion rate and task quality
          </p>
        </div>

        <template v-if="isLoading">
          <div class="space-y-3">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-500 rounded animate-pulse w-1/2"></div>
              </div>
              <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </template>
        <template v-else-if="topPerformers && topPerformers.length">
          <div class="space-y-2">
            <div
              v-for="(performer, index) in topPerformers"
              :key="performer.id"
              class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              @click="viewPerformerDetails(performer)"
            >
              <!-- Rank Badge -->
              <div :class="getRankBadgeClasses(index)">
                <span class="text-xs font-bold">{{ index + 1 }}</span>
              </div>

              <!-- Performer Info -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ performer.fullname }}
                  </span>
                  <UBadge
                    v-if="performer.is_admin"
                    color="primary"
                    variant="subtle"
                    size="xs"
                  >
                    Admin
                  </UBadge>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  {{ performer.completed_tasks }}/{{
                    performer.total_tasks
                  }}
                  tasks completed
                  <template v-if="performer.overdue_tasks > 0">
                    •
                    <span class="text-red-600 dark:text-red-400 font-medium"
                      >{{ performer.overdue_tasks }} overdue</span
                    >
                  </template>
                </div>
              </div>

              <!-- Performance Metrics -->
              <div class="text-right">
                <div
                  class="text-sm font-semibold"
                  :class="getCompletionRateColor(performer.completion_rate)"
                >
                  {{ performer.completion_rate.toFixed(1) }}%
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  {{ performer.overdue_rate.toFixed(1) }}% overdue
                </div>
              </div>

              <!-- Performance Badge -->
              <UBadge
                :color="getPerformanceBadgeColor(performer.completion_rate)"
                class="ml-2"
              >
                {{ getPerformanceLabel(performer.completion_rate) }}
              </UBadge>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            class="h-40 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <div class="text-center">
              <UIcon
                name="mdi:account-group"
                class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
              />
              <p class="text-gray-600 dark:text-gray-400 font-medium">
                No team performance data available
              </p>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Add team members to see performance metrics
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Performance Summary -->
    <div v-if="!isLoading && performanceSummary" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Team Summary</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ performanceSummary.totalMembers }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">Team Members</div>
        </div>
        <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ performanceSummary.avgCompletionRate }}%
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">Avg Completion</div>
        </div>
        <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ performanceSummary.totalCompleted }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">Tasks Completed</div>
        </div>
        <div class="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">
            {{ performanceSummary.totalOverdue }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">Overdue Tasks</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import BarChartComponent from "../charts/BarChartComponent.vue";

// Define interfaces for type safety
interface TeamPerformer {
  id: number;
  fullname: string;
  is_admin: boolean;
  completed_tasks: number;
  total_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  overdue_rate: number;
}

interface PerformanceChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

interface PerformanceSummary {
  totalMembers: number;
  avgCompletionRate: string;
  totalCompleted: number;
  totalOverdue: number;
}

interface Props {
  isLoading?: boolean;
  teamData?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  teamData: () => ({}),
});

const emit = defineEmits([
  "viewDetails",
  "viewPerformer",
  "periodChange",
  "chartClick",
]);

const dashboardStore = useDashboardStore();
const { teamAnalytics } = storeToRefs(dashboardStore);

const selectedPeriod = ref("current_month");

const periodOptions = [
  { label: "This Week", value: "current_week" },
  { label: "This Month", value: "current_month" },
  { label: "Last 3 Months", value: "quarter" },
  { label: "This Year", value: "year" },
];

const topPerformers = computed((): TeamPerformer[] => {
  return (
    teamAnalytics.value?.user_performance
      ?.sort(
        (a: TeamPerformer, b: TeamPerformer) =>
          b.completion_rate - a.completion_rate
      )
      ?.slice(0, 5) || []
  );
});

const performanceChartData = computed((): PerformanceChartData | null => {
  if (!teamAnalytics.value?.user_performance?.length) return null;

  const users = teamAnalytics.value.user_performance;

  return {
    categories: users.map((user: TeamPerformer) => user.fullname),
    series: [
      {
        name: "Completion Rate",
        data: users.map((user: TeamPerformer) => user.completion_rate),
      },
      {
        name: "Overdue Rate",
        data: users.map((user: TeamPerformer) => user.overdue_rate),
      },
    ],
  };
});

const performanceSummary = computed((): PerformanceSummary | null => {
  if (!teamAnalytics.value?.user_performance?.length) return null;

  const users = teamAnalytics.value.user_performance;
  const totalMembers = users.length;
  const avgCompletionRate = (
    users.reduce(
      (sum: number, user: TeamPerformer) => sum + user.completion_rate,
      0
    ) / totalMembers
  ).toFixed(1);
  const totalCompleted = users.reduce(
    (sum: number, user: TeamPerformer) => sum + user.completed_tasks,
    0
  );
  const totalOverdue = users.reduce(
    (sum: number, user: TeamPerformer) => sum + user.overdue_tasks,
    0
  );

  return {
    totalMembers,
    avgCompletionRate,
    totalCompleted,
    totalOverdue,
  };
});

const getRankBadgeClasses = (index: number): string => {
  const baseClasses =
    "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs";

  switch (index) {
    case 0:
      return `${baseClasses} bg-yellow-500`; // Gold
    case 1:
      return `${baseClasses} bg-gray-400`; // Silver
    case 2:
      return `${baseClasses} bg-yellow-600`; // Bronze
    default:
      return `${baseClasses} bg-gray-300 text-gray-700`;
  }
};

const getCompletionRateColor = (rate: number): string => {
  if (rate >= 80) return "text-green-600";
  if (rate >= 60) return "text-blue-600";
  if (rate >= 40) return "text-yellow-600";
  return "text-red-600";
};

const getPerformanceBadgeColor = (
  rate: number
): "success" | "primary" | "warning" | "error" => {
  if (rate >= 80) return "success";
  if (rate >= 60) return "primary";
  if (rate >= 40) return "warning";
  return "error";
};

const getPerformanceLabel = (rate: number): string => {
  if (rate >= 80) return "Excellent";
  if (rate >= 60) return "Good";
  if (rate >= 40) return "Fair";
  return "Needs Improvement";
};

const handlePeriodChange = (period: string | any): void => {
  if (typeof period === "string") {
    selectedPeriod.value = period;
    emit("periodChange", period);
  } else if (period && typeof period === "object" && period.value) {
    selectedPeriod.value = period.value;
    emit("periodChange", period.value);
  }
};

const handleChartClick = (params: any): void => {
  emit("chartClick", params);
};

const viewDetails = () => {
  emit("viewDetails");
};

const viewPerformerDetails = (performer: TeamPerformer): void => {
  emit("viewPerformer", performer);
};

onMounted(() => {
  // Component initialization
});
</script>
