import { copyFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { homedir } from "node:os";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const year = Number(readOption("--year", ""));
const sourceOption = readOption("--source", "latest");
const downloadsDir = readOption("--downloads-dir", join(homedir(), "Downloads"));
const chunksDir = readOption("--chunks-dir", "src/data/import/chunks");
const planPath = readOption(
  "--plan",
  "src/data/import/calendar-master-extraction-plan.1900-2050.json",
);

if (!Number.isInteger(year)) {
  console.error("Usage: npm run data:calendar-master:stage-download -- --year 1900 [--source latest|/path/file.csv]");
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

function normalizeDate(value) {
  const trimmed = String(value ?? "").trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) {
    return trimmed;
  }

  const slash = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);

  if (!slash) {
    return "";
  }

  return `${slash[1]}-${slash[2].padStart(2, "0")}-${slash[3].padStart(2, "0")}`;
}

async function findLatestCsv() {
  const files = await readdir(downloadsDir);
  const candidates = [];

  for (const file of files) {
    if (extname(file).toLowerCase() !== ".csv") {
      continue;
    }

    const path = join(downloadsDir, file);
    const info = await stat(path);
    candidates.push({ path, mtimeMs: info.mtimeMs });
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);

  return candidates[0]?.path ?? null;
}

const plan = JSON.parse(await readFile(planPath, "utf8"));
const chunk = plan.chunks.find((item) => item.startYear === year && item.endYear === year);

if (!chunk) {
  throw new Error(`${year}: not found in ${planPath}`);
}

const sourcePath = sourceOption === "latest" ? await findLatestCsv() : resolve(sourceOption);

if (!sourcePath) {
  throw new Error(`No CSV file found in ${downloadsDir}`);
}

const text = await readFile(sourcePath, "utf8");
const rows = parseCsv(text);
const firstRow = rows[0] ?? [];
const lastRow = rows.at(-1) ?? [];
const firstDate = normalizeDate(firstRow[4]);
const lastDate = normalizeDate(lastRow[4]);
const rowCount = rows.length;
const warnings = [];

if (rowCount !== chunk.rowCount) {
  warnings.push(`rowCount mismatch: expected ${chunk.rowCount}, got ${rowCount}`);
}

if (firstDate !== chunk.startDate) {
  warnings.push(`firstDate mismatch: expected ${chunk.startDate}, got ${firstDate || "(blank)"}`);
}

if (lastDate !== chunk.endDate) {
  warnings.push(`lastDate mismatch: expected ${chunk.endDate}, got ${lastDate || "(blank)"}`);
}

if (warnings.length > 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        year,
        sourcePath,
        rowCount,
        firstDate,
        lastDate,
        expected: {
          rowCount: chunk.rowCount,
          firstDate: chunk.startDate,
          lastDate: chunk.endDate,
        },
        warnings,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

await mkdir(chunksDir, { recursive: true });

const targetPath = join(chunksDir, chunk.suggestedFile);
await copyFile(sourcePath, targetPath);

console.log(
  JSON.stringify(
    {
      ok: true,
      year,
      sourcePath,
      sourceFile: basename(sourcePath),
      targetPath,
      rowCount,
      firstDate,
      lastDate,
    },
    null,
    2,
  ),
);
