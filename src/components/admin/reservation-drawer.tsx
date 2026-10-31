"use client";

import Image from "next/image";
import { gel, formatLongDay } from "@/lib/format";
import { PRICING, RESERVATION_STATUS } from "@/constants/reservation-status";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataRow, SectionLabel } from "@/components/ui/data-row";
import { timeline } from "./reservation-status";
import type { ReservationDto } from "@/types";

interface Props {
  reservation: ReservationDto | null;
  cancelling: boolean;
  onClose: () => void;
  onCancel: (id: string) => void;
}

export function ReservationDrawer({ reservation, cancelling, onClose, onCancel }: Props): React.JSX.Element {
  const state = reservation ? timeline(reservation) : null;
  const cancelled = reservation?.status === RESERVATION_STATUS.CANCELLED;

  return (
    <Drawer
      open={Boolean(reservation)}
      onClose={onClose}
      title={reservation?.customer.name ?? ""}
      subtitle={reservation?.reference}
      footer={
        reservation && (
          <>
            <Button variant="ghost" className="flex-1"
              onClick={() => { window.location.href = `mailto:${reservation.customer.email}?subject=Your VanHop booking ${reservation.reference}`; }}>
              Email customer
            </Button>
            <Button variant="danger" className="flex-1" disabled={cancelled || cancelling}
              onClick={() => onCancel(reservation.id)}>
              {cancelled ? "Cancelled" : cancelling ? "Cancelling…" : "Cancel booking"}
            </Button>
          </>
        )
      }
    >
      {reservation && state && (
        <>
          <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-xl bg-surface-2">
            {reservation.van.imageUrl && (
              <Image src={reservation.van.imageUrl} alt="" fill sizes="440px" className="object-cover" />
            )}
          </div>

          <SectionLabel>Booking</SectionLabel>
          <DataRow label="Status" value={<Badge tone={state.tone}>{state.label}</Badge>} />
          <DataRow label="Van" value={reservation.van.name} />
          <DataRow label="Type" value={reservation.van.kind} />
          <DataRow label="Pickup" value={`${formatLongDay(reservation.startDate)}, 08:00`} />
          <DataRow label="Return" value={`${formatLongDay(reservation.endDate)}, 20:00`} />
          <DataRow label="Phone key" value={reservation.isUnlocked ? "Unlocked" : "Locked"} />

          <SectionLabel>Customer</SectionLabel>
          <DataRow label="Email" value={reservation.customer.email} />
          <DataRow label="Phone" value={reservation.customer.phone} />

          <SectionLabel>Charges</SectionLabel>
          <DataRow
            label={`${gel(reservation.pricePerDaySnapshot)} × ${reservation.days} days`}
            value={gel(reservation.pricePerDaySnapshot * reservation.days)}
          />
          <DataRow label="Cleaning" value={gel(reservation.cleaningFee)} />
          <DataRow label="Deposit (refundable)" value={gel(PRICING.DEPOSIT)} />
          <DataRow strong label="Total" value={gel(reservation.totalAmount)} />
        </>
      )}
    </Drawer>
  );
}
