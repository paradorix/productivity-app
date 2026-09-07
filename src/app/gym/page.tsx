"use client";

import { useState } from "react";
import { GymPlan } from "@/components/gym/GymPlan";
import { GymTracker, sessionFromPlan, type ActiveSession } from "@/components/gym/GymTracker";
import type { PlannedExercise, Weekday } from "@/lib/types";

/**
 * Plan and tracker are one screen with two faces, swapped in place — the same
 * conditional the original used, rather than two routes. The plan hands the
 * tracker a session already built from the day you tapped, so the tracker
 * never has to wait on the plan's data to know what you're starting.
 */
export default function GymPage() {
  const [view, setView] = useState<"plan" | "tracker">("plan");
  const [session, setSession] = useState<ActiveSession | null>(null);
  // Counts starts rather than naming the day: starting Monday twice in a row
  // has to produce two fresh sessions, not reuse the first one's rows.
  const [sessionKey, setSessionKey] = useState(0);

  function startWorkout(day: Weekday, exercises: PlannedExercise[]) {
    setSession(sessionFromPlan(day, exercises));
    setSessionKey((key) => key + 1);
    setView("tracker");
  }

  if (view === "plan") return <GymPlan onStartWorkout={startWorkout} />;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => {
          setSession(null);
          setView("plan");
        }}
        className="self-start font-pixel text-[14px] text-[var(--text-primary)] px-4 pt-4 cursor-pointer"
      >
        ‹ plan
      </button>
      <GymTracker key={sessionKey} initialSession={session} />
    </div>
  );
}
