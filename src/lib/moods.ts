import type { Mood } from "./types";

/**
 * The five mood faces, as pixel maps for `PixelGrid`.
 *
 * 'K' is the outline, 'F' the fill (the mood's own colour), '.' transparent.
 * These are the original hand-drawn grids, unchanged — the difference between
 * "good" and "great" is a single row of pixels, so they are copied rather than
 * regenerated.
 */
export const MOOD_FACES: Record<Mood, string[]> = {
  great: [".KKKKK.", "KFFFFFK", "KFKFKFK", "KKFFFKK", "KFKKKFK", "KFFFFFK", ".KKKKK."],
  good: [".KKKKK.", "KFFFFFK", "KFKFKFK", "KFFFFFK", "KFKKKFK", "KFFFFFK", ".KKKKK."],
  okay: [".KKKKK.", "KFFFFFK", "KFKFKFK", "KFFFFFK", "KFFKFFK", "KFFFFFK", ".KKKKK."],
  low: [".KKKKK.", "KFFFFFK", "KFKFKFK", "KFFFFFK", "KFKKKFK", "KKFFFKK", ".KKKKK."],
  rough: [".KKKKK.", "KFFFFFK", "KFKFKFK", "KFFFFFK", "KFFKFFK", "KKFFFKK", ".KKKKK."],
};

export const MOOD_COLORS: Record<Mood, string> = {
  great: "var(--butter-600)",
  good: "var(--butter-400)",
  okay: "var(--sky-300)",
  low: "var(--brown-300)",
  rough: "var(--rust-400)",
};

export function moodPalette(mood: Mood): Record<string, string> {
  return { K: "var(--brown-900)", F: MOOD_COLORS[mood] };
}
