"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A full-height sheet over the app, used by the exercise browser and the
 * plant-creation flow — the web stand-in for the original's presented sheets.
 *
 * Escape closes it and focus moves inside on open, because a sheet you can
 * only leave with the mouse is a trap for anyone using a keyboard. The
 * backdrop closes it too, matching the swipe-down it replaces.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8 bg-[rgb(62_37_19/0.55)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={
          "w-full sm:max-w-[480px] h-dvh sm:h-[min(760px,100dvh-4rem)] flex flex-col outline-none " +
          "bg-[var(--surface-screen)] border-[4px] border-[var(--brown-900)] sm:chunky-lg"
        }
      >
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[var(--brown-700)] border-b-2 border-[var(--brown-900)]">
          <span className="font-pixel font-bold uppercase text-[10px] tracking-[0.12em] text-[var(--cream-50)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-pixel font-bold text-[12px] text-[var(--cream-50)] px-2 py-1 cursor-pointer hover:text-[var(--butter-400)]"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
