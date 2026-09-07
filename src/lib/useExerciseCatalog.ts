"use client";

import { useEffect, useState } from "react";
import { loadExercises, type ExerciseDefinition } from "./exercises";

/**
 * Loads the exercise reference list for whichever screen needs it.
 *
 * A failed load is reported, not swallowed — but it is never fatal: every gym
 * screen still lets you type an exercise name by hand, so the catalog going
 * missing costs you autocomplete, not the ability to log a workout.
 */
export function useExerciseCatalog(): {
  exercises: ExerciseDefinition[] | null;
  failed: boolean;
} {
  const [exercises, setExercises] = useState<ExerciseDefinition[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadExercises()
      .then((list) => {
        if (!cancelled) setExercises(list);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { exercises, failed };
}
