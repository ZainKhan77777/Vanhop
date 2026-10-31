import { cn } from "@/lib/format";

/**
 * `tone` picks the placeholder colour for the surface it sits on: "light"
 * inside white panels, "dark" directly on the navy page background. Passing a
 * bg-* class through `className` would be unreliable — Tailwind classes have
 * equal specificity, so the winner depends on stylesheet order, not the order
 * they are written in.
 */
export function Skeleton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}): React.JSX.Element {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-xl", tone === "dark" ? "bg-white/10" : "bg-surface-2", className)}
    />
  );
}

export function CardSkeleton(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-white">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

/** Screen-reader announcement to pair with any visual skeleton. */
export function LoadingLabel({ children = "Loading" }: { children?: string }): React.JSX.Element {
  return <span className="sr-only" role="status" aria-live="polite">{children}</span>;
}
