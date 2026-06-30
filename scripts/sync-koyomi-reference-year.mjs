import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

function parseMonths(value) {
  if (!value || value === "all") {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  }

  if (/^\d{1,2}-\d{1,2}$/.test(value)) {
    const [start, end] = value.split("-").map(Number);
    if (start < 1 || end > 12 || start > end) {
      throw new Error(`invalid --months: ${value}`);
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  return value.split(",").map((monthText) => {
    const month = Number(monthText);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error(`invalid month: ${monthText}`);
    }
    return month;
  });
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

const year = readOption("--year");
const jsDir = readOption("--js-dir", "/private/tmp/koyomi8-js");
const months = parseMonths(readOption("--months", "all"));
const fixtureDir = readOption(
  "--fixture-dir",
  "data-workbench/calendar-notes/fixtures",
);
const calendarMasterPath = readOption(
  "--calendar-master",
  "src/data/calendar-master-rows.1900-2050.json",
);
const occurrenceDir = readOption(
  "--occurrence-dir",
  "src/data/calendar-note-occurrences/by-year",
);
const samplesDir = readOption(
  "--samples-dir",
  "src/data/calendar-notes/koyomi-reference-samples/by-year",
);

if (!year) {
  console.error(
    "usage: node scripts/sync-koyomi-reference-year.mjs --year 2021 [--months all|1-3|1,2,3]",
  );
  process.exit(1);
}

await mkdir(fixtureDir, { recursive: true });

for (const month of months) {
  const monthText = String(month).padStart(2, "0");
  const csvPath = path.join(
    fixtureDir,
    `koyomi-reference-${year}-${monthText}.csv`,
  );

  run("node", [
    "scripts/generate-koyomi-reference-csv-from-js.mjs",
    "--year",
    year,
    "--month",
    String(month),
    "--js-dir",
    jsDir,
    "--output",
    csvPath,
  ]);

  run("node", [
    "scripts/import-koyomi-reference-csv.mjs",
    "--year",
    year,
    "--input",
    csvPath,
    "--month",
    String(month),
    "--output-dir",
    samplesDir,
  ]);
}

run("node", [
  "scripts/generate-calendar-note-occurrences-range.mjs",
  "--calendar-master",
  calendarMasterPath,
  "--output-dir",
  occurrenceDir,
  "--start-year",
  year,
  "--end-year",
  year,
  "--split-by-year",
  "--references",
  samplesDir,
]);

for (const month of months) {
  const monthText = String(month).padStart(2, "0");
  run("node", [
    "scripts/compare-koyomi-reference-samples.mjs",
    "--month",
    `${year}-${monthText}`,
    "--samples",
    samplesDir,
  ]);
}

console.log(
  JSON.stringify(
    {
      year,
      months,
      fixtureDir,
      occurrenceDir,
      samplesDir,
      status: "synced",
    },
    null,
    2,
  ),
);
