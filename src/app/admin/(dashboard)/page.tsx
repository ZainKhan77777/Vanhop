import { listReservations } from "@/features/reservations/reservation.service";
import { OverviewView } from "@/components/admin/overview-view";

export const dynamic = "force-dynamic";

export default async function OverviewPage(): Promise<React.JSX.Element> {
  const { items } = await listReservations({ page: 1, limit: 100 });
  return <OverviewView reservations={items} />;
}
