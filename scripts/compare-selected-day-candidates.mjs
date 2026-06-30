import { readFile } from "node:fs/promises";
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

const samplesPath = readOption(
  "--samples",
  defaultKoyomiReferenceSamplesDir,
);
const calendarMasterPath = readOption(
  "--calendar-master",
  "src/data/calendar-master-rows.1900-2050.json",
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

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function getLunarDay(date) {
  const year = date.slice(0, 4);
  const rows = await readJson(path.join(lunarDir, `${year}.json`));
  return rows.find((row) => row.date === date) ?? null;
}

function calculateCandidates(row, lunarDay) {
  const solarMonth = solarMonthNumbersByBranch[row.duplicateMonth] ?? null;
  const ichiryumanbaibiBranches = solarMonth
    ? ichiryumanbaibiBranchesBySolarMonth[solarMonth]
    : [];
  const sanrinbouBranch = solarMonth
    ? sanrinbouBranchBySolarMonth[solarMonth]
    : null;
  const fujojuDays = lunarDay?.lunar.month
    ? fujojuDaysByLunarMonth[lunarDay.lunar.month]
    : [];

  return [
    ichiryumanbaibiBranches.includes(row.duplicateDay)
      ? "ichiryumanbaibi"
      : null,
    sanrinbouBranch === row.duplicateDay ? "sanrinbou" : null,
    lunarDay &&
    !lunarDay.lunar.isLeapMonth &&
    fujojuDays.includes(lunarDay.lunar.day)
      ? "fujoju"
      : null,
  ].filter(Boolean);
}

function compareArrays(candidateCodes, referenceCodes) {
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
    candidateCodes,
    referenceScopedCodes,
    candidateOnly,
    referenceOnly,
  };
}

const [samplesMaster, calendarRows] = await Promise.all([
  readKoyomiReferenceSamples(samplesPath),
  readJson(calendarMasterPath),
]);

const rowsByDate = new Map(calendarRows.map((row) => [row.date, row]));
const results = [];

for (const sample of samplesMaster.samples) {
  const row = rowsByDate.get(sample.date);

  if (!row) {
    results.push({
      date: sample.date,
      status: "missing_calendar_master_row",
      sample,
    });
    continue;
  }

  const lunarDay = await getLunarDay(sample.date);
  const candidateCodes = calculateCandidates(row, lunarDay);
  const comparison = compareArrays(candidateCodes, sample.selectedDayCodes);

  results.push({
    date: sample.date,
    status: comparison.status,
    dayPillar: row.dayPillar,
    solarMonthBranch: row.duplicateMonth,
    dayBranch: row.duplicateDay,
    lunar: lunarDay
      ? {
          month: lunarDay.lunar.month,
          day: lunarDay.lunar.day,
          isLeapMonth: lunarDay.lunar.isLeapMonth,
        }
      : null,
    referenceSummary: sample.summary,
    ...comparison,
  });
}

const summary = {
  total: results.length,
  matched: results.filter((result) => result.status === "matched").length,
  mismatched: results.filter((result) => result.status === "mismatched").length,
  missing: results.filter((result) =>
    result.status.startsWith("missing_"),
  ).length,
};

console.log(JSON.stringify({ summary, results }, null, 2));
