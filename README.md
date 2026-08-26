# Productivity App

> Working name — this is a placeholder until the real one is decided.

A journal, garden, gym log and food log that runs entirely in your own browser.

## The one design decision everything else follows from

**There is no server and no database.** Your entries are stored in your own
browser using IndexedDB. There is no account to create, no password, nothing
transmitted anywhere, and no operator — including whoever deploys this — who
can read what you write.

That has a real cost, stated plainly rather than buried:

- **Clearing your browser data deletes everything, permanently.**
- Your data does not sync between devices. Your laptop and your phone are
  two separate, unrelated copies.

The mitigation is Settings → **download backup**, which writes a single JSON
file containing everything, photos included. **Restore from a backup** is
available both in Settings and on the welcome screen — because someone who
cleared their browser lands on the welcome screen, and that is exactly when
they need it.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4, with the pixel design tokens as CSS custom properties
- Dexie (IndexedDB) — not `localStorage`, which caps around 5 MB and can't
  hold the photo Blobs attached to entries
- Zod, to validate a backup file *before* any of it is written

Fonts (Press Start 2P, Pixelify Sans, Silkscreen) are self-hosted rather than
loaded from Google Fonts, so the app makes no third-party requests at all.

## Status

Phase 1 (foundation) is built: design system, storage, onboarding, settings,
and backup/restore. Journal, Garden, Gym and Food are placeholder screens and
arrive in later phases.

## Running it

```bash
npm install
npm run dev
```

## Credit

Ported from an offline SwiftUI + SwiftData iOS app; the pixel art, fonts and
colour tokens come from that original design.
