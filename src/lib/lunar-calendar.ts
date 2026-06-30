import lunarCalendarData from "@/data/lunar-calendar-2026.sample.json";
import lunarMonthData from "@/data/lunar-months-2026.sample.json";

export type Rokuyo = "先勝" | "友引" | "先負" | "仏滅" | "大安" | "赤口";

export type SourceStatus =
  | "verified"
  | "calculated"
  | "sample_cross_checked"
  | "sample_calculated"
  | "provisional"
  | "legacy"
  | "mismatched";

export type LunarMonthMasterEntry = {
  monthKey: string;
  lunarYear: number;
  lunarMonth: number;
  isLeapMonth: boolean;
  monthIndexInYear: number;
  monthSize: "large" | "small" | "unknown";
  dayCount: 29 | 30 | null;
  newMoonDate: string | null;
  newMoonDatetimeJst: string | null;
  nextNewMoonDate: string;
  nextNewMoonDatetimeJst: string | null;
  containsChuki: boolean | null;
  chukiName: string | null;
  chukiDate: string | null;
  sourceStatus: SourceStatus;
  verification: {
    status: "pending" | "matched" | "mismatched";
    sources: Array<{
      name: string;
      type: "book" | "official" | "third_party" | "calculation";
      checkedAt: string | null;
      result: "matched" | "mismatched" | "reference_only";
    }>;
    diffs: string[];
  };
  sourceNote?: string;
};

export type LunarCalendarDayMasterEntry = {
  date: string;
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
    monthIndexInYear: number;
    monthKey: string;
    monthSize: LunarMonthMasterEntry["monthSize"];
    monthDayCount: LunarMonthMasterEntry["dayCount"];
    newMoonDate: string;
    nextNewMoonDate: string;
    display: string;
  };
  rokuyo: {
    name: Rokuyo;
    index: number;
    calculation: {
      method: "lunar_month_plus_lunar_day_mod_6";
      formula: "(lunarMonth + lunarDay) % 6";
      value: number;
    };
    displayText: string;
  };
  sourceStatus: SourceStatus;
  verification: {
    status: "pending" | "matched" | "mismatched";
    checkedFields: string[];
    sources: Array<{
      name: string;
      type: "book" | "official" | "third_party" | "calculation";
      checkedAt: string | null;
      result: "matched" | "mismatched" | "reference_only";
    }>;
    diffs: string[];
  };
  generator: {
    method: string;
    version: string;
    generatedAt: string | null;
  };
};

export type LunarCalendarEntry = {
  date: string;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  monthSize: "large" | "small" | "unknown";
  rokuyo: Rokuyo;
  sourceStatus: "sample_cross_checked" | "sample_calculated";
  sourceNote: string;
};

export const formalLunarCalendarSchemaSummary = {
  dayMaster: "LunarCalendarDayMasterEntry",
  monthMaster: "LunarMonthMasterEntry",
  requiredVerificationFields: [
    "newMoonDate",
    "isLeapMonth",
    "monthSize",
    "containsChuki",
    "lunarMonth",
    "lunarDay",
    "rokuyo",
  ],
  sourceStatusValues: [
    "verified",
    "calculated",
    "sample_cross_checked",
    "sample_calculated",
    "provisional",
    "legacy",
    "mismatched",
  ],
} as const;

const lunarCalendar = lunarCalendarData as LunarCalendarEntry[];
const lunarMonths = lunarMonthData as LunarMonthMasterEntry[];
const lunarCalendarByDate = new Map(
  lunarCalendar.map((entry) => [entry.date, entry]),
);
const lunarMonthsByKey = new Map(
  lunarMonths.map((entry) => [entry.monthKey, entry]),
);

const rokuyoByRemainder: Record<number, Rokuyo> = {
  0: "大安",
  1: "赤口",
  2: "先勝",
  3: "友引",
  4: "先負",
  5: "仏滅",
};

function getMonthKey(entry: LunarCalendarEntry) {
  return `${entry.lunarYear}-${String(entry.lunarMonth).padStart(2, "0")}`;
}

export function calculateRokuyo(lunarMonth: number, lunarDay: number): Rokuyo {
  return rokuyoByRemainder[(lunarMonth + lunarDay) % 6];
}

export function getLunarCalendar(date: string) {
  return lunarCalendarByDate.get(date) ?? null;
}

export function getLunarCalendars(query: { year?: string | null } = {}) {
  return lunarCalendar.filter((entry) => {
    if (query.year && !entry.date.startsWith(`${query.year}-`)) {
      return false;
    }

    return true;
  });
}

export function getLunarMonths(query: { year?: string | null } = {}) {
  return lunarMonths.filter((entry) => {
    if (query.year && !entry.monthKey.startsWith(`${query.year}-`)) {
      return false;
    }

    return true;
  });
}

export function getLunarCalendarValidation() {
  const checks: Array<{
    id: string;
    label: string;
    status: "passed" | "failed";
    detail: string;
  }> = [];

  const sortedDays = [...lunarCalendar].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const rokuyoMismatches = sortedDays.filter(
    (entry) => calculateRokuyo(entry.lunarMonth, entry.lunarDay) !== entry.rokuyo,
  );

  checks.push({
    id: "rokuyo_formula",
    label: "六曜算出",
    status: rokuyoMismatches.length === 0 ? "passed" : "failed",
    detail:
      rokuyoMismatches.length === 0
        ? "全サンプルで (旧暦月 + 旧暦日) % 6 と六曜が一致。"
        : `${rokuyoMismatches.length}件の六曜不一致があります。`,
  });

  const continuityDiffs: string[] = [];

  for (let index = 1; index < sortedDays.length; index += 1) {
    const previous = sortedDays[index - 1];
    const current = sortedDays[index];
    const sameLunarMonth =
      previous.lunarYear === current.lunarYear &&
      previous.lunarMonth === current.lunarMonth &&
      previous.isLeapMonth === current.isLeapMonth;
    const expectedDay = sameLunarMonth ? previous.lunarDay + 1 : 1;

    if (current.lunarDay !== expectedDay) {
      continuityDiffs.push(
        `${current.date}: expected lunar day ${expectedDay}, actual ${current.lunarDay}`,
      );
    }
  }

  checks.push({
    id: "lunar_day_continuity",
    label: "旧暦日の連続性",
    status: continuityDiffs.length === 0 ? "passed" : "failed",
    detail:
      continuityDiffs.length === 0
        ? "サンプル範囲内の旧暦日は連続しています。"
        : continuityDiffs.join(" / "),
  });

  const missingMonthKeys = [
    ...new Set(sortedDays.map((entry) => getMonthKey(entry))),
  ].filter((monthKey) => !lunarMonthsByKey.has(monthKey));

  checks.push({
    id: "month_master_connection",
    label: "月マスター接続",
    status: missingMonthKeys.length === 0 ? "passed" : "failed",
    detail:
      missingMonthKeys.length === 0
        ? "サンプルに登場する旧暦月は月マスターへ接続済み。"
        : `月マスター未接続: ${missingMonthKeys.join(", ")}`,
  });

  const monthRangeDiffs = lunarMonths.flatMap((month) => {
    const days = sortedDays.filter((entry) => getMonthKey(entry) === month.monthKey);
    const maxDay = Math.max(...days.map((entry) => entry.lunarDay));

    if (days.length === 0 || !month.dayCount) {
      return [];
    }

    if (maxDay > month.dayCount) {
      return [
        `${month.monthKey}: max lunar day ${maxDay} exceeds dayCount ${month.dayCount}`,
      ];
    }

    return [];
  });

  checks.push({
    id: "month_day_count_range",
    label: "月大小と日数範囲",
    status: monthRangeDiffs.length === 0 ? "passed" : "failed",
    detail:
      monthRangeDiffs.length === 0
        ? "サンプル日付は月マスターの日数範囲内に収まっています。"
        : monthRangeDiffs.join(" / "),
  });

  const failed = checks.filter((check) => check.status === "failed").length;

  return {
    status: failed === 0 ? ("passed" as const) : ("failed" as const),
    summary: {
      total: checks.length,
      passed: checks.length - failed,
      failed,
    },
    checks,
  };
}

export function getLunarCalendarSummary() {
  const dates = lunarCalendar.map((entry) => entry.date).sort();

  return {
    total: lunarCalendar.length,
    range: {
      start: dates[0] ?? null,
      end: dates.at(-1) ?? null,
    },
    sourceStatus: "sample" as const,
    sourcePolicy:
      "旧暦マスター正式化前の30日サンプル。旧暦月日を正本化し、六曜は旧暦月日から再計算・検算する。",
    formalSchema: formalLunarCalendarSchemaSummary,
    monthMaster: {
      total: lunarMonths.length,
      connectedMonthKeys: lunarMonths.map((entry) => entry.monthKey),
    },
    nextVerification:
      "1900〜2050年へ広げる前に、国立天文台/万年暦/第三者旧暦表で朔日・閏月・月大小を検算する。",
  };
}
