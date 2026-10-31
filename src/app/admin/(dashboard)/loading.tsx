import { Skeleton, LoadingLabel } from "@/components/ui/skeleton";

/**
 * Lives inside the dashboard layout, so the sidebar stays put and only the
 * content area swaps while the next admin page loads.
 */
export default function AdminLoading(): React.JSX.Element {
  return (
    <>
      <LoadingLabel>Loading the dashboard</LoadingLabel>

      <div className="space-y-2.5">
        <Skeleton tone="dark" className="h-8 w-44" />
        <Skeleton tone="dark" className="h-4 w-64" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl2 border border-line bg-white p-5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="panel mt-5 space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    </>
  );
}
