"use client";

import { useEffect, useState } from "react";

interface Props { label: string; value: number; prefix?: string }

export function StatCard({ label, value, prefix = "" }: Props): React.JSX.Element {
  const shown = useCountUp(value);
  return (
    <div className="rounded-xl2 border border-line bg-white p-5 text-navy-900 shadow-sm2">
      <dt className="text-[12.5px] font-semibold text-muted">{label}</dt>
      <dd className="mt-2 text-[30px] font-extrabold tracking-tight tabular-nums">
        {prefix}{shown.toLocaleString("en-GB")}
      </dd>
    </div>
  );
}

function useCountUp(target: number, duration = 850): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setValue(target); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
