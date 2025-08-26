import { z } from "zod";
import { TASK_CATEGORIES, CATEGORY_FIELDS } from "~/constants/choices.js";

/**
 * Base schema for all task types - common fields
 */
const baseTaskSchema = z.object({
  client: z.number().min(1, "Client is required"),
  category: z.enum(Object.values(TASK_CATEGORIES), "Category is required"),
  description: z.string().min(1, "Description is required"),
  assigned_to: z.number().min(1, "Assigned to is required"),
  priority: z.string().min(1, "Priority is required"),
  deadline: z.string().min(1, "Deadline is required"),
  remarks: z.string().nullable().optional(),
  date_complied: z.string().nullable().optional(),
  completion_date: z.string().nullable().optional(),
});

/**
 * Category-specific field schemas
 */

// Compliance-specific fields
const complianceFields = z.object({
  steps: z.string().min(1, "Steps are required"),
  requirements: z.string().min(1, "Requirements are required"),
  period_covered: z.string().min(1, "Period covered is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
});

// Financial Statement-specific fields  
const financialStatementFields = z.object({
  type: z.string().min(1, "Type is required"),
  needed_data: z.string().min(1, "Needed data is required"),
  period_covered: z.string().min(1, "Period covered is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
});

// Tax Case-specific fields
const taxCaseFields = z.object({
  tax_category: z.string().min(1, "Tax category is required"),
  tax_type: z.string().min(1, "Tax type is required"),
  form: z.string().min(1, "Form is required"),
  working_paper: z.string().min(1, "Working paper is required"),
  tax_payable: z.number().min(0, "Tax payable must be a non-negative number"),
  last_followup: z.string().nullable().optional(),
  period_covered: z.string().min(1, "Period covered is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
});

// Miscellaneous-specific fields
const miscellaneousFields = z.object({
  area: z.string().min(1, "Area is required"),
  period_covered: z.string().min(1, "Period covered is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
});

// Implementation task fields (Accounting Audit, Finance, HR)
const implementationFields = z.object({
  period_covered: z.string().min(1, "Period covered is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
});

/**
 * Complete task schema with all possible fields (for internal use)
 */
const completeTaskSchema = baseTaskSchema.extend({
  // All possible category-specific fields
  steps: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  needed_data: z.string().nullable().optional(),
  tax_category: z.string().nullable().optional(),
  tax_type: z.string().nullable().optional(),
  form: z.string().nullable().optional(),
  working_paper: z.string().nullable().optional(),
  tax_payable: z.number().nullable().optional(),
  last_followup: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  period_covered: z.string().nullable().optional(),
  engagement_date: z.string().nullable().optional(),
});

/**
 * Category-specific schemas for form validation
 */
export const complianceSchema = baseTaskSchema.merge(complianceFields);
export const financialStatementSchema = baseTaskSchema.merge(financialStatementFields);
export const taxCaseSchema = baseTaskSchema.merge(taxCaseFields);
export const miscellaneousSchema = baseTaskSchema.merge(miscellaneousFields);
export const accountingAuditSchema = baseTaskSchema.merge(implementationFields);
export const financeImplementationSchema = baseTaskSchema.merge(implementationFields);
export const hrImplementationSchema = baseTaskSchema.merge(implementationFields);

/**
 * Dynamic schema validator based on category
 * @param {string} category - Task category
 * @returns {ZodSchema} Appropriate schema for the category
 */
export const getSchemaForCategory = (category) => {
  switch (category) {
    case TASK_CATEGORIES.COMPLIANCE:
      return complianceSchema;
    case TASK_CATEGORIES.FINANCIAL_STATEMENT:
      return financialStatementSchema;
    case TASK_CATEGORIES.TAX_CASE:
      return taxCaseSchema;
    case TASK_CATEGORIES.MISCELLANEOUS:
      return miscellaneousSchema;
    case TASK_CATEGORIES.ACCOUNTING_AUDIT:
      return accountingAuditSchema;
    case TASK_CATEGORIES.FINANCE_IMPLEMENTATION:
      return financeImplementationSchema;
    case TASK_CATEGORIES.HR_IMPLEMENTATION:
      return hrImplementationSchema;
    default:
      return baseTaskSchema;
  }
};

/**
 * Unified task schema with conditional validation
 * Uses refine to apply category-specific validation
 */
export const unifiedTaskSchema = completeTaskSchema.refine(
  (data) => {
    if (!data.category) return false;
    
    // Get the appropriate schema for validation
    const categorySchema = getSchemaForCategory(data.category);
    
    try {
      categorySchema.parse(data);
      return true;
    } catch (error) {
      return false;
    }
  },
  {
    message: "Invalid data for the selected category",
  }
);

/**
 * Validation helper functions
 */

/**
 * Validate task data for a specific category
 * @param {Object} data - Task data to validate
 * @param {string} category - Task category
 * @returns {Object} Validation result with success flag and errors
 */
export const validateTaskForCategory = (data, category) => {
  const schema = getSchemaForCategory(category);
  
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error) {
    return { success: false, data: null, errors: error.errors };
  }
};

/**
 * Get required fields for a category
 * @param {string} category - Task category
 * @returns {Array} Array of required field names
 */
export const getRequiredFieldsForCategory = (category) => {
  const categoryConfig = CATEGORY_FIELDS[category];
  return categoryConfig ? categoryConfig.required : [];
};

/**
 * Get all fields for a category
 * @param {string} category - Task category
 * @returns {Array} Array of field names
 */
export const getFieldsForCategory = (category) => {
  const categoryConfig = CATEGORY_FIELDS[category];
  return categoryConfig ? categoryConfig.fields : [];
};

/**
 * Check if a field is required for a category
 * @param {string} fieldName - Field name to check
 * @param {string} category - Task category
 * @returns {boolean} True if field is required
 */
export const isFieldRequiredForCategory = (fieldName, category) => {
  const requiredFields = getRequiredFieldsForCategory(category);
  return requiredFields.includes(fieldName);
};

/**
 * Get default values for a category
 * @param {string} category - Task category
 * @returns {Object} Default field values
 */
export const getDefaultValuesForCategory = (category) => {
  const baseDefaults = {
    client: null,
    category,
    description: "",
    assigned_to: null,
    priority: "medium",
    deadline: "",
    remarks: "",
    date_complied: null,
    completion_date: null,
  };

  const categoryDefaults = {
    [TASK_CATEGORIES.COMPLIANCE]: {
      steps: "",
      requirements: "",
      period_covered: "",
      engagement_date: "",
    },
    [TASK_CATEGORIES.FINANCIAL_STATEMENT]: {
      type: null,
      needed_data: "",
      period_covered: "",
      engagement_date: "",
    },
    [TASK_CATEGORIES.TAX_CASE]: {
      tax_category: null,
      tax_type: null,
      form: null,
      working_paper: "",
      tax_payable: 0,
      last_followup: null,
      period_covered: "",
      engagement_date: "",
    },
    [TASK_CATEGORIES.MISCELLANEOUS]: {
      area: "",
      period_covered: "",
      engagement_date: "",
    },
    [TASK_CATEGORIES.ACCOUNTING_AUDIT]: {
      period_covered: "",
      engagement_date: "",
    },
    [TASK_CATEGORIES.FINANCE_IMPLEMENTATION]: {
      period_covered: "",
      engagement_date: "",
    },
    [TASK_CATEGORIES.HR_IMPLEMENTATION]: {
      period_covered: "",
      engagement_date: "",
    },
  };

  return {
    ...baseDefaults,
    ...(categoryDefaults[category] || {}),
  };
};

// Export the main schemas
export default unifiedTaskSchema;

// Legacy exports for backward compatibility
export { complianceSchema as complianceSchemaLegacy };
export { taxCaseSchema as taxSchema };
export { financialStatementSchema as financialStatementSchemaLegacy };
export { accountingAuditSchema as auditingAccountingSchema };
export { financeImplementationSchema as financeImplementationSchemaLegacy };
export { hrImplementationSchema as hrImplementationSchemaLegacy };
export { miscellaneousSchema as miscellaneousSchemaLegacy };