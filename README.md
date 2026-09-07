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

## What's in it

- **Journal** — one entry per calendar day, with a mood and an optional photo.
  A month calendar marks the days you wrote. Today is always editable; a past
  day you already wrote opens read-only; a past day you missed stays editable
  so you can still fill it in. Future days are locked.
- **Garden** — one plant that grows on the days you logged something. It only
  ever grows: there is no wilting, no decay, and no penalty for a gap. Skipping
  is just skipping.
- **Gym** — a weekly plan built from a searchable list of ~1,300 exercises, and
  a tracker that logs what you actually did against what you'd planned. Any
  exercise name is accepted, whether the list knows it or not.
- **Food** — what you ate, in your own words. No calories, no macros, no
  scoring.

Photos are downsized to a 480px thumbnail before being stored, so a year of
them still fits in a backup file you can email yourself.

## Status

All five phases are built. Phase 1 was the foundation (design system, storage,
onboarding, settings, backup/restore); phases 2–5 are the four screens above.

Still undecided, and deliberately not built: what brings someone back once
nothing punishes absence. Milestone unlocks and random events are one option,
"the garden is simply a record of what you did" is another. The growth engine
today is the gentle version — it counts days and ratchets forward, nothing
more.

## Running it

```bash
npm install
npm run dev
```

The exercise list in `public/data/exercises.json` is generated and committed;
`node scripts/build-exercises.mjs` regenerates it and explains where it
comes from.

## Credit

Ported from an offline SwiftUI + SwiftData iOS app; the pixel art, fonts and
colour tokens come from that original design.
