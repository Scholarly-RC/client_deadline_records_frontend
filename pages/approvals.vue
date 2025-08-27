<script setup>
import { useTaskStore } from "~/stores/tasks";
import { useAuthStore } from "~/stores/auth";
import ApprovalActionsPanel from "~/components/tasks/ApprovalActionsPanel.vue";
import StatusBadge from "~/components/ui/StatusBadge.vue";
import PriorityBadge from "~/components/ui/PriorityBadge.vue";
import PageHeader from "~/components/ui/PageHeader.vue";

const taskStore = useTaskStore();
const authStore = useAuthStore();

// Page Configuration
definePageMeta({
  layout: "menu",
  middleware: "auth",
});

useHead({
  title: "Client Deadline Tracker | Pending Approvals",
});

// Redirect non-admin users
if (!authStore.isAdmin) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Admin privileges required.",
  });
}

// Reactive data - simplified to focus on pending approvals only

// Methods
const refreshData = async () => {
  await taskStore.fetchPendingApprovals();
};

const onApprovalAction = async () => {
  await refreshData();
};

// Fetch data on mount
onMounted(async () => {
  await refreshData();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Pending Approvals" />
    <main
      class="overflow-y-auto px-10 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="container mx-auto px-4 py-8">
        <div class="mb-6">
          <p
            class="text-lg font-semibold text-gray-600 dark:text-gray-400 mt-2"
          >
            Review and respond to tasks awaiting your approval
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="taskStore.isLoading" class="text-center py-8">
          <UIcon
            name="i-lucide-loader-2"
            class="h-8 w-8 animate-spin text-blue-500 mx-auto"
          />
          <p class="text-gray-500 mt-2">Loading pending approvals...</p>
        </div>

        <!-- No Pending Approvals -->
        <div
          v-else-if="taskStore.pendingApprovals.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-lucide-check-circle"
            class="h-16 w-16 text-green-500 mx-auto mb-4"
          />
          <h3
            class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            All caught up!
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            No tasks are currently pending your approval.
          </p>
          <UButton @click="refreshData" class="mt-4" variant="outline">
            Refresh
          </UButton>
        </div>

        <!-- Pending Approvals List -->
        <div v-else class="space-y-6">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ taskStore.pendingApprovals.length }} task(s) pending approval
            </p>
            <UButton
              @click="refreshData"
              variant="outline"
              size="sm"
              icon="i-lucide-refresh-cw"
            >
              Refresh
            </UButton>
          </div>

          <div class="grid gap-6">
            <UCard
              v-for="task in taskStore.pendingApprovals"
              :key="task.id"
              class="hover:shadow-lg transition-shadow duration-200"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <div>
                    <h3
                      class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {{ task.description }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Client: {{ task.client_name }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      class="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      Step {{ task.current_approval_step }}
                    </span>
                    <StatusBadge :status="task.status" />
                  </div>
                </div>
              </template>

              <div class="space-y-4">
                <!-- Task Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Task ID:</span
                    >
                    <span class="font-medium">#{{ task.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Category:</span
                    >
                    <span class="font-medium">{{ task.category }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Priority:</span
                    >
                    <PriorityBadge :priority="task.priority" />
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Assigned to:</span
                    >
                    <span class="font-medium">{{ task.assigned_to_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Due Date:</span
                    >
                    <span class="font-medium">{{ task.deadline }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Days Remaining:</span
                    >
                    <span class="font-medium">{{
                      task.deadline_days_remaining
                    }}</span>
                  </div>
                </div>

                <!-- Task Description/Details -->
                <div
                  v-if="task.needed_data"
                  class="bg-gray-50 dark:bg-gray-800 rounded p-3"
                >
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
                  >
                    Needed Data:
                  </h4>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ task.needed_data }}
                  </p>
                </div>

                <div
                  v-if="task.remarks"
                  class="bg-gray-50 dark:bg-gray-800 rounded p-3"
                >
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
                  >
                    Remarks:
                  </h4>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ task.remarks }}
                  </p>
                </div>

                <!-- Approval History Summary -->
                <div
                  v-if="
                    task.approval_history && task.approval_history.length > 0
                  "
                  class="border-t pt-4"
                >
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                  >
                    Previous Approvals:
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="approval in task.approval_history"
                      :key="approval.step"
                      class="flex items-center justify-between text-sm"
                    >
                      <div class="flex items-center space-x-2">
                        <span
                          class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs"
                        >
                          Step {{ approval.step }}
                        </span>
                        <span>{{ approval.approver }}</span>
                        <span class="text-green-600 dark:text-green-400">{{
                          approval.action
                        }}</span>
                      </div>
                      <span class="text-gray-500 dark:text-gray-400">{{
                        approval.date
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Approval Actions Panel -->
                <ApprovalActionsPanel
                  :task="task"
                  @approved="onApprovalAction"
                  @rejected="onApprovalAction"
                  @forwarded="onApprovalAction"
                />
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
