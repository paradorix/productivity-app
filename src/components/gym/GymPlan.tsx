"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { todayWeekday, weekdayName, WEEKDAYS } from "@/lib/dates";
import type { PlannedExercise, Weekday } from "@/lib/types";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroChip } from "@/components/ui/RetroChip";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ExerciseBrowser } from "./ExerciseBrowser";

/**
 * The weekly split: seven days, each holding a list of exercises you intend to
 * do. A day with nothing in it is a rest day, said in those words — an empty
 * list here is a plan, not a gap.
 */
export function GymPlan({
  onStartWorkout,
}: {
  onStartWorkout: (day: Weekday, exercises: PlannedExercise[]) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<Weekday>(todayWeekday());
  const [browsing, setBrowsing] = useState(false);

  const plan = useLiveQuery(() => db.plan.toArray(), [], []);
  const byDay = [...plan].sort((a, b) => a.sortOrder - b.sortOrder);
  const dayExercises = byDay.filter((exercise) => exercise.weekday === selectedDay);
  const plannedDays = new Set(plan.map((exercise) => exercise.weekday));

  return (
    <div className="p-4 flex flex-col gap-3 pb-8">
      <ScreenHeader title="gym plan" subtitle="your weekly split" />

      <div className="flex gap-1">
        {WEEKDAYS.map((day) => (
          <RetroChip
            key={day.value}
            selected={day.value === selectedDay}
            label={day.full}
            onClick={() => setSelectedDay(day.value)}
            className="flex-1 flex flex-col items-center gap-[3px] py-2"
          >
            <span className="font-pixel text-[10px] tracking-[0.08em] text-[var(--text-primary)]">
              {day.short}
            </span>
            <span
              aria-hidden
              className="w-[4px] h-[4px]"
              style={{
                background: plannedDays.has(day.value) ? "var(--accent-primary)" : "transparent",
              }}
            />
          </RetroChip>
        ))}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-[16px] text-[var(--text-primary)]">
          {weekdayName(selectedDay)}
        </h2>
        <span className="font-body text-[12px] text-[var(--text-secondary)]">
          {dayExercises.length} exercise{dayExercises.length === 1 ? "" : "s"}
        </span>
      </div>

      {dayExercises.length === 0 ? (
        <p className="font-body italic text-[13px] text-[var(--text-secondary)]">
          rest day — nothing planned yet. add an exercise below.
        </p>
      ) : (
        dayExercises.map((exercise) => (
          <RetroCard key={exercise.id} title={exercise.name} padding={12}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-body text-[13px] text-[var(--text-secondary)]">
                {exercise.sets} sets × {exercise.reps} reps
              </span>
              <button
                type="button"
                onClick={() => void db.plan.delete(exercise.id)}
                aria-label={`Remove ${exercise.name} from ${weekdayName(selectedDay)}`}
                className="w-6 h-6 shrink-0 font-pixel text-[12px] text-[var(--text-secondary)] border-2 border-[var(--border-primary)] cursor-pointer hover:text-[var(--accent-primary)]"
              >
                ×
              </button>
            </div>
          </RetroCard>
        ))
      )}

      <RetroButton variant="secondary" fullWidth onClick={() => setBrowsing(true)}>
        + add exercise
      </RetroButton>

      <RetroButton
        variant="accent"
        fullWidth
        disabled={dayExercises.length === 0}
        onClick={() => onStartWorkout(selectedDay, dayExercises)}
      >
        {dayExercises.length === 0
          ? "rest day"
          : `start ${weekdayName(selectedDay).toLowerCase()} workout`}
      </RetroButton>

      {browsing && (
        <ExerciseBrowser
          weekday={selectedDay}
          existingCount={dayExercises.length}
          onClose={() => setBrowsing(false)}
        />
      )}
    </div>
  );
}
