import { notFound } from "next/navigation";
import { findReservationOrThrow } from "@/features/reservations/reservation.service";
import { REFERENCE } from "@/constants/reservation-status";
import { KeyPanel } from "@/components/keys/key-panel";
import type { ReservationDto } from "@/types";

export const dynamic = "force-dynamic";

export default async function KeysPage({ params }: { params: Promise<{ ref: string }> }): Promise<React.JSX.Element> {
  const { ref } = await params;

  // This page shows a customer's name, email and phone, so it is reachable by
  // booking reference only. A Mongo _id that leaked from an admin URL or a log
  // must not open it.
  const reference = decodeURIComponent(ref).trim().toUpperCase();
  if (!REFERENCE.PATTERN.test(reference)) notFound();

  let reservation: ReservationDto;
  try {
    reservation = await findReservationOrThrow(reference);
  } catch {
    notFound();
  }

  return (
    <section className="wrap pt-10">
      <div className="mb-7">
        <h1 className="text-[clamp(26px,3.2vw,38px)]">Your phone key</h1>
        <p className="mt-1.5 text-[14.5px] text-white/65">
          Active for the length of your rental. Nothing to collect, nothing to hand back.
        </p>
      </div>
      <KeyPanel initial={reservation} />
    </section>
  );
}
