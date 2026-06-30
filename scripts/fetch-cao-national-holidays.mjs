import { readFile, writeFile } from "node:fs/promises";
import { TextDecoder } from "node:util";

const defaultCsvUrl =
  "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";

const args = process.argv.slice(2);

function getArg(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const inputPath = getArg("--input");
const outputPath = getArg(
  "--output",
  "src/data/national-holidays-1955-2027.verified.json",
);
const sourceUrl = getArg("--url", defaultCsvUrl);

async function readCsvBytes() {
  if (inputPath) {
    return readFile(inputPath);
  }

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch national holiday CSV: ${response.status} ${response.statusText}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normalizeDate(value) {
  const [year, month, day] = value.split("/").map((part) => Number(part));

  if (!year || !month || !day) {
    throw new Error(`Invalid holiday date: ${value}`);
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function toHolidayType(name) {
  if (name === "休日") {
    return "citizens_holiday_or_substitute";
  }

  if (name.includes("振替休日")) {
    return "substitute_holiday";
  }

  return "national_holiday";
}

const csvBytes = await readCsvBytes();
const csvText = new TextDecoder("shift_jis").decode(csvBytes);
const [header, ...records] = parseCsv(csvText);

if (!header) {
  throw new Error("National holiday CSV header row is missing.");
}

const entries = records.map(([rawDate, name]) => ({
  date: normalizeDate(rawDate),
  name,
  type: toHolidayType(name),
  isNationalHoliday: true,
  sourceStatus: "verified",
  source: {
    organization: "内閣府",
    dataset: "国民の祝日・休日月日",
    url: sourceUrl,
  },
}));

await writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`);

const years = [...new Set(entries.map((entry) => entry.date.slice(0, 4)))];

console.log(
  `Converted ${entries.length} national holidays: ${years[0]}-${years.at(-1)} -> ${outputPath}`,
);
