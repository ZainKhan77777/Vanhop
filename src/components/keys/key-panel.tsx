"use client";

import { useState } from "react";
import { useLock } from "@/hooks/use-lock";
import { formatLongDay } from "@/lib/format";
import { ErrorNote } from "@/components/ui/error-note";
import { VanLockAnimation } from "./van-lock-animation";
import { LockToggle } from "./lock-toggle";
import { AccessLog } from "./access-log";
import type { ReservationDto } from "@/types";

export function KeyPanel({ initial }: { initial: ReservationDto }): React.JSX.Element {
  const [reservation, setReservation] = useState(initial);
  const [pulse, setPulse] = useState(0);
  const lock = useLock(reservation.id);

  function toggle(): void {
    lock.mutate(!reservation.isUnlocked, {
      onSuccess: (updated) => { setReservation(updated); setPulse((p) => p + 1); },
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="panel flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-[13.5px] text-muted">{reservation.van.name} · {reservation.van.kind}</p>
          <p className="mt-2 inline-block rounded-md border-2 border-navy-900 px-4 py-1.5 text-[17px] font-extrabold tracking-[.16em]">
            {reservation.reference}
          </p>
        </div>

        <VanLockAnimation unlocked={reservation.isUnlocked} pulse={pulse} />

        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
          reservation.isUnlocked ? "bg-brass/10 text-brass" : "border border-line bg-surface-2 text-muted"
        }`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {reservation.isUnlocked ? "Doors unlocked" : "Doors locked"}
        </span>

        <LockToggle unlocked={reservation.isUnlocked} pending={lock.isPending} pulse={pulse} onToggle={toggle} />

        {lock.isError && <ErrorNote message={lock.error.message} />}

        <p className="max-w-[34ch] text-[13.5px] text-muted">
          Your key works from 08:00 on {formatLongDay(reservation.startDate)} until 20:00 on {formatLongDay(reservation.endDate)}.
        </p>
      </section>

      <section className="panel">
        <h2 className="text-[22px]">Access log</h2>
        <p className="mb-2 mt-1 text-[13.5px] text-muted">Every lock and unlock is recorded.</p>
        <AccessLog entries={reservation.accessLog} />
      </section>
    </div>
  );
}
