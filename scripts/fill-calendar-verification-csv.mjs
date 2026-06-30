import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");

const inputPath = process.argv[2];
const outputPath =
  process.argv[3] ??
  path.join(appRoot, "outputs", "verification_50days_calendar.filled.csv");

if (!inputPath) {
  throw new Error(
    "Usage: node scripts/fill-calendar-verification-csv.mjs <input.csv> [output.csv]",
  );
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function toCsvCell(value) {
  const text = value == null ? "" : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsvLine(cells) {
  return cells.map(toCsvCell).join(",");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(appRoot, relativePath), "utf8"));
}

function normalizeNijuhachishuku(value) {
  return value.replaceAll("氏", "氐").trim();
}

const calendarMasterRows = readJson("src/data/calendar-master-rows.1900-2050.json");
const calendarMasterByDate = new Map(
  calendarMasterRows.map((row) => [row.date, row]),
);
const occurrenceCache = new Map();

function getOccurrenceDay(date) {
  const year = date.slice(0, 4);

  if (!occurrenceCache.has(year)) {
    const occurrence = readJson(
      `src/data/calendar-note-occurrences/by-year/${year}.json`,
    );
    occurrenceCache.set(
      year,
      new Map(occurrence.days.map((day) => [day.date, day])),
    );
  }

  return occurrenceCache.get(year).get(date);
}

function buildJudgement({ row, masterRow, occurrence }) {
  const results = [];
  const referenceDayPillar = row["日干支(参考)"]?.trim();
  const referenceNijuhachishuku = row["二十八宿(参考)"]?.trim();
  const actualDayPillar = masterRow?.dayPillar ?? "";
  const actualNijuhachishuku = occurrence?.notes?.nijuhachishuku ?? "";

  if (referenceDayPillar) {
    results.push(
      referenceDayPillar === actualDayPillar
        ? "日干支一致"
        : `日干支差分: ${referenceDayPillar}→${actualDayPillar || "未取得"}`,
    );
  }

  if (referenceNijuhachishuku) {
    results.push(
      normalizeNijuhachishuku(referenceNijuhachishuku) ===
        normalizeNijuhachishuku(actualNijuhachishuku)
        ? "二十八宿一致"
        : `二十八宿差分: ${referenceNijuhachishuku}→${
            actualNijuhachishuku || "未取得"
          }`,
    );
  }

  return results.join(" / ") || "-";
}

const raw = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
const headers = parseCsvLine(lines[0]);
const records = lines.slice(1).map((line) => {
  const cells = parseCsvLine(line);
  return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
});

const filledRecords = records.map((record) => {
  const date = record["日付"];
  const masterRow = calendarMasterByDate.get(date);
  const occurrence = getOccurrenceDay(date);

  return {
    ...record,
    "十二直(Codex出力)": occurrence?.notes?.junichoku ?? "",
    "二十八宿(Codex出力)": occurrence?.notes?.nijuhachishuku ?? "",
    "二十七宿(Codex出力)": occurrence?.notes?.nanajushichishuku ?? "",
    "万年暦と一致(判定)": buildJudgement({
      row: record,
      masterRow,
      occurrence,
    }),
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `\uFEFF${toCsvLine(headers)}\n${filledRecords
    .map((record) => toCsvLine(headers.map((header) => record[header] ?? "")))
    .join("\n")}\n`,
);

const mismatches = filledRecords.filter((record) =>
  record["万年暦と一致(判定)"].includes("差分"),
);

console.log(`filled ${filledRecords.length} rows`);
console.log(`mismatches ${mismatches.length}`);
console.log(outputPath);
