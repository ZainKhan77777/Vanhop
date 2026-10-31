import { ACCESS_ACTION } from "@/constants/reservation-status";
import type { AccessEntry } from "@/types";

export function AccessLog({ entries }: { entries: AccessEntry[] }): React.JSX.Element {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No activity yet. Your first unlock will show here.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.map((entry, i) => (
        <li key={`${entry.at}-${i}`} className="flex animate-lift items-center gap-3 py-3 text-[14.5px]"
          style={{ animationDelay: `${i * 50}ms` }}>
          <span className="h-2 w-2 flex-none rounded-full bg-brass" />
          <span className="flex-1">
            {entry.action === ACCESS_ACTION.UNLOCK ? "Van unlocked from your phone" : "Van locked from your phone"}
          </span>
          <time className="text-[12.5px] text-muted" dateTime={entry.at}>
            {new Date(entry.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </time>
        </li>
      ))}
    </ul>
  );
}
