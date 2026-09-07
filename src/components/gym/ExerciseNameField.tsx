"use client";

import { useState } from "react";
import { suggestExercises } from "@/lib/exercises";
import { useExerciseCatalog } from "@/lib/useExerciseCatalog";

/**
 * A free-text exercise name with a short autocomplete underneath.
 *
 * Suggestions only ever suggest. Anything you type is accepted as-is, so an
 * exercise the catalog has never heard of — a machine at your gym, something
 * your physio gave you — logs exactly like any other.
 */
export function ExerciseNameField({
  value,
  onChange,
  onSubmit,
  placeholder = "add exercise",
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  const { exercises } = useExerciseCatalog();
  const [focused, setFocused] = useState(false);

  const suggestions = focused && exercises ? suggestExercises(exercises, value) : [];
  const exactMatch = suggestions.length === 1 && suggestions[0].name === value;

  return (
    <div className="relative flex-1">
      <input
        value={value}
        placeholder={placeholder}
        aria-label="Exercise name"
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        // Blur is delayed so a click on a suggestion lands before the list
        // unmounts out from under the pointer.
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onSubmit) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className="w-full font-body text-[14px] text-[var(--text-primary)] py-[6px] bg-transparent border-b-2 border-[var(--border-subtle)] placeholder:text-[var(--text-muted)]"
      />

      {suggestions.length > 0 && !exactMatch && (
        <ul className="absolute left-0 right-0 top-full mt-1 z-20 bg-[var(--surface-card)] border-2 border-[var(--brown-900)] chunky-sm">
          {suggestions.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(exercise.name);
                  setFocused(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-[10px] py-2 text-left cursor-pointer hover:bg-[var(--surface-inset)]"
              >
                <span className="font-body text-[13px] text-[var(--text-primary)]">
                  {exercise.name}
                </span>
                <span className="font-pixel text-[8px] tracking-[0.12em] uppercase text-[var(--text-muted)] shrink-0">
                  {exercise.bodyPart}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
