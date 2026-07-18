import type { LookupTableDefinition } from "@/lib/divination-provenance/types";

export type MonthlyPlateGroup = "A" | "B" | "C";
export type Kyusei = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type YearBranch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
export type MonthBranch = "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥" | "子" | "丑";
export type Direction8 = "北" | "北東" | "東" | "南東" | "南" | "南西" | "西" | "北西";
export type Palace = Direction8 | "中央";
export type SourcePosition = "top" | "upper_right" | "right" | "lower_right" | "bottom" | "lower_left" | "left" | "upper_left" | "center";

export type MonthlyPlateLevel1Fixture = {
  fixtureId: string;
  yearGroup: MonthlyPlateGroup;
  yearBranches: readonly YearBranch[];
  monthBranch: MonthBranch;
  monthNumber: number;
  centerStar: Kyusei;
  palaceStars: Readonly<Record<Palace, Kyusei>>;
  gohosatsu: Direction8 | null;
  ankensatsu: Direction8 | null;
  monthBreaker: Direction8;
  sourceOrientationLookupId: "lookup.monthly.source-orientation.v1";
};

export const sourcePositionToDirection8 = {
  top: "南",
  upper_right: "南西",
  right: "西",
  lower_right: "北西",
  bottom: "北",
  lower_left: "北東",
  left: "東",
  upper_left: "南東",
  center: "中央",
} as const satisfies Readonly<Record<SourcePosition, Palace>>;

export const oppositeDirections8 = {
  北: "南",
  北東: "南西",
  東: "西",
  南東: "北西",
  南: "北",
  南西: "北東",
  西: "東",
  北西: "南東",
} as const satisfies Readonly<Record<Direction8, Direction8>>;

export const monthlyYearGroups = {
  A: { yearBranches: ["子", "卯", "午", "酉"], yearStars: ["1", "4", "7"] },
  B: { yearBranches: ["丑", "辰", "未", "戌"], yearStars: ["3", "6", "9"] },
  C: { yearBranches: ["寅", "巳", "申", "亥"], yearStars: ["2", "5", "8"] },
} as const satisfies Readonly<Record<MonthlyPlateGroup, { yearBranches: readonly YearBranch[]; yearStars: readonly Kyusei[] }>>;

export const palaceStarsByCenter = {
  "1": { 北: "6", 北東: "4", 東: "8", 南東: "9", 南: "5", 南西: "7", 西: "3", 北西: "2", 中央: "1" },
  "2": { 北: "7", 北東: "5", 東: "9", 南東: "1", 南: "6", 南西: "8", 西: "4", 北西: "3", 中央: "2" },
  "3": { 北: "8", 北東: "6", 東: "1", 南東: "2", 南: "7", 南西: "9", 西: "5", 北西: "4", 中央: "3" },
  "4": { 北: "9", 北東: "7", 東: "2", 南東: "3", 南: "8", 南西: "1", 西: "6", 北西: "5", 中央: "4" },
  "5": { 北: "1", 北東: "8", 東: "3", 南東: "4", 南: "9", 南西: "2", 西: "7", 北西: "6", 中央: "5" },
  "6": { 北: "2", 北東: "9", 東: "4", 南東: "5", 南: "1", 南西: "3", 西: "8", 北西: "7", 中央: "6" },
  "7": { 北: "3", 北東: "1", 東: "5", 南東: "6", 南: "2", 南西: "4", 西: "9", 北西: "8", 中央: "7" },
  "8": { 北: "4", 北東: "2", 東: "6", 南東: "7", 南: "3", 南西: "5", 西: "1", 北西: "9", 中央: "8" },
  "9": { 北: "5", 北東: "3", 東: "7", 南東: "8", 南: "4", 南西: "6", 西: "2", 北西: "1", 中央: "9" },
} as const satisfies Readonly<Record<Kyusei, Readonly<Record<Palace, Kyusei>>>>;

export const warningsByCenter = {
  "1": { gohosatsu: "南", ankensatsu: "北" },
  "2": { gohosatsu: "北東", ankensatsu: "南西" },
  "3": { gohosatsu: "西", ankensatsu: "東" },
  "4": { gohosatsu: "北西", ankensatsu: "南東" },
  "5": { gohosatsu: null, ankensatsu: null },
  "6": { gohosatsu: "南東", ankensatsu: "北西" },
  "7": { gohosatsu: "東", ankensatsu: "西" },
  "8": { gohosatsu: "南西", ankensatsu: "北東" },
  "9": { gohosatsu: "北", ankensatsu: "南" },
} as const satisfies Readonly<Record<Kyusei, { gohosatsu: Direction8 | null; ankensatsu: Direction8 | null }>>;

export const monthBreakerByBranch = {
  寅: "南西", 卯: "西", 辰: "北西", 巳: "北西", 午: "北", 未: "北東",
  申: "北東", 酉: "東", 戌: "南東", 亥: "南東", 子: "南", 丑: "南西",
} as const satisfies Readonly<Record<MonthBranch, Direction8>>;

const F = (fixture: Omit<MonthlyPlateLevel1Fixture, "fixtureId" | "yearBranches" | "sourceOrientationLookupId">): MonthlyPlateLevel1Fixture => ({
  ...fixture,
  fixtureId: `monthly-plate-${fixture.yearGroup}-${fixture.monthBranch}`,
  yearBranches: monthlyYearGroups[fixture.yearGroup].yearBranches,
  sourceOrientationLookupId: "lookup.monthly.source-orientation.v1",
});

// 『改訂版 平成・萬年暦』p.24と研究台帳のLevel 1値を手動固定したfixture。
// production関数やdaily masterから期待値を生成しない。
export const monthlyPlateLevel1Fixtures = [
  F({ yearGroup: "A", monthBranch: "寅", monthNumber: 2, centerStar: "8", palaceStars: palaceStarsByCenter["8"], ...warningsByCenter["8"], monthBreaker: "南西" }),
  F({ yearGroup: "A", monthBranch: "卯", monthNumber: 3, centerStar: "7", palaceStars: palaceStarsByCenter["7"], ...warningsByCenter["7"], monthBreaker: "西" }),
  F({ yearGroup: "A", monthBranch: "辰", monthNumber: 4, centerStar: "6", palaceStars: palaceStarsByCenter["6"], ...warningsByCenter["6"], monthBreaker: "北西" }),
  F({ yearGroup: "A", monthBranch: "巳", monthNumber: 5, centerStar: "5", palaceStars: palaceStarsByCenter["5"], ...warningsByCenter["5"], monthBreaker: "北西" }),
  F({ yearGroup: "A", monthBranch: "午", monthNumber: 6, centerStar: "4", palaceStars: palaceStarsByCenter["4"], ...warningsByCenter["4"], monthBreaker: "北" }),
  F({ yearGroup: "A", monthBranch: "未", monthNumber: 7, centerStar: "3", palaceStars: palaceStarsByCenter["3"], ...warningsByCenter["3"], monthBreaker: "北東" }),
  F({ yearGroup: "A", monthBranch: "申", monthNumber: 8, centerStar: "2", palaceStars: palaceStarsByCenter["2"], ...warningsByCenter["2"], monthBreaker: "北東" }),
  F({ yearGroup: "A", monthBranch: "酉", monthNumber: 9, centerStar: "1", palaceStars: palaceStarsByCenter["1"], ...warningsByCenter["1"], monthBreaker: "東" }),
  F({ yearGroup: "A", monthBranch: "戌", monthNumber: 10, centerStar: "9", palaceStars: palaceStarsByCenter["9"], ...warningsByCenter["9"], monthBreaker: "南東" }),
  F({ yearGroup: "A", monthBranch: "亥", monthNumber: 11, centerStar: "8", palaceStars: palaceStarsByCenter["8"], ...warningsByCenter["8"], monthBreaker: "南東" }),
  F({ yearGroup: "A", monthBranch: "子", monthNumber: 12, centerStar: "7", palaceStars: palaceStarsByCenter["7"], ...warningsByCenter["7"], monthBreaker: "南" }),
  F({ yearGroup: "A", monthBranch: "丑", monthNumber: 1, centerStar: "6", palaceStars: palaceStarsByCenter["6"], ...warningsByCenter["6"], monthBreaker: "南西" }),
  F({ yearGroup: "B", monthBranch: "寅", monthNumber: 2, centerStar: "5", palaceStars: palaceStarsByCenter["5"], ...warningsByCenter["5"], monthBreaker: "南西" }),
  F({ yearGroup: "B", monthBranch: "卯", monthNumber: 3, centerStar: "4", palaceStars: palaceStarsByCenter["4"], ...warningsByCenter["4"], monthBreaker: "西" }),
  F({ yearGroup: "B", monthBranch: "辰", monthNumber: 4, centerStar: "3", palaceStars: palaceStarsByCenter["3"], ...warningsByCenter["3"], monthBreaker: "北西" }),
  F({ yearGroup: "B", monthBranch: "巳", monthNumber: 5, centerStar: "2", palaceStars: palaceStarsByCenter["2"], ...warningsByCenter["2"], monthBreaker: "北西" }),
  F({ yearGroup: "B", monthBranch: "午", monthNumber: 6, centerStar: "1", palaceStars: palaceStarsByCenter["1"], ...warningsByCenter["1"], monthBreaker: "北" }),
  F({ yearGroup: "B", monthBranch: "未", monthNumber: 7, centerStar: "9", palaceStars: palaceStarsByCenter["9"], ...warningsByCenter["9"], monthBreaker: "北東" }),
  F({ yearGroup: "B", monthBranch: "申", monthNumber: 8, centerStar: "8", palaceStars: palaceStarsByCenter["8"], ...warningsByCenter["8"], monthBreaker: "北東" }),
  F({ yearGroup: "B", monthBranch: "酉", monthNumber: 9, centerStar: "7", palaceStars: palaceStarsByCenter["7"], ...warningsByCenter["7"], monthBreaker: "東" }),
  F({ yearGroup: "B", monthBranch: "戌", monthNumber: 10, centerStar: "6", palaceStars: palaceStarsByCenter["6"], ...warningsByCenter["6"], monthBreaker: "南東" }),
  F({ yearGroup: "B", monthBranch: "亥", monthNumber: 11, centerStar: "5", palaceStars: palaceStarsByCenter["5"], ...warningsByCenter["5"], monthBreaker: "南東" }),
  F({ yearGroup: "B", monthBranch: "子", monthNumber: 12, centerStar: "4", palaceStars: palaceStarsByCenter["4"], ...warningsByCenter["4"], monthBreaker: "南" }),
  F({ yearGroup: "B", monthBranch: "丑", monthNumber: 1, centerStar: "3", palaceStars: palaceStarsByCenter["3"], ...warningsByCenter["3"], monthBreaker: "南西" }),
  F({ yearGroup: "C", monthBranch: "寅", monthNumber: 2, centerStar: "2", palaceStars: palaceStarsByCenter["2"], ...warningsByCenter["2"], monthBreaker: "南西" }),
  F({ yearGroup: "C", monthBranch: "卯", monthNumber: 3, centerStar: "1", palaceStars: palaceStarsByCenter["1"], ...warningsByCenter["1"], monthBreaker: "西" }),
  F({ yearGroup: "C", monthBranch: "辰", monthNumber: 4, centerStar: "9", palaceStars: palaceStarsByCenter["9"], ...warningsByCenter["9"], monthBreaker: "北西" }),
  F({ yearGroup: "C", monthBranch: "巳", monthNumber: 5, centerStar: "8", palaceStars: palaceStarsByCenter["8"], ...warningsByCenter["8"], monthBreaker: "北西" }),
  F({ yearGroup: "C", monthBranch: "午", monthNumber: 6, centerStar: "7", palaceStars: palaceStarsByCenter["7"], ...warningsByCenter["7"], monthBreaker: "北" }),
  F({ yearGroup: "C", monthBranch: "未", monthNumber: 7, centerStar: "6", palaceStars: palaceStarsByCenter["6"], ...warningsByCenter["6"], monthBreaker: "北東" }),
  F({ yearGroup: "C", monthBranch: "申", monthNumber: 8, centerStar: "5", palaceStars: palaceStarsByCenter["5"], ...warningsByCenter["5"], monthBreaker: "北東" }),
  F({ yearGroup: "C", monthBranch: "酉", monthNumber: 9, centerStar: "4", palaceStars: palaceStarsByCenter["4"], ...warningsByCenter["4"], monthBreaker: "東" }),
  F({ yearGroup: "C", monthBranch: "戌", monthNumber: 10, centerStar: "3", palaceStars: palaceStarsByCenter["3"], ...warningsByCenter["3"], monthBreaker: "南東" }),
  F({ yearGroup: "C", monthBranch: "亥", monthNumber: 11, centerStar: "2", palaceStars: palaceStarsByCenter["2"], ...warningsByCenter["2"], monthBreaker: "南東" }),
  F({ yearGroup: "C", monthBranch: "子", monthNumber: 12, centerStar: "1", palaceStars: palaceStarsByCenter["1"], ...warningsByCenter["1"], monthBreaker: "南" }),
  F({ yearGroup: "C", monthBranch: "丑", monthNumber: 1, centerStar: "9", palaceStars: palaceStarsByCenter["9"], ...warningsByCenter["9"], monthBreaker: "南西" }),
] as const satisfies readonly MonthlyPlateLevel1Fixture[];

export const monthlyPlateLookupTables = [
  { lookupTableId: "lookup.monthly.year-groups.v1", lookupTableVersion: "1", label: "月盤年支3グループ", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 3 },
  { lookupTableId: "lookup.monthly.centers-36.v1", lookupTableVersion: "1", label: "3グループ×12月中宮", sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 36 },
  { lookupTableId: "lookup.monthly.palace-stars-36x9.v1", lookupTableVersion: "1", label: "36月盤×9宮大字九星", sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 324 },
  { lookupTableId: "lookup.monthly.gohosatsu-9.v1", lookupTableVersion: "1", label: "中宮別五黄殺", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 9 },
  { lookupTableId: "lookup.monthly.ankensatsu-9.v1", lookupTableVersion: "1", label: "中宮別暗剣殺", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 9 },
  { lookupTableId: "lookup.monthly.breaker-12.v1", lookupTableVersion: "1", label: "月支別月破", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 12 },
  { lookupTableId: "lookup.monthly.source-orientation.v1", lookupTableVersion: "1", label: "紙面原位置から8方位", sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 9 },
  { lookupTableId: "lookup.direction.opposites-8.v1", lookupTableVersion: "1", label: "8方位対宮", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], entryCount: 8 },
] as const satisfies readonly LookupTableDefinition[];
