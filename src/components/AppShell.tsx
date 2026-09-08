"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/db";
import { normalizePath } from "@/lib/cn";
import { Onboarding } from "./Onboarding";
import { TabBar } from "./TabBar";

/**
 * The "device" frame plus the onboarding gate.
 *
 * The palette's two surface tokens finally read correctly here: butter is the
 * plastic case the device is moulded from, cream is the screen inside it. On a
 * narrow window the case falls away and the screen fills the viewport.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    db.profile
      .get("me")
      .then((profile) => {
        if (!cancelled) {
          setOnboarded(Boolean(profile));
          setReady(true);
        }
      })
      .catch(() => {
        // A browser with IndexedDB blocked (private mode in some browsers)
        // still gets a usable app — it just can't persist anything.
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing renders until we know whether this browser has been set up, so the
  // user never sees the app flash past before the welcome screen.
  if (!ready) return null;

  // A static host may serve "/settings/" rather than "/settings"; comparing
  // the raw string would then quietly show the tab bar on a screen that hides
  // it deliberately.
  const showTabBar = onboarded && normalizePath(pathname) !== "/settings";

  return (
    <div className="min-h-dvh flex items-center justify-center p-0 sm:p-8">
      <div
        className={
          "w-full sm:max-w-[480px] h-dvh sm:h-[min(760px,100dvh-4rem)] flex flex-col " +
          "bg-[var(--surface-screen)] sm:border-[4px] sm:border-[var(--brown-900)] sm:chunky-lg overflow-hidden"
        }
      >
        {onboarded ? (
          <>
            <main className="flex-1 overflow-y-auto">{children}</main>
            {showTabBar && <TabBar />}
          </>
        ) : (
          <Onboarding onDone={() => setOnboarded(true)} />
        )}
      </div>
    </div>
  );
}
