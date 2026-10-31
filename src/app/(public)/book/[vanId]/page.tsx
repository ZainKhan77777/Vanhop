import { notFound } from "next/navigation";
import { listActiveVans } from "@/features/vans/van.service";
import { BookingFlow } from "@/components/booking/booking-flow";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ vanId: string }> }): Promise<React.JSX.Element> {
  const { vanId } = await params;
  const vans = await listActiveVans();
  const selected = vans.find((v) => v.slug === vanId || v.id === vanId);
  if (!selected) notFound();

  return (
    <section className="wrap pt-10">
      <div className="mb-7">
        <h1 className="text-[clamp(26px,3.2vw,38px)]">Book your van</h1>
        <p className="mt-1.5 text-[14.5px] text-white/65">Four short steps. Nothing is charged until pickup.</p>
      </div>
      <BookingFlow vans={vans} initialVan={selected} />
    </section>
  );
}
