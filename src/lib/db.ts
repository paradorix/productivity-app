import Dexie, { type EntityTable } from "dexie";
import type {
  FoodLogEntry,
  GardenPlant,
  JournalEntry,
  PlannedExercise,
  Profile,
  WorkoutSession,
} from "./types";

/**
 * The whole database. It lives in the visitor's own browser (IndexedDB) and
 * is never transmitted anywhere — there is no server, no account, and no
 * operator who can read it.
 *
 * IndexedDB rather than localStorage specifically because journal and food
 * entries carry photos: localStorage caps out around 5 MB and stores strings
 * only, so photos would have to be base64'd into it and would blow the cap
 * within a handful of entries. IndexedDB stores Blobs directly.
 */
class AppDatabase extends Dexie {
  journal!: EntityTable<JournalEntry, "id">;
  garden!: EntityTable<GardenPlant, "id">;
  workouts!: EntityTable<WorkoutSession, "id">;
  plan!: EntityTable<PlannedExercise, "id">;
  food!: EntityTable<FoodLogEntry, "id">;
  profile!: EntityTable<Profile, "id">;

  constructor() {
    super("productivity-app");
    // Only indexed fields are listed; everything else is stored but unindexed.
    this.version(1).stores({
      journal: "id, day",
      garden: "id",
      workouts: "id, day",
      plan: "id, weekday",
      food: "id, day, mealType",
      profile: "id",
    });
  }
}

export const db = new AppDatabase();

/** Every table, in a fixed order — used by export, import and wipe. */
export const TABLES = ["profile", "journal", "garden", "workouts", "plan", "food"] as const;

export async function getProfile(): Promise<Profile | undefined> {
  return db.profile.get("me");
}

/** Deletes absolutely everything. Used by import (replace) and by Settings. */
export async function wipeAll(): Promise<void> {
  await db.transaction("rw", [db.journal, db.garden, db.workouts, db.plan, db.food, db.profile], async () => {
    await Promise.all(TABLES.map((t) => db.table(t).clear()));
  });
}
