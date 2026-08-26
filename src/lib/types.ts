/**
 * Data model, ported from the SwiftData `@Model` classes in ~/Vianne/Vianne/Models.
 *
 * Two deliberate departures from the Swift original:
 *
 * 1. Calendar days are `YYYY-MM-DD` strings, not midnight-normalized `Date`s.
 *    On one phone, midnight-local was unambiguous. On the web the same user
 *    can open the site from a different timezone, and a stored instant would
 *    silently slide to the previous or next day. A date string can't drift.
 *
 * 2. Workout sessions own their exercises as a nested array rather than a
 *    relationship. SwiftData needed the inverse link; IndexedDB stores the
 *    whole object graph in one record, so the join disappears.
 */

export const MOODS = ["great", "good", "okay", "low", "rough"] as const;
export type Mood = (typeof MOODS)[number];

export const PLANT_TYPES = ["hero", "flower", "berry", "mushroom"] as const;
export type PlantType = (typeof PLANT_TYPES)[number];

export const GROWTH_STAGES = ["seed", "sprout", "bloom", "flourishing", "mature"] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];

export const POT_COLORS = ["terracotta", "cream", "clay"] as const;
export type PotColor = (typeof POT_COLORS)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/** 1 = Monday … 7 = Sunday, matching the Swift `Weekday` raw values. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface JournalEntry {
  id: string;
  /** Local calendar day, `YYYY-MM-DD`. One entry per day. */
  day: string;
  text: string;
  mood: Mood | null;
  photo: Blob | null;
  createdAt: string;
  updatedAt: string;
}

export interface GardenPlant {
  id: string;
  plantType: PlantType;
  name: string;
  growthStage: GrowthStage;
  potColor: PotColor;
  hasHat: boolean;
  hasRibbon: boolean;
  createdAt: string;
}

export interface LoggedExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  target: string | null;
  sortOrder: number;
}

export interface WorkoutSession {
  id: string;
  day: string;
  weekday: Weekday | null;
  isFreeform: boolean;
  exercises: LoggedExercise[];
}

export interface PlannedExercise {
  id: string;
  weekday: Weekday;
  name: string;
  exerciseId: string;
  bodyPart: string;
  sets: number;
  reps: string;
  sortOrder: number;
}

export interface FoodLogEntry {
  id: string;
  day: string;
  mealType: MealType;
  text: string;
  photo: Blob | null;
}

export interface Profile {
  /** Always the literal string "me" — there is exactly one local user. */
  id: "me";
  displayName: string;
  onboardedAt: string;
  /** ISO timestamp of the last successful export, or null if never. */
  lastBackupAt: string | null;
}

/** Local calendar day as `YYYY-MM-DD`, using the browser's own timezone. */
export function toDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function newId(): string {
  return crypto.randomUUID();
}
