import type { CalendarNoteCode } from "@/lib/calendar-notes";

export type SelectedDayCandidateInput = {
  calendarMonth: number;
  dayPillar: string;
  solarMonthBranch: string;
  dayBranch: string;
  lunarMonth: number | null;
  lunarDay: number | null;
  isLeapMonth: boolean | null;
};

export type SelectedDayCandidate = {
  code: Extract<
    CalendarNoteCode,
    | "ichiryumanbaibi"
    | "sanrinbou"
    | "fujoju"
    | "tensha_bi"
    | "tenten_satsu"
    | "jiten_satsu"
    | "shihai_nichi"
  >;
  name: string;
  isActive: boolean;
  ruleId: string;
  ruleLabel: string;
  basis: string;
  inputs: Record<string, string | number | boolean | null>;
  confidence: "candidate_v0";
};

const solarMonthNumbersByBranch: Record<string, number> = {
  寅: 1,
  卯: 2,
  辰: 3,
  巳: 4,
  午: 5,
  未: 6,
  申: 7,
  酉: 8,
  戌: 9,
  亥: 10,
  子: 11,
  丑: 12,
};

const ichiryumanbaibiBranchesBySolarMonth: Record<number, string[]> = {
  1: ["丑", "午"],
  2: ["酉", "寅"],
  3: ["子", "卯"],
  4: ["卯", "辰"],
  5: ["巳", "午"],
  6: ["酉", "午"],
  7: ["子", "未"],
  8: ["卯", "申"],
  9: ["午", "酉"],
  10: ["酉", "戌"],
  11: ["亥", "子"],
  12: ["卯", "子"],
};

const sanrinbouBranchBySolarMonth: Record<number, string> = {
  1: "亥",
  2: "寅",
  3: "午",
  4: "亥",
  5: "寅",
  6: "午",
  7: "亥",
  8: "寅",
  9: "午",
  10: "亥",
  11: "寅",
  12: "午",
};

const fujojuDaysByLunarMonth: Record<number, number[]> = {
  1: [3, 11, 19, 27],
  2: [2, 10, 18, 26],
  3: [1, 9, 17, 25],
  4: [4, 12, 20, 28],
  5: [5, 13, 21, 29],
  6: [6, 14, 22, 30],
  7: [3, 11, 19, 27],
  8: [2, 10, 18, 26],
  9: [1, 9, 17, 25],
  10: [4, 12, 20, 28],
  11: [5, 13, 21, 29],
  12: [6, 14, 22, 30],
};

type LowerCalendarNoteSeason = "春" | "夏" | "秋" | "冬";

const lowerCalendarNoteSeasonByCalendarMonth: Record<
  number,
  LowerCalendarNoteSeason
> = {
  1: "冬",
  2: "春",
  3: "春",
  4: "春",
  5: "夏",
  6: "夏",
  7: "夏",
  8: "秋",
  9: "秋",
  10: "秋",
  11: "冬",
  12: "冬",
};

const lowerCalendarNotePillarsBySeason: Record<
  LowerCalendarNoteSeason,
  Record<"tensha_bi" | "tenten_satsu" | "jiten_satsu" | "shihai_nichi", string>
> = {
  春: {
    tensha_bi: "戊寅",
    tenten_satsu: "乙卯",
    jiten_satsu: "辛卯",
    shihai_nichi: "庚申",
  },
  夏: {
    tensha_bi: "甲午",
    tenten_satsu: "丙午",
    jiten_satsu: "戊午",
    shihai_nichi: "壬子",
  },
  秋: {
    tensha_bi: "戊申",
    tenten_satsu: "辛酉",
    jiten_satsu: "癸酉",
    shihai_nichi: "甲寅",
  },
  冬: {
    tensha_bi: "甲子",
    tenten_satsu: "壬子",
    jiten_satsu: "丙子",
    shihai_nichi: "丙午",
  },
};

const lowerCalendarNoteLabels = {
  tensha_bi: "天赦日",
  tenten_satsu: "天轉殺",
  jiten_satsu: "地轉殺",
  shihai_nichi: "四癈日",
} as const;

function solarMonthLabel(month: number | null) {
  return month ? `節月${month}月` : "節月不明";
}

export function calculateSelectedDayCandidates(
  input: SelectedDayCandidateInput,
): SelectedDayCandidate[] {
  const solarMonth = solarMonthNumbersByBranch[input.solarMonthBranch] ?? null;
  const ichiryumanbaibiBranches = solarMonth
    ? ichiryumanbaibiBranchesBySolarMonth[solarMonth]
    : [];
  const sanrinbouBranch = solarMonth
    ? sanrinbouBranchBySolarMonth[solarMonth]
    : null;
  const fujojuDays = input.lunarMonth
    ? fujojuDaysByLunarMonth[input.lunarMonth]
    : [];
  const lowerCalendarNoteSeason =
    lowerCalendarNoteSeasonByCalendarMonth[input.calendarMonth] ?? null;
  const lowerCalendarNotePillars = lowerCalendarNoteSeason
    ? lowerCalendarNotePillarsBySeason[lowerCalendarNoteSeason]
    : null;
  const lowerCalendarNoteCandidates = lowerCalendarNotePillars
    ? (Object.entries(lowerCalendarNotePillars) as Array<
        [
          keyof typeof lowerCalendarNoteLabels,
          string,
        ]
      >).map(([code, pillar]) => ({
        code,
        name: lowerCalendarNoteLabels[code],
        isActive: input.dayPillar === pillar,
        ruleId: `${code}_season_day_pillar_v0`,
        ruleLabel: "手元万年暦方式: 季節別の日干支",
        basis: `${lowerCalendarNoteSeason}: ${pillar}の日`,
        inputs: {
          calendarMonth: input.calendarMonth,
          season: lowerCalendarNoteSeason,
          dayPillar: input.dayPillar,
        },
        confidence: "candidate_v0" as const,
      }))
    : [];

  return [
    {
      code: "ichiryumanbaibi",
      name: "一粒万倍日",
      isActive: ichiryumanbaibiBranches.includes(input.dayBranch),
      ruleId: "ichiryumanbaibi_solar_month_day_branch_v0",
      ruleLabel: "こよみページ方式I: 節月ごとの対象日支",
      basis: `${solarMonthLabel(solarMonth)}: ${ichiryumanbaibiBranches.join("・") || "-"}の日`,
      inputs: {
        solarMonthBranch: input.solarMonthBranch,
        solarMonth,
        dayBranch: input.dayBranch,
      },
      confidence: "candidate_v0",
    },
    {
      code: "sanrinbou",
      name: "三隣亡",
      isActive: sanrinbouBranch === input.dayBranch,
      ruleId: "sanrinbou_solar_month_day_branch_v0",
      ruleLabel: "こよみページ方式: 節月ごとの対象日支",
      basis: `${solarMonthLabel(solarMonth)}: ${sanrinbouBranch ?? "-"}の日`,
      inputs: {
        solarMonthBranch: input.solarMonthBranch,
        solarMonth,
        dayBranch: input.dayBranch,
      },
      confidence: "candidate_v0",
    },
    {
      code: "fujoju",
      name: "不成就日",
      isActive:
        Boolean(input.lunarMonth && input.lunarDay) &&
        !input.isLeapMonth &&
        fujojuDays.includes(input.lunarDay ?? -1),
      ruleId: "fujoju_lunar_month_day_v0",
      ruleLabel: "こよみページ方式: 旧暦月ごとの対象日",
      basis: `旧暦${input.lunarMonth ?? "-"}月: ${fujojuDays.join("・") || "-"}日`,
      inputs: {
        lunarMonth: input.lunarMonth,
        lunarDay: input.lunarDay,
        isLeapMonth: input.isLeapMonth,
      },
      confidence: "candidate_v0",
    },
    ...lowerCalendarNoteCandidates,
  ];
}

export function compareSelectedDayCandidates(
  candidates: SelectedDayCandidate[],
  adoptedCodes: CalendarNoteCode[],
) {
  const candidateCodes = candidates
    .filter((candidate) => candidate.isActive)
    .map((candidate) => candidate.code as string);
  const scopedCodes = candidates.map((candidate) => candidate.code);
  const adoptedScopedCodes = adoptedCodes.filter((code) =>
    scopedCodes.includes(code as SelectedDayCandidate["code"]),
  ).map((code) => code as string);

  return {
    status:
      candidateCodes.length === adoptedScopedCodes.length &&
      candidateCodes.every((code) => adoptedScopedCodes.includes(code))
        ? ("matched" as const)
        : ("mismatched" as const),
    candidateCodes,
    adoptedScopedCodes,
    candidateOnly: candidateCodes.filter(
      (code) => !adoptedScopedCodes.includes(code),
    ),
    adoptedOnly: adoptedScopedCodes.filter(
      (code) => !candidateCodes.includes(code),
    ),
  };
}
