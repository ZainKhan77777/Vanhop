"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { VanMark } from "@/components/ui/van-mark";

const LINKS = [
  { href: ROUTES.home, label: "Fleet", match: (p: string) => p === "/" },
  { href: ROUTES.keysLookup, label: "Your key", match: (p: string) => p.startsWith("/keys") },
  { href: ROUTES.adminLogin, label: "Admin", match: (p: string) => p.startsWith("/admin") },
];

export function SiteNav(): React.JSX.Element {
  // Active state is read from the URL rather than hardcoded, so it stays true
  // on every page instead of only on the home page.
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 text-navy-900 backdrop-blur">
      <div className="wrap flex items-center gap-4 py-3">
        <Link href={ROUTES.home} className="flex min-w-0 shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-navy-900 text-white">
            <VanMark size={20} />
          </span>
          <span className="hidden min-w-0 min-[420px]:block">
            <b className="block whitespace-nowrap text-[19px] font-extrabold leading-tight tracking-tight">VanHop</b>
            <i className="hidden text-xs not-italic leading-tight text-muted sm:block">Van rental · Tbilisi</i>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-1 rounded-full bg-surface-2 p-1">
          {LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors sm:px-5",
                  active ? "bg-navy-900 text-white" : "text-muted hover:text-navy-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href={`${ROUTES.home}#fleet`} className="hidden lg:block">
          <Button className="px-5 py-2.5 text-sm">Reserve a van</Button>
        </Link>
      </div>
    </header>
  );
}
