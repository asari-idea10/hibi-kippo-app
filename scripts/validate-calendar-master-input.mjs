import { readFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const inputPath = readOption("--input", null);
const schemaPath = readOption(
  "--schema",
  "src/data/calendar-master-input-schema.v1.json",
);
const startDate = readOption("--start-date", null);
const endDate = readOption("--end-date", null);

if (!inputPath) {
  console.error(
    "Usage: npm run data:calendar-master:validate -- --input <rows.json> [--start-date YYYY-MM-DD --end-date YYYY-MM-DD]",
  );
  process.exit(1);
}

const rows = JSON.parse(await readFile(inputPath, "utf8"));
const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const errors = [];
const warnings = [];

if (!Array.isArray(rows)) {
  errors.push("Input must be an array of day rows.");
}

function dateToIndex(date) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isBooleanFlag(value) {
  return value === "1" || value === "0" || value === "" || value === 1 || value === 0 || typeof value === "boolean";
}

function validateRow(row, index) {
  const label = row?.date ?? `index:${index}`;

  for (const key of schema.requiredKeys) {
    if (!(key in row)) {
      errors.push(`${label}: missing required key ${key}`);
    }
  }

  if (typeof row.row !== "number") {
    errors.push(`${label}: row must be number`);
  }

  if (!isDate(row.date ?? "")) {
    errors.push(`${label}: date must be YYYY-MM-DD`);
  }

  for (const key of schema.booleanFlagKeys) {
    if (!isBooleanFlag(row[key])) {
      errors.push(`${label}: ${key} must be \"1\", \"0\", empty string, 1, 0, true, or false`);
    }
  }

  const knownKeys = new Set([...schema.requiredKeys, ...schema.optionalKeys]);
  for (const key of Object.keys(row)) {
    if (!knownKeys.has(key)) {
      warnings.push(`${label}: unknown key ${key}`);
    }
  }
}

if (Array.isArray(rows)) {
  rows.forEach(validateRow);

  const seen = new Set();

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    if (seen.has(row.date)) {
      errors.push(`${row.date}: duplicate date`);
    }

    seen.add(row.date);

    if (index > 0 && rows[index - 1].date > row.date) {
      errors.push(`${row.date}: rows must be sorted by date ascending`);
    }
  }

  if (startDate && rows[0]?.date !== startDate) {
    errors.push(`range start mismatch: expected ${startDate}, got ${rows[0]?.date}`);
  }

  if (endDate && rows.at(-1)?.date !== endDate) {
    errors.push(`range end mismatch: expected ${endDate}, got ${rows.at(-1)?.date}`);
  }

  if (startDate && endDate && rows.length > 0) {
    const expectedCount = dateToIndex(endDate) - dateToIndex(startDate) + 1;

    if (rows.length !== expectedCount) {
      errors.push(`row count mismatch: expected ${expectedCount}, got ${rows.length}`);
    }

    for (
      let cursor = dateToIndex(startDate), rowIndex = 0;
      cursor <= dateToIndex(endDate);
      cursor += 1, rowIndex += 1
    ) {
      const expectedDate = indexToDate(cursor);
      const actualDate = rows[rowIndex]?.date;

      if (actualDate !== expectedDate) {
        errors.push(`missing or shifted date: expected ${expectedDate}, got ${actualDate}`);
        break;
      }
    }
  }
}

const result = {
  ok: errors.length === 0,
  inputPath,
  schemaPath,
  rows: Array.isArray(rows) ? rows.length : null,
  start: Array.isArray(rows) ? rows[0]?.date ?? null : null,
  end: Array.isArray(rows) ? rows.at(-1)?.date ?? null : null,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}
