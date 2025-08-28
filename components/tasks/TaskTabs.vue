<script setup>
import UnifiedTaskTable from "~/components/tasks/UnifiedTaskTable.vue";
import { TASK_CATEGORIES } from "~/constants/choices.js";

// Props
const props = defineProps({
  showUserTasksOnly: {
    type: Boolean,
    default: false,
    description: "If true, only shows tasks assigned to the current user. Used for 'My Deadlines' view."
  }
});

const route = useRoute();
const router = useRouter();

// Refs to UnifiedTaskTable components
const complianceTableRef = ref(null);
const financialStatementTableRef = ref(null);
const financeImplementationTableRef = ref(null);
const hrImplementationTableRef = ref(null);
const auditingAccountingTableRef = ref(null);
const miscellaneousTableRef = ref(null);
const taxTableRef = ref(null);

// Method to refresh all tables
const refreshAllTables = async () => {
  const tableRefs = [
    complianceTableRef.value,
    financialStatementTableRef.value,
    financeImplementationTableRef.value,
    hrImplementationTableRef.value,
    auditingAccountingTableRef.value,
    miscellaneousTableRef.value,
    taxTableRef.value,
  ];

  // Refresh all tables that are currently mounted
  await Promise.all(
    tableRefs
      .filter((ref) => ref && ref.refreshData)
      .map((ref) => ref.refreshData())
  );
};

// Expose the refresh method to parent components
defineExpose({
  refreshAllTables,
});

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

const active = computed({
  get() {
    return route.query.tab || "compliance";
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      path: route.path,
      query: { tab },
    });
  },
});
</script>

<template>
  <UTabs v-model="active" :items="items" class="w-full">
    <template #compliance>
      <UnifiedTaskTable
        ref="complianceTableRef"
        :category="TASK_CATEGORIES.COMPLIANCE"
        title="Compliance Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
    <template #financial_statement>
      <UnifiedTaskTable
        ref="financialStatementTableRef"
        :category="TASK_CATEGORIES.FINANCIAL_STATEMENT"
        title="Financial Statement Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
    <template #finance_implementation>
      <UnifiedTaskTable
        ref="financeImplementationTableRef"
        :category="TASK_CATEGORIES.FINANCE_IMPLEMENTATION"
        title="Finance Implementation Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
    <template #hr_implementation>
      <UnifiedTaskTable
        ref="hrImplementationTableRef"
        :category="TASK_CATEGORIES.HR_IMPLEMENTATION"
        title="HR Implementation Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
    <template #auditing_accounting>
      <UnifiedTaskTable
        ref="auditingAccountingTableRef"
        :category="TASK_CATEGORIES.ACCOUNTING_AUDIT"
        title="Auditing & Accounting Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
    <template #miscellaneous>
      <UnifiedTaskTable
        ref="miscellaneousTableRef"
        :category="TASK_CATEGORIES.MISCELLANEOUS"
        title="Miscellaneous Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
    <template #tax>
      <UnifiedTaskTable
        ref="taxTableRef"
        :category="TASK_CATEGORIES.TAX_CASE"
        title="Tax Tasks"
        :show-category-column="false"
        :show-user-tasks-only="props.showUserTasksOnly"
      />
    </template>
  </UTabs>
</template>
