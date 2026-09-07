import { plantSprite, pottedSprite, POT_SPRITES } from "@/lib/garden";
import type { GrowthStage, PlantType, PotColor } from "@/lib/types";
import { PixelSprite } from "@/components/ui/PixelSprite";

/**
 * Composites pot + plant + accessories into one image. The single place this
 * layering lives, shared by the creation preview and the garden itself.
 *
 * The original art only ever pins the hat and ribbon against one fixed
 * "potted" pose per species, not against each of the five growth sprites — so
 * these offsets are the design's proportions for that pose, scaled. It reads
 * correctly at every stage, but exact placement for every stage × species
 * combination was never drawn, and this approximates it rather than inventing
 * new art.
 */

/** Each species wears its hat at a different height, as a fraction of the frame. */
const HAT_TOP: Record<PlantType, number> = {
  hero: 14 / 190,
  flower: 24 / 190,
  berry: 42 / 190,
  mushroom: 38 / 190,
};

const POT_ASPECT = 80 / 256;
const ACCESSORY_ASPECT = 64 / 96;

export function PlantSprite({
  plantType,
  /** null shows the stage-agnostic "freshly potted" pose used while creating. */
  growthStage,
  potColor,
  hasHat,
  hasRibbon,
  size = 140,
  priority = false,
}: {
  plantType: PlantType;
  growthStage: GrowthStage | null;
  potColor: PotColor;
  hasHat: boolean;
  hasRibbon: boolean;
  size?: number;
  priority?: boolean;
}) {
  const frameHeight = (size * 190) / 180;
  const potWidth = size * 0.933;
  const plantWidth = size * 0.833;
  const ribbonWidth = size * 0.256;
  const hatWidth = size * 0.233;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: frameHeight }}
      role="img"
      aria-label={`${plantType} plant in a ${potColor} pot`}
    >
      <Layer bottom={frameHeight * 0.032} width={potWidth}>
        <PixelSprite name={POT_SPRITES[potColor]} size={potWidth} height={potWidth * POT_ASPECT} />
      </Layer>

      <Layer bottom={frameHeight * 0.084} width={plantWidth}>
        <PixelSprite
          name={growthStage ? plantSprite(plantType, growthStage) : pottedSprite(plantType)}
          size={plantWidth}
          priority={priority}
        />
      </Layer>

      {hasRibbon && (
        <Layer bottom={frameHeight * 0.168} width={ribbonWidth}>
          <PixelSprite
            name="garden-acc-ribbon"
            size={ribbonWidth}
            height={ribbonWidth * ACCESSORY_ASPECT}
          />
        </Layer>
      )}

      {hasHat && (
        <Layer top={frameHeight * HAT_TOP[plantType]} width={hatWidth}>
          <PixelSprite name="garden-acc-hat" size={hatWidth} height={hatWidth * ACCESSORY_ASPECT} />
        </Layer>
      )}
    </div>
  );
}

/** Horizontally centred layer pinned to the top or bottom of the frame. */
function Layer({
  children,
  width,
  top,
  bottom,
}: {
  children: React.ReactNode;
  width: number;
  top?: number;
  bottom?: number;
}) {
  return (
    <div
      className="absolute left-1/2 leading-[0]"
      style={{ width, top, bottom, marginLeft: -width / 2 }}
    >
      {children}
    </div>
  );
}
