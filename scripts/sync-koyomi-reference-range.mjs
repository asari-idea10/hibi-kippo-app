import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

function hasFlag(name) {
  return args.includes(name);
}

const startYear = Number(readOption("--start-year", "1900"));
const endYear = Number(readOption("--end-year", "2050"));
const jsDir = readOption("--js-dir", "/private/tmp/koyomi8-js");
const months = readOption("--months", "all");
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
const continueOnError = hasFlag("--continue-on-error");

if (
  !Number.isInteger(startYear) ||
  !Number.isInteger(endYear) ||
  startYear < 1 ||
  endYear < startYear
) {
  throw new Error(`invalid year range: ${startYear}-${endYear}`);
}

function runYear(year) {
  return spawnSync(
    "node",
    [
      "scripts/sync-koyomi-reference-year.mjs",
      "--year",
      String(year),
      "--months",
      months,
      "--js-dir",
      jsDir,
      "--fixture-dir",
      fixtureDir,
      "--calendar-master",
      calendarMasterPath,
      "--occurrence-dir",
      occurrenceDir,
      "--samples-dir",
      samplesDir,
    ],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 50,
    },
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function summarizeYear(year) {
  const [samples, occurrences] = await Promise.all([
    readJson(path.join(samplesDir, `${year}.json`)),
    readJson(path.join(occurrenceDir, `${year}.json`)),
  ]);

  return {
    year,
    samples: samples.samples?.length ?? 0,
    occurrences: occurrences.days?.length ?? 0,
    start: samples.range?.start ?? null,
    end: samples.range?.end ?? null,
  };
}

const results = [];
const errors = [];

for (let year = startYear; year <= endYear; year += 1) {
  const startedAt = Date.now();
  const result = runYear(year);
  const elapsedMs = Date.now() - startedAt;

  if (result.status !== 0) {
    const error = {
      year,
      status: "failed",
      elapsedMs,
      stderr: result.stderr,
      stdoutTail: result.stdout?.slice(-4000) ?? "",
    };
    errors.push(error);
    console.error(JSON.stringify(error, null, 2));

    if (!continueOnError) {
      process.exit(result.status ?? 1);
    }

    continue;
  }

  const summary = await summarizeYear(year);
  const output = {
    ...summary,
    status: "synced",
    elapsedMs,
  };
  results.push(output);
  console.log(JSON.stringify(output));
}

const total = {
  startYear,
  endYear,
  years: results.length,
  failed: errors.length,
  samples: results.reduce((sum, result) => sum + result.samples, 0),
  occurrences: results.reduce((sum, result) => sum + result.occurrences, 0),
  status: errors.length === 0 ? "synced" : "completed_with_errors",
};

console.log(JSON.stringify(total, null, 2));

if (errors.length > 0) {
  process.exit(1);
}
