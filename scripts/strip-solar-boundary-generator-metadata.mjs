import { readFile, writeFile } from "node:fs/promises";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error(
    "Usage: node scripts/strip-solar-boundary-generator-metadata.mjs <input.json> <output.json>",
  );
  process.exit(1);
}

const rows = JSON.parse(await readFile(inputPath, "utf8"));

const stripped = rows.map((row) => ({
  date: row.date,
  name: row.name,
  kind: row.kind,
  timeJst: row.timeJst,
  datetimeJst: row.datetimeJst,
  datetimeJstPrecision: row.datetimeJstPrecision,
  exactDatetimeJst: row.exactDatetimeJst,
  boundaryMethod: row.boundaryMethod,
  solarLongitude: row.solarLongitude,
  isSetsuiriForKyusei: row.isSetsuiriForKyusei,
  affectsYearBoundary: row.affectsYearBoundary,
  affectsMonthBoundary: row.affectsMonthBoundary,
  source: "verified_master",
  sourceUrl: row.sourceUrl,
  sourceNote:
    "開発時に天文計算で生成し、国立天文台/万年暦/チェックポイントで検算した静的マスター。本体アプリは計算ライブラリに依存しない。",
}));

await writeFile(outputPath, `${JSON.stringify(stripped, null, 2)}\n`);
console.log(`Stripped generator metadata: ${rows.length} rows -> ${outputPath}`);
