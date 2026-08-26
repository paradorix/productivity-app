"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import { RetroCard } from "@/components/ui/RetroCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function HomePage() {
  const [name, setName] = useState("");

  useEffect(() => {
    db.profile.get("me").then((p) => setName(p?.displayName ?? ""));
  }, []);

  return (
    <div className="p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <ScreenHeader title="home" subtitle={name ? `hello, ${name}` : undefined} />
        <Link
          href="/settings"
          aria-label="Settings"
          className="font-pixel font-bold text-[18px] leading-none text-[var(--text-secondary)] p-2 hover:text-[var(--text-primary)]"
        >
          ⚙
        </Link>
      </div>

      <RetroCard title="today">
        <EmptyState
          title="nothing logged yet!"
          subtitle="Journal, garden, gym and food arrive in the next phases."
        />
      </RetroCard>
    </div>
  );
}
