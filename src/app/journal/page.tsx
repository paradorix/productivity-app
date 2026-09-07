"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { JournalCalendar } from "@/components/journal/JournalCalendar";
import { BlobImage } from "@/components/ui/BlobImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { MoodFace } from "@/components/ui/MoodFace";
import { PhotoAttach } from "@/components/ui/PhotoAttach";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroChip } from "@/components/ui/RetroChip";
import { RetroTextArea } from "@/components/ui/RetroTextField";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { db } from "@/lib/db";
import { formatDay, isToday, shiftMonth } from "@/lib/dates";
import { MOODS, newId, toDayKey, type JournalEntry, type Mood } from "@/lib/types";

/**
 * One entry per calendar day.
 *
 * Days behave differently depending on where they sit relative to today:
 * today is always editable, a past day with an entry opens read-only, and a
 * past day you missed stays editable so you can still fill it in. Future days
 * are locked in the calendar and can't be selected at all.
 */
export default function JournalPage() {
  const today = toDayKey();
  const [viewMonth, setViewMonth] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today);
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null);

  const entries = useLiveQuery(() => db.journal.orderBy("day").reverse().toArray(), [], []);

  const entryDays = new Set(entries.map((entry) => entry.day));
  const selectedEntry = entries.find((entry) => entry.day === selectedDay) ?? null;
  const viewOnly = selectedEntry !== null && !isToday(selectedDay);
  const filtered = moodFilter ? entries.filter((entry) => entry.mood === moodFilter) : entries;

  function openEntry(day: string) {
    setSelectedDay(day);
    setViewMonth(day);
  }

  return (
    <div className="p-4 flex flex-col gap-3 pb-8">
      <ScreenHeader
        title="daily journal"
        subtitle="everything you're feeling, one page at a time."
      />

      <RetroCard title="calendar" padding={12}>
        <JournalCalendar
          viewMonth={viewMonth}
          selectedDay={selectedDay}
          entryDays={entryDays}
          onSelect={setSelectedDay}
          onShiftMonth={(delta) => setViewMonth(shiftMonth(viewMonth, delta))}
        />
      </RetroCard>

      <RetroCard title={isToday(selectedDay) ? "today" : formatDay(selectedDay)} padding={14}>
        {viewOnly ? (
          <ReadOnlyEntry entry={selectedEntry} />
        ) : (
          // Remounting on the day — and on the saved entry's timestamp — is
          // what loads the right draft into the editor. The alternative,
          // syncing state from an effect, would fight the user's typing.
          <EntryEditor
            key={`${selectedDay}:${selectedEntry?.updatedAt ?? "new"}`}
            day={selectedDay}
            entry={selectedEntry}
          />
        )}
      </RetroCard>

      <h2 className="font-display text-[15px] text-[var(--text-primary)] mt-1">past entries</h2>

      {entries.length > 0 && (
        <div className="flex gap-[6px]">
          {MOODS.map((mood) => (
            <RetroChip
              key={mood}
              selected={moodFilter === mood}
              label={`Filter by ${mood}`}
              onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
              className="flex-1 flex items-center justify-center py-[6px]"
            >
              <MoodFace mood={mood} cell={2} />
            </RetroChip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={entries.length === 0 ? "nothing logged yet!" : "no entries with that mood"}
          subtitle={
            entries.length === 0
              ? "write your first entry above."
              : "try a different mood filter."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => (
            <PastEntryRow
              key={entry.id}
              entry={entry}
              selected={entry.day === selectedDay}
              onOpen={() => openEntry(entry.day)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryEditor({ day, entry }: { day: string; entry: JournalEntry | null }) {
  const [text, setText] = useState(entry?.text ?? "");
  const [mood, setMood] = useState<Mood | null>(entry?.mood ?? null);
  const [photo, setPhoto] = useState<Blob | null>(entry?.photo ?? null);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (entry) {
        await db.journal.update(entry.id, { text: trimmed, mood, photo, updatedAt: now });
      } else {
        await db.journal.add({
          id: newId(),
          day,
          text: trimmed,
          mood,
          photo,
          createdAt: now,
          updatedAt: now,
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <FieldLabel>{timestampLabel(day)}</FieldLabel>

      <RetroTextArea
        value={text}
        placeholder="how was today?"
        aria-label="Entry text"
        onChange={(event) => setText(event.target.value)}
      />

      <div className="flex flex-col gap-[6px]">
        <FieldLabel>MOOD</FieldLabel>
        <div className="flex gap-[6px]">
          {MOODS.map((option) => (
            <RetroChip
              key={option}
              selected={mood === option}
              label={option}
              onClick={() => setMood(mood === option ? null : option)}
              className="flex-1 flex items-center justify-center py-3"
            >
              <MoodFace mood={option} cell={3} />
            </RetroChip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <FieldLabel>PHOTO</FieldLabel>
        <PhotoAttach photo={photo} onChange={setPhoto} />
      </div>

      <RetroButton
        variant="accent"
        fullWidth
        disabled={!text.trim() || saving}
        onClick={() => void save()}
      >
        {entry ? "update entry" : "save entry"}
      </RetroButton>
    </div>
  );
}

function ReadOnlyEntry({ entry }: { entry: JournalEntry }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <FieldLabel>{`${timestampLabel(entry.day)} · VIEW ONLY`}</FieldLabel>

      <p className="font-body text-[14px] leading-[1.6] text-[var(--text-primary)] whitespace-pre-wrap p-[14px] bg-[var(--surface-screen)] border-2 border-[var(--border-subtle)] bevel">
        {entry.text}
      </p>

      {entry.mood && (
        <div className="flex flex-col gap-[6px]">
          <FieldLabel>MOOD</FieldLabel>
          <div className="self-start p-[10px] bg-[var(--butter-400)] border-2 border-[var(--brown-900)] bevel-pressed">
            <MoodFace mood={entry.mood} cell={3} label={entry.mood} />
          </div>
        </div>
      )}

      {entry.photo && (
        <div className="flex flex-col gap-[6px]">
          <FieldLabel>PHOTO</FieldLabel>
          <div className="self-start border-2 border-[var(--brown-900)] leading-[0]">
            <BlobImage blob={entry.photo} alt="Photo attached to this entry" size={72} />
          </div>
        </div>
      )}
    </div>
  );
}

function PastEntryRow({
  entry,
  selected,
  onOpen,
}: {
  entry: JournalEntry;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <RetroCard padding={0} accent={selected}>
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-start gap-[10px] text-left px-3 py-[10px] cursor-pointer"
      >
        <span className="pt-[2px] shrink-0">
          <MoodFace mood={entry.mood ?? "okay"} cell={3} />
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
          <span className="font-pixel text-[9px] tracking-[0.12em] uppercase text-[var(--text-muted)]">
            {formatDay(entry.day)}
          </span>
          <span className="font-body text-[13px] text-[var(--text-secondary)] line-clamp-2">
            {entry.text}
          </span>
        </span>
        {entry.photo && (
          <span className="shrink-0 border-2 border-[var(--brown-900)] leading-[0]">
            <BlobImage blob={entry.photo} alt="" size={34} />
          </span>
        )}
      </button>
    </RetroCard>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="font-pixel text-[9px] tracking-[0.12em] uppercase text-[var(--text-muted)]">
      {children}
    </span>
  );
}

function timestampLabel(day: string): string {
  const label = formatDay(day).toUpperCase();
  if (!isToday(day)) return label;
  const time = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${label} · ${time.toUpperCase()}`;
}
