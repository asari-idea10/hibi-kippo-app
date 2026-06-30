import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultKoyomiReferenceSamplesDir,
  readKoyomiReferenceSamples,
} from "./lib/koyomi-reference-samples.mjs";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const month = readOption("--month", "2021-02");
const samplesPath = readOption(
  "--samples",
  defaultKoyomiReferenceSamplesDir,
);
const occurrenceDir = readOption(
  "--occurrence-dir",
  "src/data/calendar-note-occurrences/by-year",
);
const outputPath = readOption(
  "--output",
  `data-workbench/calendar-notes/verification-reports/koyomi-reference-${month}.alignment.json`,
);

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function normalizeCodes(codes) {
  return [...new Set(codes)].sort();
}

function compareValue(label, appValue, referenceValue) {
  const app = appValue || null;
  const reference = referenceValue || null;

  return {
    label,
    status: app === reference ? "matched" : "mismatched",
    app,
    reference,
  };
}

function compareCodes(appCodes, referenceCodes) {
  const app = normalizeCodes(appCodes);
  const reference = normalizeCodes(referenceCodes);
  const appOnly = app.filter((code) => !reference.includes(code));
  const referenceOnly = reference.filter((code) => !app.includes(code));

  return {
    label: "selectedDayCodes",
    status:
      appOnly.length === 0 && referenceOnly.length === 0
        ? "matched"
        : "mismatched",
    app,
    reference,
    appOnly,
    referenceOnly,
  };
}

const year = month.slice(0, 4);
const [samplesMaster, occurrenceMaster] = await Promise.all([
  readKoyomiReferenceSamples(samplesPath, { month }),
  readJson(path.join(occurrenceDir, `${year}.json`)),
]);

const occurrencesByDate = new Map(
  occurrenceMaster.days.map((day) => [day.date, day]),
);
const samples = samplesMaster.samples.sort((a, b) =>
  a.date.localeCompare(b.date),
);

const days = samples.map((sample) => {
  const occurrence = occurrencesByDate.get(sample.date) ?? null;

  if (!occurrence) {
    return {
      date: sample.date,
      status: "missing_occurrence",
      sample,
    };
  }

  const checks = [
    compareValue("junichoku", occurrence.notes.junichoku, sample.junichoku),
    compareValue(
      "nijuhachishuku",
      occurrence.notes.nijuhachishuku,
      sample.nijuhachishuku,
    ),
    compareValue(
      "nanajushichishuku",
      occurrence.notes.nanajushichishuku,
      sample.nanajushichishuku,
    ),
    compareValue("summary", occurrence.notes.legacySummary, sample.summary),
    compareCodes(occurrence.notes.selectedDayCodes, sample.selectedDayCodes),
  ];

  return {
    date: sample.date,
    status: checks.every((check) => check.status === "matched")
      ? "matched"
      : "mismatched",
    sourceStatus: occurrence.source.verificationStatus,
    checks,
  };
});

const summary = {
  month,
  total: days.length,
  matched: days.filter((day) => day.status === "matched").length,
  mismatched: days.filter((day) => day.status === "mismatched").length,
  missing: days.filter((day) => day.status === "missing_occurrence").length,
};

const output = {
  schemaVersion: "koyomi_reference_alignment_report.v0",
  sourcePolicy:
    "こよみページCSV由来の正本サンプルと、日々吉方の暦注発生マスターを比較する。",
  summary,
  days,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
console.log(`written: ${outputPath}`);
