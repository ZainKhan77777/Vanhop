"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { gel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export interface VanUtilisation {
  id: string;
  name: string;
  kind: string;
  imageUrl: string;
  pricePerDay: number;
  bookedDays: number;
  reservations: number;
  revenue: number;
  outNow: boolean;
}

const WINDOW_DAYS = 30;

export function FleetUtilisationCard({ van }: { van: VanUtilisation }): React.JSX.Element {
  const pct = Math.min(100, Math.round((van.bookedDays / WINDOW_DAYS) * 100));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <article className="overflow-hidden rounded-xl2 border border-line bg-white text-navy-900 shadow-sm2">
      <div className="relative aspect-[16/9] bg-surface-2">
        <Image src={van.imageUrl} alt="" fill sizes="(max-width: 860px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="p-5">
        <h4 className="text-xl">{van.name}</h4>
        <p className="mb-3.5 text-[13px] text-muted">{van.kind} · {gel(van.pricePerDay)} / day</p>

        <div className="flex justify-between text-[13.5px] font-semibold">
          <span>Booked days</span><span className="tabular-nums">{van.bookedDays} / {WINDOW_DAYS}</span>
        </div>
        <div className="my-2 h-[7px] overflow-hidden rounded-full bg-surface-2">
          <span className="block h-full rounded-full bg-brass transition-[width] duration-1000 ease-soft"
            style={{ width: `${width}%` }} />
        </div>

        <div className="flex justify-between text-[13px] text-muted">
          <span>{van.reservations} reservations</span>
          <span>{gel(van.revenue)} earned</span>
        </div>
        <div className="mt-3.5">
          <Badge tone={van.outNow ? "out" : "soon"}>{van.outNow ? "Out now" : "At the depot"}</Badge>
        </div>
      </div>
    </article>
  );
}
