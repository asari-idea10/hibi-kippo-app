import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const inputPath = readOption(
  "--input",
  "src/data/calendar-master-rows.1900-2050.json",
);
const outputDir = readOption("--output-dir", "src/data/calendar-master/by-year");

const rows = JSON.parse(await readFile(inputPath, "utf8"));

if (!Array.isArray(rows)) {
  throw new Error(`${inputPath}: expected an array of calendar master rows.`);
}

const groups = new Map();

for (const row of rows) {
  if (!row?.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    throw new Error(`Invalid row date: ${JSON.stringify(row?.date)}`);
  }

  const year = row.date.slice(0, 4);
  const yearRows = groups.get(year) ?? [];
  yearRows.push(row);
  groups.set(year, yearRows);
}

await mkdir(outputDir, { recursive: true });

const years = [...groups.keys()].sort();

for (const year of years) {
  const yearRows = groups.get(year).sort((a, b) => a.date.localeCompare(b.date));

  await writeFile(
    path.join(outputDir, `${year}.json`),
    `${JSON.stringify(yearRows, null, 2)}\n`,
  );
}

const totalRows = years.reduce((sum, year) => sum + groups.get(year).length, 0);

console.log(
  JSON.stringify(
    {
      ok: true,
      inputPath,
      outputDir,
      years: years.length,
      rows: totalRows,
      first: {
        year: years[0] ?? null,
        count: years[0] ? groups.get(years[0]).length : 0,
        start: years[0] ? groups.get(years[0])[0]?.date : null,
        end: years[0] ? groups.get(years[0]).at(-1)?.date : null,
      },
      last: {
        year: years.at(-1) ?? null,
        count: years.at(-1) ? groups.get(years.at(-1)).length : 0,
        start: years.at(-1) ? groups.get(years.at(-1))[0]?.date : null,
        end: years.at(-1) ? groups.get(years.at(-1)).at(-1)?.date : null,
      },
    },
    null,
    2,
  ),
);
