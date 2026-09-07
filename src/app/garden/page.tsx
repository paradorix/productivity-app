"use client";

import { useState } from "react";
import { PlantCreation } from "@/components/garden/PlantCreation";
import { PlantSprite } from "@/components/garden/PlantSprite";
import { ChunkyProgressBar } from "@/components/ui/ChunkyProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroTextField } from "@/components/ui/RetroTextField";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { db } from "@/lib/db";
import { daysToNextStage, GROWTH_THRESHOLDS, stageForDayCount, stageRank } from "@/lib/garden";
import type { GrowthStage } from "@/lib/types";
import { useGardenStatus } from "@/lib/useGarden";

/**
 * One plant, growing on the days you logged something — anything. It never
 * shrinks and it never dies; a gap in your logging just means it waits.
 */
export default function GardenPage() {
  const { plant, dayCount, loading } = useGardenStatus();
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);

  return (
    <div className="p-4 flex flex-col gap-4 pb-8">
      <ScreenHeader title="garden" titleSize={19} />

      {loading ? null : plant ? (
        <>
          <RetroCard accent>
            <div className="flex flex-col items-center gap-2">
              <PlantSprite
                plantType={plant.plantType}
                growthStage={plant.growthStage}
                potColor={plant.potColor}
                hasHat={plant.hasHat}
                hasRibbon={plant.hasRibbon}
                size={120}
                priority
              />

              {renaming ? (
                <RenameField
                  initial={plant.name}
                  onDone={async (next) => {
                    if (next) await db.garden.update(plant.id, { name: next });
                    setRenaming(false);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setRenaming(true)}
                  className="font-body font-bold text-[16px] text-[var(--text-primary)] underline decoration-dotted underline-offset-4 cursor-pointer"
                  aria-label={`Rename ${plant.name}`}
                >
                  {plant.name}
                </button>
              )}

              <p className="font-body text-[12px] text-[var(--text-secondary)] text-center">
                {caption(dayCount, plant.growthStage)}
              </p>

              <div className="w-full mt-1">
                <ChunkyProgressBar
                  progress={Math.min(dayCount, GROWTH_THRESHOLDS.mature) / GROWTH_THRESHOLDS.mature}
                  label={`${dayCount} of ${GROWTH_THRESHOLDS.mature} days toward fully grown`}
                />
              </div>
            </div>
          </RetroCard>

          <RetroCard title="how it grows" padding={14}>
            <p className="font-body text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              Any day you write a journal entry, log a meal, or finish a workout counts as a day
              logged. Miss a week and nothing is taken away — {plant.name} just waits where you
              left it.
            </p>
          </RetroCard>
        </>
      ) : (
        <EmptyState
          title="nothing planted yet!"
          subtitle="start a plant and it'll grow as you log your days."
        >
          <RetroButton variant="accent" onClick={() => setCreating(true)}>
            plant a seed
          </RetroButton>
        </EmptyState>
      )}

      {creating && <PlantCreation onClose={() => setCreating(false)} />}
    </div>
  );
}

function RenameField({
  initial,
  onDone,
}: {
  initial: string;
  onDone: (next: string) => void | Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      className="w-full max-w-[240px] flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void onDone(value.trim());
      }}
    >
      <RetroTextField
        autoFocus
        value={value}
        maxLength={30}
        aria-label="Plant name"
        className="p-2 text-[14px]"
        onChange={(event) => setValue(event.target.value)}
      />
      <RetroButton type="submit" size="sm">
        ok
      </RetroButton>
    </form>
  );
}

function caption(dayCount: number, stage: GrowthStage): string {
  if (dayCount === 0) return "log a day in your journal, food or gym to help it sprout";

  const days = `${dayCount} day${dayCount === 1 ? "" : "s"} logged`;
  if (stage === "mature") return `${days} · fully grown`;

  // Deleting entries lowers the count but never the plant. When the stage is
  // already ahead of what the count would earn, promising "2 more to sprout"
  // under a plant that has visibly bloomed would just read as broken.
  if (stageRank(stage) > stageRank(stageForDayCount(dayCount))) return `${days} · ${stage}`;

  const next = daysToNextStage(dayCount);
  return next ? `${days} · ${next.remaining} more to ${next.stage}` : days;
}
