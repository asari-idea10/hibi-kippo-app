import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, test } from "vitest";

import {
  DirectionCompass,
  type DirectionCompassDirection,
  type DirectionCompassState,
} from "@/components/direction-compass";
import {
  searchCalendarDb,
  type CalendarDbDirection,
  type CalendarDbRow,
} from "@/lib/calendar-db-view";
import {
  getCalendarMasterRow,
  getCalendarMasterRows,
  type CalendarMasterRow,
} from "@/lib/calendar-master-rows";

type GroupLabel = "A" | "B" | "C";
type Kyusei = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type YearBranch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";
type MonthBranch =
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥"
  | "子"
  | "丑";
type WarningDirection = DirectionCompassDirection | "";

type ExpectedMonthlyPlateGroup = {
  label: GroupLabel;
  yearBranches: readonly YearBranch[];
  yearStars: readonly Kyusei[];
  expectedCenterByMonthBranch: Readonly<Record<MonthBranch, Kyusei>>;
};

const kyuseiStars = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const monthBranches = [
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
  "子",
  "丑",
] as const satisfies readonly MonthBranch[];
const directions = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
  "中央",
] as const satisfies readonly CalendarDbDirection[];
const compassDirections = directions.filter(
  (direction): direction is DirectionCompassDirection => direction !== "中央",
);
const validWarningDirections = new Set<string>(["", ...compassDirections]);

// 『改訂版 平成萬年暦』由来の研究台帳を、月盤中宮用として手動転記した独立期待値。
// 暦DB、production関数、Getsumeiテスト、snapshotから生成してはならない。
const expectedMonthlyPlateGroups = [
  {
    label: "A",
    yearBranches: ["子", "卯", "午", "酉"],
    yearStars: ["1", "4", "7"],
    expectedCenterByMonthBranch: {
      寅: "8",
      卯: "7",
      辰: "6",
      巳: "5",
      午: "4",
      未: "3",
      申: "2",
      酉: "1",
      戌: "9",
      亥: "8",
      子: "7",
      丑: "6",
    },
  },
  {
    label: "B",
    yearBranches: ["丑", "辰", "未", "戌"],
    yearStars: ["3", "6", "9"],
    expectedCenterByMonthBranch: {
      寅: "5",
      卯: "4",
      辰: "3",
      巳: "2",
      午: "1",
      未: "9",
      申: "8",
      酉: "7",
      戌: "6",
      亥: "5",
      子: "4",
      丑: "3",
    },
  },
  {
    label: "C",
    yearBranches: ["寅", "巳", "申", "亥"],
    yearStars: ["2", "5", "8"],
    expectedCenterByMonthBranch: {
      寅: "2",
      卯: "1",
      辰: "9",
      巳: "8",
      午: "7",
      未: "6",
      申: "5",
      酉: "4",
      戌: "3",
      亥: "2",
      子: "1",
      丑: "9",
    },
  },
] as const satisfies readonly ExpectedMonthlyPlateGroup[];

const groupByYearBranch: Readonly<Record<YearBranch, GroupLabel>> = {
  子: "A",
  卯: "A",
  午: "A",
  酉: "A",
  丑: "B",
  辰: "B",
  未: "B",
  戌: "B",
  寅: "C",
  巳: "C",
  申: "C",
  亥: "C",
};

// Step 5B-2で内部整合を確認した9盤を、式ではなく静的な81値として固定する。
// 原資料画像324セルとの完全一致を主張する期待値ではない。
const expectedPlateByCenter: Readonly<
  Record<Kyusei, Readonly<Record<CalendarDbDirection, Kyusei>>>
> = {
  "1": { 北: "6", 北東: "4", 東: "8", 南東: "9", 南: "5", 南西: "7", 西: "3", 北西: "2", 中央: "1" },
  "2": { 北: "7", 北東: "5", 東: "9", 南東: "1", 南: "6", 南西: "8", 西: "4", 北西: "3", 中央: "2" },
  "3": { 北: "8", 北東: "6", 東: "1", 南東: "2", 南: "7", 南西: "9", 西: "5", 北西: "4", 中央: "3" },
  "4": { 北: "9", 北東: "7", 東: "2", 南東: "3", 南: "8", 南西: "1", 西: "6", 北西: "5", 中央: "4" },
  "5": { 北: "1", 北東: "8", 東: "3", 南東: "4", 南: "9", 南西: "2", 西: "7", 北西: "6", 中央: "5" },
  "6": { 北: "2", 北東: "9", 東: "4", 南東: "5", 南: "1", 南西: "3", 西: "8", 北西: "7", 中央: "6" },
  "7": { 北: "3", 北東: "1", 東: "5", 南東: "6", 南: "2", 南西: "4", 西: "9", 北西: "8", 中央: "7" },
  "8": { 北: "4", 北東: "2", 東: "6", 南東: "7", 南: "3", 南西: "5", 西: "1", 北西: "9", 中央: "8" },
  "9": { 北: "5", 北東: "3", 東: "7", 南東: "8", 南: "4", 南西: "6", 西: "2", 北西: "1", 中央: "9" },
};

const expectedWarningsByCenter: Readonly<
  Record<
    Kyusei,
    { gohosatsu: WarningDirection; ankensatsu: WarningDirection }
  >
> = {
  "1": { gohosatsu: "南", ankensatsu: "北" },
  "2": { gohosatsu: "北東", ankensatsu: "南西" },
  "3": { gohosatsu: "西", ankensatsu: "東" },
  "4": { gohosatsu: "北西", ankensatsu: "南東" },
  "5": { gohosatsu: "", ankensatsu: "" },
  "6": { gohosatsu: "南東", ankensatsu: "北西" },
  "7": { gohosatsu: "東", ankensatsu: "西" },
  "8": { gohosatsu: "南西", ankensatsu: "北東" },
  "9": { gohosatsu: "北", ankensatsu: "南" },
};

const expectedMonthBreaks = [
  { monthBranch: "寅", oppositeBranch: "申", direction: "南西" },
  { monthBranch: "卯", oppositeBranch: "酉", direction: "西" },
  { monthBranch: "辰", oppositeBranch: "戌", direction: "北西" },
  { monthBranch: "巳", oppositeBranch: "亥", direction: "北西" },
  { monthBranch: "午", oppositeBranch: "子", direction: "北" },
  { monthBranch: "未", oppositeBranch: "丑", direction: "北東" },
  { monthBranch: "申", oppositeBranch: "寅", direction: "北東" },
  { monthBranch: "酉", oppositeBranch: "卯", direction: "東" },
  { monthBranch: "戌", oppositeBranch: "辰", direction: "南東" },
  { monthBranch: "亥", oppositeBranch: "巳", direction: "南東" },
  { monthBranch: "子", oppositeBranch: "午", direction: "南" },
  { monthBranch: "丑", oppositeBranch: "未", direction: "南西" },
] as const satisfies readonly {
  monthBranch: MonthBranch;
  oppositeBranch: YearBranch;
  direction: DirectionCompassDirection;
}[];

const expectedMonthBreakByBranch = Object.fromEntries(
  expectedMonthBreaks.map(({ monthBranch, direction }) => [
    monthBranch,
    direction,
  ]),
) as Readonly<Record<MonthBranch, DirectionCompassDirection>>;

const groupByLabel = Object.fromEntries(
  expectedMonthlyPlateGroups.map((group) => [group.label, group]),
) as Readonly<Record<GroupLabel, ExpectedMonthlyPlateGroup>>;

const yearBranchCases = expectedMonthlyPlateGroups.flatMap((group) =>
  group.yearBranches.map((yearBranch) => ({
    group: group.label,
    yearBranch,
    expectedYearStars: group.yearStars,
  })),
);

const monthlyBoardCases = expectedMonthlyPlateGroups.flatMap((group) =>
  monthBranches.map((monthBranch) => ({
    group: group.label,
    monthBranch,
    expectedCenter: group.expectedCenterByMonthBranch[monthBranch],
  })),
);

const staticPlateCases = kyuseiStars.flatMap((center) =>
  directions.map((direction) => ({
    center,
    direction,
    expectedStar: expectedPlateByCenter[center][direction],
  })),
);

const fiveCenterCases = monthlyBoardCases.filter(
  ({ expectedCenter }) => expectedCenter === "5",
);

const overlapCases = monthlyBoardCases.flatMap((boardCase) => {
  const warnings = expectedWarningsByCenter[boardCase.expectedCenter];
  const monthBreak = expectedMonthBreakByBranch[boardCase.monthBranch];
  const cases: Array<{
    group: GroupLabel;
    monthBranch: MonthBranch;
    direction: DirectionCompassDirection;
    warning: "五黄殺" | "暗剣殺";
  }> = [];

  if (warnings.gohosatsu && warnings.gohosatsu === monthBreak) {
    cases.push({
      group: boardCase.group,
      monthBranch: boardCase.monthBranch,
      direction: monthBreak,
      warning: "五黄殺",
    });
  }

  if (warnings.ankensatsu && warnings.ankensatsu === monthBreak) {
    cases.push({
      group: boardCase.group,
      monthBranch: boardCase.monthBranch,
      direction: monthBreak,
      warning: "暗剣殺",
    });
  }

  return cases;
});

function boardInputKey(group: GroupLabel, monthBranch: MonthBranch) {
  return `${group}|${monthBranch}`;
}

function isKyusei(value: string): value is Kyusei {
  return kyuseiStars.includes(value as Kyusei);
}

function isYearBranch(value: string): value is YearBranch {
  return value in groupByYearBranch;
}

function isMonthBranch(value: string): value is MonthBranch {
  return monthBranches.includes(value as MonthBranch);
}

function getMonthBoardStar(
  row: CalendarDbRow | undefined,
  direction: CalendarDbDirection,
) {
  return row?.directionBoardValues[direction]?.month.match(/^\[(\d)\]/)?.[1];
}

function getPublicCalendarRow(date: string) {
  return searchCalendarDb({
    year: date.slice(0, 4),
    start: date,
    end: date,
    limit: 1,
    view: "kyusei",
    dayType: "all",
    kyuseiMatch: "all",
    purpose: "none",
    candidate: "all",
    goodDirectionMatch: "all",
  }).rows[0];
}

type WarningSets = {
  gohosatsu: Set<string>;
  ankensatsu: Set<string>;
};

type FullRangeAudit = {
  invalidYearBranches: string[];
  yearGroupMismatches: string[];
  invalidMonthBranches: string[];
  invalidMonthStars: string[];
  centerMismatches: string[];
  gohosatsuMismatches: string[];
  ankensatsuMismatches: string[];
  monthBreakMismatches: string[];
  invalidWarningDirections: string[];
};

let calendarRows: CalendarMasterRow[] = [];
let observedYearStarsByBranch = new Map<YearBranch, Set<string>>();
let observedCentersByInput = new Map<string, Set<string>>();
let observedWarningsByCenter = new Map<Kyusei, WarningSets>();
let observedMonthBreaksByBranch = new Map<MonthBranch, Set<string>>();
let representativeRowsByInput = new Map<string, CalendarMasterRow>();
let publicRowsByInput = new Map<string, CalendarDbRow>();
let publicRowsByCenter = new Map<Kyusei, CalendarDbRow[]>();
let publicRowsByDate = new Map<string, CalendarDbRow>();
let fullRangeAudit: FullRangeAudit;

beforeAll(() => {
  calendarRows = getCalendarMasterRows({
    start: "1900-01-01",
    end: "2050-12-31",
  });
  observedYearStarsByBranch = new Map();
  observedCentersByInput = new Map();
  observedWarningsByCenter = new Map();
  observedMonthBreaksByBranch = new Map();
  representativeRowsByInput = new Map();
  publicRowsByInput = new Map();
  publicRowsByCenter = new Map();
  publicRowsByDate = new Map();
  fullRangeAudit = {
    invalidYearBranches: [],
    yearGroupMismatches: [],
    invalidMonthBranches: [],
    invalidMonthStars: [],
    centerMismatches: [],
    gohosatsuMismatches: [],
    ankensatsuMismatches: [],
    monthBreakMismatches: [],
    invalidWarningDirections: [],
  };

  for (const row of calendarRows) {
    if (!isYearBranch(row.duplicateYear)) {
      fullRangeAudit.invalidYearBranches.push(row.date);
      continue;
    }

    const group = groupByYearBranch[row.duplicateYear];
    const expectedGroup = groupByLabel[group];
    const yearStars = observedYearStarsByBranch.get(row.duplicateYear) ?? new Set<string>();
    yearStars.add(row.yearKyusei);
    observedYearStarsByBranch.set(row.duplicateYear, yearStars);

    if (!expectedGroup.yearStars.includes(row.yearKyusei as Kyusei)) {
      fullRangeAudit.yearGroupMismatches.push(row.date);
    }

    if (!isMonthBranch(row.duplicateMonth)) {
      fullRangeAudit.invalidMonthBranches.push(row.date);
      continue;
    }

    if (!isKyusei(row.monthKyusei)) {
      fullRangeAudit.invalidMonthStars.push(row.date);
      continue;
    }

    const key = boardInputKey(group, row.duplicateMonth);
    const centers = observedCentersByInput.get(key) ?? new Set<string>();
    centers.add(row.monthKyusei);
    observedCentersByInput.set(key, centers);

    if (!representativeRowsByInput.has(key)) {
      representativeRowsByInput.set(key, row);
    }

    const expectedCenter = expectedGroup.expectedCenterByMonthBranch[row.duplicateMonth];

    if (row.monthKyusei !== expectedCenter) {
      fullRangeAudit.centerMismatches.push(row.date);
    }

    const expectedWarnings = expectedWarningsByCenter[row.monthKyusei];
    const warningSets = observedWarningsByCenter.get(row.monthKyusei) ?? {
      gohosatsu: new Set<string>(),
      ankensatsu: new Set<string>(),
    };
    warningSets.gohosatsu.add(row.monthGohosatsu);
    warningSets.ankensatsu.add(row.monthAnkensatsu);
    observedWarningsByCenter.set(row.monthKyusei, warningSets);

    if (row.monthGohosatsu !== expectedWarnings.gohosatsu) {
      fullRangeAudit.gohosatsuMismatches.push(row.date);
    }

    if (row.monthAnkensatsu !== expectedWarnings.ankensatsu) {
      fullRangeAudit.ankensatsuMismatches.push(row.date);
    }

    const monthBreaks = observedMonthBreaksByBranch.get(row.duplicateMonth) ?? new Set<string>();
    monthBreaks.add(row.monthSaiha);
    observedMonthBreaksByBranch.set(row.duplicateMonth, monthBreaks);

    if (row.monthSaiha !== expectedMonthBreakByBranch[row.duplicateMonth]) {
      fullRangeAudit.monthBreakMismatches.push(row.date);
    }

    const warningDirections = [
      row.monthGohosatsu,
      row.monthAnkensatsu,
      row.monthSaiha,
    ];

    if (warningDirections.some((direction) => !validWarningDirections.has(direction))) {
      fullRangeAudit.invalidWarningDirections.push(row.date);
    }
  }

  for (const boardCase of monthlyBoardCases) {
    const key = boardInputKey(boardCase.group, boardCase.monthBranch);
    const representative = representativeRowsByInput.get(key);

    if (!representative) {
      continue;
    }

    const publicRow = getPublicCalendarRow(representative.date);

    if (!publicRow) {
      continue;
    }

    publicRowsByInput.set(key, publicRow);
    publicRowsByDate.set(publicRow.date, publicRow);
    const rowsForCenter = publicRowsByCenter.get(boardCase.expectedCenter) ?? [];
    rowsForCenter.push(publicRow);
    publicRowsByCenter.set(boardCase.expectedCenter, rowsForCenter);
  }

  for (const date of ["2026-07-06", "2026-07-07"]) {
    const publicRow = getPublicCalendarRow(date);

    if (publicRow) {
      publicRowsByDate.set(date, publicRow);
    }
  }
});

describe("月盤の年支3グループ独立期待値", () => {
  test.each(yearBranchCases)(
    "$groupグループ 年支$yearBranchは年九星$expectedYearStars",
    ({ yearBranch, expectedYearStars }) => {
      const observed = [
        ...(observedYearStarsByBranch.get(yearBranch) ?? []),
      ].sort();

      expect(observed).toEqual([...expectedYearStars].sort());
    },
  );
});

describe("月盤中宮3グループ×12月支の独立36期待値", () => {
  test.each(monthlyBoardCases)(
    "$groupグループ $monthBranch月は中宮$expectedCenter",
    ({ group, monthBranch, expectedCenter }) => {
      const observed = [
        ...(observedCentersByInput.get(boardInputKey(group, monthBranch)) ?? []),
      ];

      expect(observed).toEqual([expectedCenter]);
    },
  );
});

describe("Step 5B-2で確認した現行月盤配置の静的9盤", () => {
  test.each(staticPlateCases)(
    "中宮$centerの$directionは$expectedStar",
    ({ center, direction, expectedStar }) => {
      const row = publicRowsByCenter.get(center)?.[0];

      expect(getMonthBoardStar(row, direction)).toBe(expectedStar);
    },
  );

  test("36盤×9宮の324値が静的9盤期待値に一致する", () => {
    for (const boardCase of monthlyBoardCases) {
      const row = publicRowsByInput.get(
        boardInputKey(boardCase.group, boardCase.monthBranch),
      );

      for (const direction of directions) {
        expect(
          getMonthBoardStar(row, direction),
          `${boardCase.group}グループ ${boardCase.monthBranch}月 ${direction}`,
        ).toBe(expectedPlateByCenter[boardCase.expectedCenter][direction]);
      }
    }
  });

  test.each(kyuseiStars)("中宮$centerの盤は九星1〜9を一度ずつ含む", (center) => {
    const row = publicRowsByCenter.get(center)?.[0];
    const stars = directions.map((direction) => getMonthBoardStar(row, direction));

    expect(stars).toHaveLength(9);
    expect(new Set(stars)).toHaveLength(9);
    expect([...stars].sort()).toEqual([...kyuseiStars]);
    expect(getMonthBoardStar(row, "中央")).toBe(center);
  });

  test.each(kyuseiStars)("同じ中宮$centerから異なる配置を生成しない", (center) => {
    const rows = publicRowsByCenter.get(center) ?? [];
    const signatures = rows.map((row) =>
      directions.map((direction) => getMonthBoardStar(row, direction)).join("|"),
    );

    expect(rows).toHaveLength(4);
    expect(new Set(signatures)).toHaveLength(1);
  });

  test("36入力と中宮1〜9をすべて網羅する", () => {
    expect(publicRowsByInput).toHaveLength(36);
    expect([...publicRowsByCenter.keys()].sort()).toEqual([...kyuseiStars]);
  });
});

describe("月盤五黄殺の独立9期待値", () => {
  test.each(kyuseiStars)("中宮$centerの五黄殺", (center) => {
    const observed = [
      ...(observedWarningsByCenter.get(center)?.gohosatsu ?? []),
    ];

    expect(observed).toEqual([expectedWarningsByCenter[center].gohosatsu]);
  });
});

describe("月盤暗剣殺の独立9期待値", () => {
  test.each(kyuseiStars)("中宮$centerの暗剣殺", (center) => {
    const observed = [
      ...(observedWarningsByCenter.get(center)?.ankensatsu ?? []),
    ];

    expect(observed).toEqual([expectedWarningsByCenter[center].ankensatsu]);
  });
});

describe("8方位化された月破の独立12期待値", () => {
  test.each(expectedMonthBreaks)(
    "$monthBranch月は$oppositeBranch冲で月破$direction",
    ({ monthBranch, direction }) => {
      const observed = [
        ...(observedMonthBreaksByBranch.get(monthBranch) ?? []),
      ];

      expect(observed).toEqual([direction]);
    },
  );
});

describe("五黄中宮4ケースの現行方位なし表現", () => {
  test.each(fiveCenterCases)(
    "$groupグループ $monthBranch月は五黄殺・暗剣殺が空欄",
    ({ group, monthBranch }) => {
      const row = representativeRowsByInput.get(boardInputKey(group, monthBranch));

      expect(row?.monthGohosatsu).toBe("");
      expect(row?.monthAnkensatsu).toBe("");
      expect(row?.monthSaiha).toBe(expectedMonthBreakByBranch[monthBranch]);
    },
  );
});

describe("月盤の同一方位にある複数警告ラベル", () => {
  test.each(overlapCases)(
    "$groupグループ $monthBranch月 $directionは$warningと破を保持",
    ({ group, monthBranch, direction, warning }) => {
      const row = publicRowsByInput.get(boardInputKey(group, monthBranch));
      const value = row?.directionBoardValues[direction]?.month ?? "";

      expect(value).toContain(warning);
      expect(value).toContain("破");
    },
  );

  test("重複内訳は五黄殺×月破5、暗剣殺×月破5、3種同一0", () => {
    const gohoOverlaps = overlapCases.filter(
      ({ warning }) => warning === "五黄殺",
    );
    const ankenOverlaps = overlapCases.filter(
      ({ warning }) => warning === "暗剣殺",
    );
    const tripleOverlaps = monthlyBoardCases.filter(({ expectedCenter, monthBranch }) => {
      const warnings = expectedWarningsByCenter[expectedCenter];
      const monthBreak = expectedMonthBreakByBranch[monthBranch];

      return (
        warnings.gohosatsu !== "" &&
        warnings.gohosatsu === warnings.ankensatsu &&
        warnings.gohosatsu === monthBreak
      );
    });

    expect(gohoOverlaps).toHaveLength(5);
    expect(ankenOverlaps).toHaveLength(5);
    expect(tripleOverlaps).toEqual([]);
  });
});

describe("2026年7月の現行日付単位月盤切替", () => {
  // 時刻境界の正しさは固定しない。birthTime、小暑10:57、既知6件は将来Stepで別途扱う。
  test.each([
    {
      date: "2026-07-06",
      monthBranch: "午",
      center: "4",
      gohosatsu: "北西",
      ankensatsu: "南東",
      monthBreak: "北",
    },
    {
      date: "2026-07-07",
      monthBranch: "未",
      center: "3",
      gohosatsu: "西",
      ankensatsu: "東",
      monthBreak: "北東",
    },
  ] as const)(
    "$dateは$monthBranch月・中宮$center",
    ({ date, monthBranch, center, gohosatsu, ankensatsu, monthBreak }) => {
      const row = getCalendarMasterRow(date);
      const publicRow = publicRowsByDate.get(date);

      expect(row?.duplicateMonth).toBe(monthBranch);
      expect(row?.monthKyusei).toBe(center);
      expect(row?.monthGohosatsu).toBe(gohosatsu);
      expect(row?.monthAnkensatsu).toBe(ankensatsu);
      expect(row?.monthSaiha).toBe(monthBreak);
      expect(getMonthBoardStar(publicRow, "中央")).toBe(center);
    },
  );
});

describe("暦DB全55,152日の月盤不変条件", () => {
  test("年支・月支・月九星・三警告・36入力が全期間で整合する", () => {
    const multipleCenters = [...observedCentersByInput.entries()].filter(
      ([, centers]) => centers.size !== 1,
    );

    expect(calendarRows).toHaveLength(55_152);
    expect(fullRangeAudit.invalidYearBranches).toEqual([]);
    expect(fullRangeAudit.yearGroupMismatches).toEqual([]);
    expect(fullRangeAudit.invalidMonthBranches).toEqual([]);
    expect(fullRangeAudit.invalidMonthStars).toEqual([]);
    expect(fullRangeAudit.centerMismatches).toEqual([]);
    expect(fullRangeAudit.gohosatsuMismatches).toEqual([]);
    expect(fullRangeAudit.ankensatsuMismatches).toEqual([]);
    expect(fullRangeAudit.monthBreakMismatches).toEqual([]);
    expect(fullRangeAudit.invalidWarningDirections).toEqual([]);
    expect(observedCentersByInput).toHaveLength(36);
    expect(multipleCenters).toEqual([]);
    expect(observedYearStarsByBranch).toHaveLength(12);
    expect(observedMonthBreaksByBranch).toHaveLength(12);
  });

  test("36ケースの三警告集計は方位32・五黄中宮4・月破36", () => {
    const rows = monthlyBoardCases.map(({ group, monthBranch }) =>
      representativeRowsByInput.get(boardInputKey(group, monthBranch)),
    );

    expect(rows).toHaveLength(36);
    expect(rows.filter((row) => row?.monthGohosatsu !== "")).toHaveLength(32);
    expect(rows.filter((row) => row?.monthGohosatsu === "")).toHaveLength(4);
    expect(rows.filter((row) => row?.monthAnkensatsu !== "")).toHaveLength(32);
    expect(rows.filter((row) => row?.monthAnkensatsu === "")).toHaveLength(4);
    expect(rows.filter((row) => row?.monthSaiha !== "")).toHaveLength(36);
    expect(rows.filter((row) => row?.monthSaiha === "")).toEqual([]);
    expect(rows.filter((row) => row?.monthSaiha === "中央")).toEqual([]);
  });
});

describe("compassOrientationは月盤の意味情報を変更しない", () => {
  test("north-topとsouth-topは同じ星・警告・内部方向を別座標へ描画する", () => {
    const row = publicRowsByDate.get("2026-07-07");
    const states: DirectionCompassState[] = compassDirections.map((direction) => {
      const value = row?.directionBoardValues[direction]?.month ?? "";
      const warningLabels = ["暗剣殺", "五黄殺", "破"].filter((label) =>
        value.includes(label),
      );

      return {
        direction,
        starNumber: getMonthBoardStar(row, direction),
        warning: warningLabels.length > 0,
        warningLabel: warningLabels.join("・"),
      };
    });
    const northMarkup = renderToStaticMarkup(
      createElement(DirectionCompass, {
        states,
        orientation: "north-top",
        centerLabel: "月盤",
        centerValue: "3",
      }),
    );
    const southMarkup = renderToStaticMarkup(
      createElement(DirectionCompass, {
        states,
        orientation: "south-top",
        centerLabel: "月盤",
        centerValue: "3",
      }),
    );
    const titlePattern = /<title>(.*?)<\/title>/g;
    const northTitles = [...northMarkup.matchAll(titlePattern)].map((match) => match[1]);
    const southTitles = [...southMarkup.matchAll(titlePattern)].map((match) => match[1]);

    expect(northTitles).toEqual(southTitles);
    expect(northMarkup).toContain("月盤");
    expect(southMarkup).toContain("月盤");
    expect(northMarkup).not.toBe(southMarkup);
  });
});
