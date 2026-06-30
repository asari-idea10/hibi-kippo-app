import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  calendarNoteDefinitions,
  getCalendarNoteEntry,
  type CalendarNoteCode,
} from "@/lib/calendar-notes";

export type CalendarNoteOccurrenceDay = {
  date: string;
  source: {
    workbook: string;
    sheet: string;
    row: number;
    sourceStatus: "sample" | "legacy_spreadsheet" | "hybrid_v0";
    verificationStatus:
      | "legacy_spreadsheet"
      | "rule_checked_v0"
      | "external_reference_checked";
  };
  notes: {
    junichoku: string | null;
    nijuhachishuku: string | null;
    nanajushichishuku: string | null;
    selectedDayCodes: CalendarNoteCode[];
    doyo: {
      isDoyo: boolean;
      label: string | null;
      isManichi: boolean;
      doyoSatsuDirection: string | null;
    };
    legacySummary: string | null;
    reference?: {
      sourceName: string;
      overrideSelectedDayCodes: boolean;
    } | null;
  };
  rawFlags: Record<CalendarNoteCode, boolean>;
  diffs: string[];
};

export type CalendarNoteOccurrenceYearMaster = {
  schemaVersion: "calendar_note_occurrences.v0";
  year: string;
  range: {
    start: string | null;
    end: string | null;
    count: number;
  };
  sourceStatus: "sample" | "hybrid_v0";
  verificationStatus: "legacy_spreadsheet" | "rule_checked_v0";
  note: string;
  days: CalendarNoteOccurrenceDay[];
};

const yearCache = new Map<string, CalendarNoteOccurrenceYearMaster | null>();
const generatedOccurrenceByYearDir = path.join(
  process.cwd(),
  "src/data/calendar-note-occurrences/by-year",
);
const sampleOccurrenceByYearDir = path.join(
  process.cwd(),
  "src/data/calendar-notes/by-year",
);

function dateToIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index: number) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function listYearsInRange(start: string | null, end: string | null) {
  if (!start || !end) {
    return ["2026"];
  }

  const startYear = Number(start.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  const years: string[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(String(year));
  }

  return years;
}

function readOccurrenceYear(year: string) {
  if (yearCache.has(year)) {
    return yearCache.get(year);
  }

  const generatedFilePath = path.join(generatedOccurrenceByYearDir, `${year}.json`);
  const sampleFilePath = path.join(sampleOccurrenceByYearDir, `${year}.json`);
  const filePath = existsSync(generatedFilePath)
    ? generatedFilePath
    : sampleFilePath;

  if (!existsSync(filePath)) {
    yearCache.set(year, null);
    return null;
  }

  const rows = JSON.parse(
    readFileSync(filePath, "utf8"),
  ) as CalendarNoteOccurrenceYearMaster;
  yearCache.set(year, rows);
  return rows;
}

export function getCalendarNoteOccurrenceSummary() {
  const masters = listYearsInRange("2026-01-01", "2026-12-31")
    .map((year) => readOccurrenceYear(year))
    .filter((master): master is CalendarNoteOccurrenceYearMaster =>
      Boolean(master),
    );
  const days = masters.flatMap((master) => master.days);
  const selectedDayCounts = Object.fromEntries(
    Object.keys(calendarNoteDefinitions).map((code) => [code, 0]),
  ) as Record<CalendarNoteCode, number>;
  let diffCount = 0;

  for (const day of days) {
    diffCount += day.diffs.length;
    for (const code of day.notes.selectedDayCodes) {
      selectedDayCounts[code] += 1;
    }
  }

  return {
    schemaVersion: "calendar_note_occurrences.v0",
    strategy: "yearly_server_side_json",
    runtimeImport: false,
    directory: existsSync(path.join(generatedOccurrenceByYearDir, "1900.json"))
      ? "src/data/calendar-note-occurrences/by-year"
      : "src/data/calendar-notes/by-year",
    range: {
      start: days[0]?.date ?? null,
      end: days.at(-1)?.date ?? null,
      count: days.length,
    },
    sourceStatus: masters.some((master) => master.sourceStatus === "hybrid_v0")
      ? "hybrid_v0"
      : ("sample" as const),
    verificationStatus: masters.some(
      (master) => master.verificationStatus === "rule_checked_v0",
    )
      ? "rule_checked_v0"
      : ("legacy_spreadsheet" as const),
    diffCount,
    validationStatus: diffCount === 0 ? "matched" : "mismatched",
    selectedDayCounts,
    note:
      "日別暦注発生マスターは年別JSONから必要な年だけ読み込む。意味文はcalendar-note-definitions側を参照する。",
  };
}

export function getCalendarNoteOccurrenceDays(query: {
  start?: string | null;
  end?: string | null;
} = {}) {
  const summary = getCalendarNoteOccurrenceSummary();
  const start = query.start ?? summary.range.start;
  const end = query.end ?? summary.range.end;

  return listYearsInRange(start, end)
    .flatMap((year) => readOccurrenceYear(year)?.days ?? [])
    .filter((day) => (!start || day.date >= start) && (!end || day.date <= end));
}

export function getCalendarNoteOccurrenceDay(date: string) {
  return (
    readOccurrenceYear(date.slice(0, 4))?.days.find(
      (day) => day.date === date,
    ) ?? null
  );
}

export function getCalendarNoteOccurrenceAround(date: string, days = 7) {
  const centerIndex = dateToIndex(date);
  return getCalendarNoteOccurrenceDays({
    start: indexToDate(centerIndex - days),
    end: indexToDate(centerIndex + days),
  });
}

export function enrichCalendarNoteOccurrence(day: CalendarNoteOccurrenceDay) {
  return {
    ...day,
    definitions: day.notes.selectedDayCodes.map(
      (code) => calendarNoteDefinitions[code],
    ),
    junichokuDefinition: day.notes.junichoku
      ? getCalendarNoteEntry("junichoku", day.notes.junichoku)
      : null,
    nijuhachishukuDefinition: day.notes.nijuhachishuku
      ? getCalendarNoteEntry("nijuhachishuku", day.notes.nijuhachishuku)
      : null,
  };
}
