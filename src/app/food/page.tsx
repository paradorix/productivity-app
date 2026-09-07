"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BlobImage } from "@/components/ui/BlobImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoAttach } from "@/components/ui/PhotoAttach";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroChip } from "@/components/ui/RetroChip";
import { RetroTextField } from "@/components/ui/RetroTextField";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { db } from "@/lib/db";
import { formatDay, isToday } from "@/lib/dates";
import { MEAL_TYPES, newId, toDayKey, type FoodLogEntry, type MealType } from "@/lib/types";

/**
 * Deliberately the lightest screen in the app: what you ate, in your own
 * words. No calories, no macros, no targets — it's a diary, not a diet tool,
 * and the moment it starts scoring your meals it becomes something else.
 *
 * It opens on today. Earlier days are reachable one step back, which is as
 * much history as a log like this needs on screen; everything ever logged is
 * still in your backup file.
 */
export default function FoodPage() {
  const [day, setDay] = useState(toDayKey());

  const entries = useLiveQuery(() => db.food.where("day").equals(day).toArray(), [day], []);
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Only days that actually have meals are reachable, so stepping back never
  // lands on an empty day the user has to step past.
  const days = useLiveQuery(
    async () => (await db.food.orderBy("day").uniqueKeys()) as string[],
    [],
    [] as string[],
  );
  const earlier = days.filter((d) => d < day).at(-1) ?? null;
  const later = days.find((d) => d > day) ?? null;

  return (
    <div className="p-4 flex flex-col gap-3 pb-8">
      <ScreenHeader
        title="food log"
        subtitle={`${sorted.length} meal${sorted.length === 1 ? "" : "s"} logged ${
          isToday(day) ? "today" : `on ${formatDay(day)}`
        }`}
      />

      {(earlier || !isToday(day)) && (
        <div className="flex items-center justify-between gap-2">
          <NavLink label="‹ earlier day" disabled={!earlier} onClick={() => earlier && setDay(earlier)} />
          {!isToday(day) && (
            <button
              type="button"
              onClick={() => setDay(toDayKey())}
              className="font-pixel text-[10px] tracking-[0.12em] uppercase underline text-[var(--text-secondary)] cursor-pointer"
            >
              back to today
            </button>
          )}
          <NavLink label="later day ›" disabled={!later} onClick={() => later && setDay(later)} />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState title="nothing logged yet!" subtitle="log your first meal below." />
      ) : (
        sorted.map((entry) => <MealRow key={entry.id} entry={entry} />)
      )}

      {isToday(day) ? (
        <LogMealCard />
      ) : (
        <p className="font-body text-[12px] text-[var(--text-muted)] text-center py-2">
          viewing {formatDay(day)} — go back to today to log a meal.
        </p>
      )}
    </div>
  );
}

function LogMealCard() {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);

  async function logMeal() {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await db.food.add({
        id: newId(),
        day: toDayKey(),
        mealType,
        text: trimmed,
        photo,
        createdAt: new Date().toISOString(),
      });
      setText("");
      setPhoto(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RetroCard title="log a meal" padding={14}>
      <form
        className="flex flex-col gap-[10px]"
        onSubmit={(event) => {
          event.preventDefault();
          void logMeal();
        }}
      >
        <div className="flex gap-[6px]">
          {MEAL_TYPES.map((meal) => (
            <RetroChip
              key={meal}
              selected={meal === mealType}
              onClick={() => setMealType(meal)}
              className="flex-1 py-2 font-pixel text-[9px] tracking-[0.08em] uppercase text-[var(--text-primary)]"
            >
              {meal}
            </RetroChip>
          ))}
        </div>

        <RetroTextField
          value={text}
          placeholder="what did you eat?"
          aria-label="What did you eat?"
          onChange={(event) => setText(event.target.value)}
        />

        <PhotoAttach photo={photo} onChange={setPhoto} />

        <RetroButton type="submit" variant="accent" fullWidth disabled={!text.trim() || saving}>
          + log meal
        </RetroButton>
      </form>
    </RetroCard>
  );
}

function MealRow({ entry }: { entry: FoodLogEntry }) {
  return (
    <RetroCard padding={14}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="font-pixel text-[10px] tracking-[0.12em] uppercase text-[var(--text-muted)]">
            {entry.mealType}
          </span>
          <span className="font-body text-[14px] text-[var(--text-primary)] break-words">
            {entry.text}
          </span>
        </div>
        {entry.photo && (
          <span className="shrink-0 border-2 border-[var(--brown-900)] leading-[0]">
            <BlobImage blob={entry.photo} alt="" size={34} />
          </span>
        )}
        <button
          type="button"
          onClick={() => void db.food.delete(entry.id)}
          aria-label={`Delete ${entry.mealType} entry`}
          className="w-6 h-6 shrink-0 font-pixel text-[12px] text-[var(--text-secondary)] border-2 border-[var(--border-primary)] cursor-pointer hover:text-[var(--accent-primary)]"
        >
          ×
        </button>
      </div>
    </RetroCard>
  );
}

function NavLink({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="font-pixel text-[10px] tracking-[0.12em] uppercase text-[var(--text-secondary)] cursor-pointer disabled:opacity-30 disabled:cursor-default"
    >
      {label}
    </button>
  );
}
