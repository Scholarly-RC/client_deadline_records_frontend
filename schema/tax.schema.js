import { z } from "zod";

export const taxSchema = z.object({
  category: z.string().min(1, "Tax category is required"),
  tax_type: z.string().min(1, "Tax type is required"),
  form: z.string().min(1, "Form is required"),
  working_paper: z.string().min(1, "Working paper is required"),
  tax_payable: z.number().min(0, "Tax payable must be a non-negative number"),
  last_followup: z.string().nullable().optional(),
  period_covered: z.string().min(1, "Period covered is required"),
  assigned_to: z.number().min(1, "Assigned to is required"),
  priority: z.string().min(1, "Priority is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  remarks: z.string().nullable().optional(),
  date_complied: z.string().nullable().optional(),
  completion_date: z.string().nullable().optional(),
});
