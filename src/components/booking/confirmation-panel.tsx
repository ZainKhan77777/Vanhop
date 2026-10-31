import Link from "next/link";
import { gel, formatLongDay } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { DataRow } from "@/components/ui/data-row";
import type { ReservationDto } from "@/types";

export function ConfirmationPanel({ reservation }: { reservation: ReservationDto }): React.JSX.Element {
  return (
    <div className="panel animate-lift text-center">
      <svg viewBox="0 0 64 64" className="mx-auto h-16 w-16" aria-hidden>
        <circle cx="32" cy="32" r="29" fill="none" stroke="#A8761F" strokeWidth="2.5" opacity=".25" />
        <path d="M20 33.5 L28.5 42 L45 24" fill="none" stroke="#A8761F" strokeWidth="4"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "draw .8s .15s cubic-bezier(.22,.9,.3,1) forwards" }} />
        <style>{`@keyframes draw{to{stroke-dashoffset:0}}`}</style>
      </svg>

      <h2 className="mt-5 text-[30px]">You&rsquo;re booked</h2>
      <p className="mt-2 text-[14.5px] text-muted">
        A confirmation is on its way to {reservation.customer.email}.
      </p>

      <div className="mx-auto mt-6 max-w-sm text-left">
        <DataRow label="Reference" value={reservation.reference} />
        <DataRow label="Van" value={reservation.van.name} />
        <DataRow label="Pickup" value={formatLongDay(reservation.startDate)} />
        <DataRow label="Return" value={formatLongDay(reservation.endDate)} />
        <DataRow strong label="Total" value={gel(reservation.totalAmount)} />
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href={ROUTES.keys(reservation.reference)}>
          <Button>Open your phone key</Button>
        </Link>
        <Link href={ROUTES.home}>
          <Button variant="ghost">Back to the fleet</Button>
        </Link>
      </div>
    </div>
  );
}
