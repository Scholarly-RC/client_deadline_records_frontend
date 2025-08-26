<script setup>
import { computed, ref, onMounted } from "vue";
import { useTaskStore } from "~/stores/tasks";
import { useAuthStore } from "~/stores/auth";
import { useUserStore } from "~/stores/users";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["approved", "rejected", "forwarded"]);

const taskStore = useTaskStore();
const authStore = useAuthStore();
const userStore = useUserStore();

const showDecisionModal = ref(false);
const showForwardModal = ref(false);
const decisionAction = ref("approved");
const comments = ref("");
const forwardComments = ref("");
const selectedForwardUser = ref(null);

const canShowActions = computed(() => {
  return taskStore.canApproveTask(props.task);
});

const forwardUserOptions = computed(() => {
  return userStore.users
    .filter((user) => user.is_admin && user.id !== authStore.user?.id)
    .map((user) => ({
      label: user.fullname,
      value: user.id,
      ...user,
    }));
});

const openApprovalDialog = (action) => {
  decisionAction.value = action;
  comments.value = "";
  showDecisionModal.value = true;
};

const openForwardDialog = () => {
  selectedForwardUser.value = null;
  forwardComments.value = "";
  showForwardModal.value = true;
};

const closeDecisionModal = () => {
  showDecisionModal.value = false;
  comments.value = "";
};

const closeForwardModal = () => {
  showForwardModal.value = false;
  selectedForwardUser.value = null;
  forwardComments.value = "";
};

const processDecision = async () => {
  try {
    await taskStore.processApproval(
      props.task.id,
      decisionAction.value,
      comments.value || null
    );

    emit(decisionAction.value);
    closeDecisionModal();
  } catch (error) {
    console.error("Failed to process approval:", error);
  }
};

const processForward = async () => {
  try {
    await taskStore.processApproval(
      props.task.id,
      "approved",
      forwardComments.value || null,
      selectedForwardUser.value
    );

    emit("forwarded");
    closeForwardModal();
  } catch (error) {
    console.error("Failed to forward approval:", error);
  }
};

// Fetch users when component mounts
onMounted(async () => {
  if (userStore.users.length === 0) {
    await userStore.getUserChoices();
  }
});
</script>

<template>
  <div
    v-if="canShowActions"
    class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
  >
    <div class="flex items-start space-x-3">
      <UIcon
        name="mdi:clock-outline"
        class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5"
      />
      <div class="flex-1">
        <h4 class="font-medium text-amber-800 dark:text-amber-200 mb-1">
          Approval Required
        </h4>
        <p class="text-sm text-amber-700 dark:text-amber-300 mb-3">
          This task is pending your approval (Step
          {{ task.current_approval_step }})
        </p>

        <div class="flex flex-wrap gap-2">
          <UButton
            color="success"
            size="sm"
            icon="mdi:check"
            @click="openApprovalDialog('approved')"
            :loading="taskStore.isProcessingApproval"
          >
            Approve
          </UButton>

          <UButton
            color="error"
            variant="outline"
            size="sm"
            icon="mdi:close"
            @click="openApprovalDialog('rejected')"
            :loading="taskStore.isProcessingApproval"
          >
            Reject
          </UButton>

          <UButton
            color="secondary"
            variant="outline"
            size="sm"
            icon="mdi:account-arrow-right"
            @click="openForwardDialog"
            :loading="taskStore.isProcessingApproval"
          >
            Forward
          </UButton>
        </div>
      </div>
    </div>

    <!-- Approval Decision Modal -->
    <UModal v-model:open="showDecisionModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ decisionAction === "approved" ? "Approve" : "Reject" }} Task
            </h3>
          </template>

          <div class="space-y-4">
            <div class="flex flex-col gap-1">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Task: <span class="font-medium">{{ task.description }}</span>
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Client:
                <span class="font-medium">{{ task.client_name }}</span>
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Assigned To:
                <span class="font-medium">{{ task.assigned_to_name }}</span>
              </p>
            </div>

            <UFormField
              :label="`Comments ${
                decisionAction === 'rejected' ? '(Required)' : '(Optional)'
              }`"
              name="comments"
              :required="decisionAction === 'rejected'"
              :help="`Add your ${
                decisionAction === 'approved' ? 'approval' : 'rejection'
              } comments`"
            >
              <UTextarea
                v-model="comments"
                :placeholder="`Add your ${
                  decisionAction === 'approved' ? 'approval' : 'rejection'
                } comments...`"
                :required="decisionAction === 'rejected'"
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <div
              v-if="decisionAction === 'rejected'"
              class="bg-red-50 dark:bg-red-900/20 p-3 rounded-md"
            >
              <div class="flex">
                <UIcon
                  name="i-lucide-alert-triangle"
                  class="h-5 w-5 text-red-400 mr-2 mt-0.5"
                />
                <div class="text-sm text-red-700 dark:text-red-300">
                  <p class="font-medium mb-1">Rejection Impact:</p>
                  <ul class="list-disc list-inside space-y-1 text-xs">
                    <li>Task status will change to "For Revision"</li>
                    <li>Original assignee will be notified</li>
                    <li>Approval workflow will be reset</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton
                variant="ghost"
                @click="closeDecisionModal"
                :disabled="taskStore.isProcessingApproval"
              >
                Cancel
              </UButton>
              <UButton
                :color="decisionAction === 'approved' ? 'success' : 'error'"
                @click="processDecision"
                :loading="taskStore.isProcessingApproval"
                :disabled="decisionAction === 'rejected' && !comments.trim()"
              >
                {{ decisionAction === "approved" ? "Approve" : "Reject" }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Forward Modal -->
    <UModal v-model:open="showForwardModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Forward to Another Approver</h3>
          </template>

          <div class="space-y-4">
            <div class="flex flex-col gap-1">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Task: <span class="font-medium">{{ task.description }}</span>
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Client:
                <span class="font-medium">{{ task.client_name }}</span>
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Assigned To:
                <span class="font-medium">{{ task.assigned_to_name }}</span>
              </p>
            </div>

            <UFormField
              label="Forward to Admin User"
              name="selectedForwardUser"
              required
              help="Select an admin user to forward this approval to"
            >
              <USelectMenu
                v-model="selectedForwardUser"
                :items="forwardUserOptions"
                placeholder="Select admin user..."
                class="w-full"
              >
                <template #option="{ option }">
                  <div class="flex items-center space-x-2">
                    <div class="flex-1">
                      <div class="font-medium">{{ option.fullname }}</div>
                      <div class="text-sm text-gray-500">{{ option.role }}</div>
                    </div>
                  </div>
                </template>
              </USelectMenu>
            </UFormField>

            <UFormField
              label="Forward Comments (Optional)"
              name="forwardComments"
              help="Add comments for the next approver"
            >
              <UTextarea
                v-model="forwardComments"
                placeholder="Add comments for the next approver..."
                :rows="3"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton
                variant="ghost"
                @click="closeForwardModal"
                :disabled="taskStore.isProcessingApproval"
              >
                Cancel
              </UButton>
              <UButton
                color="secondary"
                @click="processForward"
                :loading="taskStore.isProcessingApproval"
                :disabled="!selectedForwardUser"
              >
                Forward
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
