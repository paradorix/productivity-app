"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Geometric glyph stand-ins, carried over from the original design. */
export const TABS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/journal", label: "Journal", icon: "✎" },
  { href: "/garden", label: "Garden", icon: "♣" },
  { href: "/gym", label: "Gym", icon: "▲" },
  { href: "/food", label: "Food", icon: "●" },
] as const;

/**
 * Bottom nav styled as physical device buttons.
 *
 * On iOS this was a tab-state enum; on the web each tab is a real route, so
 * the back button, bookmarks and deep links all work for free — the one place
 * where the browser gives us something SwiftUI charged for.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex gap-1 p-[6px] bg-[var(--brown-700)] border-t-2 border-[var(--brown-900)]"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center gap-[3px] py-[7px] border-2 border-[var(--brown-900)]",
              "transition-[box-shadow,transform] duration-[60ms] no-underline",
              active
                ? "bg-[var(--butter-400)] text-[var(--brown-900)] bevel-pressed translate-x-[1px] translate-y-[1px]"
                : "bg-[var(--cream-100)] text-[var(--text-secondary)] bevel hover:bg-[var(--cream-50)]",
            )}
          >
            {/* U+FE0E plus font-variant-emoji keep these as flat monochrome
                glyphs. Without them, mobile platforms swap in their colour
                emoji font and the icons stop matching the palette. */}
            <span
              aria-hidden
              className="text-[16px] leading-none"
              style={{ fontVariantEmoji: "text" }}
            >
              {tab.icon}
              {"\uFE0E"}
            </span>
            <span className="font-pixel font-bold text-[9px] uppercase tracking-[0.08em]">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
