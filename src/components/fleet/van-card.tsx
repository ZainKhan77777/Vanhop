import Image from "next/image";
import Link from "next/link";
import { gel, cn } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import type { VanDto } from "@/types";

export function VanCard({ van, index }: { van: VanDto; index: number }): React.JSX.Element {
  return (
    <article
      style={{ animationDelay: `${index * 90}ms` }}
      className={cn(
        "group flex animate-lift flex-col overflow-hidden rounded-xl2 border border-line bg-white",
        "text-navy-900 shadow-sm2 transition-all duration-[400ms] ease-soft hover:-translate-y-1.5 hover:shadow-md2",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <Image
          src={van.imageUrl}
          alt={van.name}
          fill
          sizes="(max-width: 860px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.06]"
          priority={index === 0}
        />
        {van.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold">
            {van.badge}
          </span>
        )}
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-navy-900/80 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Available now
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[26px]">{van.name}</h3>
        <p className="mt-1 text-sm text-muted">{van.kind}</p>
        <p className="mt-3.5 text-[14.5px] leading-relaxed text-muted">{van.description}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {van.specs.map((spec) => (
            <li key={spec} className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12.5px] text-muted">
              {spec}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-5 [margin-top:1.5rem]">
          <p className="text-2xl font-extrabold tracking-tight">
            {gel(van.pricePerDay)}
            <small className="ml-1 text-[13px] font-medium text-muted">/ day</small>
          </p>
          <Link href={ROUTES.book(van.slug)}>
            <Button>Reserve</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
