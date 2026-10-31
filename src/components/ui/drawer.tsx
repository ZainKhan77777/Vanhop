"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/format";

interface DrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function Drawer({ open, title, subtitle, onClose, footer, children }: DrawerProps): React.JSX.Element {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[70] bg-navy-900/50 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed inset-y-0 right-0 z-[80] flex w-full max-w-[440px] flex-col bg-white text-navy-900",
          "shadow-[-20px_0_60px_rgba(10,17,30,.3)] transition-transform duration-[420ms] ease-soft",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h3 className="text-[25px]">{title}</h3>
            {subtitle && <p className="mt-1 text-[12.5px] font-semibold tracking-[.08em] text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line bg-surface-2 text-lg transition hover:rotate-90 hover:bg-line"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex gap-2.5 border-t border-line px-6 py-4">{footer}</div>}
      </aside>
    </>
  );
}
