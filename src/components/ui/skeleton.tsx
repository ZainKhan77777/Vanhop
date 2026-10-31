import { cn } from "@/lib/format";

export function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return <div className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
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
