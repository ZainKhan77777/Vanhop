import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/format";

type Variant = "solid" | "light" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  solid: "bg-navy-900 text-white hover:shadow-md2",
  light: "bg-white text-navy-900 hover:shadow-md2",
  ghost: "border border-line bg-transparent text-navy-900 hover:bg-surface-2",
  danger: "bg-rose text-white hover:shadow-md2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", full = false, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14.5px] font-bold",
        "transition-all duration-300 ease-soft active:translate-y-px",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
        VARIANTS[variant],
        full && "w-full",
        className,
      )}
      {...props}
    />
  );
});
