import { RESERVATION_STATUS } from "@/constants/reservation-status";
import { toUtcDay } from "@/lib/format";
import type { VanDto, ReservationDto } from "@/types";
import type { VanUtilisation } from "./fleet-utilisation-card";

export function buildUtilisation(vans: VanDto[], reservations: ReservationDto[]): VanUtilisation[] {
  const today = toUtcDay(new Date()).getTime();

  return vans.map((van) => {
    const mine = reservations.filter(
      (r) => r.van.id === van.id && r.status !== RESERVATION_STATUS.CANCELLED,
    );
    return {
      id: van.id,
      name: van.name,
      kind: van.kind,
      imageUrl: van.imageUrl,
      pricePerDay: van.pricePerDay,
      bookedDays: mine.reduce((sum, r) => sum + r.days, 0),
      reservations: mine.length,
      revenue: mine.reduce((sum, r) => sum + r.totalAmount, 0),
      outNow: mine.some(
        (r) => toUtcDay(r.startDate).getTime() <= today && toUtcDay(r.endDate).getTime() >= today,
      ),
    };
  });
}
