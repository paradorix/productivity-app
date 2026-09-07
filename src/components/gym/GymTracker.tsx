"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatDay, weekdayName, WEEKDAYS } from "@/lib/dates";
import { newId, toDayKey, type PlannedExercise, type Weekday, type WorkoutSession } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ExerciseNameField } from "./ExerciseNameField";

export interface ActiveRow {
  id: string;
  name: string;
  target: string | null;
  sets: number;
  reps: string;
  weight: string;
}

export interface ActiveSession {
  weekday: Weekday | null;
  isFreeform: boolean;
  rows: ActiveRow[];
}

/** Turns a day's plan into the editable rows a session starts from. */
export function sessionFromPlan(day: Weekday, exercises: PlannedExercise[]): ActiveSession {
  return {
    weekday: day,
    isFreeform: false,
    rows: exercises.map((exercise) => ({
      id: newId(),
      name: exercise.name,
      target: `${exercise.sets}×${exercise.reps}`,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: "",
    })),
  };
}

/**
 * Logging a workout as it happens, then keeping it.
 *
 * A session is held in component state, not the database, until you finish it.
 * A workout you abandoned halfway through isn't a workout, and it shouldn't
 * show up in your history or count toward the garden as though it were.
 *
 * The plan's sets and reps arrive as a *target* the row remembers separately
 * from what you actually did — the point of the screen is the difference
 * between the two.
 */
export function GymTracker({ initialSession }: { initialSession: ActiveSession | null }) {
  const [session, setSession] = useState<ActiveSession | null>(initialSession);
  const [freeName, setFreeName] = useState("");

  const plan = useLiveQuery(() => db.plan.toArray(), [], []);
  const history = useLiveQuery(() => db.workouts.toArray(), [], []);
  const sortedHistory = [...history].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const plannedDays = new Set(plan.map((exercise) => exercise.weekday));

  function startPlanned(day: Weekday) {
    const exercises = plan
      .filter((exercise) => exercise.weekday === day)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setSession(sessionFromPlan(day, exercises));
  }

  function updateRow(id: string, patch: Partial<ActiveRow>) {
    setSession((current) =>
      current
        ? { ...current, rows: current.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) }
        : current,
    );
  }

  function addFreeExercise() {
    const trimmed = freeName.trim();
    if (!trimmed) return;
    setSession((current) =>
      current
        ? {
            ...current,
            rows: [
              ...current.rows,
              { id: newId(), name: trimmed, target: null, sets: 3, reps: "10", weight: "" },
            ],
          }
        : current,
    );
    setFreeName("");
  }

  async function finishWorkout() {
    if (!session || session.rows.length === 0) return;
    await db.workouts.add({
      id: newId(),
      day: toDayKey(),
      weekday: session.weekday,
      isFreeform: session.isFreeform,
      createdAt: new Date().toISOString(),
      exercises: session.rows.map((row, index) => ({
        id: newId(),
        name: row.name,
        sets: row.sets,
        reps: row.reps,
        weight: row.weight,
        target: row.target,
        sortOrder: index,
      })),
    });
    setSession(null);
  }

  return (
    <div className="p-4 flex flex-col gap-3 pb-8">
      <ScreenHeader title="gym tracker" subtitle="log today's work" />

      {session === null ? (
        <RetroCard title="start a workout" padding={14}>
          <div className="flex flex-col gap-[10px]">
            <div className="flex gap-1">
              {WEEKDAYS.map((day) => {
                const planned = plannedDays.has(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    disabled={!planned}
                    onClick={() => startPlanned(day.value)}
                    aria-label={
                      planned ? `Start ${day.full} workout` : `${day.full} — nothing planned`
                    }
                    className={
                      "flex-1 py-2 font-pixel text-[10px] border-2 border-[var(--brown-900)] bevel " +
                      (planned
                        ? "bg-[var(--surface-card)] text-[var(--text-secondary)] cursor-pointer"
                        : "bg-[var(--surface-inset)] text-[var(--text-muted)] opacity-50 cursor-not-allowed")
                    }
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
            <RetroButton variant="secondary" fullWidth onClick={() => setSession({ weekday: null, isFreeform: true, rows: [] })}>
              + freeform workout
            </RetroButton>
          </div>
        </RetroCard>
      ) : (
        <>
          <RetroCard
            title={session.isFreeform ? "freeform workout" : `${weekdayName(session.weekday)} workout`}
            padding={14}
          >
            <div className="flex flex-col gap-[10px]">
              {session.rows.length === 0 && (
                <p className="font-body italic text-[12px] text-[var(--text-secondary)]">
                  add your first exercise below.
                </p>
              )}

              {session.rows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-[6px] pb-2 border-b-2 border-[var(--border-subtle)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1 font-body font-bold text-[13px] text-[var(--text-primary)]">
                      {row.name}
                    </span>
                    {row.target && (
                      <span className="font-body text-[11px] text-[var(--text-muted)]">
                        target {row.target}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setSession({ ...session, rows: session.rows.filter((r) => r.id !== row.id) })
                      }
                      aria-label={`Remove ${row.name}`}
                      className="w-5 h-5 shrink-0 font-pixel text-[11px] text-[var(--text-secondary)] border-2 border-[var(--border-primary)] cursor-pointer hover:text-[var(--accent-primary)]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <NumberCell
                      label="SETS"
                      value={row.sets}
                      onChange={(sets) => updateRow(row.id, { sets })}
                    />
                    <TextCell
                      label="REPS"
                      value={row.reps}
                      onChange={(reps) => updateRow(row.id, { reps })}
                    />
                    <TextCell
                      label="LBS"
                      value={row.weight}
                      placeholder="—"
                      onChange={(weight) => updateRow(row.id, { weight })}
                    />
                  </div>
                </div>
              ))}

              {session.isFreeform && (
                <div className="flex items-end gap-2">
                  <ExerciseNameField
                    value={freeName}
                    onChange={setFreeName}
                    onSubmit={addFreeExercise}
                  />
                  <RetroButton size="sm" onClick={addFreeExercise} disabled={!freeName.trim()}>
                    add
                  </RetroButton>
                </div>
              )}
            </div>
          </RetroCard>

          <div className="flex gap-2">
            <RetroButton variant="secondary" onClick={() => setSession(null)}>
              cancel
            </RetroButton>
            <RetroButton
              variant="accent"
              fullWidth
              disabled={session.rows.length === 0}
              onClick={() => void finishWorkout()}
            >
              finish workout
            </RetroButton>
          </div>
        </>
      )}

      <h2 className="font-display text-[16px] text-[var(--text-primary)] mt-1">history</h2>

      {sortedHistory.length === 0 ? (
        <EmptyState
          title="no workouts logged yet!"
          subtitle="finish a workout above to start your history."
        />
      ) : (
        sortedHistory.map((entry) => <HistoryRow key={entry.id} entry={entry} />)
      )}
    </div>
  );
}

function HistoryRow({ entry }: { entry: WorkoutSession }) {
  return (
    <RetroCard title={formatDay(entry.day)} padding={12}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-body text-[12px] text-[var(--text-secondary)]">
            {entry.isFreeform ? "freeform" : weekdayName(entry.weekday)} · {entry.exercises.length}{" "}
            exercise{entry.exercises.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => void db.workouts.delete(entry.id)}
            aria-label={`Delete the workout logged on ${formatDay(entry.day)}`}
            className="w-6 h-6 shrink-0 font-pixel text-[12px] text-[var(--text-secondary)] border-2 border-[var(--border-primary)] cursor-pointer hover:text-[var(--accent-primary)]"
          >
            ×
          </button>
        </div>
        {[...entry.exercises]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((exercise) => (
            <div key={exercise.id} className="flex justify-between gap-2">
              <span className="font-body text-[12px] text-[var(--text-secondary)]">
                {exercise.name}
              </span>
              <span className="font-body text-[12px] text-[var(--text-secondary)] shrink-0">
                {exercise.sets}×{exercise.reps}
                {exercise.weight ? ` @ ${exercise.weight}lb` : ""}
              </span>
            </div>
          ))}
      </div>
    </RetroCard>
  );
}

function NumberCell({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex-1 flex flex-col gap-[2px]">
      <span className="font-pixel text-[9px] tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="w-full font-body text-[13px] text-[var(--text-primary)] py-[5px] bg-transparent border-b-2 border-[var(--border-subtle)]"
      />
    </label>
  );
}

function TextCell({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex-1 flex flex-col gap-[2px]">
      <span className="font-pixel text-[9px] tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full font-body text-[13px] text-[var(--text-primary)] py-[5px] bg-transparent border-b-2 border-[var(--border-subtle)] placeholder:text-[var(--text-muted)]"
      />
    </label>
  );
}
