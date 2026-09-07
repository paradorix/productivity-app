"use client";

import { useRef, useState } from "react";
import { downsizeImage } from "@/lib/photo";
import { BlobImage } from "./BlobImage";

/**
 * The photo tile shared by Journal and Food: tap to pick, thumbnail once
 * attached, and a "remove photo" affordance beside it.
 *
 * One photo maximum — picking again replaces rather than appends. The picked
 * file is downsized before it ever reaches the caller, so no screen can
 * accidentally store a 4 MB original.
 */
export function PhotoAttach({
  photo,
  onChange,
  label = "attach a photo",
}: {
  photo: Blob | null;
  onChange: (photo: Blob | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      onChange(await downsizeImage(file));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={photo ? "Replace photo" : "Attach a photo"}
        className="w-[48px] h-[48px] shrink-0 flex items-center justify-center bg-[var(--surface-card)] border-[3px] border-[var(--brown-900)] bevel cursor-pointer disabled:cursor-wait"
      >
        {photo ? (
          <BlobImage blob={photo} alt="Attached photo" size={42} />
        ) : (
          <span aria-hidden className="font-pixel font-bold text-[16px] text-[var(--text-secondary)]">
            +
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {photo ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="font-pixel font-bold uppercase text-[9px] tracking-[0.12em] underline text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          remove photo
        </button>
      ) : (
        <span className="font-body text-[12px] text-[var(--text-secondary)]">
          {busy ? "resizing…" : label}
        </span>
      )}
    </div>
  );
}
