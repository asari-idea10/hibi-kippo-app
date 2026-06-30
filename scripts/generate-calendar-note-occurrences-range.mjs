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

function hasOption(name) {
  return args.includes(name);
}

const calendarMasterPath = readOption(
  "--calendar-master",
  "src/data/calendar-master-rows.sample.json",
);
const policyPath = readOption(
  "--policy",
  "src/data/calendar-notes/generation-input-policy.v0.json",
);
const referencesPath = readOption(
  "--references",
  defaultKoyomiReferenceSamplesDir,
);
const outputPath = readOption("--output", null);
const outputDir = readOption("--output-dir", null);
const startDate = readOption("--start-date", null);
const endDate = readOption("--end-date", null);
const startYear = readOption("--start-year", null);
const endYear = readOption("--end-year", null);
const splitByYear = hasOption("--split-by-year") || Boolean(outputDir);

if (!outputPath && !outputDir) {
  console.error(
    "Usage: npm run data:calendar-notes:generate-range -- --calendar-master <rows.json> (--output <file.json> | --output-dir <dir>) [--start-date YYYY-MM-DD --end-date YYYY-MM-DD] [--start-year YYYY --end-year YYYY] [--split-by-year]",
  );
  process.exit(1);
}

const rows = JSON.parse(await readFile(calendarMasterPath, "utf8"));
const policy = JSON.parse(await readFile(policyPath, "utf8"));
const referenceSamples = await readKoyomiReferenceSamples(referencesPath);

const selectedDayFlags = [
  ["legacyTenshaBi", "tensha_bi"],
  ["legacyIchiryumanbaibi", "ichiryumanbaibi"],
  ["legacyTenichiTenjo", "tenichi_tenjo"],
  ["legacyFujoju", "fujoju"],
  ["legacySanrinbou", "sanrinbou"],
  ["legacyJippoGure", "jippo_gure"],
  ["legacyHassen", "hassen"],
  ["legacyRoujitsu", "roujitsu"],
  ["legacyKasshi", "kasshi"],
  ["legacyKoushin", "koushin"],
  ["legacyShinnyu", "shinnyu"],
  ["legacyTsuchinotoMi", "tsuchinoto_mi"],
];

const externalCalendarNoteReferences = Object.fromEntries(
  (referenceSamples.samples ?? []).map((sample) => [
    sample.date,
    {
      sourceName:
        sample.sourceStatus === "golden_reference"
          ? "こよみのページ 暦注計算CSV"
          : "こよみのページ 暦注計算",
      summary: sample.summary,
      selectedDayCodes: sample.selectedDayCodes ?? [],
      overrideSelectedDayCodes: sample.sourceStatus === "golden_reference",
      junichoku: sample.junichoku,
      nijuhachishuku: sample.nijuhachishuku,
      nanajushichishuku: sample.nanajushichishuku,
    },
  ]),
);

const branches = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

const junichokuOrder = [
  "建",
  "除",
  "満",
  "平",
  "定",
  "執",
  "破",
  "危",
  "成",
  "納",
  "開",
  "閉",
];

const nijuhachishukuOrder = [
  "角",
  "亢",
  "氐",
  "房",
  "心",
  "尾",
  "箕",
  "斗",
  "牛",
  "女",
  "虚",
  "危",
  "室",
  "壁",
  "奎",
  "婁",
  "胃",
  "昴",
  "畢",
  "觜",
  "参",
  "井",
  "鬼",
  "柳",
  "星",
  "張",
  "翼",
  "軫",
];

function dateToUtcIndex(date) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function calculateJunichoku(monthBranch, dayBranch) {
  const monthIndex = branches.indexOf(monthBranch);
  const dayIndex = branches.indexOf(dayBranch);

  if (monthIndex === -1 || dayIndex === -1) {
    return null;
  }

  return junichokuOrder[(dayIndex - monthIndex + 12) % 12];
}

function calculateNijuhachishuku(date) {
  const referenceIndex = dateToUtcIndex("2026-05-28");
  const targetIndex = dateToUtcIndex(date);
  const orderIndex =
    ((targetIndex - referenceIndex) % nijuhachishukuOrder.length +
      nijuhachishukuOrder.length) %
    nijuhachishukuOrder.length;

  return nijuhachishukuOrder[orderIndex];
}

function unique(values) {
  return [...new Set(values)];
}

function normalizeNijuhachishuku(name) {
  return name === "氏" ? "氐" : name;
}

function isInRange(row) {
  if (startDate && row.date < startDate) {
    return false;
  }

  if (endDate && row.date > endDate) {
    return false;
  }

  const year = row.date.slice(0, 4);

  if (startYear && year < startYear) {
    return false;
  }

  if (endYear && year > endYear) {
    return false;
  }

  return true;
}

function toOccurrenceDay(row) {
  const externalReference = externalCalendarNoteReferences[row.date] ?? null;
  const legacySelectedDayCodes = selectedDayFlags
    .filter(([flag]) => row[flag] === "1")
    .map(([, code]) => code);
  const externalSelectedDayCodes = externalReference?.selectedDayCodes ?? [];
  const selectedDayCodes = externalReference?.overrideSelectedDayCodes
    ? externalSelectedDayCodes
    : unique([...legacySelectedDayCodes, ...externalSelectedDayCodes]);
  const calculatedJunichoku = calculateJunichoku(
    row.duplicateMonth,
    row.duplicateDay,
  );
  const calculatedNijuhachishuku = calculateNijuhachishuku(row.date);
  const legacyNijuhachishuku = normalizeNijuhachishuku(
    row.legacyNijuhachishuku,
  );
  const junichoku =
    externalReference?.junichoku || row.legacyJunichoku || calculatedJunichoku;
  const nijuhachishuku =
    externalReference?.nijuhachishuku ||
    legacyNijuhachishuku ||
    calculatedNijuhachishuku;
  const nanajushichishuku = externalReference?.nanajushichishuku ?? null;
  const diffs = [
    !externalReference?.junichoku &&
    row.legacyJunichoku &&
    calculatedJunichoku &&
    row.legacyJunichoku !== calculatedJunichoku
      ? `junichoku: spreadsheet=${row.legacyJunichoku} / calculated=${calculatedJunichoku}`
      : null,
    !externalReference?.nijuhachishuku &&
    legacyNijuhachishuku &&
    calculatedNijuhachishuku &&
    legacyNijuhachishuku !== calculatedNijuhachishuku
      ? `nijuhachishuku: spreadsheet=${legacyNijuhachishuku} / calculated=${calculatedNijuhachishuku}`
      : null,
  ].filter(Boolean);
  const usedCalculated =
    !row.legacyJunichoku ||
    !row.legacyNijuhachishuku ||
    externalSelectedDayCodes.length > 0 ||
    Boolean(externalReference?.junichoku) ||
    Boolean(externalReference?.nijuhachishuku);

  return {
    date: row.date,
    source: {
      workbook: "★フォーチューンマイレージマスタ",
      sheet: "年月日",
      row: row.row,
      sourceStatus: usedCalculated ? "hybrid_v0" : "legacy_spreadsheet",
      verificationStatus:
        externalReference
          ? "external_reference_checked"
          : usedCalculated
            ? "rule_checked_v0"
            : "legacy_spreadsheet",
    },
    notes: {
      junichoku,
      nijuhachishuku,
      nanajushichishuku,
      selectedDayCodes,
      doyo: {
        isDoyo: row.doyoFlag !== "",
        label: row.doyoLabel || null,
        isManichi: false,
        doyoSatsuDirection: null,
      },
      legacySummary: externalReference?.summary || row.legacySummary || null,
      reference: externalReference
        ? {
            sourceName: externalReference.sourceName,
            overrideSelectedDayCodes:
              externalReference.overrideSelectedDayCodes ?? false,
          }
        : null,
    },
    rawFlags: Object.fromEntries(
      [
        ...selectedDayFlags.map(([flag, code]) => [code, row[flag] === "1"]),
        ...externalSelectedDayCodes.map((code) => [code, true]),
      ],
    ),
    diffs,
  };
}

function buildMaster(days) {
  return {
    schemaVersion: policy.output.schemaVersion,
    range: {
      start: days[0]?.date ?? null,
      end: days.at(-1)?.date ?? null,
      count: days.length,
    },
    sourceStatus: "hybrid_v0",
    verificationStatus: "rule_checked_v0",
    note:
      "暦注発生マスター。十二直・二十八宿はスプシ値を優先し、空欄は計算ルールで補完する。主要選日はスプシフラグと外部参照メモを統合する。",
    days,
  };
}

function groupByYear(days) {
  const groups = new Map();

  for (const day of days) {
    const year = day.date.slice(0, 4);
    const group = groups.get(year) ?? [];
    group.push(day);
    groups.set(year, group);
  }

  return groups;
}

const days = rows
  .filter(isInRange)
  .sort((a, b) => a.date.localeCompare(b.date))
  .map(toOccurrenceDay);

if (splitByYear) {
  await mkdir(outputDir, { recursive: true });
  const groups = groupByYear(days);

  for (const [year, yearDays] of groups) {
    const master = buildMaster(yearDays);
    const output = {
      ...master,
      year,
    };

    await writeFile(
      path.join(outputDir, `${year}.json`),
      `${JSON.stringify(output, null, 2)}\n`,
    );
  }

  console.log(
    `${days.length} calendar note occurrence rows split into ${groups.size} yearly files at ${outputDir}`,
  );
} else {
  const output = buildMaster(days);
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `${days.length} calendar note occurrence rows written to ${outputPath}`,
  );
}
