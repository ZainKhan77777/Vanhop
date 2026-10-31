"use client";

interface Props { value: string; onChange: (value: string) => void; placeholder: string }

export function SearchInput({ value, onChange, placeholder }: Props): React.JSX.Element {
  return (
    <div className="relative min-w-0 flex-1 basis-64">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field pl-10"
      />
    </div>
  );
}
