export function ErrorNote({ message }: { message: string }): React.JSX.Element {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl bg-rose/10 px-3.5 py-3 text-[13.5px] font-medium text-rose"
    >
      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-current" />
      <span>{message}</span>
    </div>
  );
}
