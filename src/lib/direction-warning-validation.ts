import { getCalendarDays } from "@/lib/calendar-day";
import type { CalendarDay, DirectionWarnings } from "@/lib/calendar-day";

type BoardKey = "year" | "month" | "day";
type WarningKey = keyof DirectionWarnings;

type DirectionSpotCheck = {
  date: string;
  board: BoardKey;
  expected: DirectionWarnings;
  reason: string;
};

const columnMapping: Record<BoardKey, Record<WarningKey, string>> = {
  year: {
    ankensatsu: "AN",
    gohosatsu: "AO",
    saiha: "AP",
  },
  month: {
    ankensatsu: "AQ",
    gohosatsu: "AR",
    saiha: "AS",
  },
  day: {
    ankensatsu: "AT",
    gohosatsu: "AU",
    saiha: "AV",
  },
};

const spotChecks: DirectionSpotCheck[] = [
  {
    date: "2026-05-16",
    board: "year",
    expected: { ankensatsu: "北", gohosatsu: "南", saiha: "北" },
    reason: "取り込み開始日の年盤スポットチェック",
  },
  {
    date: "2026-05-16",
    board: "month",
    expected: { ankensatsu: "", gohosatsu: "", saiha: "北西" },
    reason: "取り込み開始日の月盤スポットチェック",
  },
  {
    date: "2026-05-16",
    board: "day",
    expected: { ankensatsu: "東", gohosatsu: "西", saiha: "南西" },
    reason: "取り込み開始日の日盤スポットチェック",
  },
  {
    date: "2026-06-06",
    board: "month",
    expected: { ankensatsu: "南東", gohosatsu: "北西", saiha: "北" },
    reason: "芒種・節入り日の月盤切替スポットチェック",
  },
  {
    date: "2026-06-06",
    board: "day",
    expected: { ankensatsu: "北西", gohosatsu: "南東", saiha: "南東" },
    reason: "芒種・節入り日の日盤スポットチェック",
  },
  {
    date: "2026-06-14",
    board: "day",
    expected: { ankensatsu: "", gohosatsu: "", saiha: "北東" },
    reason: "取り込み最終日の日盤スポットチェック",
  },
];

function compareDirectionWarnings(actual: DirectionWarnings, expected: DirectionWarnings) {
  return {
    ankensatsu: actual.ankensatsu === expected.ankensatsu,
    gohosatsu: actual.gohosatsu === expected.gohosatsu,
    saiha: actual.saiha === expected.saiha,
  };
}

function isPassed(result: ReturnType<typeof compareDirectionWarnings>) {
  return Object.values(result).every(Boolean);
}

function countFilledWarnings(days: CalendarDay[], board: BoardKey) {
  return days.reduce(
    (total, day) => {
      const warnings = day.directionWarnings[board];
      return {
        ankensatsu: total.ankensatsu + Number(warnings.ankensatsu !== ""),
        gohosatsu: total.gohosatsu + Number(warnings.gohosatsu !== ""),
        saiha: total.saiha + Number(warnings.saiha !== ""),
      };
    },
    { ankensatsu: 0, gohosatsu: 0, saiha: 0 },
  );
}

export function getDirectionWarningValidation() {
  const days = getCalendarDays();
  const checks = spotChecks.map((check) => {
    const day = days.find((value) => value.date === check.date);
    const actual = day?.directionWarnings[check.board] ?? {
      ankensatsu: "",
      gohosatsu: "",
      saiha: "",
    };
    const matches = compareDirectionWarnings(actual, check.expected);

    return {
      ...check,
      actual,
      matches,
      passed: Boolean(day) && isPassed(matches),
      sourceColumns: columnMapping[check.board],
    };
  });
  const passed = checks.filter((check) => check.passed).length;

  return {
    status: passed === checks.length ? "passed" : "failed",
    source: {
      workbook: "★フォーチューンマイレージマスタ",
      sheet: "年月日",
      range: "AN:AV",
    },
    columnMapping,
    summary: {
      checkedRows: days.length,
      spotChecks: checks.length,
      passed,
      failed: checks.length - passed,
      dateRange: {
        start: days[0]?.date ?? null,
        end: days.at(-1)?.date ?? null,
      },
    },
    filledCounts: {
      year: countFilledWarnings(days, "year"),
      month: countFilledWarnings(days, "month"),
      day: countFilledWarnings(days, "day"),
    },
    checks,
  };
}
