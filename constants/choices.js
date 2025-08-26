// ~/constants/choices.js

// New unified task model status choices
export const statusChoices = [
  { label: "Completed", value: "completed" },
  { label: "For Revision", value: "for_revision" },
  { label: "For Checking", value: "for_checking" },
  { label: "In Progress", value: "in_progress" },
  { label: "Pending", value: "pending" },
  { label: "Not Yet Started", value: "not_yet_started" },
  { label: "Cancelled", value: "cancelled" },
];

// New unified task categories from backend
export const TASK_CATEGORIES = {
  COMPLIANCE: "compliance",
  FINANCIAL_STATEMENT: "financial_statement",
  ACCOUNTING_AUDIT: "accounting_audit",
  FINANCE_IMPLEMENTATION: "finance_implementation",
  HR_IMPLEMENTATION: "hr_implementation",
  MISCELLANEOUS: "miscellaneous",
  TAX_CASE: "tax_case",
};

// New task category choices for UI
export const categoryChoices = [
  { label: "Accounting / Auditing", value: TASK_CATEGORIES.ACCOUNTING_AUDIT },
  { label: "Compliance", value: TASK_CATEGORIES.COMPLIANCE },
  {
    label: "Finance Implementation",
    value: TASK_CATEGORIES.FINANCE_IMPLEMENTATION,
  },
  {
    label: "Financial Statement Preparation",
    value: TASK_CATEGORIES.FINANCIAL_STATEMENT,
  },
  {
    label: "Human Resource Implementation",
    value: TASK_CATEGORIES.HR_IMPLEMENTATION,
  },
  { label: "Miscellaneous Tasks", value: TASK_CATEGORIES.MISCELLANEOUS },
  { label: "Tax", value: TASK_CATEGORIES.TAX_CASE },
];

// Legacy to new category mapping for migration
export const LEGACY_CATEGORY_MAPPING = {
  compliance: TASK_CATEGORIES.COMPLIANCE,
  accounting_audits: TASK_CATEGORIES.ACCOUNTING_AUDIT,
  financial_statement_preparations: TASK_CATEGORIES.FINANCIAL_STATEMENT,
  finance_implementations: TASK_CATEGORIES.FINANCE_IMPLEMENTATION,
  human_resource_implementations: TASK_CATEGORIES.HR_IMPLEMENTATION,
  miscellaneous_tasks: TASK_CATEGORIES.MISCELLANEOUS,
  tax_cases: TASK_CATEGORIES.TAX_CASE,
};

// Reverse mapping for UI display
export const CATEGORY_DISPLAY_MAPPING = {
  [TASK_CATEGORIES.COMPLIANCE]: "compliance",
  [TASK_CATEGORIES.ACCOUNTING_AUDIT]: "accounting_audits",
  [TASK_CATEGORIES.FINANCIAL_STATEMENT]: "financial_statement_preparations",
  [TASK_CATEGORIES.FINANCE_IMPLEMENTATION]: "finance_implementations",
  [TASK_CATEGORIES.HR_IMPLEMENTATION]: "human_resource_implementations",
  [TASK_CATEGORIES.MISCELLANEOUS]: "miscellaneous_tasks",
  [TASK_CATEGORIES.TAX_CASE]: "tax_cases",
};

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

// Tax case specific choices
export const taxCaseCategoryChoices = [
  { label: "One-Time Engagement", value: "OTE" },
  { label: "Regular Process", value: "RP" },
];

export const typeOfTaxCaseChoices = [
  { label: "Percentage Tax", value: "PT" },
  { label: "Income Tax", value: "IT" },
  { label: "Withholding Tax - Expanded", value: "WE" },
];

// Category-specific field configurations
export const CATEGORY_FIELDS = {
  [TASK_CATEGORIES.COMPLIANCE]: {
    fields: ["steps", "requirements", "period_covered", "engagement_date"],
    required: ["steps", "requirements", "period_covered", "engagement_date"],
  },
  [TASK_CATEGORIES.FINANCIAL_STATEMENT]: {
    fields: ["type", "needed_data", "period_covered", "engagement_date"],
    required: ["type", "needed_data", "period_covered", "engagement_date"],
  },
  [TASK_CATEGORIES.TAX_CASE]: {
    fields: [
      "tax_category",
      "tax_type",
      "form",
      "working_paper",
      "tax_payable",
      "last_followup",
      "period_covered",
      "engagement_date",
    ],
    required: [
      "tax_category",
      "tax_type",
      "form",
      "working_paper",
      "tax_payable",
      "period_covered",
      "engagement_date",
    ],
  },
  [TASK_CATEGORIES.MISCELLANEOUS]: {
    fields: ["area", "period_covered", "engagement_date"],
    required: ["area", "period_covered", "engagement_date"],
  },
  [TASK_CATEGORIES.ACCOUNTING_AUDIT]: {
    fields: ["period_covered", "engagement_date"],
    required: ["period_covered", "engagement_date"],
  },
  [TASK_CATEGORIES.FINANCE_IMPLEMENTATION]: {
    fields: ["period_covered", "engagement_date"],
    required: ["period_covered", "engagement_date"],
  },
  [TASK_CATEGORIES.HR_IMPLEMENTATION]: {
    fields: ["period_covered", "engagement_date"],
    required: ["period_covered", "engagement_date"],
  },
};

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
