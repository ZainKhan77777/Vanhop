import { cn } from "@/lib/format";

/**
 * The VanHop mark. One definition so the header, the admin sidebar, the login
 * card and the favicon can't drift apart.
 */
export function VanMark({ className, size = 20 }: { className?: string; size?: number }): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      aria-hidden
    >
      <path d="M3 13h13l3 4h2v-4l-3-5H6L3 9z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}
