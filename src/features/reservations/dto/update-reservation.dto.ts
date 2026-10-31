import { z } from "zod";
import { RESERVATION_STATUS } from "@/constants/reservation-status";

export const updateReservationDto = z.object({
  status: z.enum([RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.COMPLETED]),
});

export type UpdateReservationDto = z.infer<typeof updateReservationDto>;
