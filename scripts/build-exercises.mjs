/**
 * Builds `public/data/exercises.json` — the exercise reference list the gym
 * planner searches.
 *
 * The source is the same trimmed, English-only, media-free dataset the iOS app
 * bundled (originally github.com/hasaneyldrm/exercises-dataset), which lives
 * outside this repo at ~/Vianne/Vianne/Resources/ExerciseData/exercises-en.json.
 *
 * This step exists because that file is 878 KB, and 800 KB of it is coaching
 * instructions this app never shows. The browser screen needs a name, a body
 * part and an equipment type, so that is all that ships — the difference
 * between a list that appears instantly and one that stalls on a phone.
 *
 * Run: node scripts/build-exercises.mjs [path-to-source.json]
 * The output is committed; this only needs re-running if the source changes.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source =
  process.argv[2] ?? join(homedir(), "Vianne/Vianne/Resources/ExerciseData/exercises-en.json");
const outPath = join(projectRoot, "public/data/exercises.json");

const raw = JSON.parse(readFileSync(source, "utf8"));
if (!Array.isArray(raw) || raw.length === 0) {
  throw new Error(`${source} did not contain a non-empty array of exercises`);
}

const seen = new Set();
const trimmed = [];
for (const exercise of raw) {
  const { id, name, bodyPart, equipment } = exercise;
  if (!id || !name || !bodyPart || !equipment) {
    throw new Error(`exercise ${id ?? "(no id)"} is missing a required field`);
  }
  if (seen.has(id)) throw new Error(`duplicate exercise id ${id}`);
  seen.add(id);
  trimmed.push({ id, name, bodyPart, equipment });
}

trimmed.sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(trimmed));

const bytes = JSON.stringify(trimmed).length;
console.log(`wrote ${trimmed.length} exercises to public/data/exercises.json (${Math.round(bytes / 1024)} KB)`);
