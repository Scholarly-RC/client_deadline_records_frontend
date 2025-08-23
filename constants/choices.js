// ~/constants/choices.js

export const statusChoices = [
  { label: "Completed", value: "completed" },
  { label: "For Revision", value: "for_revision" },
  { label: "For Checking", value: "for_checking" },
  { label: "On Going", value: "on_going" },
  { label: "Pending", value: "pending" },
  { label: "Not Yet Started", value: "not_yet_started" },
  { label: "Cancelled", value: "cancelled" },
];

export const categoryChoices = [
  { label: "Accounting / Auditing", value: "accounting_auditing" },
  { label: "Compliance", value: "compliance" },
  { label: "Finance Implementation", value: "finance_implementation" },
  {
    label: "Financial Statement Preparation",
    value: "financial_statement_prep",
  },
  { label: "Human Resource Implementation", value: "hr_implementation" },
  { label: "Miscellaneous Tasks", value: "miscellaneous_tasks" },
  { label: "Tax (One-Time Engagement)", value: "tax_one_time" },
  { label: "Tax (Regular Processing)", value: "tax_regular" },
];

// Example for priorities
export const priorityChoices = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const fsrTypeChoices = [
  { label: "Quarterly", value: "quarterly" },
  { label: "Annual", value: "annual" },
];
