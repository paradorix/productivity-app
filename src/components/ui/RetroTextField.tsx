"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Bordered, inset-bevel single-line input. */
export function RetroTextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full font-body text-[15px] text-[var(--text-primary)] p-[14px]",
        "bg-[var(--surface-card)] border-2 border-[var(--brown-900)] bevel",
        "placeholder:text-[var(--text-muted)]",
        className,
      )}
    />
  );
}

/** Bordered, inset-bevel multi-line input, used by the journal editor. */
export function RetroTextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-[110px] font-body text-[14px] text-[var(--text-primary)] p-[10px] resize-y",
        "bg-[var(--surface-screen)] border-2 border-[var(--border-subtle)] bevel",
        "placeholder:text-[var(--text-muted)]",
        className,
      )}
    />
  );
}
