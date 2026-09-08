import Image from "next/image";
import { assetPath } from "@/lib/assets";

/**
 * Renders one of the bundled pixel PNGs. `data-pixel` switches the browser to
 * nearest-neighbour scaling — without it, every sprite is quietly blurred by
 * the default smooth scaler and the whole aesthetic collapses.
 */
export function PixelSprite({
  name,
  size,
  height,
  alt = "",
  className,
  priority = false,
}: {
  name: string;
  size: number;
  height?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      // `unoptimized` means Next hands this src straight through, base path
      // and all — so the prefix has to be applied here.
      src={assetPath(`/sprites/${name}.png`)}
      alt={alt}
      width={size}
      height={height ?? size}
      data-pixel=""
      unoptimized
      priority={priority}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
