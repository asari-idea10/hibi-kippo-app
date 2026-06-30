import { writeFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const startYear = Number(readOption("--start-year", "1900"));
const endYear = Number(readOption("--end-year", "2050"));
const yearsPerChunk = Number(readOption("--years-per-chunk", "1"));
const outputPath = readOption(
  "--output",
  "src/data/import/calendar-master-extraction-plan.1900-2050.json",
);
const sheetName = readOption("--sheet-name", "年月日");
const firstDataRow = Number(readOption("--first-data-row", "2"));
const startColumn = readOption("--start-column", "A");
const endColumn = readOption("--end-column", "BN");

if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear > endYear) {
  throw new Error("--start-year and --end-year must be valid integers.");
}

if (!Number.isInteger(yearsPerChunk) || yearsPerChunk < 1) {
  throw new Error("--years-per-chunk must be a positive integer.");
}

function dateToIndex(date) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function daysInYear(year) {
  return dateToIndex(`${year + 1}-01-01`) - dateToIndex(`${year}-01-01`);
}

function rowForDate(date) {
  return firstDataRow + dateToIndex(date) - dateToIndex(`${startYear}-01-01`);
}

const chunks = [];

for (let cursor = startYear; cursor <= endYear; cursor += yearsPerChunk) {
  const chunkStartYear = cursor;
  const chunkEndYear = Math.min(cursor + yearsPerChunk - 1, endYear);
  const startDate = `${chunkStartYear}-01-01`;
  const endDate = `${chunkEndYear}-12-31`;
  const startRow = rowForDate(startDate);
  const endRow = rowForDate(endDate);
  const rowCount = dateToIndex(endDate) - dateToIndex(startDate) + 1;

  chunks.push({
    id: `${chunkStartYear}-${chunkEndYear}`,
    startYear: chunkStartYear,
    endYear: chunkEndYear,
    startDate,
    endDate,
    startRow,
    endRow,
    rowCount,
    range: `${startColumn}${startRow}:${endColumn}${endRow}`,
    sheetRange: `${sheetName}!${startColumn}${startRow}:${endColumn}${endRow}`,
    suggestedFile: `calendar-master-rows.${chunkStartYear}-${chunkEndYear}.source.csv`,
  });
}

const totalRows = chunks.reduce((sum, chunk) => sum + chunk.rowCount, 0);
const expectedRows =
  dateToIndex(`${endYear}-12-31`) - dateToIndex(`${startYear}-01-01`) + 1;
const lastDate = indexToDate(dateToIndex(`${endYear}-12-31`));

const plan = {
  schemaVersion: "calendar_master_extraction_plan.v1",
  source: {
    workbook: "★フォーチューンマイレージマスタ",
    sheet: sheetName,
    startColumn,
    endColumn,
    firstDataRow,
  },
  range: {
    startYear,
    endYear,
    startDate: `${startYear}-01-01`,
    endDate: lastDate,
    expectedRows,
    totalRows,
    yearsPerChunk,
  },
  checks: {
    rowsMatch: totalRows === expectedRows,
    leapYears: Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
      .filter((year) => daysInYear(year) === 366),
  },
  chunks,
};

await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      ok: true,
      outputPath,
      chunks: chunks.length,
      totalRows,
      start: plan.range.startDate,
      end: plan.range.endDate,
    },
    null,
    2,
  ),
);
