/**
 * The exercise reference list — read-only lookup data, not user data, so it
 * lives in `public/data/exercises.json` rather than IndexedDB. See
 * `scripts/build-exercises.mjs` for where it comes from and why it's trimmed.
 *
 * It is fetched on demand and cached in memory for the session: 125 KB is
 * cheap once, and wasteful on every visit to a screen that may never open the
 * browser. Nothing here is required to log a workout — the catalog is a
 * convenience, and a user who types an exercise it has never heard of gets to
 * log it exactly the same way.
 */

export interface ExerciseDefinition {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
}

let cache: ExerciseDefinition[] | null = null;
let inFlight: Promise<ExerciseDefinition[]> | null = null;

export async function loadExercises(): Promise<ExerciseDefinition[]> {
  if (cache) return cache;
  // Concurrent callers (the browser sheet and the name field) share one fetch.
  inFlight ??= fetch("/data/exercises.json")
    .then((response) => {
      if (!response.ok) throw new Error(`exercise list responded ${response.status}`);
      return response.json() as Promise<ExerciseDefinition[]>;
    })
    .then((list) => {
      cache = list;
      return list;
    })
    .catch((error) => {
      inFlight = null;
      throw error;
    });
  return inFlight;
}

/**
 * The five filter chips. The dataset's own body parts are finer-grained than
 * the design's row of five, so shoulders fold in with arms and cardio/neck
 * with core — every exercise stays reachable from some chip, which matters
 * more than the labels being anatomically tidy.
 */
export const FILTER_CHIPS: Array<{ label: string; bodyParts: string[] }> = [
  { label: "Chest", bodyParts: ["chest"] },
  { label: "Back", bodyParts: ["back"] },
  { label: "Legs", bodyParts: ["upper legs", "lower legs"] },
  { label: "Arms", bodyParts: ["upper arms", "lower arms", "shoulders"] },
  { label: "Core", bodyParts: ["waist", "cardio", "neck"] },
];

export function bodyPartsForChips(labels: Set<string>): Set<string> | null {
  if (labels.size === 0) return null;
  const parts = new Set<string>();
  for (const chip of FILTER_CHIPS) {
    if (labels.has(chip.label)) chip.bodyParts.forEach((part) => parts.add(part));
  }
  return parts;
}

/** Chip filter plus name search, uncapped — the full browse list. */
export function browseExercises(
  list: ExerciseDefinition[],
  bodyParts: Set<string> | null,
  query: string,
): ExerciseDefinition[] {
  const trimmed = query.trim().toLowerCase();
  return list.filter((exercise) => {
    const matchesPart = !bodyParts || bodyParts.has(exercise.bodyPart);
    const matchesQuery = !trimmed || exercise.name.toLowerCase().includes(trimmed);
    return matchesPart && matchesQuery;
  });
}

/** Short autocomplete list for free typing. Empty query offers nothing. */
export function suggestExercises(
  list: ExerciseDefinition[],
  query: string,
  limit = 5,
): ExerciseDefinition[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  const matches: ExerciseDefinition[] = [];
  for (const exercise of list) {
    if (exercise.name.toLowerCase().includes(trimmed)) {
      matches.push(exercise);
      if (matches.length === limit) break;
    }
  }
  return matches;
}
