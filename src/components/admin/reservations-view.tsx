"use client";

import { useMemo, useState } from "react";
import { useReservations, useCancelReservation } from "@/hooks/use-reservations";
import { gel, formatDay } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorNote } from "@/components/ui/error-note";
import { DashboardHeader } from "./dashboard-header";
import { SearchInput } from "./search-input";
import { FilterChips, type ChipOption } from "./filter-chips";
import { ReservationTable } from "./reservation-table";
import { ReservationDrawer } from "./reservation-drawer";
import { timeline } from "./reservation-status";
import type { ReservationDto } from "@/types";

const TABS = [
  { value: "all", label: "All" },
  { value: "out", label: "Out now" },
  { value: "soon", label: "Upcoming" },
  { value: "fin", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function ReservationsView(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<ReservationDto | null>(null);

  const { data, isLoading, isError, error } = useReservations({ q: query || undefined });
  const cancel = useCancelReservation();
  const items = useMemo(() => data?.items ?? [], [data]);

  // The timeline label is derived client-side, so the tabs filter here too.
  const options: ChipOption[] = TABS.map((t) => ({
    ...t,
    count: t.value === "all" ? items.length : items.filter((r) => timeline(r).tone === t.value).length,
  }));
  const visible = tab === "all" ? items : items.filter((r) => timeline(r).tone === tab);

  function exportCsv(): void {
    const head = "Reference,Customer,Email,Phone,Van,Pickup,Return,Days,Total,Status";
    const body = items.map((r) =>
      [r.reference, r.customer.name, r.customer.email, r.customer.phone, r.van.name,
       formatDay(r.startDate), formatDay(r.endDate), r.days, r.totalAmount, r.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    ).join("\n");

    const url = URL.createObjectURL(new Blob([`${head}\n${body}`], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "vanhop-reservations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function onCancel(id: string): void {
    cancel.mutate(id, { onSuccess: () => setSelected(null) });
  }

  return (
    <>
      <DashboardHeader
        title="Reservations"
        subtitle="Every booking made through the site. Select a row to see the full booking."
        actions={
          <Button variant="light" onClick={exportCsv} disabled={items.length === 0}>
            Export CSV
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3.5 rounded-xl2 border border-line bg-white p-4 text-navy-900 shadow-sm2">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name, email or reference" />
        <FilterChips options={options} active={tab} onChange={setTab} />
      </div>

      <div className="mt-4">
        {isLoading && <Skeleton className="h-80 w-full" />}
        {isError && <ErrorNote message={error.message} />}
        {data && <ReservationTable items={visible} onSelect={setSelected} />}
      </div>

      {data && items.length > 0 && (
        <p className="mt-3 text-[13px] text-white/50">
          Showing {visible.length} of {items.length} · {gel(items.reduce((s, r) => s + r.totalAmount, 0))} booked
        </p>
      )}

      <ReservationDrawer
        reservation={selected}
        cancelling={cancel.isPending}
        onClose={() => setSelected(null)}
        onCancel={onCancel}
      />
    </>
  );
}
