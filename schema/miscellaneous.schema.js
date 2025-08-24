import { z } from "zod";

export const miscellaneousSchema = z.object({
  description: z.string().min(1, "Description is required"),
  area: z.string().min(1, "Area is required"),
  period_covered: z.string().min(1, "Period covered is required"),
  assigned_to: z.number().min(1, "Assigned to is required"),
  priority: z.string().min(1, "Priority is required"),
  engagement_date: z.string().min(1, "Engagement date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  remarks: z.string().nullable().optional(),
  date_complied: z.string().nullable().optional(),
  completion_date: z.string().nullable().optional(),
});
