import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultKoyomiReferenceSamplesDir,
  defaultKoyomiReferenceSamplesFile,
  readKoyomiReferenceSamples,
  readKoyomiReferenceYear,
  writeKoyomiReferenceYear,
} from "./lib/koyomi-reference-samples.mjs";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

function hasFlag(name) {
  return args.includes(name);
}

const inputPath = readOption("--input");
const yearText = readOption("--year");
const outputPath = readOption(
  "--output",
  defaultKoyomiReferenceSamplesFile,
);
const outputDir = readOption("--output-dir", null);
const monthFilter = readOption("--month");
const startDate = readOption("--start-date");
const endDate = readOption("--end-date");
const replaceExisting = !hasFlag("--append-only");

if (!inputPath || !yearText) {
  console.error(
    [
      "usage:",
      "  node scripts/import-koyomi-reference-csv.mjs --year 2021 --input /path/Rekicyuu_2021.csv",
      "",
      "options:",
      "  --month 2                  2月だけ取り込む",
      "  --start-date YYYY-MM-DD    開始日で絞る",
      "  --end-date YYYY-MM-DD      終了日で絞る",
      "  --append-only              同じ日付が既にある場合は置き換えない",
      `  --output-dir <dir>         年別JSONへ取り込む。既定候補: ${defaultKoyomiReferenceSamplesDir}`,
    ].join("\n"),
  );
  process.exit(1);
}

const year = Number(yearText);

if (!Number.isInteger(year) || year < 1) {
  throw new Error(`invalid --year: ${yearText}`);
}

const selectedDayCodeByName = {
  天赦日: "tensha_bi",
  一粒万倍日: "ichiryumanbaibi",
  不成就日: "fujoju",
  三隣亡: "sanrinbou",
  八専: "hassen",
  八専入り: "hassen",
  八専終わり: "hassen",
  八専間日: "hassen",
  十方暮: "jippo_gure",
  十方暮始まり: "jippo_gure",
  十方暮終わり: "jippo_gure",
  天一天上: "tenichi_tenjo",
  天一天上始まり: "tenichi_tenjo",
  天一天上終わり: "tenichi_tenjo",
  老日: "roujitsu",
  甲子: "kasshi",
  庚申: "koushin",
  神吉日: "shinnyu",
  己巳: "tsuchinoto_mi",
  大土始まり: "otsuchi_start",
  大明日: "daimyo_nichi",
  天恩日: "tenon_nichi",
  地火日: "jikabi",
  大禍日: "taika_nichi",
};

const nonSelectedDayNames = new Set([
  "小寒",
  "大寒",
  "立春",
  "雨水",
  "啓蟄",
  "春分",
  "清明",
  "穀雨",
  "立夏",
  "小満",
  "芒種",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "処暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
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
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return value.replace(/^\uFEFF/, "").trim();
}

function toIsoDate(dateWithWeekday) {
  const match = dateWithWeekday.trim().match(/^(\d{1,2})\/(\d{1,2})\((.)\)$/);
  if (!match) {
    throw new Error(`cannot parse date cell: ${dateWithWeekday}`);
  }

  const [, monthText, dayText] = match;
  const month = Number(monthText);
  const day = Number(dayText);

  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    month,
    day,
    weekday: match[3],
  };
}

function parseSlashTriple(value) {
  const [junichoku, nijuhachishuku, nanajushichishuku] = value
    .split("/")
    .map((part) => part.trim());

  return {
    junichoku: junichoku || null,
    nijuhachishuku: nijuhachishuku || null,
    nanajushichishuku: nanajushichishuku || null,
  };
}

function parseLunar(value) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) {
    return null;
  }

  return {
    month: Number(match[1]),
    day: Number(match[2]),
  };
}

function parseRokuyoKyusei(value) {
  const [rokuyo, kyusei] = value.split("/").map((part) => part.trim());
  return {
    rokuyo: rokuyo || null,
    kyusei: kyusei || null,
  };
}

function splitSummaryNames(summary) {
  return summary
    .replaceAll("※", "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseSelectedDayCodes(summary) {
  const names = splitSummaryNames(summary);
  const codes = [];
  const unmappedNames = [];

  for (const name of names) {
    const code = selectedDayCodeByName[name];
    if (code) {
      codes.push(code);
    } else if (nonSelectedDayNames.has(name)) {
      continue;
    } else {
      unmappedNames.push(name);
    }
  }

  return {
    selectedDayCodes: [...new Set(codes)],
    unmappedNames,
  };
}

function shouldImport(date, month) {
  if (monthFilter && month !== Number(monthFilter)) {
    return false;
  }

  if (startDate && date < startDate) {
    return false;
  }

  if (endDate && date > endDate) {
    return false;
  }

  return true;
}

function parseKoyomiCsvRows(csvText) {
  const rows = parseCsv(csvText);
  const [header, ...body] = rows;

  if (!header) {
    throw new Error("CSV header is missing");
  }

  const headerIndex = new Map(
    header.map((value, index) => [normalizeHeader(value), index]),
  );

  const requiredHeaders = [
    "日付(曜)",
    "干支",
    "12直/28宿/27宿",
    "その他（※以下は「下段」）",
    "旧暦",
    "六曜/九星",
  ];

  const missingHeaders = requiredHeaders.filter(
    (name) => !headerIndex.has(name),
  );
  if (missingHeaders.length > 0) {
    throw new Error(`missing CSV headers: ${missingHeaders.join(", ")}`);
  }

  return body
    .map((row) => {
      const dateCell = row[headerIndex.get("日付(曜)")].trim();
      const { date, month, weekday } = toIsoDate(dateCell);
      const summary = row[headerIndex.get("その他（※以下は「下段」）")].trim();
      const lunar = parseLunar(row[headerIndex.get("旧暦")]);
      const { rokuyo, kyusei } = parseRokuyoKyusei(
        row[headerIndex.get("六曜/九星")],
      );
      const { selectedDayCodes, unmappedNames } =
        parseSelectedDayCodes(summary);

      return {
        date,
        weekday,
        dayPillar: row[headerIndex.get("干支")].trim(),
        ...parseSlashTriple(row[headerIndex.get("12直/28宿/27宿")]),
        summary,
        selectedDayCodes,
        lunar: lunar
          ? {
              ...lunar,
              rokuyo,
            }
          : undefined,
        kyusei,
        sourceMemo: "こよみページCSVから取り込み",
        sourceStatus: "golden_reference",
        sourceUrl: "https://koyomi8.com/sub/rekicyuu.html",
        unmappedNames,
        _month: month,
      };
    })
    .filter((sample) => shouldImport(sample.date, sample._month))
    .map((sample) => {
      const nextSample = { ...sample };
      delete nextSample._month;
      return nextSample;
    });
}

function sortSamples(samples) {
  return [...samples].sort((a, b) => a.date.localeCompare(b.date));
}

const csvText = await readFile(inputPath, "utf8");
const importedSamples = parseKoyomiCsvRows(csvText);
const sampleMaster = outputDir
  ? await readKoyomiReferenceYear(year, outputDir)
  : await readKoyomiReferenceSamples(outputPath);
const existingSamples = Array.isArray(sampleMaster.samples)
  ? sampleMaster.samples
  : [];
const existingByDate = new Map(
  existingSamples.map((sample) => [sample.date, sample]),
);
let added = 0;
let replaced = 0;
let skipped = 0;

for (const sample of importedSamples) {
  if (existingByDate.has(sample.date)) {
    if (replaceExisting) {
      existingByDate.set(sample.date, sample);
      replaced += 1;
    } else {
      skipped += 1;
    }
  } else {
    existingByDate.set(sample.date, sample);
    added += 1;
  }
}

const nextMaster = {
  ...sampleMaster,
  source: {
    ...sampleMaster.source,
    methodNotes: [
      ...(sampleMaster.source?.methodNotes ?? []),
      "こよみページCSVは scripts/import-koyomi-reference-csv.mjs で正本サンプルへ取り込む。",
    ].filter((value, index, array) => array.indexOf(value) === index),
  },
  samples: sortSamples([...existingByDate.values()]),
};

if (outputDir) {
  await writeKoyomiReferenceYear(year, nextMaster, outputDir);
} else {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(nextMaster, null, 2)}\n`);
}

const unmappedNames = [
  ...new Set(importedSamples.flatMap((sample) => sample.unmappedNames ?? [])),
].sort();

console.log(
  JSON.stringify(
    {
      imported: importedSamples.length,
      added,
      replaced,
      skipped,
      output: outputDir ? path.join(outputDir, `${year}.json`) : outputPath,
      unmappedNames,
    },
    null,
    2,
  ),
);
