import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/format";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label className="label" htmlFor={inputId}>{label}</label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn("field", error && "border-rose focus:border-rose focus:ring-rose/15", className)}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="mt-1.5 text-[12.5px] font-medium text-rose">{error}</p>}
    </div>
  );
});
