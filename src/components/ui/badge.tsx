import { cn } from "@/lib/format";

export type BadgeTone = "out" | "soon" | "fin" | "cancelled";

const TONES: Record<BadgeTone, string> = {
  out: "bg-brass/10 text-brass",
  soon: "bg-navy-700/10 text-navy-700",
  fin: "bg-surface-2 text-muted",
  cancelled: "bg-rose/10 text-rose",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }): React.JSX.Element {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold", TONES[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
