"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "accent";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[var(--fill-primary)] text-[var(--text-on-fill)] border-[var(--border-primary-strong)]",
  secondary: "bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--border-primary)]",
  accent: "bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--border-primary-strong)]",
};

const SIZES: Record<Size, string> = {
  sm: "px-[14px] py-[7px] text-[11px]",
  md: "px-[20px] py-[11px] text-[13px]",
  lg: "px-[26px] py-[15px] text-[15px]",
};

/**
 * Chunky square button with an uppercase Silkscreen label.
 *
 * The press state is the whole character of this design system: the inset
 * bevel inverts, the hard offset shadow collapses to nothing, and the button
 * translates down-right by exactly the shadow offset — so it reads as a
 * physical key being pushed flush into the case. In SwiftUI this needed a
 * stack of overlays; in CSS it is two box-shadows and a transform.
 */
export function RetroButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "font-pixel font-bold uppercase tracking-[0.08em] border-[3px] cursor-pointer select-none",
        "bevel chunky-sm transition-[box-shadow,transform] duration-[60ms]",
        "active:bevel-pressed active:chunky-none active:translate-x-[2px] active:translate-y-[2px]",
        "disabled:cursor-not-allowed disabled:bg-[var(--surface-inset)] disabled:text-[var(--text-muted)]",
        "disabled:border-[var(--border-subtle)] disabled:chunky-none disabled:translate-x-0 disabled:translate-y-0",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}
