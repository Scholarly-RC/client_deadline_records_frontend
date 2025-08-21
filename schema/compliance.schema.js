import { z } from "zod";

export const complianceSchema = z.object({
  description: z.string().nonempty("Description is required."),
  steps: z.string().nonempty("Steps are required."),
  requirements: z.string().nonempty("Requirements are required."),
  status: z.string().nonempty("Status is required."),
  period_covered: z.string().nonempty("Period covered is required."),
  assigned_to: z.number().min(1, "Assigned to is required."),
  priority: z.string().nonempty("Priority is required."),
  engagement_date: z.string().nonempty("Engagement date is required."),
  deadline: z.string().nonempty("Deadline is required."),
  remarks: z.string().optional(),
  date_complied: z.string().optional(),
  completion_date: z.string().optional(),
});
