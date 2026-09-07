"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { PlantSprite } from "@/components/garden/PlantSprite";
import { ChunkyProgressBar } from "@/components/ui/ChunkyProgressBar";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { RetroCard } from "@/components/ui/RetroCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { db } from "@/lib/db";
import { formatDayLong, greeting } from "@/lib/dates";
import { GROWTH_THRESHOLDS } from "@/lib/garden";
import { toDayKey } from "@/lib/types";
import { useGardenStatus } from "@/lib/useGarden";

/**
 * What today looks like so far, and one tap back into whatever you were doing.
 *
 * The day counts here come from the same hook the garden uses, so the number
 * on this card and the number under the plant are the same number rather than
 * two calculations that agree until they don't.
 */
export default function HomePage() {
  const today = toDayKey();
  const profile = useLiveQuery(() => db.profile.get("me"), [], undefined);
  const { plant, dayCount } = useGardenStatus();

  const journalToday = useLiveQuery(
    () => db.journal.where("day").equals(today).count(),
    [today],
    0,
  );
  const mealsToday = useLiveQuery(() => db.food.where("day").equals(today).count(), [today], 0);
  const workoutsToday = useLiveQuery(
    () => db.workouts.where("day").equals(today).count(),
    [today],
    0,
  );

  return (
    <div className="p-4 flex flex-col gap-3 pb-8">
      <div className="flex items-center gap-3">
        <PixelSprite name="garden-hero-sprout" size={44} priority />
        <div className="flex-1 min-w-0">
          <p className="font-pixel text-[11px] tracking-[0.12em] uppercase text-[var(--text-secondary)]">
            {formatDayLong(today)}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[18px] text-[var(--text-primary)]">{greeting()}</h1>
            <PixelSprite name="glyph-heart" size={18} />
          </div>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="font-pixel font-bold text-[18px] leading-none text-[var(--text-secondary)] p-2 hover:text-[var(--text-primary)]"
        >
          ⚙
        </Link>
      </div>

      {profile?.displayName && (
        <ScreenHeader title={`hello, ${profile.displayName}`} titleSize={14} />
      )}

      {plant ? (
        <RetroCard accent padding={14}>
          <Link href="/garden" className="flex items-center gap-3 no-underline">
            <PlantSprite
              plantType={plant.plantType}
              growthStage={plant.growthStage}
              potColor={plant.potColor}
              hasHat={plant.hasHat}
              hasRibbon={plant.hasRibbon}
              size={56}
            />
            <span className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="font-body font-bold text-[14px] text-[var(--text-primary)]">
                {plant.name} is growing
              </span>
              <span className="font-body text-[11px] text-[var(--text-secondary)]">
                {dayCount > 0
                  ? `${dayCount} day${dayCount === 1 ? "" : "s"} logged · ${plant.growthStage}`
                  : "not started yet"}
              </span>
              <ChunkyProgressBar
                progress={Math.min(dayCount, GROWTH_THRESHOLDS.mature) / GROWTH_THRESHOLDS.mature}
                label={`${dayCount} of ${GROWTH_THRESHOLDS.mature} days toward fully grown`}
              />
            </span>
          </Link>
        </RetroCard>
      ) : (
        <TodayCard
          href="/garden"
          title="nothing planted yet"
          detail="a plant grows on the days you log something"
          action="garden"
        />
      )}

      <h2 className="font-display text-[14px] text-[var(--text-primary)] mt-1">jump back in</h2>

      <TodayCard
        href="/journal"
        title="today's journal"
        detail={journalToday > 0 ? "1 entry written" : "not written yet"}
      />
      <TodayCard
        href="/gym"
        title="today's workout"
        detail={
          workoutsToday > 0
            ? `${workoutsToday} logged`
            : "nothing logged yet"
        }
      />
      <TodayCard
        href="/food"
        title="today's meals"
        detail={mealsToday > 0 ? `${mealsToday} logged` : "nothing logged yet"}
      />

      {plant && (
        <RetroCard padding={14}>
          <div className="flex items-center gap-[10px]">
            <PixelSprite name="glyph-heart" size={18} />
            <p className="font-body font-semibold text-[13px] text-[var(--text-primary)]">
              {dayCount > 0
                ? `${dayCount} day${dayCount === 1 ? "" : "s"} logged with ${plant.name} — keep it soft and steady`
                : `log today to help ${plant.name} grow — no pressure`}
            </p>
          </div>
        </RetroCard>
      )}
    </div>
  );
}

/**
 * The whole row is the link, and "open" is a label on it — not a button
 * nested inside an anchor, which is invalid markup and gives screen readers
 * two competing controls for one destination.
 */
function TodayCard({
  href,
  title,
  detail,
  action = "open",
}: {
  href: string;
  title: string;
  detail: string;
  action?: string;
}) {
  return (
    <RetroCard padding={0}>
      <Link href={href} className="flex items-center justify-between gap-3 p-[14px] no-underline">
        <span className="flex flex-col gap-[2px]">
          <span className="font-body font-bold text-[14px] text-[var(--text-primary)]">{title}</span>
          <span className="font-body text-[11px] text-[var(--text-secondary)]">{detail}</span>
        </span>
        <span className="shrink-0 font-pixel font-bold uppercase tracking-[0.08em] text-[11px] px-[14px] py-[7px] bg-[var(--surface-card)] text-[var(--text-primary)] border-[3px] border-[var(--border-primary)] bevel chunky-sm">
          {action}
        </span>
      </Link>
    </RetroCard>
  );
}
