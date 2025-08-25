<script setup>
import { getDaysRemaining } from "~/utils/getDaysRemaining";
import PriorityBadge from "../ui/PriorityBadge.vue";
import StatusBadge from "../ui/StatusBadge.vue";

const deadlineUpdate = useDeadlineUpdate();

const props = defineProps({
  deadline: {
    type: Object,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const daysRemaining = computed(() => {
  return getDaysRemaining(props.deadline.deadline_days_remaining);
});

const history = computed(() => {
  return props.deadline.status_history;
});
</script>

<template>
  <UCard
    class="w-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
    variant="subtle"
  >
    <template #header>
      <h3 class="text-lg font-semibold">{{ deadline.client_name }}</h3>
    </template>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Task ID:</span>
        <span class="text-sm">#{{ deadline.id }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Due Date:</span>
        <span class="text-sm">{{ deadline.deadline }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Days Remaining:</span>
        <span class="text-sm">{{ daysRemaining }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Priority:</span>
        <PriorityBadge :priority="deadline.priority" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Status:</span>
        <StatusBadge :status="deadline.status" />
      </div>

      <div v-if="deadline.description">
        <span class="text-sm font-medium">Description:</span>
        <p class="text-sm">{{ deadline.description }}</p>
      </div>
      <div v-if="deadline.needed_data">
        <span class="text-sm font-medium">Needed Data:</span>
        <p class="text-sm">{{ deadline.needed_data }}</p>
      </div>
      <div v-if="deadline.category_name">
        <span class="text-sm font-medium">Category:</span>
        <p class="text-sm">{{ deadline.category_name }}</p>
      </div>
      <div v-if="deadline.type_name">
        <span class="text-sm font-medium">Type:</span>
        <p class="text-sm">{{ deadline.type_name }}</p>
      </div>
      <div v-if="deadline.form_name">
        <span class="text-sm font-medium">Form:</span>
        <p class="text-sm">{{ deadline.form_name }}</p>
      </div>
      <div v-if="deadline.period_covered">
        <span class="text-sm font-medium">Period Covered:</span>
        <p class="text-sm">{{ deadline.period_covered }}</p>
      </div>
      <div v-if="deadline.tax_payable">
        <span class="text-sm font-medium">Tax Payable:</span>
        <p class="text-sm">{{ deadline.tax_payable }}</p>
      </div>
      <div v-if="deadline.remarks">
        <span class="text-sm font-medium">Remarks:</span>
        <p class="text-sm max-w-xs break-words">{{ deadline.remarks }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UPopover arrow>
          <UButton label="View History" variant="soft" color="primary" />
          <template #content>
            <div class="p-4 space-y-2 max-h-96 overflow-y-auto">
              <div v-for="(item, index) in history" :key="index">
                <p class="text-sm font-medium">Status: {{ item.status }}</p>
                <p class="text-sm max-w-xs break-words">
                  Remarks: {{ item.remarks }}
                </p>
                <p class="text-xs text-gray-500">Date: {{ item.date }}</p>
              </div>
            </div>
          </template>
        </UPopover>
        <UButton
          @click="deadlineUpdate.open(category, deadline)"
          label="Add Update"
          variant="soft"
          color="primary"
        />
      </div>
    </template>
  </UCard>
</template>
