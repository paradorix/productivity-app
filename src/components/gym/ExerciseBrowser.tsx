"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { weekdayName } from "@/lib/dates";
import {
  bodyPartsForChips,
  browseExercises,
  FILTER_CHIPS,
  type ExerciseDefinition,
} from "@/lib/exercises";
import { useExerciseCatalog } from "@/lib/useExerciseCatalog";
import { newId, type Weekday } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroChip } from "@/components/ui/RetroChip";
import { RetroTextField } from "@/components/ui/RetroTextField";

/**
 * Search and filter the exercise list, tap one to add it to a day's plan.
 *
 * Only the first `PAGE` matches are rendered. The full list is 1,324 rows and
 * putting all of them in the DOM makes the sheet stutter on a phone for no
 * benefit — nobody scrolls a thousand exercises, they type two letters. The
 * count of what's hidden is shown rather than quietly truncating.
 */
const PAGE = 40;

export function ExerciseBrowser({
  weekday,
  existingCount,
  onClose,
}: {
  weekday: Weekday;
  existingCount: number;
  onClose: () => void;
}) {
  const { exercises, failed } = useExerciseCatalog();
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const matches = exercises ? browseExercises(exercises, bodyPartsForChips(chips), search) : [];
  const shown = matches.slice(0, PAGE);

  function toggleChip(label: string) {
    const next = new Set(chips);
    if (!next.delete(label)) next.add(label);
    setChips(next);
  }

  async function add(exercise: ExerciseDefinition) {
    await db.plan.add({
      id: newId(),
      weekday,
      name: exercise.name,
      exerciseId: exercise.id,
      bodyPart: exercise.bodyPart,
      sets: 3,
      reps: "10",
      sortOrder: existingCount,
    });
    setAdded(exercise.name);
    closeTimer.current = window.setTimeout(onClose, 900);
  }

  return (
    <Modal title="exercise browser" onClose={onClose}>
      <div className="p-4 flex flex-col gap-3 relative">
        <p className="font-body text-[12px] text-[var(--text-secondary)]">
          adding to {weekdayName(weekday)}
        </p>

        <RetroTextField
          value={search}
          placeholder="search exercises"
          aria-label="Search exercises"
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex gap-[6px]">
          {FILTER_CHIPS.map((chip) => (
            <RetroChip
              key={chip.label}
              selected={chips.has(chip.label)}
              onClick={() => toggleChip(chip.label)}
              className="flex-1 py-[6px] font-pixel text-[9px] tracking-[0.12em] uppercase text-[var(--text-primary)]"
            >
              {chip.label}
            </RetroChip>
          ))}
        </div>

        {failed ? (
          <EmptyState
            title="couldn't load the exercise list"
            subtitle="you can still add exercises by name from the tracker."
          />
        ) : !exercises ? (
          <p className="font-body text-[13px] text-[var(--text-muted)] py-6 text-center">
            loading exercises…
          </p>
        ) : matches.length === 0 ? (
          <EmptyState title="no matches" subtitle="try a different filter or search term." />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {shown.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => void add(exercise)}
                  className="text-left cursor-pointer"
                >
                  <RetroCard padding={0}>
                    <span className="flex items-center gap-[10px] px-3 py-[10px]">
                      <span className="w-[26px] h-[26px] shrink-0 flex items-center justify-center font-pixel text-[13px] uppercase text-[var(--brown-700)] bg-[var(--surface-inset)] border-2 border-[var(--brown-900)]">
                        {exercise.equipment.charAt(0)}
                      </span>
                      <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                        <span className="font-body font-bold text-[13px] text-[var(--text-primary)]">
                          {exercise.name}
                        </span>
                        <span className="self-start font-pixel text-[9px] tracking-[0.12em] uppercase text-[var(--text-muted)] px-[5px] py-[2px] bg-[var(--cream-100)] border-2 border-[var(--border-subtle)]">
                          {exercise.bodyPart}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="w-[22px] h-[22px] shrink-0 flex items-center justify-center font-pixel text-[13px] text-[var(--text-on-accent)] bg-[var(--accent-primary)] border-2 border-[var(--brown-900)]"
                      >
                        +
                      </span>
                    </span>
                  </RetroCard>
                </button>
              ))}
            </div>

            {matches.length > shown.length && (
              <p className="font-body text-[12px] text-[var(--text-muted)] text-center py-1">
                showing {shown.length} of {matches.length} — search to narrow it down
              </p>
            )}
          </>
        )}
      </div>

      {added && (
        <p
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 font-pixel text-[10px] tracking-[0.12em] text-[var(--cream-50)] bg-[var(--brown-900)] px-3 py-2 chunky-sm"
        >
          ✦ added {added} to {weekdayName(weekday)}!
        </p>
      )}
    </Modal>
  );
}
