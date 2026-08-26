"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BackupError, downloadBackup, restoreBackup } from "@/lib/backup";
import { db, wipeAll } from "@/lib/db";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroTextField } from "@/components/ui/RetroTextField";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

type Status = { kind: "ok" | "error"; message: string } | null;

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [confirmImport, setConfirmImport] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.profile.get("me").then((p) => {
      setName(p?.displayName ?? "");
      setLastBackup(p?.lastBackupAt ?? null);
    });
  }, []);

  async function saveName(next: string) {
    setName(next);
    const trimmed = next.trim();
    if (trimmed) await db.profile.update("me", { displayName: trimmed });
  }

  async function handleExport() {
    setBusy(true);
    setStatus(null);
    try {
      await downloadBackup();
      const p = await db.profile.get("me");
      setLastBackup(p?.lastBackupAt ?? null);
      setStatus({ kind: "ok", message: "Backup downloaded. Keep it somewhere safe." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't build the backup file." });
    } finally {
      setBusy(false);
    }
  }

  // Import replaces everything, so the file is read and held until the user
  // confirms — never applied straight off the file picker.
  async function handleFilePicked(file: File) {
    try {
      setConfirmImport(await file.text());
      setStatus(null);
    } catch {
      setStatus({ kind: "error", message: "Couldn't read that file." });
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function applyImport() {
    if (!confirmImport) return;
    setBusy(true);
    try {
      const { counts } = await restoreBackup(confirmImport);
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      setConfirmImport(null);
      const p = await db.profile.get("me");
      setName(p?.displayName ?? "");
      setLastBackup(p?.lastBackupAt ?? null);
      setStatus({ kind: "ok", message: `Restored ${total} item${total === 1 ? "" : "s"}.` });
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof BackupError ? error.message : "Something went wrong restoring that file.",
      });
      setConfirmImport(null);
    } finally {
      setBusy(false);
    }
  }

  async function applyWipe() {
    setBusy(true);
    try {
      await wipeAll();
      // A hard reload, deliberately: the shell caches whether a profile exists
      // in React state, and a client-side route change wouldn't remount it —
      // the user would land on a logged-in-looking app with no data behind it.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-5 flex flex-col gap-5 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="font-pixel font-bold text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ←
        </Link>
        <ScreenHeader title="settings" titleSize={18} />
      </div>

      <RetroCard title="your name">
        <RetroTextField
          value={name}
          maxLength={40}
          aria-label="Your name"
          onChange={(e) => void saveName(e.target.value)}
        />
      </RetroCard>

      <RetroCard title="your data">
        <div className="flex flex-col gap-4">
          <p className="font-body text-[13px] leading-[1.6] text-[var(--text-secondary)]">
            Everything lives in this browser on this computer. That means no one else
            can read it — and also that <strong>clearing your browser data deletes it
            permanently</strong>. Download a backup now and then.
          </p>

          <div className="flex flex-col gap-2">
            <RetroButton fullWidth onClick={() => void handleExport()} disabled={busy}>
              download backup
            </RetroButton>
            <p className="font-body text-[12px] text-[var(--text-muted)]">
              {lastBackup
                ? `Last backup: ${new Date(lastBackup).toLocaleDateString()}`
                : "You haven't backed up yet."}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t-2 border-[var(--border-subtle)]">
            <RetroButton
              variant="secondary"
              fullWidth
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              restore from backup
            </RetroButton>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFilePicked(file);
              }}
            />
            {confirmImport && (
              <div className="border-[3px] border-[var(--accent-primary)] p-3 flex flex-col gap-3">
                <p className="font-body text-[13px] leading-[1.6] text-[var(--text-primary)]">
                  Restoring replaces everything currently in this browser with the
                  contents of that file. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <RetroButton variant="accent" size="sm" onClick={() => void applyImport()} disabled={busy}>
                    replace everything
                  </RetroButton>
                  <RetroButton variant="secondary" size="sm" onClick={() => setConfirmImport(null)}>
                    cancel
                  </RetroButton>
                </div>
              </div>
            )}
          </div>

          {status && (
            <p
              role="status"
              className="font-body text-[13px] leading-[1.5]"
              style={{
                color: status.kind === "ok" ? "var(--status-positive)" : "var(--accent-primary)",
              }}
            >
              {status.message}
            </p>
          )}
        </div>
      </RetroCard>

      <RetroCard title="danger zone" accent>
        <div className="flex flex-col gap-3">
          <p className="font-body text-[13px] leading-[1.6] text-[var(--text-secondary)]">
            Delete everything and start over.
          </p>
          {confirmWipe ? (
            <div className="flex flex-col gap-3">
              <p className="font-body text-[13px] text-[var(--text-primary)]">
                Really delete everything? Download a backup first if you might want it back.
              </p>
              <div className="flex gap-2">
                <RetroButton variant="accent" size="sm" onClick={() => void applyWipe()} disabled={busy}>
                  delete it all
                </RetroButton>
                <RetroButton variant="secondary" size="sm" onClick={() => setConfirmWipe(false)}>
                  cancel
                </RetroButton>
              </div>
            </div>
          ) : (
            <RetroButton variant="secondary" fullWidth onClick={() => setConfirmWipe(true)} disabled={busy}>
              delete all my data
            </RetroButton>
          )}
        </div>
      </RetroCard>
    </div>
  );
}
