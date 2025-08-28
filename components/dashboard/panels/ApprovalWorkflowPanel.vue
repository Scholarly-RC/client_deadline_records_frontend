<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Approval Workflow
        </h3>
      </div>
    </template>

    <div>
      <!-- Workflow Status Overview -->
      <div class="mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Pending Approvals -->
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div
                    class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"
                  ></div>
                </template>
                <template v-else>
                  <div
                    class="text-2xl font-bold text-orange-600 dark:text-orange-400"
                  >
                    {{ workflowData?.tasks_requiring_approval || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Pending Approval
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              >
                <UIcon name="mdi:clock-outline" class="w-5 h-5" />
              </div>
            </div>
          </UCard>

          <!-- In Progress Approvals -->
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div
                    class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"
                  ></div>
                </template>
                <template v-else>
                  <div
                    class="text-2xl font-bold text-blue-600 dark:text-blue-400"
                  >
                    {{ workflowData?.tasks_in_approval || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  In Review
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              >
                <UIcon name="mdi:eye-outline" class="w-5 h-5" />
              </div>
            </div>
          </UCard>

          <!-- Approved -->
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div
                    class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"
                  ></div>
                </template>
                <template v-else>
                  <div
                    class="text-2xl font-bold text-green-600 dark:text-green-400"
                  >
                    {{ workflowData?.tasks_approved || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Approved
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              >
                <UIcon name="mdi:check-circle-outline" class="w-5 h-5" />
              </div>
            </div>
          </UCard>

          <!-- My Approvals -->
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <template v-if="isLoading">
                  <div
                    class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mb-1"
                  ></div>
                </template>
                <template v-else>
                  <div
                    class="text-2xl font-bold text-purple-600 dark:text-purple-400"
                  >
                    {{ workflowData?.pending_my_approval || 0 }}
                  </div>
                </template>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Awaiting Me
                </div>
              </div>
              <div
                class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
              >
                <UIcon name="mdi:account-check-outline" class="w-5 h-5" />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Workflow Chart and Queue -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Approval Status Chart -->
        <div>
          <div class="mb-4">
            <h4
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Approval Status Distribution
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Current workflow state breakdown
            </p>
          </div>

          <template v-if="isLoading">
            <div
              class="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          </template>
          <template v-else-if="approvalChartData">
            <PieChartComponent
              title="Approval Status"
              :data="approvalChartData"
              :is-loading="isLoading"
              :height="'280px'"
              :show-export="false"
              :show-chart-type-toggle="false"
              @click="handleApprovalChartClick"
            />
          </template>
          <template v-else>
            <div
              class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="text-center">
                <UIcon
                  name="mdi:chart-donut"
                  class="w-12 h-12 text-gray-400 mx-auto mb-2"
                />
                <p class="text-gray-500 dark:text-gray-400">
                  No approval data available
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- Recent Approvals Queue -->
        <div>
          <div class="mb-4">
            <h4
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Recent Approval Activity
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Latest workflow updates and decisions
            </p>
          </div>

          <template v-if="isLoading">
            <div class="space-y-3">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3 p-3">
                <div class="flex items-center gap-3 p-3">
                  <div
                    class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                  ></div>
                  <div class="flex-1 space-y-2">
                    <div
                      class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"
                    ></div>
                    <div
                      class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"
                    ></div>
                  </div>
                  <div
                    class="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  ></div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="recentApprovals && recentApprovals.length">
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div
                v-for="approval in recentApprovals"
                :key="approval.id"
                class="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                @click="viewApprovalDetails(approval)"
              >
                <!-- Status Icon -->
                <div :class="getApprovalStatusIconClasses(approval.status)">
                  <UIcon
                    :name="getApprovalStatusIcon(approval.status)"
                    class="w-4 h-4"
                  />
                </div>

                <!-- Approval Info -->
                <div class="flex-1">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white mb-1"
                  >
                    {{ approval.title || `Task #${approval.id}` }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ approval.client_name }}</span>
                    <span class="mx-1">•</span>
                    <span>{{ formatApprovalTime(approval.updated_at) }}</span>
                  </div>
                </div>

                <!-- Status Badge -->
                <UBadge
                  :color="getApprovalStatusColor(approval.status)"
                  variant="subtle"
                >
                  {{ formatApprovalStatus(approval.status) }}
                </UBadge>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              class="h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="text-center">
                <UIcon
                  name="mdi:clipboard-check-outline"
                  class="w-12 h-12 text-gray-400 mx-auto mb-2"
                />
                <p class="text-gray-500 dark:text-gray-400">
                  No recent approvals
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import PieChartComponent from "../charts/PieChartComponent.vue";

// Define interfaces for type safety
interface WorkflowData {
  tasks_requiring_approval: number;
  tasks_in_approval: number;
  tasks_approved: number;
  pending_my_approval: number;
}

interface ApprovalChartItem {
  name: string;
  value: number;
  display_name: string;
}

interface RecentApproval {
  id: number;
  title: string;
  client_name: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  updated_at: Date;
}

interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  isLoading?: boolean;
}

type ApprovalStatus = "pending" | "in_review" | "approved" | "rejected";

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits([
  "viewAllApprovals",
  "viewApproval",
  "workflowFilterChange",
  "chartClick",
  "viewPendingApprovals",
  "viewApprovalHistory",
  "configureWorkflow",
]);

const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const { businessIntelligence } = storeToRefs(dashboardStore);
const { isAdmin } = storeToRefs(authStore);

const selectedWorkflowFilter = ref("all");

const workflowFilterOptions: FilterOption[] = [
  { label: "All Workflows", value: "all" },
  { label: "Pending Only", value: "pending" },
  { label: "My Approvals", value: "my_approvals" },
  { label: "Recently Approved", value: "recent_approved" },
];

const workflowData = computed((): WorkflowData => {
  return (
    businessIntelligence.value?.approval_workflow || {
      tasks_requiring_approval: 0,
      tasks_in_approval: 0,
      tasks_approved: 0,
      pending_my_approval: 0,
    }
  );
});

const approvalChartData = computed((): ApprovalChartItem[] | null => {
  if (!workflowData.value || Object.keys(workflowData.value).length === 0)
    return null;

  const data: ApprovalChartItem[] = [];

  if (workflowData.value.tasks_requiring_approval > 0) {
    data.push({
      name: "Pending Approval",
      value: workflowData.value.tasks_requiring_approval,
      display_name: "Pending Approval",
    });
  }

  if (workflowData.value.tasks_in_approval > 0) {
    data.push({
      name: "In Review",
      value: workflowData.value.tasks_in_approval,
      display_name: "In Review",
    });
  }

  if (workflowData.value.tasks_approved > 0) {
    data.push({
      name: "Approved",
      value: workflowData.value.tasks_approved,
      display_name: "Approved",
    });
  }

  return data.length > 0 ? data : null;
});

// Use actual data from the dashboard store instead of mock data
const recentApprovals = computed((): RecentApproval[] => {
  // This should come from the actual API in the future
  // For now, return empty array as API endpoint for recent approvals may not exist yet
  return [];
});

const getApprovalStatusIcon = (status: ApprovalStatus): string => {
  const icons: Record<ApprovalStatus, string> = {
    pending: "mdi:clock-outline",
    in_review: "mdi:eye-outline",
    approved: "mdi:check-circle-outline",
    rejected: "mdi:close-circle-outline",
  };
  return icons[status] || icons.pending;
};

const getApprovalStatusIconClasses = (status: ApprovalStatus): string => {
  const base =
    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center";
  const colors: Record<ApprovalStatus, string> = {
    pending:
      "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    in_review:
      "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    approved:
      "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    rejected: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };
  return `${base} ${colors[status] || colors.pending}`;
};

const getApprovalStatusColor = (
  status: ApprovalStatus
):
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral" => {
  const colors: Record<
    ApprovalStatus,
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
  > = {
    pending: "warning",
    in_review: "info",
    approved: "success",
    rejected: "error",
  };
  return colors[status] || colors.pending;
};

const formatApprovalStatus = (status: ApprovalStatus): string => {
  return status
    .replace("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatApprovalTime = (timestamp: Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

const handleWorkflowFilterChange = (filter: any): void => {
  const filterValue =
    typeof filter === "string" ? filter : filter?.value || filter;
  selectedWorkflowFilter.value = filterValue;
  emit("workflowFilterChange", filterValue);
};

const handleApprovalChartClick = (params: any): void => {
  emit("chartClick", { type: "approval_status", params });
};

const viewAllApprovals = (): void => {
  emit("viewAllApprovals");
};

const viewApprovalDetails = (approval: RecentApproval): void => {
  emit("viewApproval", approval);
};

const viewPendingApprovals = (): void => {
  emit("viewPendingApprovals");
};

const viewApprovalHistory = (): void => {
  emit("viewApprovalHistory");
};

const configureWorkflow = (): void => {
  emit("configureWorkflow");
};

onMounted(() => {
  // Component initialization
});
</script>
