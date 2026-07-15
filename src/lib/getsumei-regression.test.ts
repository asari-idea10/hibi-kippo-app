import { beforeAll, describe, expect, test } from "vitest";

import { getCalendarDays } from "@/lib/calendar-day";
import {
  getCalendarMasterRows,
  type CalendarMasterRow,
} from "@/lib/calendar-master-rows";

type Kyusei = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
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

type ExpectedGetsumeiGroup = {
  label: "A" | "B" | "C";
  honmeiStars: readonly Kyusei[];
  expectedByMonthBranch: Readonly<Record<MonthBranch, Kyusei>>;
};

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

// 『改訂版 平成萬年暦』由来の研究台帳を手動転記した独立期待値。
// 暦DB、production関数、snapshotから生成してはならない。
const expectedGetsumeiGroups = [
  {
    label: "A",
    honmeiStars: ["1", "4", "7"],
    expectedByMonthBranch: {
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
    honmeiStars: ["3", "6", "9"],
    expectedByMonthBranch: {
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
    honmeiStars: ["2", "5", "8"],
    expectedByMonthBranch: {
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
] as const satisfies readonly ExpectedGetsumeiGroup[];

const groupedCases = expectedGetsumeiGroups.flatMap((group) =>
  monthBranches.map((monthBranch) => ({
    group: group.label,
    honmeiStars: group.honmeiStars,
    monthBranch,
    expectedStar: group.expectedByMonthBranch[monthBranch],
  })),
);

const expandedCases = expectedGetsumeiGroups.flatMap((group) =>
  group.honmeiStars.flatMap((honmeiStar) =>
    monthBranches.map((monthBranch) => ({
      group: group.label,
      honmeiStar,
      monthBranch,
      expectedStar: group.expectedByMonthBranch[monthBranch],
    })),
  ),
);

const representativeBirthDates = [
  {
    group: "A",
    birthDate: "2002-03-15",
    expectedHonmeiStar: "7",
    expectedMonthBranch: "卯",
    expectedGetsumeiStar: "7",
  },
  {
    group: "B",
    birthDate: "2000-03-15",
    expectedHonmeiStar: "9",
    expectedMonthBranch: "卯",
    expectedGetsumeiStar: "4",
  },
  {
    group: "C",
    birthDate: "2001-03-15",
    expectedHonmeiStar: "8",
    expectedMonthBranch: "卯",
    expectedGetsumeiStar: "1",
  },
] as const;

function inputKey(honmeiStar: string, monthBranch: string) {
  return `${honmeiStar}|${monthBranch}`;
}

let calendarRows: CalendarMasterRow[];
let observedByInput: Map<string, Set<string>>;

beforeAll(() => {
  calendarRows = getCalendarMasterRows({
    start: "1900-01-01",
    end: "2050-12-31",
  });
  observedByInput = new Map<string, Set<string>>();

  for (const row of calendarRows) {
    const key = inputKey(row.yearKyusei, row.duplicateMonth);
    const observed = observedByInput.get(key) ?? new Set<string>();
    observed.add(row.monthKyusei);
    observedByInput.set(key, observed);
  }
});

describe("月命星 3グループ × 12月支の独立期待値", () => {
  test.each(groupedCases)(
    "$groupグループ $monthBranch月は$expectedStar",
    ({ honmeiStars, monthBranch, expectedStar }) => {
      const observed = honmeiStars.map((honmeiStar) => [
        ...(observedByInput.get(inputKey(honmeiStar, monthBranch)) ?? []),
      ]);

      expect(observed).toEqual(honmeiStars.map(() => [expectedStar]));
    },
  );
});

describe("月命星 本命星9種類 × 12月支の独立期待値", () => {
  test.each(expandedCases)(
    "$groupグループ 本命星$honmeiStar × $monthBranch月は$expectedStar",
    ({ honmeiStar, monthBranch, expectedStar }) => {
      const observed = [
        ...(observedByInput.get(inputKey(honmeiStar, monthBranch)) ?? []),
      ];

      expect(observed).toEqual([expectedStar]);
    },
  );
});

describe("暦DB全期間の月命星相当値の不変条件", () => {
  test("必須入力が埋まり、年九星と月九星が1〜9に収まる", () => {
    expect(calendarRows).toHaveLength(55_152);
    expect(calendarRows.filter((row) => row.yearKyusei === "")).toEqual([]);
    expect(calendarRows.filter((row) => row.monthKyusei === "")).toEqual([]);
    expect(calendarRows.filter((row) => row.duplicateMonth === "")).toEqual([]);
    expect(calendarRows.filter((row) => !/^[1-9]$/.test(row.yearKyusei))).toEqual(
      [],
    );
    expect(
      calendarRows.filter((row) => !/^[1-9]$/.test(row.monthKyusei)),
    ).toEqual([]);
  });

  test("本命星×月支の108入力が揃い、各入力の出力が一意である", () => {
    const multipleOutputs = [...observedByInput.entries()].filter(
      ([, observed]) => observed.size !== 1,
    );

    expect(observedByInput).toHaveLength(108);
    expect(multipleOutputs).toEqual([]);
  });

  test("同一本命星グループでは月支ごとの出力が変わらない", () => {
    const groupDifferences = groupedCases.filter(
      ({ honmeiStars, monthBranch }) => {
        const signatures = honmeiStars.map((honmeiStar) =>
          [
            ...(observedByInput.get(inputKey(honmeiStar, monthBranch)) ?? []),
          ].join(","),
        );

        return new Set(signatures).size !== 1;
      },
    );

    expect(groupDifferences).toEqual([]);
  });

  test("独立期待値の108入力に未定義がない", () => {
    const undefinedInputs = expandedCases.filter(
      ({ honmeiStar, monthBranch }) =>
        !observedByInput.has(inputKey(honmeiStar, monthBranch)),
    );

    expect(undefinedInputs).toEqual([]);
  });
});

describe("非境界日のbirthDate取得経路", () => {
  // 各グループから、節入り・立春・資料差6件を避けた3月15日を固定する。
  test.each(representativeBirthDates)(
    "$groupグループ $birthDate",
    ({
      birthDate,
      expectedHonmeiStar,
      expectedMonthBranch,
      expectedGetsumeiStar,
    }) => {
      const days = getCalendarDays({ start: birthDate, end: birthDate });

      expect(days).toHaveLength(1);

      const day = days[0];

      if (!day) {
        throw new Error(`出生日行を取得できませんでした: ${birthDate}`);
      }

      expect(day.date).toBe(birthDate);
      expect(day.solarTerm.isSetsuiri).toBe(false);
      expect(day.kyusei.year).toBe(expectedHonmeiStar);
      expect(day.branches.month).toBe(expectedMonthBranch);
      expect(day.kyusei.month).toBe(expectedGetsumeiStar);
    },
  );
});
