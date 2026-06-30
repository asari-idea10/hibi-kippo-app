import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const inputPath = readOption("--input", null);
const planPath = readOption(
  "--plan",
  "src/data/import/calendar-master-extraction-plan.1900-2050.json",
);
const outputDir = readOption("--output-dir", "src/data/import/chunks");

if (!inputPath) {
  console.error(
    "Usage: npm run data:calendar-master:split-source -- --input <full-source.csv> [--output-dir src/data/import/chunks]",
  );
  process.exit(1);
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

function toCsvCell(value) {
  const text = String(value ?? "");

  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  return `${rows.map((row) => row.map(toCsvCell).join(",")).join("\n")}\n`;
}

const plan = JSON.parse(await readFile(planPath, "utf8"));
const rows = parseCsv(await readFile(inputPath, "utf8"));
const dataRows = rows.filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(String(row[4] ?? "")));
const rowsByYear = new Map();

for (const row of dataRows) {
  const year = row[4].slice(0, 4);
  const yearRows = rowsByYear.get(year) ?? [];
  yearRows.push(row);
  rowsByYear.set(year, yearRows);
}

await mkdir(outputDir, { recursive: true });

const results = [];

for (const chunk of plan.chunks) {
  const year = String(chunk.startYear);
  const yearRows = rowsByYear.get(year) ?? [];
  const outputPath = join(outputDir, chunk.suggestedFile);

  if (yearRows.length !== chunk.rowCount) {
    throw new Error(
      `${year}: row count mismatch. expected ${chunk.rowCount}, got ${yearRows.length}`,
    );
  }

  if (yearRows[0]?.[4] !== chunk.startDate || yearRows.at(-1)?.[4] !== chunk.endDate) {
    throw new Error(
      `${year}: date range mismatch. expected ${chunk.startDate} - ${chunk.endDate}, got ${yearRows[0]?.[4]} - ${yearRows.at(-1)?.[4]}`,
    );
  }

  await writeFile(outputPath, toCsv(yearRows));
  results.push({
    year,
    outputPath,
    rowCount: yearRows.length,
    startDate: yearRows[0][4],
    endDate: yearRows.at(-1)[4],
  });
}

console.log(
  JSON.stringify(
    {
      ok: true,
      inputPath,
      outputDir,
      chunks: results.length,
      rows: results.reduce((sum, result) => sum + result.rowCount, 0),
      first: results[0],
      last: results.at(-1),
    },
    null,
    2,
  ),
);
