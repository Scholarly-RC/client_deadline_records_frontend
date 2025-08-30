// ~/constants/choices.ts

import { TaskStatus, TaskPriority } from '~/types/api';

// New unified task model status choices
export interface StatusChoice {
  label: string;
  value: TaskStatus;
}

export const statusChoices: StatusChoice[] = [
  { label: "Completed", value: TaskStatus.COMPLETED },
  { label: "For Revision", value: TaskStatus.FOR_REVISION },
  { label: "For Checking", value: TaskStatus.FOR_CHECKING },
  { label: "On Going", value: TaskStatus.ON_GOING },
  { label: "Pending", value: TaskStatus.PENDING },
  { label: "Pending Approval", value: TaskStatus.PENDING_APPROVAL },
  { label: "Not Yet Started", value: TaskStatus.NOT_YET_STARTED },
  { label: "Cancelled", value: TaskStatus.CANCELLED },
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
} as const;

export type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];

// New task category choices for UI
export interface CategoryChoice {
  label: string;
  value: TaskCategory;
}

export const categoryChoices: CategoryChoice[] = [
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
export const LEGACY_CATEGORY_MAPPING: Record<string, TaskCategory> = {
  compliance: TASK_CATEGORIES.COMPLIANCE,
  accounting_audits: TASK_CATEGORIES.ACCOUNTING_AUDIT,
  financial_statement_preparations: TASK_CATEGORIES.FINANCIAL_STATEMENT,
  finance_implementations: TASK_CATEGORIES.FINANCE_IMPLEMENTATION,
  human_resource_implementations: TASK_CATEGORIES.HR_IMPLEMENTATION,
  miscellaneous_tasks: TASK_CATEGORIES.MISCELLANEOUS,
  tax_cases: TASK_CATEGORIES.TAX_CASE,
};

// Reverse mapping for UI display
export const CATEGORY_DISPLAY_MAPPING: Record<TaskCategory, string> = {
  [TASK_CATEGORIES.COMPLIANCE]: "compliance",
  [TASK_CATEGORIES.ACCOUNTING_AUDIT]: "accounting_audits",
  [TASK_CATEGORIES.FINANCIAL_STATEMENT]: "financial_statement_preparations",
  [TASK_CATEGORIES.FINANCE_IMPLEMENTATION]: "finance_implementations",
  [TASK_CATEGORIES.HR_IMPLEMENTATION]: "human_resource_implementations",
  [TASK_CATEGORIES.MISCELLANEOUS]: "miscellaneous_tasks",
  [TASK_CATEGORIES.TAX_CASE]: "tax_cases",
};

// Example for priorities
export interface PriorityChoice {
  label: string;
  value: TaskPriority;
}

export const priorityChoices: PriorityChoice[] = [
  { label: "High", value: TaskPriority.HIGH },
  { label: "Medium", value: TaskPriority.MEDIUM },
  { label: "Low", value: TaskPriority.LOW },
];

// FSR Type choices
export interface FsrTypeChoice {
  label: string;
  value: string;
}

export const fsrTypeChoices: FsrTypeChoice[] = [
  { label: "Quarterly", value: "quarterly" },
  { label: "Annual", value: "annual" },
];

// Tax case specific choices
export interface TaxCaseCategoryChoice {
  label: string;
  value: string;
}

export const taxCaseCategoryChoices: TaxCaseCategoryChoice[] = [
  { label: "One-Time Engagement", value: "OTE" },
  { label: "Regular Process", value: "RP" },
];

export interface TypeOfTaxCaseChoice {
  label: string;
  value: string;
}

export const typeOfTaxCaseChoices: TypeOfTaxCaseChoice[] = [
  { label: "Percentage Tax", value: "PT" },
  { label: "Income Tax", value: "IT" },
  { label: "Withholding Tax - Expanded", value: "WE" },
];

// Category-specific field configurations
export const CATEGORY_FIELDS: Record<TaskCategory, { fields: string[]; required: string[] }> = {
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

export interface BirFormChoice {
  label: string;
  value: string;
}

export const birFormChoices: BirFormChoice[] = [
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