"use client";

import { useRef, useState } from "react";
import { BackupError, restoreBackup } from "@/lib/backup";
import { db } from "@/lib/db";
import { PixelSprite } from "./ui/PixelSprite";
import { RetroButton } from "./ui/RetroButton";
import { RetroTextField } from "./ui/RetroTextField";

/**
 * Welcome → name → done, plus a restore path.
 *
 * The restore option has to live *here*, not only in Settings. Someone who
 * clears their browser data loses their profile, which drops them back onto
 * this screen — and Settings is unreachable without a profile. Hiding restore
 * behind the tab bar would mean the recovery feature is locked away in
 * exactly the situation it exists for.
 *
 * There is no account and no password, because there is no server to hold
 * one. The name is a label stored in this browser, and the copy says so
 * rather than implying a sign-up that doesn't exist.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function finish() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await db.profile.put({
        id: "me",
        displayName: trimmed,
        onboardedAt: new Date().toISOString(),
        lastBackupAt: null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore(file: File) {
    setRestoreError(null);
    setSaving(true);
    try {
      await restoreBackup(await file.text());
      // A backup without a profile would leave the app stuck on this screen.
      const profile = await db.profile.get("me");
      if (!profile) {
        await db.profile.put({
          id: "me",
          displayName: "friend",
          onboardedAt: new Date().toISOString(),
          lastBackupAt: null,
        });
      }
      onDone();
    } catch (error) {
      setRestoreError(
        error instanceof BackupError ? error.message : "Couldn't read that backup file.",
      );
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <PixelSprite name="glyph-seedling" size={64} priority />

      {step === "welcome" ? (
        <>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-[20px] leading-[1.4] text-[var(--text-primary)]">
              productivity app
            </h1>
            <p className="font-body text-[15px] text-[var(--text-secondary)]">
              a cozy little world for your days
            </p>
          </div>

          <RetroButton size="lg" onClick={() => setStep("name")}>
            get started
          </RetroButton>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={saving}
              className="font-pixel font-bold uppercase text-[10px] tracking-[0.12em] underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? "restoring…" : "restore from a backup"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleRestore(file);
              }}
            />
            {restoreError && (
              <p role="alert" className="font-body text-[12px] text-[var(--accent-primary)] max-w-[280px]">
                {restoreError}
              </p>
            )}
          </div>

          <p className="font-body text-[12px] text-[var(--text-muted)] max-w-[280px] leading-[1.6]">
            Everything you write stays on this computer, in this browser. There is
            no account and no server — nobody else can read it, including us.
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[16px] leading-[1.4] text-[var(--text-primary)]">
              what should we call you?
            </h2>
            <p className="font-body text-[13px] text-[var(--text-muted)]">
              just a name for your own screen — no email, no password
            </p>
          </div>
          <form
            className="w-full max-w-[300px] flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void finish();
            }}
          >
            <RetroTextField
              autoFocus
              value={name}
              maxLength={40}
              placeholder="your name"
              aria-label="Your name"
              onChange={(e) => setName(e.target.value)}
            />
            <RetroButton type="submit" size="lg" fullWidth disabled={!name.trim() || saving}>
              {saving ? "saving…" : "start"}
            </RetroButton>
          </form>
        </>
      )}
    </div>
  );
}
