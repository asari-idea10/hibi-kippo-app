import { writeFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
}

const startYear = Number(readOption("--start-year"));
const endYear = Number(readOption("--end-year"));
const outputPath = readOption("--output");

if (
  !Number.isInteger(startYear) ||
  !Number.isInteger(endYear) ||
  startYear > endYear ||
  !outputPath
) {
  console.error(
    "Usage: node scripts/fetch-naoj-zassetsu-references.mjs --start-year <yyyy> --end-year <yyyy> --output <output.json>",
  );
  process.exit(1);
}

const TARGETS = new Map([
  ["入梅", { code: "nyubai", solarLongitude: 80 }],
  ["半夏生", { code: "hangesho", solarLongitude: 100 }],
]);

function pad(value) {
  return String(value).padStart(2, "0");
}

function sourceUrl(year) {
  return `https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenom_sekki.cgi?year=${year}`;
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function extractCells(rowHtml) {
  return Array.from(rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map(
    (match) => stripTags(match[1]),
  );
}

function parseDate(value) {
  const match = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseTime(value) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  return `${pad(Number(match[1]))}:${match[2]}`;
}

function parseName(value) {
  const match = value.match(/^(入梅|半夏生)\(黄経(\d{1,3})°\)$/);
  if (!match) {
    return null;
  }

  return {
    name: match[1],
    solarLongitude: Number(match[2]),
  };
}

function parseRows(html, year) {
  const url = sourceUrl(year);

  return Array.from(html.matchAll(/<tr>([\s\S]*?)<\/tr>/g))
    .map((match) => extractCells(match[1]))
    .map((cells) => {
      if (cells.length < 6 || cells[3] !== "雑節") {
        return null;
      }

      const parsedName = parseName(cells[5]);
      if (!parsedName || !TARGETS.has(parsedName.name)) {
        return null;
      }

      const target = TARGETS.get(parsedName.name);
      const date = parseDate(cells[0]);
      const timeJst = parseTime(cells[1]);

      if (
        !date ||
        !timeJst ||
        target.solarLongitude !== parsedName.solarLongitude
      ) {
        return null;
      }

      return {
        date,
        code: target.code,
        name: parsedName.name,
        timeJst,
        solarLongitude: target.solarLongitude,
        sourceName: "国立天文台 二十四節気・雑節",
        sourceUrl: url,
        sourceNote:
          "国立天文台 暦計算室の二十四節気・雑節ページ。分単位の時刻照合用正本サンプル。",
        verificationPrecision: "minute",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code));
}

async function fetchYear(year) {
  const response = await fetch(sourceUrl(year));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl(year)}: ${response.status}`);
  }

  const bytes = await response.arrayBuffer();
  const html = new TextDecoder("euc-jp").decode(bytes);
  const rows = parseRows(html, year);

  if (rows.length !== 2) {
    throw new Error(
      `Expected 2 zassetsu rows for ${year}, but parsed ${rows.length}.`,
    );
  }

  return rows;
}

const rows = [];
for (let year = startYear; year <= endYear; year += 1) {
  rows.push(...(await fetchYear(year)));
}

await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(
  `Fetched ${rows.length} NAOJ zassetsu references: ${startYear}-${endYear} -> ${outputPath}`,
);
