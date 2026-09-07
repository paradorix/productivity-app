"use client";

import { formatMonth, isFuture, isToday, monthGrid, parseDayKey, WEEKDAY_HEADERS } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { PixelGrid } from "@/components/ui/PixelGrid";

const LOCK_ROWS = [".KKK.", "K...K", "K...K", "KKKKK", "KKKKK", "KK.KK", "KKKKK"];
const LOCK_PALETTE = { K: "var(--text-muted)" };

/**
 * Month grid: a dot marks a day with an entry, the accent fill marks the
 * selected day, an accent border marks today.
 *
 * Future days are drawn with a padlock and aren't buttons at all. You can
 * backfill a day you missed, but you can't pre-write a day that hasn't
 * happened — which is also why "no entry yet" never reads as a failure here.
 */
export function JournalCalendar({
  viewMonth,
  selectedDay,
  entryDays,
  onSelect,
  onShiftMonth,
}: {
  viewMonth: string;
  selectedDay: string;
  entryDays: Set<string>;
  onSelect: (day: string) => void;
  onShiftMonth: (delta: number) => void;
}) {
  const cells = monthGrid(viewMonth);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <NavButton symbol="‹" label="Previous month" onClick={() => onShiftMonth(-1)} />
        <span className="font-pixel font-bold uppercase text-[11px] tracking-[0.12em] text-[var(--text-primary)]">
          {formatMonth(viewMonth)}
        </span>
        <NavButton symbol="›" label="Next month" onClick={() => onShiftMonth(1)} />
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_HEADERS.map((symbol, index) => (
          <span
            key={index}
            aria-hidden
            className="font-pixel text-[9px] tracking-[0.12em] text-[var(--text-muted)] text-center"
          >
            {symbol}
          </span>
        ))}

        {cells.map((day, index) => {
          if (!day) return <span key={`pad-${index}`} />;

          const selected = day === selectedDay;
          const today = isToday(day);
          const locked = isFuture(day);
          const hasEntry = entryDays.has(day);
          const dayNumber = parseDayKey(day).getDate();

          const content = (
            <>
              <span className="font-body text-[12px] leading-none">{dayNumber}</span>
              {locked ? (
                <PixelGrid rows={LOCK_ROWS} palette={LOCK_PALETTE} cell={2} />
              ) : (
                <span
                  aria-hidden
                  className="w-[4px] h-[4px]"
                  style={{
                    background: hasEntry
                      ? selected
                        ? "var(--cream-50)"
                        : "var(--accent-primary)"
                      : "transparent",
                  }}
                />
              )}
            </>
          );

          const shared = cn(
            "aspect-square w-full flex flex-col items-center justify-center gap-[3px] border-2",
            locked
              ? "bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-muted)]"
              : selected
                ? "bg-[var(--accent-primary)] border-[var(--brown-900)] text-[var(--text-on-accent)] bevel-pressed"
                : cn(
                    "bg-[var(--surface-card)] text-[var(--text-primary)] bevel",
                    today ? "border-[var(--accent-primary)]" : "border-[var(--brown-900)]",
                  ),
          );

          if (locked) {
            return (
              <div key={day} className={shared} aria-label={`${dayNumber}, not yet`}>
                {content}
              </div>
            );
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={selected}
              aria-label={`${dayNumber}${hasEntry ? ", has an entry" : ""}`}
              className={cn(shared, "cursor-pointer")}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  symbol,
  label,
  onClick,
}: {
  symbol: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-[26px] h-[26px] font-pixel text-[12px] text-[var(--text-primary)] bg-[var(--surface-card)] border-2 border-[var(--brown-900)] bevel cursor-pointer"
    >
      {symbol}
    </button>
  );
}
