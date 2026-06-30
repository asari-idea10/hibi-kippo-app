import doyoPeriodData from "@/data/doyo-periods-1900-2050.koyomi-v0.json";
import { getCalendarDay, type CalendarDay } from "@/lib/calendar-day";
import { getSolarTerms } from "@/lib/solar-terms";

export type DoyoSeason = "winter" | "spring" | "summer" | "autumn";

export type DoyoPeriod = {
  id: string;
  year: string;
  season: DoyoSeason;
  label: string;
  startDate: string;
  endDate: string;
  startSolarLongitude: 297 | 27 | 117 | 207;
  endSolarLongitude?: 315 | 45 | 135 | 225;
  boundaryTerm: {
    name: "立春" | "立夏" | "立秋" | "立冬";
    date: string;
    timeJst: string;
  };
  doyoSatsuDirection: string;
  manichiBranches: string[];
  seasonalDoyoDayBranch?: "戌" | "丑" | "辰" | "未";
  seasonalDoyoDays?: Array<{
    date: string;
    branch: string;
    label: string;
  }>;
  manichi?: Array<{
    date: string;
    branch: string;
  }>;
  method:
    | "koyomi8_public_js_generated_v0"
    | "koyomi_solar_longitude_interpolation_v0";
  sourceStatus: "koyomi_reference_priority_v0";
  sourceUrl: "https://koyomi8.com/sub/doyou.html";
  note: string;
};

export type DoyoManualCheckTarget = {
  date: string;
  periodLabel: string;
  checkItem: string;
  expected: string;
  reason: string;
};

const doyoBoundaries = [
  {
    term: "立春",
    startSolarLongitude: 297,
    previousTerm: "小寒",
    nextTerm: "大寒",
    season: "winter",
    label: "冬土用",
    doyoSatsuDirection: "北東",
    manichiBranches: ["寅", "卯", "巳"],
    seasonalDoyoDayBranch: "未",
  },
  {
    term: "立夏",
    startSolarLongitude: 27,
    previousTerm: "清明",
    nextTerm: "穀雨",
    season: "spring",
    label: "春土用",
    doyoSatsuDirection: "南東",
    manichiBranches: ["巳", "午", "酉"],
    seasonalDoyoDayBranch: "戌",
  },
  {
    term: "立秋",
    startSolarLongitude: 117,
    previousTerm: "小暑",
    nextTerm: "大暑",
    season: "summer",
    label: "夏土用",
    doyoSatsuDirection: "南西",
    manichiBranches: ["卯", "辰", "申"],
    seasonalDoyoDayBranch: "丑",
  },
  {
    term: "立冬",
    startSolarLongitude: 207,
    previousTerm: "寒露",
    nextTerm: "霜降",
    season: "autumn",
    label: "秋土用",
    doyoSatsuDirection: "北西",
    manichiBranches: ["未", "酉", "亥"],
    seasonalDoyoDayBranch: "辰",
  },
] as const;

const generatedDoyoPeriods = doyoPeriodData as DoyoPeriod[];

function dateToIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index: number) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function timestampToFixedJstDate(timestamp: number) {
  return new Date(timestamp + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function interpolateDoyoStartDate(
  terms: ReturnType<typeof getSolarTerms>,
  boundary: (typeof doyoBoundaries)[number],
) {
  const previous = terms.find((entry) => entry.name === boundary.previousTerm);
  const next = terms.find((entry) => entry.name === boundary.nextTerm);

  if (!previous || !next) {
    return null;
  }

  const longitudeSpan = next.solarLongitude - previous.solarLongitude;
  const ratio =
    (boundary.startSolarLongitude - previous.solarLongitude) / longitudeSpan;
  const previousTime = new Date(previous.datetimeJst).getTime();
  const nextTime = new Date(next.datetimeJst).getTime();
  const crossingTime = previousTime + (nextTime - previousTime) * ratio;

  return timestampToFixedJstDate(crossingTime);
}

function getGeneratedDoyoPeriods(year: string): DoyoPeriod[] | null {
  const periods = generatedDoyoPeriods.filter((period) => period.year === year);

  return periods.length > 0 ? periods.map(enrichDoyoPeriod) : null;
}

function getSeasonalDoyoDayBranch(season: DoyoSeason) {
  return doyoBoundaries.find((boundary) => boundary.season === season)
    ?.seasonalDoyoDayBranch;
}

function getSeasonalDoyoDayLabel(branch: string) {
  return `土用の${branch}の日`;
}

function getSeasonalDoyoDays(period: DoyoPeriod) {
  const branch = getSeasonalDoyoDayBranch(period.season);

  if (!branch) {
    return [];
  }

  const days = [];

  for (
    let index = dateToIndex(period.startDate);
    index <= dateToIndex(period.endDate);
    index += 1
  ) {
    const date = indexToDate(index);
    const day = getCalendarDay(date);

    if (day?.branches.day === branch) {
      days.push({
        date,
        branch,
        label: getSeasonalDoyoDayLabel(branch),
      });
    }
  }

  return days;
}

function enrichDoyoPeriod(period: DoyoPeriod): DoyoPeriod {
  const seasonalDoyoDayBranch = getSeasonalDoyoDayBranch(period.season);

  return {
    ...period,
    seasonalDoyoDayBranch,
    seasonalDoyoDays: getSeasonalDoyoDays(period),
  };
}

function getInterpolatedDoyoPeriods(year: string): DoyoPeriod[] {
  const terms = getSolarTerms({ year });

  return doyoBoundaries.flatMap((boundary) => {
      const term = terms.find((entry) => entry.name === boundary.term);
      const startDate = interpolateDoyoStartDate(terms, boundary);

      if (!term || !startDate) {
        return [];
      }

      const boundaryIndex = dateToIndex(term.date);

      const period = {
        id: `${year}-${boundary.season}-doyo`,
        year,
        season: boundary.season,
        label: boundary.label,
        startDate,
        endDate: indexToDate(boundaryIndex - 1),
        startSolarLongitude: boundary.startSolarLongitude,
        boundaryTerm: {
          name: term.name as DoyoPeriod["boundaryTerm"]["name"],
          date: term.date,
          timeJst: term.timeJst,
        },
        doyoSatsuDirection: boundary.doyoSatsuDirection,
        manichiBranches: [...boundary.manichiBranches],
        seasonalDoyoDayBranch: boundary.seasonalDoyoDayBranch,
        method: "koyomi_solar_longitude_interpolation_v0",
        sourceStatus: "koyomi_reference_priority_v0",
        sourceUrl: "https://koyomi8.com/sub/doyou.html",
        note:
          "こよみのページの定義を優先し、土用入りを太陽黄経297/27/117/207度の通過日として扱うv0。本体ではSwiss Ephemerisを直接組み込まず、既存の二十四節気マスターから補間して検証する。",
      } satisfies DoyoPeriod;

      return [enrichDoyoPeriod(period)];
    });
}

export function getDoyoPeriods(year: string): DoyoPeriod[] {
  return getGeneratedDoyoPeriods(year) ?? getInterpolatedDoyoPeriods(year);
}

export function getDoyoManualCheckTargets(year: string): DoyoManualCheckTarget[] {
  const targets = getDoyoPeriods(year).flatMap((period) => {
    const periodTargets: DoyoManualCheckTarget[] = [
      {
        date: period.startDate,
        periodLabel: period.label,
        checkItem: "土用入り",
        expected: `${period.label} 1日目 / 土用殺 ${period.doyoSatsuDirection}`,
        reason: "期間開始日が万年暦の土用入りと一致するか確認する。",
      },
      {
        date: period.endDate,
        periodLabel: period.label,
        checkItem: "土用最終日",
        expected: `${period.label} 最終日 / 翌日 ${period.boundaryTerm.name}`,
        reason: "四立前日までを土用として扱うv0の終端を確認する。",
      },
      {
        date: period.boundaryTerm.date,
        periodLabel: period.label,
        checkItem: "土用明け",
        expected: `${period.boundaryTerm.name} / 土用期間外`,
        reason: "四立当日は土用ではなく、季節切替日として扱うことを確認する。",
      },
    ];
    const firstManichiByBranch = period.manichiBranches.flatMap((branch) => {
      for (
        let index = dateToIndex(period.startDate);
        index <= dateToIndex(period.endDate);
        index += 1
      ) {
        const date = indexToDate(index);
        const day = getCalendarDay(date);

        if (day?.branches.day === branch) {
          return [
            {
              date,
              periodLabel: period.label,
              checkItem: `間日 ${branch}日`,
              expected: `${period.label} / 間日 / 日支 ${branch}`,
              reason: "各土用の間日支が、日支と一致した日に表示されるか確認する。",
            },
          ];
        }
      }

      return [];
    });
    const seasonalDoyoDayTargets =
      period.seasonalDoyoDays?.slice(0, 2).map((day) => ({
        date: day.date,
        periodLabel: period.label,
        checkItem: day.label,
        expected: `${period.label} / ${day.label} / 日支 ${day.branch}`,
        reason:
          "春戌・夏丑・秋辰・冬未の季節別土用日が、日支と一致した日に表示されるか確認する。",
      })) ?? [];

    return [...periodTargets, ...firstManichiByBranch, ...seasonalDoyoDayTargets];
  });

  return targets.sort((a, b) => a.date.localeCompare(b.date));
}

export function getDoyoContextByDate(date: string) {
  const years = [String(Number(date.slice(0, 4)) - 1), date.slice(0, 4)];
  const periods = years.flatMap((year) => getDoyoPeriods(year));
  const dateIndex = dateToIndex(date);
  const activePeriod =
    periods.find(
      (period) =>
        dateIndex >= dateToIndex(period.startDate) &&
        dateIndex <= dateToIndex(period.endDate),
    ) ?? null;

  if (!activePeriod) {
    return {
      isDoyo: false,
      period: null,
      dayIndexInDoyo: null,
      sourceStatus: "koyomi_reference_priority_v0" as const,
    };
  }

  return {
    isDoyo: true,
    period: activePeriod,
    dayIndexInDoyo: dateIndex - dateToIndex(activePeriod.startDate) + 1,
    sourceStatus: "koyomi_reference_priority_v0" as const,
  };
}

export function getDoyoComparison(day: CalendarDay) {
  const calculated = getDoyoContextByDate(day.date);
  const dayBranch = day.branches.day;
  const isManichi = Boolean(
    calculated.period?.manichiBranches.includes(dayBranch),
  );
  const isSeasonalDoyoDay = Boolean(
    calculated.period?.seasonalDoyoDayBranch === dayBranch,
  );
  const spreadsheet = {
    isDoyo: day.doyo.isDoyo,
    label: day.doyo.label,
    source: "★フォーチューンマイレージマスタ > 年月日 土用列",
  };
  const diffs = [
    spreadsheet.isDoyo !== calculated.isDoyo
      ? `土用判定: スプシ=${spreadsheet.isDoyo} / v0=${calculated.isDoyo}`
      : null,
  ].filter((diff): diff is string => Boolean(diff));

  return {
    status: diffs.length === 0 ? ("matched" as const) : ("mismatched" as const),
    spreadsheet,
    calculated: {
      ...calculated,
      dayBranch,
      isManichi,
      isSeasonalDoyoDay,
      doyoSatsuDirection: calculated.period?.doyoSatsuDirection ?? null,
    },
    diffs,
  };
}
