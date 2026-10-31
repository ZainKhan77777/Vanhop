"use client";

import { gel, formatDay, initials } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { timeline } from "./reservation-status";
import type { ReservationDto } from "@/types";

interface Props { items: ReservationDto[]; onSelect: (reservation: ReservationDto) => void }

const HEADS = ["Customer", "Van", "Pickup", "Return", "Days", "Total", "Status", ""];

export function ReservationTable({ items, onSelect }: Props): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-white text-navy-900 shadow-sm2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-left">
          <thead>
            <tr className="bg-surface-2">
              {HEADS.map((head, i) => (
                <th key={head || i} scope="col"
                  className="whitespace-nowrap px-5 py-3.5 text-[12.5px] font-bold text-muted">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const state = timeline(item);
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") onSelect(item); }}
                  className="cursor-pointer border-t border-line transition-colors hover:bg-surface-2"
                >
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brass/10 text-[12.5px] font-bold text-brass">
                        {initials(item.customer.name)}
                      </span>
                      <span className="min-w-0">
                        <b className="block truncate text-[14.5px] font-semibold">{item.customer.name}</b>
                        <small className="block truncate text-[12.5px] text-muted">
                          {item.customer.email} · {item.reference}
                        </small>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[14px]">{item.van.name}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[14px] tabular-nums">{formatDay(item.startDate)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[14px] tabular-nums">{formatDay(item.endDate)}</td>
                  <td className="px-5 py-3.5 text-[14px] tabular-nums">{item.days}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[14px] font-semibold tabular-nums">{gel(item.totalAmount)}</td>
                  <td className="px-5 py-3.5"><Badge tone={state.tone}>{state.label}</Badge></td>
                  <td className="px-5 py-3.5 text-right text-lg text-muted">›</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <EmptyState title="No reservations match that" note="Clear the search or pick a different status." />
      )}
    </div>
  );
}
