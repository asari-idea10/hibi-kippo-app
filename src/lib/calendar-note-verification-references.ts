import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CalendarNoteCode } from "@/lib/calendar-notes";

export type CalendarNoteVerificationReference = {
  date: string;
  sourceName: string;
  sourceUrl: string;
  sourceStatus: "external_reference";
  checkedStatus: "user_visual_matched" | "pending";
  summary: string;
  notes: string[];
  selectedDayCodes: CalendarNoteCode[];
  overrideSelectedDayCodes?: boolean;
  junichoku?: string;
  nijuhachishuku?: string;
  nanajushichishuku?: string;
  roadmapNote: string;
};

type KoyomiReferenceSample = {
  date: string;
  weekday?: string;
  dayPillar?: string;
  junichoku?: string | null;
  nijuhachishuku?: string | null;
  nanajushichishuku?: string | null;
  summary: string;
  selectedDayCodes: string[];
  sourceMemo?: string;
  sourceStatus?: string;
  sourceUrl?: string;
};

type KoyomiReferenceSampleMaster = {
  samples?: KoyomiReferenceSample[];
};

function splitSummaryNotes(summary: string) {
  return summary
    .replaceAll("※", "/")
    .split("/")
    .map((note) => note.trim())
    .filter(Boolean);
}

function getSourceName(sample: KoyomiReferenceSample) {
  if (sample.sourceStatus === "golden_reference") {
    return "こよみのページ 暦注計算CSV";
  }

  return "こよみのページ 暦注計算";
}

function toReference(
  sample: KoyomiReferenceSample,
): CalendarNoteVerificationReference {
  return {
    date: sample.date,
    sourceName: getSourceName(sample),
    sourceUrl:
      sample.sourceUrl ?? "https://koyomi8.com/sub/rekicyuu.html",
    sourceStatus: "external_reference",
    checkedStatus:
      sample.sourceStatus === "golden_reference"
        ? "user_visual_matched"
        : "pending",
    summary: sample.summary,
    notes: splitSummaryNotes(sample.summary),
    selectedDayCodes: sample.selectedDayCodes as CalendarNoteCode[],
    overrideSelectedDayCodes: sample.sourceStatus === "golden_reference",
    junichoku: sample.junichoku ?? undefined,
    nijuhachishuku: sample.nijuhachishuku ?? undefined,
    nanajushichishuku: sample.nanajushichishuku ?? undefined,
    roadmapNote:
      "こよみページCSV由来の正本サンプル。アプリ側の暫定表示と差分がある場合は、この正本を優先して計算式・発生マスターを調整する。",
  };
}

const byYearDir = path.join(
  process.cwd(),
  "src/data/calendar-notes/koyomi-reference-samples/by-year",
);
const legacySamplesPath = path.join(
  process.cwd(),
  "src/data/calendar-notes/koyomi-reference-samples.v0.json",
);

function readSampleMaster(filePath: string): KoyomiReferenceSampleMaster | null {
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as KoyomiReferenceSampleMaster;
}

export function getCalendarNoteVerificationReference(date: string) {
  const year = date.slice(0, 4);
  const yearMaster = readSampleMaster(path.join(byYearDir, `${year}.json`));
  const yearSample = yearMaster?.samples?.find((sample) => sample.date === date);

  if (yearSample) {
    return toReference(yearSample);
  }

  const legacyMaster = readSampleMaster(legacySamplesPath);
  const legacySample = legacyMaster?.samples?.find(
    (sample) => sample.date === date,
  );

  return legacySample ? toReference(legacySample) : null;
}
