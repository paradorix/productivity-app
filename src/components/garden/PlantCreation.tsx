"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { PLANT_DISPLAY_NAMES, PLANT_TAGLINES, POT_SWATCHES } from "@/lib/garden";
import { newId, PLANT_TYPES, POT_COLORS, type PlantType, type PotColor } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroChip } from "@/components/ui/RetroChip";
import { RetroTextField } from "@/components/ui/RetroTextField";
import { cn } from "@/lib/cn";
import { PlantSprite } from "./PlantSprite";

type Step = "species" | "customize" | "name";

/**
 * Pick a species, dress it, name it. Nothing is written until the final
 * confirm, so backing out at any point leaves the garden untouched.
 */
export function PlantCreation({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("species");
  const [plantType, setPlantType] = useState<PlantType>("hero");
  const [potColor, setPotColor] = useState<PotColor>("terracotta");
  const [hasHat, setHasHat] = useState(false);
  const [hasRibbon, setHasRibbon] = useState(false);
  const [name, setName] = useState("");
  const [planting, setPlanting] = useState(false);

  async function plantIt() {
    if (planting) return;
    setPlanting(true);
    try {
      await db.garden.add({
        id: newId(),
        plantType,
        name: name.trim() || PLANT_DISPLAY_NAMES[plantType],
        growthStage: "seed",
        potColor,
        hasHat,
        hasRibbon,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } finally {
      setPlanting(false);
    }
  }

  return (
    <Modal title="plant a seed" onClose={onClose}>
      <div className="p-5 flex flex-col gap-3 min-h-full">
        {step === "species" && (
          <>
            <h2 className="font-display text-[17px] text-[var(--text-primary)]">
              pick a plant to grow
            </h2>
            <p className="font-body text-[12px] text-[var(--text-secondary)]">
              each one grows a little differently
            </p>

            <div className="grid grid-cols-2 gap-[10px] mt-1">
              {PLANT_TYPES.map((type) => (
                <RetroChip
                  key={type}
                  selected={type === plantType}
                  accentBorderWhenSelected
                  onClick={() => setPlantType(type)}
                  className="flex flex-col items-center gap-[6px] py-3 px-[6px]"
                >
                  <PixelSprite name={`garden-${type}-bloom`} size={56} />
                  <span className="font-body font-semibold text-[11px] text-[var(--text-primary)]">
                    {PLANT_DISPLAY_NAMES[type]}
                  </span>
                  <span className="font-body text-[10px] text-[var(--text-muted)] text-center leading-[1.4]">
                    {PLANT_TAGLINES[type]}
                  </span>
                </RetroChip>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <RetroButton variant="accent" fullWidth onClick={() => setStep("customize")}>
                continue
              </RetroButton>
            </div>
          </>
        )}

        {step === "customize" && (
          <>
            <BackButton onClick={() => setStep("species")} />
            <h2 className="font-display text-[17px] text-[var(--text-primary)]">make it yours</h2>

            <div className="flex justify-center py-1">
              <PlantSprite
                plantType={plantType}
                growthStage={null}
                potColor={potColor}
                hasHat={hasHat}
                hasRibbon={hasRibbon}
                size={170}
              />
            </div>

            <SectionLabel>POT COLOR</SectionLabel>
            <div className="flex gap-3">
              {POT_COLORS.map((color) => {
                const selected = color === potColor;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPotColor(color)}
                    aria-pressed={selected}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span
                      className={cn(
                        "w-[36px] h-[36px] block",
                        selected
                          ? "border-[3px] border-[var(--accent-primary)] bevel-pressed translate-x-[2px] translate-y-[2px]"
                          : "border-2 border-[var(--brown-900)] bevel",
                      )}
                      style={{ background: POT_SWATCHES[color] }}
                    />
                    <span className="font-pixel text-[8px] tracking-[0.12em] uppercase text-[var(--text-secondary)]">
                      {color}
                    </span>
                  </button>
                );
              })}
            </div>

            <SectionLabel>ACCESSORIES</SectionLabel>
            <div className="flex gap-[10px]">
              <AccessoryToggle
                sprite="garden-acc-ribbon"
                label="ribbon"
                active={hasRibbon}
                onClick={() => setHasRibbon(!hasRibbon)}
              />
              <AccessoryToggle
                sprite="garden-acc-hat"
                label="tiny hat"
                active={hasHat}
                onClick={() => setHasHat(!hasHat)}
              />
            </div>

            <div className="mt-auto pt-4">
              <RetroButton variant="accent" fullWidth onClick={() => setStep("name")}>
                continue
              </RetroButton>
            </div>
          </>
        )}

        {step === "name" && (
          <>
            <BackButton onClick={() => setStep("customize")} />

            <div className="flex justify-center">
              <PlantSprite
                plantType={plantType}
                growthStage={null}
                potColor={potColor}
                hasHat={hasHat}
                hasRibbon={hasRibbon}
                size={140}
              />
            </div>

            <RetroCard title="name your plant" padding={16}>
              <div className="flex flex-col gap-2">
                <RetroTextField
                  value={name}
                  maxLength={30}
                  placeholder="e.g. sunny"
                  aria-label="Plant name"
                  onChange={(event) => setName(event.target.value)}
                />
                <p className="font-body text-[11px] text-[var(--text-muted)]">
                  leave it blank and it&apos;ll be called {PLANT_DISPLAY_NAMES[plantType]}. you can
                  rename it anytime from the garden.
                </p>
              </div>
            </RetroCard>

            <div className="mt-auto pt-4">
              <RetroButton
                variant="accent"
                fullWidth
                disabled={planting}
                onClick={() => void plantIt()}
              >
                {planting ? "planting…" : "plant it!"}
              </RetroButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start font-pixel text-[14px] text-[var(--text-primary)] cursor-pointer"
    >
      ‹ back
    </button>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="font-pixel text-[10px] tracking-[0.12em] uppercase text-[var(--text-secondary)] mt-1">
      {children}
    </span>
  );
}

function AccessoryToggle({
  sprite,
  label,
  active,
  onClick,
}: {
  sprite: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-2 px-3 py-[7px] cursor-pointer bg-[var(--surface-card)] border-2 border-[var(--brown-900)]",
        active ? "bevel-pressed translate-x-[2px] translate-y-[2px]" : "bevel",
      )}
    >
      <PixelSprite name={sprite} size={27} height={18} />
      <span className="font-body font-semibold text-[11px] text-[var(--text-primary)]">{label}</span>
    </button>
  );
}
