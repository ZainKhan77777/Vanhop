import Image from "next/image";
import { listActiveVans } from "@/features/vans/van.service";
import { VanCard } from "@/components/fleet/van-card";
import { EmptyState } from "@/components/ui/empty-state";

// Rendered per request: the fleet comes from MongoDB, so the build never needs a DB.
export const dynamic = "force-dynamic";

const HERO =
  "https://images.unsplash.com/photo-1688619103602-35c5b27a6619?w=1600&q=80&auto=format&fit=crop";

export default async function FleetPage(): Promise<React.JSX.Element> {
  const vans = await listActiveVans();

  return (
    <>
      <section className="wrap pt-8">
        <div className="relative h-[380px] w-full overflow-hidden rounded-[18px] sm:h-[440px] sm:rounded-[22px] lg:aspect-[16/7] lg:h-auto">
          <Image src={HERO} alt="" fill priority sizes="100vw" className="animate-kenburns object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/35 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 max-w-[720px] p-5 pb-10 sm:p-12 sm:pb-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-[13px] font-semibold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brass-light" />
              {vans.length} vans free this week
            </span>
            <h1 className="mt-4 text-[clamp(32px,5vw,54px)] leading-[1.08]">
              Rent a van in Tbilisi,{" "}
              <em className="not-italic text-brass-light [font-style:italic]">unlock it from your phone.</em>
            </h1>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-white/80">
              Pick up on Chavchavadze Avenue or have it delivered. Insurance, unlimited
              kilometres across Georgia, and no counter queue.
            </p>
          </div>
        </div>
      </section>

      <section id="fleet" className="wrap mt-14 scroll-mt-24">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <h2 className="text-[clamp(26px,3.2vw,38px)]">The fleet</h2>
          <p className="max-w-[40ch] text-[14.5px] text-white/65">
            Every van is under four years old, serviced monthly and cleaned between rentals.
          </p>
        </div>

        {vans.length === 0 ? (
          <div className="rounded-xl2 bg-white">
            <EmptyState title="No vans yet" note="Run `npm run seed` to add the starting fleet." />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {vans.map((van, i) => <VanCard key={van.id} van={van} index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
