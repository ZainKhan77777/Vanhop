import { z } from "zod";
import { RESERVATION_STATUSES } from "@/constants/reservation-status";

export const listReservationsDto = z.object({
  status: z.enum(RESERVATION_STATUSES as [string, ...string[]]).optional(),
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListReservationsDto = z.infer<typeof listReservationsDto>;
