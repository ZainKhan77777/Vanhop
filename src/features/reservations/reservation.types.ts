import type { ReservationDto } from "@/types";
import type { ReservationStatus, AccessAction } from "@/constants/reservation-status";
import { rentalDays } from "@/lib/format";
import type { ReservationDocument } from "./reservation.model";
import type { VanDocument } from "../vans/van.model";

type Populated = Omit<ReservationDocument, "vanId"> & { vanId: VanDocument | null };

export function toReservationDto(doc: Populated): ReservationDto {
  const van = doc.vanId;
  return {
    id: String(doc._id),
    reference: doc.reference,
    van: {
      id: van ? String(van._id) : "",
      name: van?.name ?? "Van removed",
      kind: van?.kind ?? "",
      imageUrl: van?.imageUrl ?? "",
      pricePerDay: van?.pricePerDay ?? doc.pricePerDaySnapshot,
    },
    customer: {
      name: doc.customer?.name ?? "",
      email: doc.customer?.email ?? "",
      phone: doc.customer?.phone ?? "",
    },
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate.toISOString(),
    days: rentalDays(doc.startDate, doc.endDate),
    pricePerDaySnapshot: doc.pricePerDaySnapshot,
    cleaningFee: doc.cleaningFee,
    totalAmount: doc.totalAmount,
    status: doc.status as ReservationStatus,
    isUnlocked: doc.isUnlocked,
    accessLog: (doc.accessLog ?? []).map((e) => ({
      action: e.action as AccessAction,
      at: new Date(e.at).toISOString(),
    })),
    createdAt: new Date((doc as unknown as { createdAt: Date }).createdAt).toISOString(),
  };
}
