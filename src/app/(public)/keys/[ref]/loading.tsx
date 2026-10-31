import { Skeleton, LoadingLabel } from "@/components/ui/skeleton";

export default function KeyLoading(): React.JSX.Element {
  return (
    <section className="wrap pt-10">
      <LoadingLabel>Loading your phone key</LoadingLabel>

      <div className="mb-7 space-y-3">
        <Skeleton tone="dark" className="h-9 w-56" />
        <Skeleton tone="dark" className="h-4 w-full max-w-[46ch]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel flex flex-col items-center gap-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-40 w-full max-w-[420px]" />
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-16 w-full max-w-[340px] rounded-full" />
        </div>
        <div className="panel space-y-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
      </div>
    </section>
  );
}
