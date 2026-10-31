import { SiteNav } from "@/components/layout/site-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <SiteNav />

      <main>{children}</main>

      <footer className="wrap mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-7 text-[13.5px] text-white/60">
        <span>VanHop · Chavchavadze Ave 37, Tbilisi</span>
        <span>Insurance and unlimited kilometres included</span>
      </footer>
    </>
  );
}
