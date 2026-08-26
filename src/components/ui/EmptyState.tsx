import type { ReactNode } from "react";
import { MASCOT_PALETTE, MASCOT_ROWS, PixelGrid } from "./PixelGrid";

/** Friendly placeholder with the pixel dog-in-a-beret mascot. */
export function EmptyState({
  title = "nothing logged yet!",
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-3 py-8 px-6 text-center">
      <PixelGrid rows={MASCOT_ROWS} palette={MASCOT_PALETTE} cell={7} />
      <p className="font-display text-[14px] leading-[1.5] text-[var(--text-primary)]">{title}</p>
      {subtitle && (
        <p className="font-body text-[14px] text-[var(--text-secondary)] max-w-[240px]">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
