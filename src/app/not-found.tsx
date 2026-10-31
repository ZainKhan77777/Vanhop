import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-5xl">Nothing here</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-white/65">
          That page has moved or never existed. The fleet is still waiting though.
        </p>
        <Link href={ROUTES.home} className="mt-7 inline-block">
          <Button variant="light">Back to the fleet</Button>
        </Link>
      </div>
    </main>
  );
}
