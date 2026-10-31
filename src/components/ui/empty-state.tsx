export function EmptyState({ title, note }: { title: string; note: string }): React.JSX.Element {
  return (
    <div className="px-6 py-14 text-center">
      <h4 className="text-base font-semibold text-navy-900">{title}</h4>
      <p className="mt-1.5 text-sm text-muted">{note}</p>
    </div>
  );
}
