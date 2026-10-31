import { RESERVATION_STATUS, TIMELINE } from "@/constants/reservation-status";
import { toUtcDay } from "@/lib/format";
import type { BadgeTone } from "@/components/ui/badge";
import type { ReservationDto } from "@/types";

/** Timeline label derived from today's date, not stored on the document. */
export function timeline(reservation: ReservationDto): { tone: BadgeTone; label: string } {
  if (reservation.status === RESERVATION_STATUS.CANCELLED) {
    return { tone: "cancelled", label: TIMELINE.CANCELLED.label };
  }
  const now = toUtcDay(new Date()).getTime();
  const start = toUtcDay(reservation.startDate).getTime();
  const end = toUtcDay(reservation.endDate).getTime();

  if (start <= now && end >= now) return { tone: "out", label: TIMELINE.OUT.label };
  if (start > now) return { tone: "soon", label: TIMELINE.SOON.label };
  return { tone: "fin", label: TIMELINE.DONE.label };
}
