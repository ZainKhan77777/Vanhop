"use client";

import { useMemo, useState } from "react";
import { useAvailability } from "@/hooks/use-availability";
import { useCreateReservation } from "@/hooks/use-create-reservation";
import { isRangeFree } from "@/features/reservations/availability";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorNote } from "@/components/ui/error-note";
import { StepIndicator } from "./step-indicator";
import { VanPicker } from "./van-picker";
import { DateRangeCalendar, nightsBetween } from "./date-range-calendar";
import { BookingForm, type ContactValues } from "./booking-form";
import { BookingSummary } from "./booking-summary";
import { ConfirmationPanel } from "./confirmation-panel";
import type { VanDto, ReservationDto } from "@/types";

export function BookingFlow({ vans, initialVan }: { vans: VanDto[]; initialVan: VanDto }): React.JSX.Element {
  const [van, setVan] = useState<VanDto>(initialVan);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [done, setDone] = useState<ReservationDto | null>(null);

  const availability = useAvailability(van.id);
  const create = useCreateReservation();
  const nights = nightsBetween(from, to);

  const ranges = useMemo(() => availability.data?.bookedRanges ?? [], [availability.data]);
  const clash = Boolean(from && to && !isRangeFree(ranges, from, to));
  const step = done ? 3 : from && to ? 2 : 1;

  function chooseVan(next: VanDto): void {
    setVan(next);
    setFrom(null);
    setTo(null);
  }

  function submit(contact: ContactValues): void {
    if (!from || !to) return;
    create.mutate(
      { vanId: van.id, customer: contact, startDate: from, endDate: to },
      { onSuccess: setDone },
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-7"><StepIndicator current={3} /></div>
        <ConfirmationPanel reservation={done} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={step} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="panel">
            <h2 className="text-[22px]">Choose a van</h2>
            <p className="mb-5 mt-1 text-[14.5px] text-muted">Each van has its own calendar. Switching vans clears the dates.</p>
            <VanPicker vans={vans} selectedId={van.id} onSelect={chooseVan} />
          </section>

          <section className="panel">
            <h2 className="text-[22px]">Pick your dates</h2>
            <p className="mb-5 mt-1 text-[14.5px] text-muted">
              Return day is checkout, so a van returned in the morning can go out the same afternoon.
            </p>

            {availability.isLoading && <Skeleton className="h-72 w-full" />}
            {availability.isError && <ErrorNote message={availability.error.message} />}
            {availability.data && (
              <DateRangeCalendar bookedRanges={ranges} from={from} to={to}
                onChange={(f, t) => { setFrom(f); setTo(t); }} />
            )}
            {clash && <div className="mt-4"><ErrorNote message="Those dates overlap a booking. Pick another range." /></div>}
          </section>

          <section className="panel">
            <h2 className="text-[22px]">Your details</h2>
            <p className="mb-5 mt-1 text-[14.5px] text-muted">We only use these to confirm the booking and send your phone key.</p>
            {create.isError && <div className="mb-4"><ErrorNote message={create.error.message} /></div>}
            <BookingForm disabled={!from || !to || clash} pending={create.isPending} onSubmit={submit} />
          </section>
        </div>

        <BookingSummary van={van} from={from} to={to} nights={nights} />
      </div>
    </div>
  );
}
