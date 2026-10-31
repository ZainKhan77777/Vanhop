import type { ReactNode } from "react";

export function DashboardHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }): React.JSX.Element {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="text-[clamp(25px,3vw,34px)]">{title}</h1>
        <p className="mt-1 text-sm text-white/60">{subtitle}</p>
      </div>
      {actions && <div className="flex gap-2.5">{actions}</div>}
    </header>
  );
}
