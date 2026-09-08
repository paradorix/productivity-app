/** Joins class names, dropping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Drops a trailing slash so route comparisons hold on any host.
 *
 * Served from Next's own dev server a route is "/journal"; a static file host
 * may well hand back "/journal/" for the same page. Comparing the raw string
 * would leave the tab bar with nothing highlighted, which looks like a bug in
 * the app rather than a difference in the host. "/" is left alone.
 */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}
