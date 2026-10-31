"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Only the contact half of the booking — dates come from the calendar above.
const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(6, "Enter a contact number").max(30),
});

export type ContactValues = z.infer<typeof contactSchema>;

interface Props {
  disabled: boolean;
  pending: boolean;
  onSubmit: (values: ContactValues) => void;
}

export function BookingForm({ disabled, pending, onSubmit }: Props): React.JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input label="Full name" autoComplete="name" placeholder="Nino Beridze"
        error={errors.name?.message} {...register("name")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com"
          error={errors.email?.message} {...register("email")} />
        <Input label="Phone" type="tel" autoComplete="tel" placeholder="+995 5xx xx xx xx"
          error={errors.phone?.message} {...register("phone")} />
      </div>
      <Button type="submit" full disabled={disabled || pending}>
        {pending ? "Confirming…" : "Confirm reservation"}
      </Button>
    </form>
  );
}
