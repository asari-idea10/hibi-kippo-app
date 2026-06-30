import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import sampleRowsData from "@/data/calendar-master-rows.sample.json";

export type CalendarMasterRow = {
  row: number;
  ymLabel: string;
  year: string;
  month: string;
  day: string;
  date: string;
  yearNumber: string;
  monthNumber: string;
  dayNumber: string;
  sexagenaryNumber: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  branch: string;
  kuubou: string;
  solarTerm: string;
  setsuiri: string;
  kasshiHelper: string;
  cycle: string;
  ton: string;
  switchFlag: string;
  seasonalBoundaryFlag: string;
  daysFromSetsuiri: string;
  yearStem: string;
  monthStem: string;
  dayStem: string;
  yearZokanMain: string;
  monthZokanMain: string;
  dayZokanMain: string;
  yearZokanMiddle: string;
  monthZokanMiddle: string;
  dayZokanMiddle: string;
  yearZokanExtra: string;
  monthZokanExtra: string;
  dayZokanExtra: string;
  yearKyusei: string;
  monthKyusei: string;
  dayKyusei: string;
  doyoFlag: string;
  doyoLabel: string;
  yearAnkensatsu: string;
  yearGohosatsu: string;
  yearSaiha: string;
  monthAnkensatsu: string;
  monthGohosatsu: string;
  monthSaiha: string;
  dayAnkensatsu: string;
  dayGohosatsu: string;
  daySaiha: string;
  duplicateYear: string;
  duplicateMonth: string;
  duplicateDay: string;
  legacyJunichoku: string;
  legacyNijuhachishuku: string;
  legacySummary: string;
  legacySanrinbou: string;
  legacyIchiryumanbaibi: string;
  legacyFujoju: string;
  legacyHassen: string;
  legacyJippoGure: string;
  legacyTenichiTenjo: string;
  legacyRoujitsu: string;
  legacyKasshi: string;
  legacyKoushin: string;
  legacyShinnyu: string;
  legacyTsuchinotoMi: string;
  legacyTenshaBi: string;
};

export type CalendarMasterRangeQuery = {
  start?: string | null;
  end?: string | null;
};

const sampleRows = sampleRowsData satisfies CalendarMasterRow[];
const yearCache = new Map<string, CalendarMasterRow[] | null>();
const calendarMasterByYearDir = path.join(
  process.cwd(),
  "src/data/calendar-master/by-year",
);
const fullRange = {
  start: "1900-01-01",
  end: "2050-12-31",
  count: 55_152,
};
const sampleRange = {
  start: sampleRows[0]?.date ?? "2026-05-16",
  end: sampleRows.at(-1)?.date ?? "2026-06-14",
  count: sampleRows.length,
};

function readYearRows(year: string) {
  if (yearCache.has(year)) {
    return yearCache.get(year);
  }

  const filePath = path.join(calendarMasterByYearDir, `${year}.json`);

  if (!existsSync(filePath)) {
    yearCache.set(year, null);
    return null;
  }

  const rows = JSON.parse(readFileSync(filePath, "utf8")) as CalendarMasterRow[];
  yearCache.set(year, rows);
  return rows;
}

function listYearsInRange(start: string, end: string) {
  const startYear = Number(start.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  const years: string[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(String(year));
  }

  return years;
}

function dateToIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index: number) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

export function getCalendarMasterRange() {
  return existsSync(path.join(calendarMasterByYearDir, "1900.json"))
    ? fullRange
    : sampleRange;
}

export function getCalendarMasterDefaultQuery(): { start: string; end: string } {
  return {
    start: "2026-05-16",
    end: "2026-06-14",
  };
}

export function getCalendarMasterRow(date: string) {
  const rows = readYearRows(date.slice(0, 4));

  if (rows) {
    return rows.find((row) => row.date === date) ?? null;
  }

  return sampleRows.find((row) => row.date === date) ?? null;
}

export function getCalendarMasterRows(query: CalendarMasterRangeQuery = {}) {
  const defaultQuery = getCalendarMasterDefaultQuery();
  const range = getCalendarMasterRange();
  const start = query.start || defaultQuery.start;
  const end = query.end || defaultQuery.end;
  const boundedStart = start < range.start ? range.start : start;
  const boundedEnd = end > range.end ? range.end : end;

  if (boundedStart > boundedEnd) {
    return [];
  }

  return listYearsInRange(boundedStart, boundedEnd)
    .flatMap((year) => readYearRows(year) ?? sampleRows.filter((row) => row.date.slice(0, 4) === year))
    .filter((row) => row.date >= boundedStart && row.date <= boundedEnd)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function listCalendarMasterDates(query: CalendarMasterRangeQuery = {}) {
  return getCalendarMasterRows(query).map((row) => row.date);
}

export function getCalendarMasterDatesAround(date: string, days = 15) {
  const center = dateToIndex(date);

  return listCalendarMasterDates({
    start: indexToDate(center - days),
    end: indexToDate(center + days),
  });
}

export function getCalendarMasterDataSource() {
  const hasYearlyMaster = existsSync(path.join(calendarMasterByYearDir, "1900.json"));

  return {
    strategy: hasYearlyMaster ? "yearly_server_side_json" : "sample_static_json",
    runtimeImport: false,
    dataFile: hasYearlyMaster
      ? "src/data/calendar-master/by-year/{year}.json"
      : "src/data/calendar-master-rows.sample.json",
  };
}
