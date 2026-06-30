import { writeFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const startYear = Number(readOption("--start-year"));
const endYear = Number(readOption("--end-year"));
const outputPath = readOption("--output");

if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || !outputPath) {
  console.error(
    "Usage: node scripts/fetch-keisan-zassetsu-references.mjs --start-year <yyyy> --end-year <yyyy> --output <output.json>",
  );
  process.exit(1);
}

const codeByName = new Map([
  ["入梅", { code: "nyubai", solarLongitude: 80 }],
  ["半夏生", { code: "hangesho", solarLongitude: 100 }],
]);

function pad(value) {
  return String(value).padStart(2, "0");
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, "").trim();
}

function parseExedata(html, year) {
  const match = html.match(/exedata\s*=\s*(\[[\s\S]*?\]);addTableClass/);

  if (!match) {
    throw new Error(`exedata not found: ${year}`);
  }

  const rows = Function(`"use strict"; return ${match[1]};`)();
  const references = [];

  for (const row of rows.slice(1)) {
    const name = stripHtml(String(row[0] ?? ""));
    const definition = codeByName.get(name);

    if (!definition) {
      continue;
    }

    const monthDay = stripHtml(String(row[1] ?? ""));
    const dateMatch = monthDay.match(/^(\d{2})月(\d{2})日$/);

    if (!dateMatch) {
      throw new Error(`Unexpected month/day: ${year} ${name} ${monthDay}`);
    }

    references.push({
      date: `${year}-${dateMatch[1]}-${dateMatch[2]}`,
      code: definition.code,
      name,
      timeJst: null,
      solarLongitude: definition.solarLongitude,
      sourceName: "高精度計算サイト 雑節",
      sourceUrl: "https://keisan.site/exec/system/1186128796",
      sourceNote:
        "keisan.siteの雑節計算結果。日付照合用。ページ説明に1950〜2050年は新こよみ便利帳との一致確認あり。",
      verificationPrecision: "date",
    });
  }

  if (references.length !== 2) {
    throw new Error(`Expected 2 references: ${year}, got ${references.length}`);
  }

  return references.sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchYear(year) {
  const body = new URLSearchParams({
    var_c1: "0",
    var_Y: String(year),
    lang: "",
    charset: "utf-8",
  });

  const response = await fetch("https://keisan.site/exec/system/1186128796", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "hibi-kippo-dev-data-generator/0.1",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${year}`);
  }

  return parseExedata(await response.text(), year);
}

const rows = [];

for (let year = startYear; year <= endYear; year += 1) {
  const yearRows = await fetchYear(year);
  rows.push(...yearRows);

  if ((year - startYear + 1) % 10 === 0 || year === endYear) {
    console.log(`Fetched ${year - startYear + 1} years through ${year}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 120));
}

await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(
  `Fetched ${rows.length} keisan zassetsu references: ${pad(startYear)}-${pad(endYear)} -> ${outputPath}`,
);
