import { gel, formatLongDay } from "@/lib/format";
import { PRICING } from "@/constants/reservation-status";
import { DataRow } from "@/components/ui/data-row";
import type { VanDto } from "@/types";

interface Props {
  van: VanDto | null;
  from: string | null;
  to: string | null;
  nights: number;
}

export function BookingSummary({ van, from, to, nights }: Props): React.JSX.Element {
  const subtotal = van ? nights * van.pricePerDay : 0;

  return (
    <aside className="panel sticky top-24">
      <h2 className="text-[22px]">Your booking</h2>
      <p className="mb-4 mt-1 text-[13.5px] text-muted">Nothing is charged until pickup.</p>

      <DataRow label="Van" value={van?.name ?? "Not chosen"} />
      <DataRow label="Pickup" value={from ? formatLongDay(from) : "—"} />
      <DataRow label="Return" value={to ? formatLongDay(to) : "—"} />
      <DataRow label="Days" value={nights || "—"} />
      <DataRow
        label={van && nights ? `${gel(van.pricePerDay)} × ${nights} days` : "Daily rate"}
        value={subtotal ? gel(subtotal) : "—"}
      />
      <DataRow label="Cleaning" value={gel(PRICING.CLEANING_FEE)} />
      <DataRow label="Deposit (refundable)" value={gel(PRICING.DEPOSIT)} />
      <DataRow strong label="Total" value={subtotal ? gel(subtotal + PRICING.CLEANING_FEE) : "—"} />
    </aside>
  );
}
