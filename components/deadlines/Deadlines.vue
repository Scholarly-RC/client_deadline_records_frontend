<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddDeadlineModal from "./AddDeadlineModal.vue";
import ComplianceTable from "./ComplianceTable.vue";
import FinancialStatementTable from "./FinancialStatementTable.vue";
import FinanceImplementationTable from "./FinanceImplementationTable.vue";
import HrImplementationTable from "./HrImplementationTable.vue";
import AuditingAccountingTable from "./AuditingAccountingTable.vue";

const items = [
  {
    label: "Compliance",
    slot: "compliance",
  },
  {
    label: "Financial Statement",
    slot: "financial_statement",
  },
  {
    label: "Finance Implementation",
    slot: "finance_implementation",
  },
  {
    label: "HR Implementation",
    slot: "hr_implementation",
  },
  {
    label: "Auditing & Accounting",
    slot: "auditing_accounting",
  },
];
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Deadlines" />
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="flex justify-end">
        <AddDeadlineModal />
      </div>
      <UTabs :items="items" class="w-full">
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
      </UTabs>
    </main>
  </div>
</template>
