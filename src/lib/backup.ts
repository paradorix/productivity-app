import { z } from "zod";
import { db } from "./db";
import {
  GROWTH_STAGES,
  MEAL_TYPES,
  MOODS,
  PLANT_TYPES,
  POT_COLORS,
  type FoodLogEntry,
  type GardenPlant,
  type JournalEntry,
  type PlannedExercise,
  type Profile,
  type WorkoutSession,
} from "./types";

/**
 * Export / import — the only protection against a cleared browser cache
 * wiping months of entries. Deliberately built in phase 1, before there is
 * any real data, so the file format is settled before anyone depends on it.
 *
 * Photos are Blobs in IndexedDB but JSON can't hold binary, so they are
 * base64'd on the way out and rebuilt on the way in. That inflates them by
 * ~33%, which is the accepted cost of a backup that is a single portable
 * file the user can email to themselves.
 */

export const BACKUP_FORMAT = "productivity-app-backup";
export const BACKUP_VERSION = 1;

const photoSchema = z
  .object({ mime: z.string(), data: z.string() })
  .nullable();

const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected a YYYY-MM-DD day");

const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int().positive(),
  exportedAt: z.string(),
  data: z.object({
    profile: z
      .object({
        id: z.literal("me"),
        displayName: z.string(),
        onboardedAt: z.string(),
        lastBackupAt: z.string().nullable(),
      })
      .nullable(),
    journal: z.array(
      z.object({
        id: z.string(),
        day: dayKey,
        text: z.string(),
        mood: z.enum(MOODS).nullable(),
        photo: photoSchema,
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    ),
    garden: z.array(
      z.object({
        id: z.string(),
        plantType: z.enum(PLANT_TYPES),
        name: z.string(),
        growthStage: z.enum(GROWTH_STAGES),
        potColor: z.enum(POT_COLORS),
        hasHat: z.boolean(),
        hasRibbon: z.boolean(),
        createdAt: z.string(),
      }),
    ),
    workouts: z.array(
      z.object({
        id: z.string(),
        day: dayKey,
        weekday: z.number().int().min(1).max(7).nullable(),
        isFreeform: z.boolean(),
        exercises: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            sets: z.number(),
            reps: z.string(),
            weight: z.string(),
            target: z.string().nullable(),
            sortOrder: z.number(),
          }),
        ),
      }),
    ),
    plan: z.array(
      z.object({
        id: z.string(),
        weekday: z.number().int().min(1).max(7),
        name: z.string(),
        exerciseId: z.string(),
        bodyPart: z.string(),
        sets: z.number(),
        reps: z.string(),
        sortOrder: z.number(),
      }),
    ),
    food: z.array(
      z.object({
        id: z.string(),
        day: dayKey,
        mealType: z.enum(MEAL_TYPES),
        text: z.string(),
        photo: photoSchema,
      }),
    ),
  }),
});

export type BackupFile = z.infer<typeof backupSchema>;
type SerializedPhoto = { mime: string; data: string } | null;

async function blobToPhoto(blob: Blob | null): Promise<SerializedPhoto> {
  if (!blob) return null;
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  // Chunked so a large photo doesn't blow the argument limit on String.fromCharCode.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return { mime: blob.type || "application/octet-stream", data: btoa(binary) };
}

function photoToBlob(photo: SerializedPhoto): Blob | null {
  if (!photo) return null;
  const binary = atob(photo.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: photo.mime });
}

/** Builds the backup object. Everything is read inside one transaction so a
 *  concurrent edit can't produce a half-consistent file. */
export async function buildBackup(): Promise<BackupFile> {
  return db.transaction("r", [db.journal, db.garden, db.workouts, db.plan, db.food, db.profile], async () => {
    const [profile, journal, garden, workouts, plan, food] = await Promise.all([
      db.profile.get("me"),
      db.journal.toArray(),
      db.garden.toArray(),
      db.workouts.toArray(),
      db.plan.toArray(),
      db.food.toArray(),
    ]);

    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        profile: profile ?? null,
        journal: await Promise.all(
          journal.map(async (e) => ({ ...e, photo: await blobToPhoto(e.photo) })),
        ),
        garden,
        workouts,
        plan,
        food: await Promise.all(
          food.map(async (e) => ({ ...e, photo: await blobToPhoto(e.photo) })),
        ),
      },
    } as BackupFile;
  });
}

/** Triggers a download of the backup and records that a backup happened. */
export async function downloadBackup(): Promise<void> {
  const backup = await buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `productivity-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const profile = await db.profile.get("me");
  if (profile) await db.profile.update("me", { lastBackupAt: backup.exportedAt });
}

export class BackupError extends Error {}

/**
 * Validates and restores a backup, replacing everything currently stored.
 *
 * Validation happens *before* any write: an import that half-applies a
 * malformed file and leaves the user with neither their old data nor their
 * new data is the single worst thing this app could do.
 */
export async function restoreBackup(fileText: string): Promise<{ counts: Record<string, number> }> {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(fileText);
  } catch {
    throw new BackupError("That file isn't valid JSON — it may not be a backup file.");
  }

  const parsed = backupSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new BackupError(
      `That doesn't look like a backup from this app (${first.path.join(".") || "file"}: ${first.message}).`,
    );
  }
  if (parsed.data.version > BACKUP_VERSION) {
    throw new BackupError(
      "That backup was made by a newer version of this app. Update the page and try again.",
    );
  }

  const { data } = parsed.data;
  const journal: JournalEntry[] = data.journal.map((e) => ({ ...e, photo: photoToBlob(e.photo) }));
  const food: FoodLogEntry[] = data.food.map((e) => ({ ...e, photo: photoToBlob(e.photo) }));
  const garden = data.garden as GardenPlant[];
  const workouts = data.workouts as WorkoutSession[];
  const plan = data.plan as PlannedExercise[];
  const profile = data.profile as Profile | null;

  await db.transaction("rw", [db.journal, db.garden, db.workouts, db.plan, db.food, db.profile], async () => {
    await Promise.all([
      db.journal.clear(),
      db.garden.clear(),
      db.workouts.clear(),
      db.plan.clear(),
      db.food.clear(),
      db.profile.clear(),
    ]);
    if (profile) await db.profile.put(profile);
    await Promise.all([
      db.journal.bulkPut(journal),
      db.garden.bulkPut(garden),
      db.workouts.bulkPut(workouts),
      db.plan.bulkPut(plan),
      db.food.bulkPut(food),
    ]);
  });

  return {
    counts: {
      journal: journal.length,
      garden: garden.length,
      workouts: workouts.length,
      plan: plan.length,
      food: food.length,
    },
  };
}
