"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { REFERENCE } from "@/constants/reservation-status";
import { MESSAGES } from "@/constants/messages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function KeyLookup(): React.JSX.Element {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent): void {
    event.preventDefault();

    // Typing it by hand off a confirmation screen, so be forgiving: uppercase
    // it, strip spaces, and add the VH- prefix if they left it off.
    const raw = value.trim().toUpperCase().replace(/\s+/g, "");
    const reference = raw.startsWith(REFERENCE.PREFIX) ? raw : `${REFERENCE.PREFIX}${raw}`;

    if (!REFERENCE.PATTERN.test(reference)) {
      setError(MESSAGES.BAD_REFERENCE);
      return;
    }

    setError(null);
    router.push(ROUTES.keys(reference));
  }

  return (
    <form onSubmit={submit} noValidate className="panel mx-auto max-w-md">
      <Input
        label="Booking reference"
        placeholder="VH-7K2M9QXD"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={value}
        error={error ?? undefined}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" full className="mt-4">Open my key</Button>
      <p className="mt-4 text-center text-[13px] text-muted">
        The reference is on your confirmation screen. It looks like VH- followed by eight characters.
      </p>
    </form>
  );
}
