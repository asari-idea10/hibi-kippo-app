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
const outputPath = readOption(
  "--output",
  `data-workbench/calendar-notes/verification-reports/selected-days-${month}.candidate.json`,
);
const calendarMasterPath = readOption(
  "--calendar-master",
  "src/data/calendar-master-rows.1900-2050.json",
);
const samplesPath = readOption(
  "--samples",
  defaultKoyomiReferenceSamplesDir,
);
const lunarDir = readOption("--lunar-dir", "src/data/lunar-calendar/by-year");

const solarMonthNumbersByBranch = {
  寅: 1,
  卯: 2,
  辰: 3,
  巳: 4,
  午: 5,
  未: 6,
  申: 7,
  酉: 8,
  戌: 9,
  亥: 10,
  子: 11,
  丑: 12,
};

const ichiryumanbaibiBranchesBySolarMonth = {
  1: ["丑", "午"],
  2: ["酉", "寅"],
  3: ["子", "卯"],
  4: ["卯", "辰"],
  5: ["巳", "午"],
  6: ["酉", "午"],
  7: ["子", "未"],
  8: ["卯", "申"],
  9: ["午", "酉"],
  10: ["酉", "戌"],
  11: ["亥", "子"],
  12: ["卯", "子"],
};

const sanrinbouBranchBySolarMonth = {
  1: "亥",
  2: "寅",
  3: "午",
  4: "亥",
  5: "寅",
  6: "午",
  7: "亥",
  8: "寅",
  9: "午",
  10: "亥",
  11: "寅",
  12: "午",
};

const fujojuDaysByLunarMonth = {
  1: [3, 11, 19, 27],
  2: [2, 10, 18, 26],
  3: [1, 9, 17, 25],
  4: [4, 12, 20, 28],
  5: [5, 13, 21, 29],
  6: [6, 14, 22, 30],
  7: [3, 11, 19, 27],
  8: [2, 10, 18, 26],
  9: [1, 9, 17, 25],
  10: [4, 12, 20, 28],
  11: [5, 13, 21, 29],
  12: [6, 14, 22, 30],
};

const scopedCodes = ["ichiryumanbaibi", "sanrinbou", "fujoju"];
const legacyFlagByCode = {
  ichiryumanbaibi: "legacyIchiryumanbaibi",
  sanrinbou: "legacySanrinbou",
  fujoju: "legacyFujoju",
};

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function calculateCandidates(row, lunarDay) {
  const solarMonth = solarMonthNumbersByBranch[row.duplicateMonth] ?? null;
  const codes = [];

  if (
    solarMonth &&
    ichiryumanbaibiBranchesBySolarMonth[solarMonth]?.includes(row.duplicateDay)
  ) {
    codes.push("ichiryumanbaibi");
  }

  if (
    solarMonth &&
    sanrinbouBranchBySolarMonth[solarMonth] === row.duplicateDay
  ) {
    codes.push("sanrinbou");
  }

  if (
    lunarDay &&
    !lunarDay.lunar.isLeapMonth &&
    fujojuDaysByLunarMonth[lunarDay.lunar.month]?.includes(lunarDay.lunar.day)
  ) {
    codes.push("fujoju");
  }

  return codes;
}

function compare(candidateCodes, referenceCodes) {
  const referenceScopedCodes = referenceCodes.filter((code) =>
    scopedCodes.includes(code),
  );
  const candidateOnly = candidateCodes.filter(
    (code) => !referenceScopedCodes.includes(code),
  );
  const referenceOnly = referenceScopedCodes.filter(
    (code) => !candidateCodes.includes(code),
  );

  return {
    status:
      candidateOnly.length === 0 && referenceOnly.length === 0
        ? "matched"
        : "mismatched",
    candidateOnly,
    referenceOnly,
  };
}

const [calendarRows, sampleMaster] = await Promise.all([
  readJson(calendarMasterPath),
  readKoyomiReferenceSamples(samplesPath, { month }),
]);
const samplesByDate = new Map(
  sampleMaster.samples.map((sample) => [sample.date, sample]),
);
const year = month.slice(0, 4);
const lunarRows = await readJson(path.join(lunarDir, `${year}.json`));
const lunarByDate = new Map(lunarRows.map((row) => [row.date, row]));
const rows = calendarRows
  .filter((row) => row.date.startsWith(month))
  .sort((a, b) => a.date.localeCompare(b.date));

const days = rows.map((row) => {
  const lunar = lunarByDate.get(row.date) ?? null;
  const sample = samplesByDate.get(row.date) ?? null;
  const candidateCodes = calculateCandidates(row, lunar);
  const legacyCodes = scopedCodes.filter(
    (code) => row[legacyFlagByCode[code]] === "1",
  );
  const referenceCodes = sample?.selectedDayCodes ?? legacyCodes;
  const comparison = compare(candidateCodes, referenceCodes);

  return {
    date: row.date,
    dayPillar: row.dayPillar,
    solarMonthBranch: row.duplicateMonth,
    dayBranch: row.duplicateDay,
    lunar: lunar
      ? {
          month: lunar.lunar.month,
          day: lunar.lunar.day,
          isLeapMonth: lunar.lunar.isLeapMonth,
          rokuyo: lunar.rokuyo.name,
        }
      : null,
    candidateCodes,
    referenceType: sample ? "koyomi_reference_sample" : "legacy_spreadsheet",
    referenceCodes,
    referenceSummary: sample?.summary ?? row.legacySummary ?? null,
    legacySummary: row.legacySummary || null,
    ...comparison,
  };
});

const summary = {
  month,
  total: days.length,
  matched: days.filter((day) => day.status === "matched").length,
  mismatched: days.filter((day) => day.status === "mismatched").length,
  koyomiReferenceSamples: days.filter(
    (day) => day.referenceType === "koyomi_reference_sample",
  ).length,
};

const output = {
  schemaVersion: "selected_day_candidate_report.v0",
  sourcePolicy:
    "こよみページ正本サンプルがある日はそれを参照し、ない日は暫定的にlegacy_spreadsheetと候補計算を比較する。",
  scopedCodes,
  summary,
  days,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(`written: ${outputPath}`);
