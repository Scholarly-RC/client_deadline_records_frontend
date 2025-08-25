<script setup>
import { getDaysRemaining } from "~/utils/getDaysRemaining";
import DeadlineStatusPill from "~/components/ui/DeadlineStatusPill.vue";
import PriorityBadge from "../ui/PriorityBadge.vue";
import StatusBadge from "../ui/StatusBadge.vue";

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

const formattedDueDate = computed(() => {
  const date = new Date(props.deadline.deadline);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const getCategoryDisplayName = (category) => {
  switch (category) {
    case "financial_statement_preparations":
      return "Financial Statement Preparation";
    case "accounting_audits":
      return "Accounting & Auditing";
    case "finance_implementations":
      return "Finance Implementation";
    case "human_resource_implementations":
      return "HR Implementation";
    case "miscellaneous_tasks":
      return "Miscellaneous";
    case "tax_cases":
      return "Tax";
    default:
      return category.replace(/_/g, " ");
  }
};
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
        <span class="text-sm font-medium">Due Date:</span>
        <span class="text-sm">{{ formattedDueDate }}</span>
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
    </div>

    <template #footer>
      <div class="text-right">
        <UButton
          :to="`/deadlines/${deadline.id}`"
          variant="link"
          color="primary"
          >View Details</UButton
        >
      </div>
    </template>
  </UCard>
</template>
