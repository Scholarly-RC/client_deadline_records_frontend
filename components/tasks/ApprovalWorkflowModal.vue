<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useTaskStore } from "~/stores/tasks";
import { useUserStore } from "~/stores/users";
import { useAuthStore } from "~/stores/auth";
import { useToast } from "#imports";
import type { User } from "~/types/entities";
import type { ApprovalRequest } from "~/types/requests";

interface TaskMinimal {
  id: number;
  description: string;
  client_name: string;
}

interface UserWithValue extends User {
  label: string;
  value: number;
}

interface Props {
  modelValue: boolean;
  task: TaskMinimal | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  task: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  approved: [];
}>()

const taskStore = useTaskStore();
const userStore = useUserStore();
const authStore = useAuthStore();

const selectedApprovers = ref<UserWithValue[]>([]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const adminUsers = computed((): UserWithValue[] => {
  return userStore.users
    .filter((user) => user.is_admin && user.id !== authStore.user?.id)
    .map((user) => ({
      label: user.fullname,
      value: user.id,
      ...user,
    }));
});

const closeModal = (): void => {
  selectedApprovers.value = [];
  emit("update:modelValue", false);
};

const initiateWorkflow = async (): Promise<void> => {
  try {
    const approvalRequest: ApprovalRequest = {
      approvers: selectedApprovers.value.map(approver => approver.id)
    };
    await taskStore.initiateApproval(props.task?.id!, approvalRequest);
    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Approval workflow initiated",
      description: "The task has been submitted for approval successfully.",
      color: "success",
      icon: "i-lucide-check-circle"
    });
    emit("approved");
    closeModal();
  } catch (error) {
    console.error("Failed to initiate approval:", error);
    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Failed to initiate approval",
      description: "There was an error submitting the task for approval. Please try again.",
      color: "error",
      icon: "i-lucide-alert-circle"
    });
  }
};

// Reset form when modal opens
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedApprovers.value = [];
    }
  }
);

// Fetch admin users when component mounts
onMounted(async () => {
  if (adminUsers.value.length === 0) {
    await userStore.getUserChoices();
  }
});
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Initiate Approval Workflow"
    description="Start the approval process for this task by selecting appropriate approvers"
    :dismissible="false"
  >
    <template #content>
      <UCard>

        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Task: {{ task?.description }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Client: {{ task?.client_name }}
            </p>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Approvers (in order)
            </label>
            <div class="space-y-2">
              <USelectMenu
                v-model="selectedApprovers"
                :items="adminUsers"
                multiple
                placeholder="Choose approvers in sequence..."
                class="w-full"
              >
              </USelectMenu>
            </div>

            <div v-if="selectedApprovers.length > 0" class="mt-3">
              <p
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Approval Order:
              </p>
              <div class="space-y-1">
                <div
                  v-for="(approver, index) in selectedApprovers"
                  :key="approver.id"
                  class="flex items-center space-x-2 text-sm"
                >
                  <span
                    class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium"
                  >
                    Step {{ index + 1 }}
                  </span>
                  <span>{{ approver.fullname }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <div class="flex">
              <UIcon
                name="i-lucide-info"
                class="h-5 w-5 text-blue-400 mr-2 mt-0.5"
              />
              <div class="text-sm text-blue-700 dark:text-blue-300">
                <p class="font-medium mb-1">Approval Process:</p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li>Task status will change to "For Checking"</li>
                  <li>First approver will be notified</li>
                  <li>Each approver must approve before next step</li>
                  <li>Any approver can reject and send for revision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              variant="ghost"
              @click="closeModal"
              :disabled="taskStore.isInitiatingApproval"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="initiateWorkflow"
              :loading="taskStore.isInitiatingApproval"
              :disabled="selectedApprovers.length === 0"
            >
              Initiate Approval
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
