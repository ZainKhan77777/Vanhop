import { Skeleton, LoadingLabel } from "@/components/ui/skeleton";

export default function BookLoading(): React.JSX.Element {
  return (
    <section className="wrap pt-10">
      <LoadingLabel>Loading the booking form</LoadingLabel>

      <div className="mb-7 space-y-3">
        <Skeleton tone="dark" className="h-9 w-56" />
        <Skeleton tone="dark" className="h-4 w-72" />
      </div>

      <div className="space-y-6">
        <Skeleton tone="dark" className="h-6 w-full max-w-md" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="panel space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            </div>
            <div className="panel space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-72 w-full" />
            </div>
          </div>
          <div className="panel space-y-3">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
