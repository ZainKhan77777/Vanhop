"use client";

import Link from "next/link";
import { RESERVATION_STATUS } from "@/constants/reservation-status";
import { ROUTES } from "@/constants/routes";
import { toUtcDay, formatDay, initials, CURRENCY } from "@/lib/format";
import { StatCard } from "./stat-card";
import { DashboardHeader } from "./dashboard-header";
import { timeline } from "./reservation-status";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { ReservationDto } from "@/types";

export function OverviewView({ reservations }: { reservations: ReservationDto[] }): React.JSX.Element {
  const today = toUtcDay(new Date()).getTime();
  const live = reservations.filter((r) => r.status !== RESERVATION_STATUS.CANCELLED);

  const out = live.filter((r) => toUtcDay(r.startDate).getTime() <= today && toUtcDay(r.endDate).getTime() >= today);
  const revenue = live.reduce((sum, r) => sum + r.totalAmount, 0);
  const days = live.reduce((sum, r) => sum + r.days, 0);

  const upcoming = live
    .filter((r) => toUtcDay(r.endDate).getTime() >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  return (
    <>
      <DashboardHeader
        title="Overview"
        subtitle="Where the fleet stands today."
        actions={<Link href={ROUTES.adminReservations}><Button variant="light">All reservations</Button></Link>}
      />

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reservations" value={live.length} />
        <StatCard label="Out right now" value={out.length} />
        <StatCard label="Days booked" value={days} />
        <StatCard label="Revenue" value={revenue} prefix={CURRENCY} />
      </dl>

      <section className="panel mt-5">
        <h2 className="text-[22px]">Next pickups</h2>
        <p className="mb-2 mt-1 text-[13.5px] text-muted">Bookings starting soonest.</p>

        {upcoming.length === 0 ? (
          <EmptyState title="Nothing booked yet" note="New reservations show up here." />
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.map((r) => {
              const state = timeline(r);
              return (
                <li key={r.id} className="flex items-center gap-3.5 py-3 text-[14.5px]">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brass/10 text-[13px] font-bold text-brass">
                    {initials(r.customer.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate font-semibold">{r.customer.name}</b>
                    <small className="block truncate text-[12.5px] text-muted">{r.van.name} · {r.reference}</small>
                  </span>
                  <span className="whitespace-nowrap text-right text-[13.5px] font-semibold">
                    {formatDay(r.startDate)}
                    <small className="block font-normal text-muted">{state.label}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
