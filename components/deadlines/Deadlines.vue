<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddDeadlineModal from "./AddDeadlineModal.vue";
import ComplianceTable from "./ComplianceTable.vue";
import FinancialStatementTable from "./FinancialStatementTable.vue";

const items = [
  {
    key: "compliance",
    label: "Compliance",
    slot: "compliance",
  },
  {
    key: "financial_statement",
    label: "Financial Statement",
    slot: "financial_statement",
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
      </UTabs>
    </main>
  </div>
</template>
