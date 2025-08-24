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
  { label: "Miscellaneous Tasks", value: "miscellaneous" },
  { label: "Tax", value: "tax" },
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

export const taxCaseCategoryChoices = [
  { label: "One-Time Engagement", value: "OTE" },
  { label: "Regular Process", value: "RP" },
];

export const typeOfTaxCaseChoices = [
  { label: "Percentage Tax", value: "PT" },
  { label: "Income Tax", value: "IT" },
  { label: "Withholding Tax - Expanded", value: "WE" },
];

export const birFormChoices = [
  { label: "BIR Form 2551Q - Quarterly Percentage Tax Return", value: "2551Q" },
  {
    label:
      "BIR Form 1701 - Annual Income Tax Return (Individuals, Estates, Trusts)",
    value: "1701",
  },
  {
    label:
      "BIR Form 0619E - Monthly Remittance Form of Creditable Income Taxes Withheld (Expanded)",
    value: "0619E",
  },
  {
    label:
      "BIR Form 1601-EQ - Quarterly Remittance Return of Creditable Income Taxes Withheld (Expanded)",
    value: "1601EQ",
  },
];
