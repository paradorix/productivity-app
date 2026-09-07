import { toDayKey, type Weekday } from "./types";

/**
 * Everything date-shaped, in one place.
 *
 * The whole app stores calendar days as `YYYY-MM-DD` strings (see the note in
 * `types.ts`). That makes comparison and equality trivial — `a === b`, `a < b`
 * — but it means anything needing a real `Date` (month grids, weekday names)
 * has to convert here, and *only* here.
 *
 * `parseDayKey` builds the date with the local-time constructor rather than
 * `new Date("2026-09-07")`, which the spec parses as UTC midnight and would
 * render as the previous day for anyone west of Greenwich.
 */

export function parseDayKey(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Sat, Sep 7" — the format the original used for entry headers. */
export function formatDay(day: string): string {
  return parseDayKey(day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "Saturday, Sep 7" — the longer form used on the home screen. */
export function formatDayLong(day: string): string {
  return parseDayKey(day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(day: string): string {
  return parseDayKey(day).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function isToday(day: string): boolean {
  return day === toDayKey();
}

/** Future days are locked in the journal — you can't write tomorrow's entry. */
export function isFuture(day: string): boolean {
  return day > toDayKey();
}

/** Shifts a `YYYY-MM-DD` by whole months, clamping into the target month. */
export function shiftMonth(day: string, delta: number): string {
  const date = parseDayKey(day);
  const targetMonth = date.getMonth() + delta;
  const shifted = new Date(date.getFullYear(), targetMonth, 1);
  const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
  shifted.setDate(Math.min(date.getDate(), lastDay));
  return toDayKey(shifted);
}

/**
 * A Sunday-first month grid: leading `null`s pad the first row so day 1 lands
 * under its real weekday column, then one entry per day of the month.
 */
export function monthGrid(day: string): Array<string | null> {
  const date = parseDayKey(day);
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const cells: Array<string | null> = Array(firstOfMonth.getDay()).fill(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(toDayKey(new Date(date.getFullYear(), date.getMonth(), d)));
  }
  return cells;
}

export const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/**
 * Monday-first, matching the gym plan's week. Deliberately independent of
 * `Date.getDay()`, which is Sunday-first — the plan reads Mon…Sun and the
 * stored `weekday` values have to mean the same thing everywhere.
 */
export const WEEKDAYS: Array<{ value: Weekday; short: string; full: string }> = [
  { value: 1, short: "MO", full: "Monday" },
  { value: 2, short: "TU", full: "Tuesday" },
  { value: 3, short: "WE", full: "Wednesday" },
  { value: 4, short: "TH", full: "Thursday" },
  { value: 5, short: "FR", full: "Friday" },
  { value: 6, short: "SA", full: "Saturday" },
  { value: 7, short: "SU", full: "Sunday" },
];

export function weekdayName(value: Weekday | null): string {
  return WEEKDAYS.find((d) => d.value === value)?.full ?? "";
}

/** Today on the Monday-first scale: JS Sunday(0) becomes 7, Monday(1) becomes 1. */
export function todayWeekday(): Weekday {
  return (((new Date().getDay() + 6) % 7) + 1) as Weekday;
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  return "good evening";
}
