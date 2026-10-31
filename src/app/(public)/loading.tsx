import { Skeleton, CardSkeleton, LoadingLabel } from "@/components/ui/skeleton";

/**
 * Shown the moment a navigation to a public page starts, so the fleet never
 * looks frozen while MongoDB is queried. The shapes match the real page, so
 * nothing jumps when the content arrives.
 */
export default function PublicLoading(): React.JSX.Element {
  return (
    <>
      <LoadingLabel>Loading the fleet</LoadingLabel>

      <section className="wrap pt-8">
        <Skeleton tone="dark" className="h-[380px] w-full rounded-[18px] sm:h-[440px] sm:rounded-[22px] lg:h-[500px]" />
      </section>

      <section className="wrap mt-14">
        <div className="mb-7 space-y-3">
          <Skeleton tone="dark" className="h-9 w-48" />
          <Skeleton tone="dark" className="h-4 w-full max-w-[40ch]" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </>
  );
}
