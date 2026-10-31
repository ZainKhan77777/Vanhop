import { z } from "zod";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be in YYYY-MM-DD format");

export const availabilityQueryDto = z.object({
  from: day.optional(),
  to: day.optional(),
});

export type AvailabilityQueryDto = z.infer<typeof availabilityQueryDto>;
