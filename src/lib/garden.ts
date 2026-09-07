import { db } from "./db";
import { toDayKey, type GardenPlant, type GrowthStage, type PlantType, type PotColor } from "./types";

/**
 * The garden's growth rules.
 *
 * Two properties this file exists to guarantee, both ported unchanged from the
 * iOS original:
 *
 * 1. **Growth never regresses.** `refreshGrowth` compares the stage implied by
 *    your logging against the stage already stored and only ever moves it up.
 *    That makes "a plant can't be taken away from you" a property of one
 *    function instead of a rule every caller has to remember. There is no wilt
 *    and no decay — skipping a day is just skipping a day.
 *
 * 2. **Home and Garden can't disagree.** Both screens read the day count from
 *    here, so the number under the plant and the number on the home card are
 *    the same number by construction.
 *
 * What counts as a logged day: any day, on or after the day the plant was
 * planted, with a journal entry, a food entry, or a finished workout. Gym is
 * included here and was not in the iOS version, which predates the gym screen
 * having anything to count.
 */

export const PLANT_DISPLAY_NAMES: Record<PlantType, string> = {
  hero: "Sunleaf",
  flower: "Petal Bud",
  berry: "Berrybush",
  mushroom: "Toadstool",
};

export const PLANT_TAGLINES: Record<PlantType, string> = {
  hero: "the original companion",
  flower: "blooms as it grows",
  berry: "fruits after a good streak",
  mushroom: "grows quietly in the shade",
};

export const POT_SPRITES: Record<PotColor, string> = {
  terracotta: "garden-pot-terracotta",
  cream: "garden-pot-cream",
  clay: "garden-pot-clay",
};

export const POT_SWATCHES: Record<PotColor, string> = {
  terracotta: "#a85c4b",
  cream: "#f5d877",
  clay: "#8b5a38",
};

/** Distinct logged days needed to reach each stage. */
export const GROWTH_THRESHOLDS: Record<Exclude<GrowthStage, "seed">, number> = {
  sprout: 3,
  bloom: 7,
  flourishing: 14,
  mature: 30,
};

const STAGE_ORDER: GrowthStage[] = ["seed", "sprout", "bloom", "flourishing", "mature"];

export function stageRank(stage: GrowthStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function stageForDayCount(count: number): GrowthStage {
  if (count >= GROWTH_THRESHOLDS.mature) return "mature";
  if (count >= GROWTH_THRESHOLDS.flourishing) return "flourishing";
  if (count >= GROWTH_THRESHOLDS.bloom) return "bloom";
  if (count >= GROWTH_THRESHOLDS.sprout) return "sprout";
  return "seed";
}

/** Days still to go before the next stage, or null once fully grown. */
export function daysToNextStage(count: number): { stage: GrowthStage; remaining: number } | null {
  const stages = ["sprout", "bloom", "flourishing", "mature"] as const;
  for (const stage of stages) {
    if (count < GROWTH_THRESHOLDS[stage]) {
      return { stage, remaining: GROWTH_THRESHOLDS[stage] - count };
    }
  }
  return null;
}

/**
 * Sprite name for a species at a stage. Seed and sprout deliberately share one
 * generic sprite across all four species — no species-specific early-stage art
 * was ever drawn, so every plant looks the same until it blooms.
 */
export function plantSprite(type: PlantType, stage: GrowthStage): string {
  if (stage === "seed" || stage === "sprout") return "garden-hero-sprout";
  const suffix = stage === "flourishing" ? "flourish" : stage;
  return `garden-${type}-${suffix}`;
}

/** The stage-agnostic "freshly potted" pose, used only by the creation preview. */
export function pottedSprite(type: PlantType): string {
  return `garden-${type}-potted`;
}

/** Distinct days with any activity, on or after the day the plant was planted. */
export function activeDayCount(plant: GardenPlant, loggedDays: Iterable<string>): number {
  const plantedOn = toDayKey(new Date(plant.createdAt));
  const days = new Set<string>();
  for (const day of loggedDays) {
    if (day >= plantedOn) days.add(day);
  }
  return days.size;
}

/** Every day the user logged anything at all, across all three sources. */
export async function collectLoggedDays(): Promise<string[]> {
  const [journal, food, workouts] = await Promise.all([
    db.journal.toArray(),
    db.food.toArray(),
    db.workouts.toArray(),
  ]);
  return [...journal.map((e) => e.day), ...food.map((e) => e.day), ...workouts.map((w) => w.day)];
}

/**
 * Advances the stored stage if activity has earned it. Returns the day count
 * either way. Never lowers the stage — see the note at the top of this file.
 */
export async function refreshGrowth(plant: GardenPlant, loggedDays: Iterable<string>): Promise<number> {
  const count = activeDayCount(plant, loggedDays);
  const implied = stageForDayCount(count);
  if (stageRank(implied) > stageRank(plant.growthStage)) {
    await db.garden.update(plant.id, { growthStage: implied });
  }
  return count;
}
