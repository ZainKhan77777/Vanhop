import { z } from "zod";
import { MESSAGES } from "@/constants/messages";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be in YYYY-MM-DD format");

export const createReservationDto = z
  .object({
    vanId: z.string().min(1, "Choose a van"),
    customer: z.object({
      name: z.string().trim().min(2, "Enter your full name").max(80),
      email: z.string().trim().email("Enter a valid email address"),
      phone: z.string().trim().min(6, "Enter a contact number").max(30),
    }),
    startDate: day,
    endDate: day,
  })
  // Both checks run on the client and the server from this one schema.
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: MESSAGES.DATE_ORDER,
    path: ["endDate"],
  })
  .refine((v) => new Date(`${v.startDate}T00:00:00.000Z`) >= startOfToday(), {
    message: MESSAGES.DATE_IN_PAST,
    path: ["startDate"],
  });

export type CreateReservationDto = z.infer<typeof createReservationDto>;

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
