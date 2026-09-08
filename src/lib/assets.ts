/**
 * Prefixes a `public/` asset with the deployment's base path.
 *
 * Next applies the base path to `Link` hrefs, script and stylesheet tags and
 * the favicon, but there are two places it cannot reach:
 *
 * - `next/image` with `unoptimized`, which passes the src through verbatim
 *   because it never goes near the image optimiser;
 * - `url(...)` inside CSS, which the bundler emits as written.
 *
 * Both are silent failures. The page still renders, so a missed prefix shows
 * up as sprites that don't appear and pixel fonts that quietly fall back to
 * the system stack — the site looks broken rather than erroring. Anything in
 * `public/` therefore goes through here.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
