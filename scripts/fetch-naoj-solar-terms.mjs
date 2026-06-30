import { readFile, writeFile } from "node:fs/promises";

const TERM_BY_LONGITUDE = new Map([
  [285, "小寒"],
  [300, "大寒"],
  [315, "立春"],
  [330, "雨水"],
  [345, "啓蟄"],
  [0, "春分"],
  [15, "清明"],
  [30, "穀雨"],
  [45, "立夏"],
  [60, "小満"],
  [75, "芒種"],
  [90, "夏至"],
  [105, "小暑"],
  [120, "大暑"],
  [135, "立秋"],
  [150, "処暑"],
  [165, "白露"],
  [180, "秋分"],
  [195, "寒露"],
  [210, "霜降"],
  [225, "立冬"],
  [240, "小雪"],
  [255, "大雪"],
  [270, "冬至"],
]);

const SETSUIRI_LONGITUDES = new Set([
  285, 315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255,
]);

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const positionalYear = args[0]?.startsWith("--") ? null : args[0];
const year = readOption("--year") ?? positionalYear;
const startYear = readOption("--start-year");
const endYear = readOption("--end-year");
const outputPath = readOption("--output") ?? args[1];
const inputPath = readOption("--input");
const urlOption = readOption("--url");

if ((!year && (!startYear || !endYear)) || !outputPath) {
  console.error(
    "Usage: npm run data:solar-terms -- --year <yyyy> --output <output.json> [--input <html>] [--url <url>]",
  );
  console.error(
    "   or: npm run data:solar-terms -- --start-year <yyyy> --end-year <yyyy> --output <output.json>",
  );
  process.exit(1);
}

function toTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function extractCells(rowHtml) {
  return Array.from(rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map((match) =>
    stripTags(match[1]),
  );
}

function parseDateCell(value) {
  const match = value.match(/(\d{1,2})月(\d{1,2})日/);
  if (!match) {
    return null;
  }

  return {
    month: Number(match[1]),
    day: Number(match[2]),
  };
}

function parseTimeCell(value) {
  const match = value.match(/(\d{1,2})時(\d{1,2})分/);
  if (!match) {
    return null;
  }

  return `${toTwoDigits(Number(match[1]))}:${toTwoDigits(Number(match[2]))}`;
}

function parseLongitude(value) {
  const match = value.match(/(\d{1,3})度/);
  return match ? Number(match[1]) : null;
}

function buildNaojUrl(yearValue) {
  const rekiyouYear = String(Number(yearValue) - 2000).padStart(2, "0");
  return `https://eco.mtk.nao.ac.jp/koyomi/yoko/${yearValue}/rekiyou${rekiyouYear}2.html`;
}

function parseSolarTerms(html, yearValue, url) {
  return Array.from(html.matchAll(/<tr>([\s\S]*?)<\/tr>/g))
    .map((match) => extractCells(match[1]))
    .map((cells) => {
      if (cells.length < 4) {
        return null;
      }

      const solarLongitude = parseLongitude(cells[1]);
      const date = parseDateCell(cells[2]);
      const timeJst = parseTimeCell(cells[3]);

      if (
        solarLongitude === null ||
        !TERM_BY_LONGITUDE.has(solarLongitude) ||
        !date ||
        !timeJst
      ) {
        return null;
      }

      const isoDate = `${yearValue}-${toTwoDigits(date.month)}-${toTwoDigits(date.day)}`;

      return {
        date: isoDate,
        name: TERM_BY_LONGITUDE.get(solarLongitude),
        kind: "二十四節気",
        timeJst,
        datetimeJst: `${isoDate}T${timeJst}:00+09:00`,
        datetimeJstPrecision: "minute",
        exactDatetimeJst: null,
        boundaryMethod: "solar_longitude_crossing",
        solarLongitude,
        isSetsuiriForKyusei: SETSUIRI_LONGITUDES.has(solarLongitude),
        affectsYearBoundary: solarLongitude === 315,
        affectsMonthBoundary: SETSUIRI_LONGITUDES.has(solarLongitude),
        source: "国立天文台",
        sourceUrl: url,
        sourceNote:
          "国立天文台の暦要項は分単位。出生時刻境界の秒精度が必要な場合は天文計算エンジンでexactDatetimeJstを補完する。",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function loadHtml(yearValue) {
  if (inputPath) {
    return readFile(inputPath, "utf8");
  }

  const sourceUrl = urlOption ?? buildNaojUrl(yearValue);

  if (!sourceUrl) {
    throw new Error("Source URL is missing.");
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status}`);
  }

  const bytes = await response.arrayBuffer();
  return new TextDecoder("shift_jis").decode(bytes);
}

function resolveYears() {
  if (year) {
    return [year];
  }

  const start = Number(startYear);
  const end = Number(endYear);

  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
    throw new Error("Invalid year range.");
  }

  return Array.from({ length: end - start + 1 }, (_, index) =>
    String(start + index),
  );
}

const years = resolveYears();
const terms = [];

for (const targetYear of years) {
  const html = await loadHtml(targetYear);
  const sourceUrl = inputPath ? `file://${inputPath}` : urlOption ?? buildNaojUrl(targetYear);
  const yearTerms = parseSolarTerms(html, targetYear, sourceUrl);

  if (yearTerms.length !== 24) {
    throw new Error(
      `Expected 24 solar terms for ${targetYear}, but parsed ${yearTerms.length}.`,
    );
  }

  terms.push(...yearTerms);
}

await writeFile(outputPath, `${JSON.stringify(terms, null, 2)}\n`);
console.log(
  `Fetched ${terms.length} solar terms: ${years[0]}-${years.at(-1)} -> ${outputPath}`,
);
