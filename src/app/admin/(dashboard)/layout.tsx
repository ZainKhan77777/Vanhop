import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/guards/require-session";
import { ROUTES } from "@/constants/routes";
import { Sidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }): Promise<React.JSX.Element> {
  const session = await getSession();
  if (!session) redirect(ROUTES.adminLogin);

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] lg:grid-cols-[252px_minmax(0,1fr)]">
      <Sidebar email={session.email} />
      <main className="min-w-0 px-4 pb-16 pt-7 sm:px-5 lg:px-8">{children}</main>
    </div>
  );
}
