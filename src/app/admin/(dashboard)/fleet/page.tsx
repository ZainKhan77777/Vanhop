import { listActiveVans } from "@/features/vans/van.service";
import { listReservations } from "@/features/reservations/reservation.service";
import { buildUtilisation } from "@/components/admin/utilisation";
import { FleetUtilisationCard } from "@/components/admin/fleet-utilisation-card";
import { DashboardHeader } from "@/components/admin/dashboard-header";

export const dynamic = "force-dynamic";

export default async function FleetPage(): Promise<React.JSX.Element> {
  const [vans, { items }] = await Promise.all([
    listActiveVans(),
    listReservations({ page: 1, limit: 100 }),
  ]);
  const rows = buildUtilisation(vans, items);

  return (
    <>
      <DashboardHeader title="Fleet" subtitle="Utilisation and earnings per van." />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((van) => <FleetUtilisationCard key={van.id} van={van} />)}
      </div>
    </>
  );
}
