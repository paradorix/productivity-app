/** Butter track, rust fill, 10px tall, square 2px border. */
export function ChunkyProgressBar({ progress, label }: { progress: number; label?: string }) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-[10px] w-full bg-[var(--surface-inset)] border-2 border-[var(--brown-900)]"
    >
      <div
        className="h-full bg-[var(--accent-primary)] transition-[width] duration-[120ms]"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
