import { MOOD_FACES, moodPalette } from "@/lib/moods";
import type { Mood } from "@/lib/types";
import { PixelGrid } from "./PixelGrid";

/** One of the five pixel mood faces, at a given cell size. */
export function MoodFace({ mood, cell = 3, label }: { mood: Mood; cell?: number; label?: string }) {
  return <PixelGrid rows={MOOD_FACES[mood]} palette={moodPalette(mood)} cell={cell} label={label} />;
}
