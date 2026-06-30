import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

function hasFlag(name) {
  return args.includes(name);
}

const inputPath = readOption("--input", null);
const inputDir = readOption("--input-dir", null);
const outputPath = readOption(
  "--output",
  "src/data/calendar-master-rows.1900-2050.json",
);
const schemaPath = readOption(
  "--schema",
  "src/data/calendar-master-input-schema.v1.json",
);
const columnMapPath = readOption("--column-map", null);
const startDate = readOption("--start-date", "1900-01-01");
const endDate = readOption("--end-date", "2050-12-31");
const sourceStartDate = readOption("--source-start-date", "1900-01-01");
const sourceFirstRow = Number(readOption("--source-first-row", "2"));
const keepUnknown = hasFlag("--keep-unknown");
const noHeader = hasFlag("--no-header");
const dryRun = hasFlag("--dry-run");

if (!inputPath && !inputDir) {
  console.error(
    [
      "Usage:",
      "  npm run data:calendar-master:build-range -- --input <source.csv|source.json> [--output <rows.json>]",
      "  npm run data:calendar-master:build-range -- --input-dir <source-dir> [--output <rows.json>]",
      "",
      "Options:",
      "  --start-date YYYY-MM-DD   default: 1900-01-01",
      "  --end-date YYYY-MM-DD     default: 2050-12-31",
      "  --source-start-date YYYY-MM-DD  default: 1900-01-01",
      "  --source-first-row <number>     default: 2",
      "  --schema <schema.json>    default: src/data/calendar-master-input-schema.v1.json",
      "  --column-map <map.json>   use when source CSV has no header row",
      "  --no-header              treat CSV as headerless and read keys from --column-map",
      "  --keep-unknown           keep columns not defined in schema",
      "  --dry-run                validate and summarize without writing output",
    ].join("\n"),
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

function csvToRows(text) {
  const [header, ...records] = parseCsv(text);

  if (!header) {
    throw new Error("CSV header row is missing.");
  }

  return records.map((record) =>
    Object.fromEntries(header.map((key, index) => [key, record[index] ?? ""])),
  );
}

function csvToRowsWithColumnMap(text, columns) {
  const records = parseCsv(text);

  return records.map((record) =>
    Object.fromEntries(columns.map((key, index) => [key, record[index] ?? ""])),
  );
}

async function readInputRows(path) {
  const text = await readFile(path, "utf8");

  if (extname(path).toLowerCase() === ".json") {
    return jsonToRows(JSON.parse(text), path);
  }

  return noHeader || columnMap
    ? csvToRowsWithColumnMap(text, columnMap?.columns ?? [])
    : csvToRows(text);
}

function valuesToRows(values) {
  if (!columnMap) {
    throw new Error("JSON values input requires --column-map.");
  }

  return values.map((record) =>
    Object.fromEntries(columnMap.columns.map((key, index) => [key, record[index] ?? ""])),
  );
}

function jsonToRows(data, path) {
  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      return valuesToRows(data);
    }

    return data;
  }

  if (Array.isArray(data?.values)) {
    return valuesToRows(data.values);
  }

  if (Array.isArray(data?.valueRanges)) {
    return data.valueRanges.flatMap((valueRange) => valuesToRows(valueRange.values ?? []));
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  throw new Error(
    `${path}: JSON input must be an array of row objects, an array of values, { values }, { valueRanges }, or { rows }.`,
  );
}

function dateToIndex(date) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function normalizeFlag(value) {
  if (value === "1" || value === 1 || value === true || value === "TRUE" || value === "true") {
    return "1";
  }

  if (
    value === "0" ||
    value === 0 ||
    value === false ||
    value === "" ||
    value == null ||
    value === "FALSE" ||
    value === "false"
  ) {
    return "0";
  }

  return String(value);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function deriveDate(row) {
  if (row.date) {
    return row.date;
  }

  if (row.year && row.month && row.day) {
    return `${row.year}-${pad2(row.month)}-${pad2(row.day)}`;
  }

  const match = String(row.ymLabel ?? "").match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);

  if (match) {
    return `${match[1]}-${pad2(match[2])}-${pad2(match[3])}`;
  }

  return "";
}

function deriveYear(row) {
  if (/^\d{4}$/.test(String(row.year ?? ""))) {
    return String(row.year);
  }

  const date = deriveDate(row);

  if (date) {
    return date.slice(0, 4);
  }

  const match = String(row.ymLabel ?? "").match(/^(\d{4})[/-]/);

  return match?.[1] ?? "";
}

function deriveMonth(row) {
  if (row.month) {
    return String(row.month);
  }

  const date = deriveDate(row);

  return date ? String(Number(date.slice(5, 7))) : "";
}

function deriveDay(row) {
  if (row.day) {
    return String(row.day);
  }

  const date = deriveDate(row);

  return date ? String(Number(date.slice(8, 10))) : "";
}

function deriveRow(row) {
  if (row.row !== "" && row.row != null) {
    return Number(row.row);
  }

  const date = deriveDate(row);

  if (!date) {
    return NaN;
  }

  return sourceFirstRow + dateToIndex(date) - dateToIndex(sourceStartDate);
}

function normalizeRow(row, schema, knownKeys) {
  const normalized = {};

  for (const key of schema.requiredKeys) {
    normalized[key] = row[key] ?? "";
  }

  for (const key of schema.optionalKeys) {
    normalized[key] = row[key] ?? "";
  }

  if (keepUnknown) {
    for (const [key, value] of Object.entries(row)) {
      if (!knownKeys.has(key)) {
        normalized[key] = value ?? "";
      }
    }
  }

  normalized.date = deriveDate(normalized);
  normalized.year = deriveYear(normalized);
  normalized.month = deriveMonth(normalized);
  normalized.day = deriveDay(normalized);
  normalized.row = deriveRow(normalized);

  for (const key of schema.booleanFlagKeys) {
    normalized[key] = normalizeFlag(normalized[key]);
  }

  return normalized;
}

const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const columnMap = columnMapPath
  ? JSON.parse(await readFile(columnMapPath, "utf8"))
  : null;

if (noHeader && !columnMap) {
  throw new Error("--no-header requires --column-map.");
}

const inputFiles = inputDir
  ? (await readdir(inputDir))
      .filter((file) => [".csv", ".json"].includes(extname(file).toLowerCase()))
      .sort()
      .map((file) => join(inputDir, file))
  : [inputPath];

const inputRows = (await Promise.all(inputFiles.map((file) => readInputRows(file)))).flat();

if (!Array.isArray(inputRows)) {
  throw new Error("Input must be an array of day rows or a CSV with a header row.");
}

const knownKeys = new Set([...schema.requiredKeys, ...schema.optionalKeys]);
const normalizedRows = inputRows
  .map((row) => normalizeRow(row, schema, knownKeys))
  .filter((row) => row.date >= startDate && row.date <= endDate)
  .sort((a, b) => a.date.localeCompare(b.date));

const errors = [];
const warnings = [];
const seen = new Set();
const expectedCount = dateToIndex(endDate) - dateToIndex(startDate) + 1;

for (const [index, row] of normalizedRows.entries()) {
  const label = row.date || `index:${index}`;

  for (const key of schema.requiredKeys) {
    if (!(key in row)) {
      errors.push(`${label}: missing required key ${key}`);
    }
  }

  if (!row.date) {
    errors.push(`${label}: date must not be empty`);
  }

  if (!Number.isFinite(row.row)) {
    errors.push(`${label}: row must be number`);
  }

  if (seen.has(row.date)) {
    errors.push(`${row.date}: duplicate date`);
  }
  seen.add(row.date);

  if (index > 0 && normalizedRows[index - 1].date === row.date) {
    errors.push(`${row.date}: duplicate sorted date`);
  }
}

for (const row of inputRows) {
  for (const key of Object.keys(row)) {
    if (!knownKeys.has(key)) {
      warnings.push(`unknown source key: ${key}`);
    }
  }
}

if (normalizedRows[0]?.date !== startDate) {
  errors.push(`range start mismatch: expected ${startDate}, got ${normalizedRows[0]?.date}`);
}

if (normalizedRows.at(-1)?.date !== endDate) {
  errors.push(`range end mismatch: expected ${endDate}, got ${normalizedRows.at(-1)?.date}`);
}

if (normalizedRows.length !== expectedCount) {
  errors.push(`row count mismatch: expected ${expectedCount}, got ${normalizedRows.length}`);
}

const result = {
  ok: errors.length === 0,
  inputPath: inputDir ?? inputPath,
  inputFiles,
  outputPath: dryRun ? null : outputPath,
  sourceRows: inputRows.length,
  outputRows: normalizedRows.length,
  start: normalizedRows[0]?.date ?? null,
  end: normalizedRows.at(-1)?.date ?? null,
  expectedRows: expectedCount,
  errors,
  warnings: [...new Set(warnings)],
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}

if (!dryRun) {
  await writeFile(outputPath, `${JSON.stringify(normalizedRows, null, 2)}\n`);
}
