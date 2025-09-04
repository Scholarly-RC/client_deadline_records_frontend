<script setup lang="ts">
import UnifiedTaskTable from "~/components/tasks/UnifiedTaskTable.vue";
import { TASK_CATEGORIES } from "~/constants/choices.js";
import type { RouteLocationNormalizedLoaded } from "vue-router";

interface Props {
  showUserTasksOnly?: boolean;
}

// Props
const props = defineProps<Props>();

const route: RouteLocationNormalizedLoaded = useRoute();
const router = useRouter();

// Refs to UnifiedTaskTable components
const complianceTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);
const financialStatementTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);
const financeImplementationTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);
const hrImplementationTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);
const auditingAccountingTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);
const miscellaneousTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);
const taxTableRef = ref<InstanceType<typeof UnifiedTaskTable> | null>(null);

interface TabItem {
  label: string;
  value: string;
  slot: string;
  category: string;
}

// Method to refresh all tables
const refreshAllTables = async (): Promise<void> => {
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
      .filter((ref): ref is InstanceType<typeof UnifiedTaskTable> => ref !== null && typeof ref.refreshData === 'function')
      .map((ref) => ref.refreshData())
  );
};

// Method to refresh only the active table
const refreshActiveTable = async (): Promise<void> => {
  if (activeTableRef.value && typeof activeTableRef.value.refreshData === 'function') {
    await activeTableRef.value.refreshData();
  }
};

// Expose the refresh methods to parent components
defineExpose({
  refreshAllTables,
  refreshActiveTable,
});

const items: TabItem[] = [
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

const active = computed<string>({
  get() {
    return (route.query.tab as string) || "compliance";
  },
  set(tab: string) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      path: route.path,
      query: { tab },
    });
  },
});

// Computed to get the current active table ref
const activeTableRef = computed(() => {
  switch (active.value) {
    case "compliance":
      return complianceTableRef.value;
    case "financial_statement":
      return financialStatementTableRef.value;
    case "finance_implementation":
      return financeImplementationTableRef.value;
    case "hr_implementation":
      return hrImplementationTableRef.value;
    case "auditing_accounting":
      return auditingAccountingTableRef.value;
    case "miscellaneous":
      return miscellaneousTableRef.value;
    case "tax":
      return taxTableRef.value;
    default:
      return null;
  }
});

// Watch for tab changes and clear filters on all tables
watch(active, async (newTab, oldTab) => {
  // Only clear filters when actually switching tabs (not on initial mount)
  if (oldTab !== undefined && newTab !== oldTab) {
    // Clear filters on all tables to prevent filter persistence
    const tableRefs = [
      complianceTableRef.value,
      financialStatementTableRef.value,
      financeImplementationTableRef.value,
      hrImplementationTableRef.value,
      auditingAccountingTableRef.value,
      miscellaneousTableRef.value,
      taxTableRef.value,
    ];

    // Clear filters on all mounted tables
    await Promise.all(
      tableRefs
        .filter((ref): ref is InstanceType<typeof UnifiedTaskTable> => ref !== null && typeof ref.clearFilters === 'function')
        .map((ref) => ref.clearFilters(false))
    );

    // Refresh data on the active table
    if (activeTableRef.value && typeof activeTableRef.value.refreshData === 'function') {
      await activeTableRef.value.refreshData();
    }
  }
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