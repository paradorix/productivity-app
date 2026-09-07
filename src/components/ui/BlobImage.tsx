"use client";

import { useEffect, useRef } from "react";

/**
 * Displays a photo held in IndexedDB as a Blob.
 *
 * A Blob has no URL until one is minted for it, and a minted URL leaks its
 * backing memory until revoked — so the src is assigned in an effect whose
 * cleanup revokes it. Doing it here, once, means no screen has to remember.
 *
 * `next/image` is deliberately not used: it optimises URLs it can fetch at
 * build or request time, and a `blob:` URL exists only inside this one tab.
 */
export function BlobImage({
  blob,
  alt,
  size,
  className,
}: {
  blob: Blob | null;
  alt: string;
  size: number;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = ref.current;
    if (!image || !blob) return;
    const url = URL.createObjectURL(blob);
    image.src = url;
    return () => {
      image.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (!blob) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob: URLs can't be optimised
    <img
      ref={ref}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "cover" }}
      className={className}
    />
  );
}
