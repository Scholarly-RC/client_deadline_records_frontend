import { z } from "zod";

export const financialStatementSchema = z.object({
  needed_data: z.string().nonempty("Needed data is required."),
  fsr_type: z.string().nonempty("FSR Type is required."),
  assigned_to: z.number().min(1, "Assigned to is required."),
  priority: z.string().nonempty("Priority is required."),
  engagement_date: z.string().nonempty("Engagement date is required."),
  deadline: z.string().nonempty("Deadline is required."),
  remarks: z.string().optional(),
  date_complied: z.string().optional(),
  completion_date: z.string().optional(),
});
