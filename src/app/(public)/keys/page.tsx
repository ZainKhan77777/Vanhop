import type { Metadata } from "next";
import { KeyLookup } from "@/components/keys/key-lookup";

export const metadata: Metadata = {
  title: "Your phone key — VanHop",
  description: "Open the phone key for a VanHop booking using its reference.",
};

export default function KeyLookupPage(): React.JSX.Element {
  return (
    <section className="wrap pt-10">
      <div className="mb-7 text-center">
        <h1 className="text-[clamp(26px,3.2vw,38px)]">Your phone key</h1>
        <p className="mx-auto mt-1.5 max-w-[46ch] text-[14.5px] text-white/65">
          Enter the reference from your booking to lock and unlock the van. Nothing to
          collect, nothing to hand back.
        </p>
      </div>
      <KeyLookup />
    </section>
  );
}
