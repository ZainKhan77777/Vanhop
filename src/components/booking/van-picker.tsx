import Image from "next/image";
import { gel, cn } from "@/lib/format";
import type { VanDto } from "@/types";

interface Props {
  vans: VanDto[];
  selectedId: string | null;
  onSelect: (van: VanDto) => void;
}

export function VanPicker({ vans, selectedId, onSelect }: Props): React.JSX.Element {
  return (
    <div className="grid gap-3.5 sm:grid-cols-3">
      {vans.map((van) => {
        const active = van.id === selectedId;
        return (
          <button
            key={van.id}
            type="button"
            onClick={() => onSelect(van)}
            aria-pressed={active}
            className={cn(
              "overflow-hidden rounded-xl border bg-white text-left transition-all duration-300 ease-soft",
              active ? "border-brass ring-[3px] ring-brass/15" : "border-line hover:border-line-2",
            )}
          >
            <span className="relative block aspect-[16/10] bg-surface-2">
              <Image src={van.imageUrl} alt="" fill sizes="33vw" className="object-cover" />
            </span>
            <span className="block bg-white px-4 pb-4 pt-3.5">
              <strong className="block truncate text-[14.5px] leading-snug">{van.name}</strong>
              <span className="mt-1 block text-[12.5px] text-muted">{gel(van.pricePerDay)} / day</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
