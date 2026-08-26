import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Cream container with a square 3px border and a hard offset shadow. An
 * optional uppercase title strip turns it into a little window, which is how
 * the design signals "this is a panel" rather than "this is a box".
 */
export function RetroCard({
  children,
  title,
  accent = false,
  padding = 20,
  className,
  style,
}: {
  children: ReactNode;
  title?: string;
  accent?: boolean;
  padding?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "bg-[var(--surface-card)] border-[3px] chunky-sm",
        accent ? "border-[var(--accent-primary)]" : "border-[var(--border-primary)]",
        className,
      )}
    >
      {title && (
        <div
          className={cn(
            "font-pixel font-bold uppercase text-[10px] tracking-[0.12em] text-[var(--cream-50)]",
            "px-2 py-1 border-b-2 border-[var(--brown-900)]",
            accent ? "bg-[var(--accent-primary)]" : "bg-[var(--brown-700)]",
          )}
        >
          {title}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
    </div>
  );
}
