import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  LunarCalendarEntry,
  LunarCalendarDayMasterEntry,
  LunarMonthMasterEntry,
} from "@/lib/lunar-calendar";

const dayCache = new Map<string, LunarCalendarDayMasterEntry[]>();
const monthCache = new Map<string, LunarMonthMasterEntry[]>();
const lunarCalendarByYearDir = path.join(
  process.cwd(),
  "src/data/lunar-calendar/by-year",
);
const lunarMonthsByYearDir = path.join(
  process.cwd(),
  "src/data/lunar-months/by-year",
);

function readYearFile<T>(cache: Map<string, T[]>, dataPath: string, year: string) {
  const cached = cache.get(year);

  if (cached) {
    return cached;
  }

  const filePath = path.join(dataPath, `${year}.json`);

  if (!existsSync(filePath)) {
    return [];
  }

  const rows = JSON.parse(readFileSync(filePath, "utf8")) as T[];
  cache.set(year, rows);
  return rows;
}

export function getGeneratedLunarCalendarDays(year: string) {
  return readYearFile<LunarCalendarDayMasterEntry>(
    dayCache,
    lunarCalendarByYearDir,
    year,
  );
}

export function getGeneratedLunarMonths(year: string) {
  return readYearFile<LunarMonthMasterEntry>(
    monthCache,
    lunarMonthsByYearDir,
    year,
  );
}

export function getGeneratedLunarCalendarDay(date: string) {
  const year = date.slice(0, 4);
  return getGeneratedLunarCalendarDays(year).find((day) => day.date === date) ?? null;
}

export function getGeneratedLunarCalendarConnectionSummary() {
  return {
    strategy: "yearly_server_side_json",
    runtimeImport: false,
    dayDirectory: "src/data/lunar-calendar/by-year",
    monthDirectory: "src/data/lunar-months/by-year",
    sourceStatus: "verified" as const,
    range: {
      start: "1900-01-01",
      end: "2050-12-31",
    },
    note:
      "50MB級の一括JSONをアプリにimportせず、サーバー側で必要な年のJSONだけ読み込む。旧暦・六曜は手元万年暦との目視照合済みとして本採用。",
  };
}

export function compareGeneratedWithSample(sampleRows: LunarCalendarEntry[]) {
  const rows = sampleRows.map((sample) => {
    const generated = getGeneratedLunarCalendarDay(sample.date);
    const sampleDisplay = `旧暦${sample.isLeapMonth ? "閏" : ""}${sample.lunarMonth}月${sample.lunarDay}日`;
    const diffs = [
      generated && generated.lunar.display !== sampleDisplay
        ? `旧暦: sample=${sampleDisplay} generated=${generated.lunar.display}`
        : null,
      generated && generated.rokuyo.name !== sample.rokuyo
        ? `六曜: sample=${sample.rokuyo} generated=${generated.rokuyo.name}`
        : null,
      !generated ? "生成旧暦が見つかりません" : null,
    ].filter((diff): diff is string => Boolean(diff));
    const referenceDiffs = [
      generated && generated.lunar.monthSize !== sample.monthSize
        ? `月大小: sample=${sample.monthSize} generated=${generated.lunar.monthSize}`
        : null,
    ].filter((diff): diff is string => Boolean(diff));

    return {
      date: sample.date,
      sample: {
        display: sampleDisplay,
        rokuyo: sample.rokuyo,
        monthSize: sample.monthSize,
        sourceStatus: sample.sourceStatus,
      },
      generated: generated
        ? {
            display: generated.lunar.display,
            rokuyo: generated.rokuyo.name,
            monthSize: generated.lunar.monthSize,
            newMoonDate: generated.lunar.newMoonDate,
            nextNewMoonDate: generated.lunar.nextNewMoonDate,
            sourceStatus: generated.sourceStatus,
          }
        : null,
      status: diffs.length === 0 ? ("matched" as const) : ("mismatched" as const),
      diffs,
      referenceDiffs,
    };
  });

  const mismatched = rows.filter((row) => row.status === "mismatched").length;

  return {
    status: mismatched === 0 ? ("matched" as const) : ("mismatched" as const),
    summary: {
      total: rows.length,
      matched: rows.length - mismatched,
      mismatched,
    },
    rows,
  };
}
