import { readFile, writeFile } from "node:fs/promises";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error(
    "Usage: npm run data:calendar -- <input.csv> <output.json>",
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

const csv = await readFile(inputPath, "utf8");
const [header, ...records] = parseCsv(csv);

if (!header) {
  throw new Error("CSV header row is missing.");
}

const json = records.map((record) =>
  Object.fromEntries(
    header.map((key, index) => {
      const value = record[index] ?? "";
      return [key, key === "row" ? Number(value) : value];
    }),
  ),
);

await writeFile(outputPath, `${JSON.stringify(json, null, 2)}\n`);
console.log(`Converted ${json.length} rows: ${inputPath} -> ${outputPath}`);
