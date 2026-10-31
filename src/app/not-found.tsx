import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-5xl">Nothing here</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-white/65">
          That page has moved, or the booking reference doesn&rsquo;t match one of ours.
          The fleet is still waiting though.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={ROUTES.home}>
            <Button variant="light">Back to the fleet</Button>
          </Link>
          <Link href={ROUTES.keysLookup}>
            <Button variant="ghost" className="border-white/25 text-white hover:bg-white/10">
              Find my phone key
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
