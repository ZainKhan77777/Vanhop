"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/format";
import { useLogout } from "@/hooks/use-auth";
import { VanMark } from "@/components/ui/van-mark";

const ITEMS = [
  { href: ROUTES.admin, label: "Overview" },
  { href: ROUTES.adminReservations, label: "Reservations" },
  { href: ROUTES.adminFleet, label: "Fleet" },
];

export function Sidebar({ email }: { email: string }): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  // Navigating away should never leave the menu hanging open behind the page.
  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut(): Promise<void> {
    await logout.mutateAsync();
    router.replace(ROUTES.adminLogin);
    router.refresh();
  }

  return (
    <aside className="flex min-w-0 flex-col gap-5 border-b border-white/10 p-4 sm:gap-7 sm:p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-brass text-white">
          <VanMark size={19} />
        </span>
        <span className="min-w-0">
          <b className="block text-base font-extrabold tracking-tight">VanHop</b>
          <i className="block text-[11.5px] not-italic text-white/60">Admin dashboard</i>
        </span>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto grid h-10 w-10 flex-none place-items-center rounded-[10px] border border-white/15 transition hover:bg-white/10 lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open
              ? <><path d="M5 5l14 14" /><path d="M19 5L5 19" /></>
              : <><path d="M3.5 7h17" /><path d="M3.5 12h17" /><path d="M3.5 17h17" /></>}
          </svg>
        </button>
      </div>

      {/*
        `lg:contents` dissolves this wrapper on desktop, so the nav and the
        footer stay direct flex children of the aside and the layout is exactly
        what it was before the menu existed.
      */}
      <div id="admin-menu" className={cn(open ? "flex flex-col gap-5" : "hidden", "lg:contents")}>
        <nav className="flex flex-col gap-1">
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

        <div className="flex flex-col gap-3 lg:mt-auto">
          <Link href={ROUTES.home}
            className="rounded-[10px] px-3.5 py-2 text-[13.5px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white">
            ← Back to site
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brass text-[13px] font-bold">
              {email[0]?.toUpperCase()}
            </span>
            <span className="min-w-0">
              <b className="block truncate text-[13px] font-semibold">{email}</b>
              <i className="block text-[11.5px] not-italic text-white/60">Administrator</i>
            </span>
          </div>
          <button onClick={signOut} disabled={logout.isPending}
            className="rounded-full border border-white/15 px-4 py-2.5 text-[13.5px] font-semibold transition hover:bg-white/10 disabled:opacity-50">
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
