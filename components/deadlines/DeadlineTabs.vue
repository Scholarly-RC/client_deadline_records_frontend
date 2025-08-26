<script setup>
import ComplianceTable from "./ComplianceTable.vue";
import FinancialStatementTable from "./FinancialStatementTable.vue";
import FinanceImplementationTable from "./FinanceImplementationTable.vue";
import HrImplementationTable from "./HrImplementationTable.vue";
import AuditingAccountingTable from "./AuditingAccountingTable.vue";
import MiscellaneousTable from "./MiscellaneousTable.vue";
import TaxTable from "./TaxTable.vue";

const route = useRoute();
const router = useRouter();

const items = [
  {
    label: "Compliance",
    value: "compliance",
    slot: "compliance",
  },
  {
    label: "Financial Statement",
    value: "financial_statement",
    slot: "financial_statement",
  },
  {
    label: "Finance Implementation",
    value: "finance_implementation",
    slot: "finance_implementation",
  },
  {
    label: "HR Implementation",
    value: "hr_implementation",
    slot: "hr_implementation",
  },
  {
    label: "Auditing & Accounting",
    value: "auditing_accounting",
    slot: "auditing_accounting",
  },
  {
    label: "Miscellaneous",
    value: "miscellaneous",
    slot: "miscellaneous",
  },
  {
    label: "Tax",
    value: "tax",
    slot: "tax",
  },
];

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
      <ComplianceTable />
    </template>
    <template #financial_statement>
      <FinancialStatementTable />
    </template>
    <template #finance_implementation>
      <FinanceImplementationTable />
    </template>
    <template #hr_implementation>
      <HrImplementationTable />
    </template>
    <template #auditing_accounting>
      <AuditingAccountingTable />
    </template>
    <template #miscellaneous>
      <MiscellaneousTable />
    </template>
    <template #tax>
      <TaxTable />
    </template>
  </UTabs>
</template>
