import type { LookupTableDefinition } from "@/lib/divination-provenance/types";

export type PersonalKyusei = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type PersonalYearGroup = "A" | "B" | "C";
export type PersonalYearBranch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
export type PersonalMonthBranch = "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥" | "子" | "丑";

export type AnnualNineStarFixture = {
  adoptedYear: number;
  annualNineStar: PersonalKyusei;
};

export type Getsumei36Fixture = {
  fixtureId: string;
  yearGroup: PersonalYearGroup;
  yearBranches: readonly PersonalYearBranch[];
  annualStars: readonly PersonalKyusei[];
  monthBranch: PersonalMonthBranch;
  monthNumber: number;
  monthlyPlateCenterStar: PersonalKyusei;
  getsumeiStar: PersonalKyusei;
};

export type PersonalBoundaryFixture = {
  fixtureId: string;
  techniqueId: "honmei-star-resolution" | "getsumei-star-resolution";
  inputDatetimeJst: string | null;
  inputDate: string;
  birthTimeStatus: "known" | "unknown";
  sourceProjectExactResult: PersonalKyusei | null;
  currentImplementationResult: PersonalKyusei;
  differenceStatus: "match" | "implementation_gap" | "exact_result_unresolved";
};

// 2024〜2032の一巡をsource ledgerの年家九星cycleとして手動固定する。
// production式またはdaily masterから期待値を生成しない。
export const annualNineStarCycleFixtures = [
  { adoptedYear: 2024, annualNineStar: "3" },
  { adoptedYear: 2025, annualNineStar: "2" },
  { adoptedYear: 2026, annualNineStar: "1" },
  { adoptedYear: 2027, annualNineStar: "9" },
  { adoptedYear: 2028, annualNineStar: "8" },
  { adoptedYear: 2029, annualNineStar: "7" },
  { adoptedYear: 2030, annualNineStar: "6" },
  { adoptedYear: 2031, annualNineStar: "5" },
  { adoptedYear: 2032, annualNineStar: "4" },
] as const satisfies readonly AnnualNineStarFixture[];

export const personalStarYearGroups = {
  A: { yearBranches: ["子", "卯", "午", "酉"], annualStars: ["1", "4", "7"] },
  B: { yearBranches: ["丑", "辰", "未", "戌"], annualStars: ["3", "6", "9"] },
  C: { yearBranches: ["寅", "巳", "申", "亥"], annualStars: ["2", "5", "8"] },
} as const satisfies Readonly<Record<PersonalYearGroup, {
  yearBranches: readonly PersonalYearBranch[];
  annualStars: readonly PersonalKyusei[];
}>>;

// 神宮館1935年の3年支群×12節月の36対応を手動固定する。
// 月盤fixture、production式、daily masterから期待値を生成しない。
export const getsumei36Fixtures = [
  { fixtureId: "getsumei-A-寅", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "寅", monthNumber: 2, monthlyPlateCenterStar: "8", getsumeiStar: "8" },
  { fixtureId: "getsumei-A-卯", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "卯", monthNumber: 3, monthlyPlateCenterStar: "7", getsumeiStar: "7" },
  { fixtureId: "getsumei-A-辰", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "辰", monthNumber: 4, monthlyPlateCenterStar: "6", getsumeiStar: "6" },
  { fixtureId: "getsumei-A-巳", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "巳", monthNumber: 5, monthlyPlateCenterStar: "5", getsumeiStar: "5" },
  { fixtureId: "getsumei-A-午", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "午", monthNumber: 6, monthlyPlateCenterStar: "4", getsumeiStar: "4" },
  { fixtureId: "getsumei-A-未", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "未", monthNumber: 7, monthlyPlateCenterStar: "3", getsumeiStar: "3" },
  { fixtureId: "getsumei-A-申", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "申", monthNumber: 8, monthlyPlateCenterStar: "2", getsumeiStar: "2" },
  { fixtureId: "getsumei-A-酉", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "酉", monthNumber: 9, monthlyPlateCenterStar: "1", getsumeiStar: "1" },
  { fixtureId: "getsumei-A-戌", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "戌", monthNumber: 10, monthlyPlateCenterStar: "9", getsumeiStar: "9" },
  { fixtureId: "getsumei-A-亥", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "亥", monthNumber: 11, monthlyPlateCenterStar: "8", getsumeiStar: "8" },
  { fixtureId: "getsumei-A-子", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "子", monthNumber: 12, monthlyPlateCenterStar: "7", getsumeiStar: "7" },
  { fixtureId: "getsumei-A-丑", yearGroup: "A", yearBranches: personalStarYearGroups.A.yearBranches, annualStars: personalStarYearGroups.A.annualStars, monthBranch: "丑", monthNumber: 1, monthlyPlateCenterStar: "6", getsumeiStar: "6" },
  { fixtureId: "getsumei-B-寅", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "寅", monthNumber: 2, monthlyPlateCenterStar: "5", getsumeiStar: "5" },
  { fixtureId: "getsumei-B-卯", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "卯", monthNumber: 3, monthlyPlateCenterStar: "4", getsumeiStar: "4" },
  { fixtureId: "getsumei-B-辰", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "辰", monthNumber: 4, monthlyPlateCenterStar: "3", getsumeiStar: "3" },
  { fixtureId: "getsumei-B-巳", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "巳", monthNumber: 5, monthlyPlateCenterStar: "2", getsumeiStar: "2" },
  { fixtureId: "getsumei-B-午", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "午", monthNumber: 6, monthlyPlateCenterStar: "1", getsumeiStar: "1" },
  { fixtureId: "getsumei-B-未", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "未", monthNumber: 7, monthlyPlateCenterStar: "9", getsumeiStar: "9" },
  { fixtureId: "getsumei-B-申", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "申", monthNumber: 8, monthlyPlateCenterStar: "8", getsumeiStar: "8" },
  { fixtureId: "getsumei-B-酉", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "酉", monthNumber: 9, monthlyPlateCenterStar: "7", getsumeiStar: "7" },
  { fixtureId: "getsumei-B-戌", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "戌", monthNumber: 10, monthlyPlateCenterStar: "6", getsumeiStar: "6" },
  { fixtureId: "getsumei-B-亥", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "亥", monthNumber: 11, monthlyPlateCenterStar: "5", getsumeiStar: "5" },
  { fixtureId: "getsumei-B-子", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "子", monthNumber: 12, monthlyPlateCenterStar: "4", getsumeiStar: "4" },
  { fixtureId: "getsumei-B-丑", yearGroup: "B", yearBranches: personalStarYearGroups.B.yearBranches, annualStars: personalStarYearGroups.B.annualStars, monthBranch: "丑", monthNumber: 1, monthlyPlateCenterStar: "3", getsumeiStar: "3" },
  { fixtureId: "getsumei-C-寅", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "寅", monthNumber: 2, monthlyPlateCenterStar: "2", getsumeiStar: "2" },
  { fixtureId: "getsumei-C-卯", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "卯", monthNumber: 3, monthlyPlateCenterStar: "1", getsumeiStar: "1" },
  { fixtureId: "getsumei-C-辰", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "辰", monthNumber: 4, monthlyPlateCenterStar: "9", getsumeiStar: "9" },
  { fixtureId: "getsumei-C-巳", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "巳", monthNumber: 5, monthlyPlateCenterStar: "8", getsumeiStar: "8" },
  { fixtureId: "getsumei-C-午", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "午", monthNumber: 6, monthlyPlateCenterStar: "7", getsumeiStar: "7" },
  { fixtureId: "getsumei-C-未", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "未", monthNumber: 7, monthlyPlateCenterStar: "6", getsumeiStar: "6" },
  { fixtureId: "getsumei-C-申", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "申", monthNumber: 8, monthlyPlateCenterStar: "5", getsumeiStar: "5" },
  { fixtureId: "getsumei-C-酉", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "酉", monthNumber: 9, monthlyPlateCenterStar: "4", getsumeiStar: "4" },
  { fixtureId: "getsumei-C-戌", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "戌", monthNumber: 10, monthlyPlateCenterStar: "3", getsumeiStar: "3" },
  { fixtureId: "getsumei-C-亥", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "亥", monthNumber: 11, monthlyPlateCenterStar: "2", getsumeiStar: "2" },
  { fixtureId: "getsumei-C-子", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "子", monthNumber: 12, monthlyPlateCenterStar: "1", getsumeiStar: "1" },
  { fixtureId: "getsumei-C-丑", yearGroup: "C", yearBranches: personalStarYearGroups.C.yearBranches, annualStars: personalStarYearGroups.C.annualStars, monthBranch: "丑", monthNumber: 1, monthlyPlateCenterStar: "9", getsumeiStar: "9" },
] as const satisfies readonly Getsumei36Fixture[];

export const personalStarBoundaryFixtures = [
  { fixtureId: "honmei-2026-risshun-before", techniqueId: "honmei-star-resolution", inputDatetimeJst: "2026-02-04T05:02:07+09:00", inputDate: "2026-02-04", birthTimeStatus: "known", sourceProjectExactResult: "2", currentImplementationResult: "1", differenceStatus: "implementation_gap" },
  { fixtureId: "honmei-2026-risshun-at", techniqueId: "honmei-star-resolution", inputDatetimeJst: "2026-02-04T05:02:08+09:00", inputDate: "2026-02-04", birthTimeStatus: "known", sourceProjectExactResult: "1", currentImplementationResult: "1", differenceStatus: "match" },
  { fixtureId: "honmei-2026-risshun-after", techniqueId: "honmei-star-resolution", inputDatetimeJst: "2026-02-04T05:02:09+09:00", inputDate: "2026-02-04", birthTimeStatus: "known", sourceProjectExactResult: "1", currentImplementationResult: "1", differenceStatus: "match" },
  { fixtureId: "getsumei-2026-shosho-before", techniqueId: "getsumei-star-resolution", inputDatetimeJst: "2026-07-07T10:56:56+09:00", inputDate: "2026-07-07", birthTimeStatus: "known", sourceProjectExactResult: "4", currentImplementationResult: "3", differenceStatus: "implementation_gap" },
  { fixtureId: "getsumei-2026-shosho-at", techniqueId: "getsumei-star-resolution", inputDatetimeJst: "2026-07-07T10:56:57+09:00", inputDate: "2026-07-07", birthTimeStatus: "known", sourceProjectExactResult: "3", currentImplementationResult: "3", differenceStatus: "match" },
  { fixtureId: "getsumei-2026-shosho-after", techniqueId: "getsumei-star-resolution", inputDatetimeJst: "2026-07-07T10:56:58+09:00", inputDate: "2026-07-07", birthTimeStatus: "known", sourceProjectExactResult: "3", currentImplementationResult: "3", differenceStatus: "match" },
  { fixtureId: "honmei-2026-risshun-time-unknown", techniqueId: "honmei-star-resolution", inputDatetimeJst: null, inputDate: "2026-02-04", birthTimeStatus: "unknown", sourceProjectExactResult: null, currentImplementationResult: "1", differenceStatus: "exact_result_unresolved" },
  { fixtureId: "getsumei-2026-shosho-time-unknown", techniqueId: "getsumei-star-resolution", inputDatetimeJst: null, inputDate: "2026-07-07", birthTimeStatus: "unknown", sourceProjectExactResult: null, currentImplementationResult: "3", differenceStatus: "exact_result_unresolved" },
] as const satisfies readonly PersonalBoundaryFixture[];

export const personalStarImplementationObservationFixtures = {
  dailyMasterDays: 55_152,
  risshun: { officialEvents: 151, sameDaySwitch: 150, nextDaySwitch: 1, missing: 0 },
  monthlySetsuiri: { officialEvents: 1_812, sameDaySwitch: 1_806, nextDaySwitch: 6, missing: 0 },
  unresolvedRisshunNextDay: [{ date: "1900-02-04", term: "立春" }],
  unresolvedMonthlyNextDay: [
    { date: "1900-01-06", term: "小寒" },
    { date: "1900-02-04", term: "立春" },
    { date: "1902-09-08", term: "白露" },
    { date: "1919-08-08", term: "立秋" },
    { date: "1939-06-06", term: "芒種" },
    { date: "1964-09-07", term: "白露" },
  ],
} as const;

export const personalStarLookupTables = [
  { lookupTableId: "lookup.personal.annual-nine-star-cycle.v1", lookupTableVersion: "1", label: "本命星用年家九星一巡fixture", sourceClaimIds: ["source-claim.jingukan-1935.annual-nine-star-cycle.v1"], projectClaimIds: ["project-claim.personal-star-scope.v1"], entryCount: 9 },
  { lookupTableId: "lookup.personal.getsumei-year-groups.v1", lookupTableVersion: "1", label: "月命星用年支・年星3グループ", sourceClaimIds: ["source-claim.jingukan-1935.monthly-nine-star-36.v1"], projectClaimIds: ["project-claim.personal-star-scope.v1"], entryCount: 3 },
  { lookupTableId: "lookup.personal.getsumei-36.v1", lookupTableVersion: "1", label: "月命星3グループ×12節月", sourceClaimIds: ["source-claim.jingukan-1935.monthly-nine-star-36.v1"], projectClaimIds: ["project-claim.getsumei-role-binding.v1"], entryCount: 36 },
] as const satisfies readonly LookupTableDefinition[];
