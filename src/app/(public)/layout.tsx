import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white text-navy-900">
        <div className="wrap flex items-center gap-5 py-3.5">
          <Link href={ROUTES.home} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-navy-900 text-sm font-extrabold text-white">V</span>
            <span className="min-w-0">
              <b className="block text-[19px] font-extrabold leading-tight tracking-tight">VanHop</b>
              <i className="block text-xs not-italic leading-tight text-muted">Van rental · Tbilisi</i>
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4">
            <a href="tel:+995322000000" className="hidden text-[13.5px] font-semibold text-muted transition hover:text-navy-900 lg:block">
              +995 322 00 00 00
            </a>
            <Link href={ROUTES.adminLogin} className="text-[13.5px] font-semibold text-muted transition hover:text-navy-900">
              Staff
            </Link>
            <Link href={ROUTES.home} className="hidden sm:block">
              <Button className="px-5 py-2.5 text-sm">Reserve a van</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="wrap mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-7 text-[13.5px] text-white/60">
        <span>VanHop · Chavchavadze Ave 37, Tbilisi</span>
        <span>Insurance and unlimited kilometres included</span>
      </footer>
    </>
  );
}
