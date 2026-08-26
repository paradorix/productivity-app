/**
 * Renders a small ASCII pixel-art map (one character per cell) as solid
 * squares. Both the empty-state mascot and the journal mood faces were
 * hand-drawn this way in the original design source: a string array plus a
 * character-to-color palette.
 */
export function PixelGrid({
  rows,
  palette,
  cell = 4,
  label,
}: {
  rows: string[];
  palette: Record<string, string>;
  cell?: number;
  label?: string;
}) {
  return (
    <div
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="inline-grid"
      style={{ gridTemplateRows: `repeat(${rows.length}, ${cell}px)` }}
    >
      {rows.map((row, y) => (
        <div key={y} className="flex">
          {[...row].map((ch, x) => (
            <div
              key={x}
              style={{
                width: cell,
                height: cell,
                background: palette[ch] ?? "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** The dog-in-a-beret mascot from the original EmptyState. */
export const MASCOT_ROWS = [
  "....HHHH....",
  "...HHHHHH...",
  "..BBBBBBBB..",
  ".BYYYYYYYYB.",
  "BBYYYYYYYYBB",
  "BYYKYYYYKYYB",
  "BYYYYYYYYYYB",
  "BYYYYWWYYYYB",
  ".BYYYWWYYYB.",
  "..BBYYYYBB..",
  "....BBBB....",
];

export const MASCOT_PALETTE: Record<string, string> = {
  H: "var(--brown-700)",
  B: "var(--brown-900)",
  Y: "var(--butter-600)",
  K: "var(--brown-900)",
  W: "var(--cream-50)",
};
