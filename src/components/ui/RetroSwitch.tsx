"use client";

import { cn } from "@/lib/cn";

/** Pill switch used by settings rows. */
export function RetroSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-[46px] h-[26px] border-[3px] border-[var(--border-primary)] cursor-pointer shrink-0",
        "transition-colors duration-[120ms]",
        checked ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-inset)]",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] w-[16px] h-[16px] bg-[var(--cream-50)] border-2 border-[var(--border-primary)]",
          "transition-[left] duration-[120ms]",
        )}
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}
