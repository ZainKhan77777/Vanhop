"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/format";
import { useLogout } from "@/hooks/use-auth";

const ITEMS = [
  { href: ROUTES.admin, label: "Overview" },
  { href: ROUTES.adminReservations, label: "Reservations" },
  { href: ROUTES.adminFleet, label: "Fleet" },
];

export function Sidebar({ email }: { email: string }): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  async function signOut(): Promise<void> {
    await logout.mutateAsync();
    router.replace(ROUTES.adminLogin);
    router.refresh();
  }

  return (
    <aside className="flex flex-col gap-7 border-b border-white/10 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-brass text-sm font-extrabold">V</span>
        <span className="min-w-0">
          <b className="block text-base font-extrabold tracking-tight">VanHop</b>
          <i className="block text-[11.5px] not-italic text-white/60">Staff dashboard</i>
        </span>
      </div>

      <nav className="flex gap-1 lg:flex-col">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "rounded-[10px] px-3.5 py-2.5 text-[14.5px] font-semibold transition-colors",
              pathname === item.href ? "bg-white text-navy-900" : "text-white/70 hover:bg-white/10 hover:text-white",
            )}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 lg:mt-auto lg:flex-col lg:items-stretch">
        <Link href={ROUTES.home}
          className="hidden rounded-[10px] px-3.5 py-2 text-[13.5px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white lg:block">
          ← Back to site
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brass text-[13px] font-bold">
            {email[0]?.toUpperCase()}
          </span>
          <span className="hidden min-w-0 lg:block">
            <b className="block truncate text-[13px] font-semibold">{email}</b>
            <i className="block text-[11.5px] not-italic text-white/60">Administrator</i>
          </span>
        </div>
        <button onClick={signOut} disabled={logout.isPending}
          className="rounded-full border border-white/15 px-4 py-2.5 text-[13.5px] font-semibold transition hover:bg-white/10 disabled:opacity-50">
          Sign out
        </button>
      </div>
    </aside>
  );
}
