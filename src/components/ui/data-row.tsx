import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function DataRow({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }): React.JSX.Element {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-2.5 text-[14.5px]", !strong && "border-b border-line")}>
      <span className="text-muted">{label}</span>
      <span className={cn("text-right font-semibold", strong && "text-[22px] font-extrabold tracking-tight")}>{value}</span>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }): React.JSX.Element {
  return <p className="mb-2.5 mt-6 text-xs font-bold text-muted first:mt-0">{children}</p>;
}
