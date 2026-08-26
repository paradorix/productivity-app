"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Generic selectable tile. Selection is expressed physically — the bevel
 * inverts and the tile shifts 1px down-right, as if held down — never by a
 * colour change alone. That matters for accessibility as much as style:
 * the state survives being viewed without colour perception.
 */
export function RetroChip({
  children,
  selected,
  accentBorderWhenSelected = false,
  onClick,
  className,
  label,
}: {
  children: ReactNode;
  selected: boolean;
  accentBorderWhenSelected?: boolean;
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  const accentBorder = selected && accentBorderWhenSelected;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        "cursor-pointer select-none transition-[box-shadow,transform] duration-[60ms]",
        selected
          ? "bg-[var(--butter-400)] bevel-pressed translate-x-[1px] translate-y-[1px]"
          : "bg-[var(--surface-card)] bevel",
        accentBorder
          ? "border-[3px] border-[var(--accent-primary)]"
          : "border-2 border-[var(--brown-900)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
