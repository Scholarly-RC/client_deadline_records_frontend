<script setup>
import UnifiedTaskTable from "~/components/tasks/UnifiedTaskTable.vue";
import { TASK_CATEGORIES } from "~/constants/choices.js";

const route = useRoute();
const router = useRouter();

const items = [
  {
    label: "Compliance",
    value: "compliance",
    slot: "compliance",
    category: TASK_CATEGORIES.COMPLIANCE,
  },
  {
    label: "Financial Statement",
    value: "financial_statement",
    slot: "financial_statement",
    category: TASK_CATEGORIES.FINANCIAL_STATEMENT,
  },
  {
    label: "Finance Implementation",
    value: "finance_implementation",
    slot: "finance_implementation",
    category: TASK_CATEGORIES.FINANCE_IMPLEMENTATION,
  },
  {
    label: "HR Implementation",
    value: "hr_implementation",
    slot: "hr_implementation",
    category: TASK_CATEGORIES.HR_IMPLEMENTATION,
  },
  {
    label: "Auditing & Accounting",
    value: "auditing_accounting",
    slot: "auditing_accounting",
    category: TASK_CATEGORIES.ACCOUNTING_AUDIT,
  },
  {
    label: "Miscellaneous",
    value: "miscellaneous",
    slot: "miscellaneous",
    category: TASK_CATEGORIES.MISCELLANEOUS,
  },
  {
    label: "Tax",
    value: "tax",
    slot: "tax",
    category: TASK_CATEGORIES.TAX_CASE,
  },
];

// Event handlers for table actions
const handleEditTask = (task) => {
  // TODO: Implement edit functionality
  console.log('Edit task:', task);
};

const handleViewTask = (task) => {
  // TODO: Implement view functionality or navigation to task details
  console.log('View task:', task);
};

const handleDeleteTask = (task) => {
  // TODO: Implement delete functionality if needed
  console.log('Delete task:', task);
};

const active = computed({
  get() {
    return route.query.tab || "compliance";
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      path: "/deadlines",
      query: { tab },
    });
  },
});
</script>

<template>
  <UTabs v-model="active" :items="items" class="w-full">
    <template #compliance>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.COMPLIANCE"
        title="Compliance Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
    <template #financial_statement>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.FINANCIAL_STATEMENT"
        title="Financial Statement Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
    <template #finance_implementation>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.FINANCE_IMPLEMENTATION"
        title="Finance Implementation Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
    <template #hr_implementation>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.HR_IMPLEMENTATION"
        title="HR Implementation Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
    <template #auditing_accounting>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.ACCOUNTING_AUDIT"
        title="Auditing & Accounting Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
    <template #miscellaneous>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.MISCELLANEOUS"
        title="Miscellaneous Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
    <template #tax>
      <UnifiedTaskTable
        :category="TASK_CATEGORIES.TAX_CASE"
        title="Tax Tasks"
        :show-category-column="false"
        @edit="handleEditTask"
        @view="handleViewTask"
        @delete="handleDeleteTask"
      />
    </template>
  </UTabs>
</template>
