import fs from "node:fs";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error(
    "Usage: node scripts/generate-calendar-note-occurrences.mjs <calendar-master-rows.json> <output.json>",
  );
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(inputPath, "utf8"));

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

function normalizeNijuhachishuku(name) {
  return name === "氏" ? "氐" : name;
}

const days = rows.map((row) => {
  const selectedDayCodes = selectedDayFlags
    .filter(([flag]) => row[flag] === "1")
    .map(([, code]) => code);
  const calculatedJunichoku = calculateJunichoku(
    row.duplicateMonth,
    row.duplicateDay,
  );
  const calculatedNijuhachishuku = calculateNijuhachishuku(row.date);
  const legacyNijuhachishuku = normalizeNijuhachishuku(
    row.legacyNijuhachishuku,
  );
  const junichoku = row.legacyJunichoku || calculatedJunichoku;
  const nijuhachishuku = legacyNijuhachishuku || calculatedNijuhachishuku;
  const usedCalculated = !row.legacyJunichoku || !legacyNijuhachishuku;

  return {
    date: row.date,
    source: {
      workbook: "★フォーチューンマイレージマスタ",
      sheet: "年月日",
      row: row.row,
      sourceStatus: usedCalculated ? "hybrid_v0" : "legacy_spreadsheet",
      verificationStatus: usedCalculated ? "rule_checked_v0" : "legacy_spreadsheet",
    },
    notes: {
      junichoku,
      nijuhachishuku,
      nanajushichishuku: null,
      selectedDayCodes,
      doyo: {
        isDoyo: row.doyoFlag !== "",
        label: row.doyoLabel || null,
        isManichi: false,
        doyoSatsuDirection: null,
      },
      legacySummary: row.legacySummary || null,
    },
    rawFlags: Object.fromEntries(
      selectedDayFlags.map(([flag, code]) => [code, row[flag] === "1"]),
    ),
    diffs: [],
  };
});

const output = {
  schemaVersion: "calendar_note_occurrences.v0",
  range: {
    start: days[0]?.date ?? null,
    end: days.at(-1)?.date ?? null,
    count: days.length,
  },
  sourceStatus: "sample",
  verificationStatus: "legacy_spreadsheet",
  note:
    "30日サンプルから生成した日別暦注発生マスター。意味文はcalendar-note-definitions側を参照する。",
  days,
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `${days.length} calendar note occurrence rows written to ${outputPath}`,
);
