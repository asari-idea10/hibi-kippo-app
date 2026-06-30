import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const input = readOption(
  "--input",
  "src/data/calendar-notes/calendar-note-occurrences.sample.json",
);
const outputDir = readOption(
  "--output-dir",
  "src/data/calendar-notes/by-year",
);

const master = JSON.parse(await readFile(input, "utf8"));

await mkdir(outputDir, { recursive: true });

const groups = new Map();

for (const day of master.days) {
  const year = day.date.slice(0, 4);
  const rows = groups.get(year) ?? [];
  rows.push(day);
  groups.set(year, rows);
}

for (const [year, days] of groups) {
  const output = {
    schemaVersion: master.schemaVersion,
    year,
    range: {
      start: days[0]?.date ?? null,
      end: days.at(-1)?.date ?? null,
      count: days.length,
    },
    sourceStatus: master.sourceStatus,
    verificationStatus: master.verificationStatus,
    note: master.note,
    days,
  };

  await writeFile(
    path.join(outputDir, `${year}.json`),
    `${JSON.stringify(output, null, 2)}\n`,
  );
}

console.log(
  `Split calendar note occurrences: ${master.days.length} days -> ${groups.size} yearly files`,
);
