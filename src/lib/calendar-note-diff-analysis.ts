import { getCalendarMasterRow } from "@/lib/calendar-master-rows";
import {
  getCalendarNoteOccurrenceDays,
  type CalendarNoteOccurrenceDay,
} from "@/lib/calendar-note-occurrences";
import { getSolarTermByDate } from "@/lib/solar-terms";

type DiffClass =
  | "glyph_normalization"
  | "accepted_setsuiri_boundary"
  | "external_reference_override"
  | "setsuiri_boundary"
  | "needs_manual_review";

type DiffOwner =
  | "spreadsheet"
  | "calculated"
  | "boundary_method"
  | "external_reference"
  | "unknown";

export type CalendarNoteDiffAnalysisRow = {
  date: string;
  diff: string;
  kind: "junichoku" | "nijuhachishuku" | "unknown";
  classification: DiffClass;
  likelyCorrect: DiffOwner;
  reason: string;
  context: {
    solarTerm: string | null;
    setsuiriTime: string | null;
    monthBranch: string | null;
    dayBranch: string | null;
  };
};

function classifyDiff(
  occurrence: CalendarNoteOccurrenceDay,
  diff: string,
): CalendarNoteDiffAnalysisRow {
  const row = getCalendarMasterRow(occurrence.date);
  const solarTerm = getSolarTermByDate(occurrence.date);

  if (diff === "nijuhachishuku: spreadsheet=氏 / calculated=氐") {
    return {
      date: occurrence.date,
      diff,
      kind: "nijuhachishuku",
      classification: "glyph_normalization",
      likelyCorrect: "calculated",
      reason:
        "二十八宿の正式名は氐。氏はスプレッドシート側の表記ゆれとして正規化対象。",
      context: {
        solarTerm: solarTerm?.name ?? null,
        setsuiriTime: solarTerm?.timeJst ?? null,
        monthBranch: row?.duplicateMonth ?? null,
        dayBranch: row?.duplicateDay ?? null,
      },
    };
  }

  if (diff.startsWith("junichoku:") && solarTerm?.isSetsuiriForKyusei) {
    return {
      date: occurrence.date,
      diff,
      kind: "junichoku",
      classification:
        occurrence.date === "2021-02-03"
          ? "external_reference_override"
          : "setsuiri_boundary",
      likelyCorrect:
        occurrence.date === "2021-02-03"
          ? "external_reference"
          : "boundary_method",
      reason:
        occurrence.date === "2021-02-03"
          ? "立春が23:59の境界例。日次暦ではこよみのページの検証正本を採用し、命式では出生時刻で別判定する。"
          : "節入り当日の十二直差分。日付単位で月支を切り替えるか、節入り時刻まで前月支を使うかの差。",
      context: {
        solarTerm: solarTerm.name,
        setsuiriTime: solarTerm.timeJst,
        monthBranch: row?.duplicateMonth ?? null,
        dayBranch: row?.duplicateDay ?? null,
      },
    };
  }

  return {
    date: occurrence.date,
    diff,
    kind: diff.startsWith("junichoku:")
      ? "junichoku"
      : diff.startsWith("nijuhachishuku:")
        ? "nijuhachishuku"
        : "unknown",
    classification: "needs_manual_review",
    likelyCorrect: "unknown",
    reason: "既知の表記ゆれ・節入り境界に分類できないため、手元万年暦で確認する。",
    context: {
      solarTerm: solarTerm?.name ?? null,
      setsuiriTime: solarTerm?.timeJst ?? null,
      monthBranch: row?.duplicateMonth ?? null,
      dayBranch: row?.duplicateDay ?? null,
    },
  };
}

export function getCalendarNoteDiffAnalysis() {
  const rows = getCalendarNoteOccurrenceDays({
    start: "1900-01-01",
    end: "2050-12-31",
  }).flatMap((occurrence) =>
    occurrence.diffs.map((diff) => classifyDiff(occurrence, diff)),
  );
  const byClassification = rows.reduce<Record<DiffClass, number>>(
    (counts, row) => {
      counts[row.classification] += 1;
      return counts;
    },
    {
      glyph_normalization: 0,
      accepted_setsuiri_boundary: 0,
      external_reference_override: 0,
      setsuiri_boundary: 0,
      needs_manual_review: 0,
    },
  );

  return {
    range: {
      start: "1900-01-01",
      end: "2050-12-31",
      count: rows.length,
    },
    byClassification,
    rows,
    summary:
      rows.length === 0
        ? "表記ゆれを正規化した結果、残る差分はありません。"
        : "残差分を採用済み節入り境界、未解決境界、手動確認に分類しています。",
  };
}
