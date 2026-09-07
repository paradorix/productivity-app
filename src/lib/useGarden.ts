"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { activeDayCount, collectLoggedDays, refreshGrowth } from "./garden";
import type { GardenPlant } from "./types";

/**
 * The plant, its day count, and the growth check — in one hook so the garden
 * and the home screen can't drift apart.
 *
 * The stage advance runs from an effect rather than during render: it is a
 * write, and a render that writes to the database is a render that can loop.
 * It settles after at most one extra pass — advancing the stage re-runs the
 * live query, and the second run finds nothing left to advance.
 */
export function useGardenStatus(): {
  plant: GardenPlant | null;
  dayCount: number;
  loading: boolean;
} {
  // An array, not `.first()`: undefined then means "still loading" and an
  // empty array means "nothing planted", which are different screens.
  const plants = useLiveQuery(() => db.garden.limit(1).toArray(), [], undefined);
  const loggedDays = useLiveQuery(collectLoggedDays, [], []);
  const plant = plants?.[0] ?? null;

  useEffect(() => {
    if (plant) void refreshGrowth(plant, loggedDays);
  }, [plant, loggedDays]);

  return {
    plant,
    dayCount: plant ? activeDayCount(plant, loggedDays) : 0,
    loading: plants === undefined,
  };
}
