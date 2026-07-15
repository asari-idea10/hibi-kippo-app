import { beforeAll, describe, expect, test } from "vitest";

import {
  getJuudaiShusei,
  getJuunidaiJusei,
  type EarthlyBranch,
  type HeavenlyStem,
  type JuudaiShusei,
  type JuunidaiJusei,
} from "@/lib/sanmeigaku-yosen-master";

const stemOrder = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const satisfies readonly HeavenlyStem[];

const expectedJuudaiByDayStem = [
  {
    dayStem: "甲",
    expected: [
      "貫索星",
      "石門星",
      "鳳閣星",
      "調舒星",
      "禄存星",
      "司禄星",
      "車騎星",
      "牽牛星",
      "龍高星",
      "玉堂星",
    ],
  },
  {
    dayStem: "乙",
    expected: [
      "石門星",
      "貫索星",
      "調舒星",
      "鳳閣星",
      "司禄星",
      "禄存星",
      "牽牛星",
      "車騎星",
      "玉堂星",
      "龍高星",
    ],
  },
  {
    dayStem: "丙",
    expected: [
      "龍高星",
      "玉堂星",
      "貫索星",
      "石門星",
      "鳳閣星",
      "調舒星",
      "禄存星",
      "司禄星",
      "車騎星",
      "牽牛星",
    ],
  },
  {
    dayStem: "丁",
    expected: [
      "玉堂星",
      "龍高星",
      "石門星",
      "貫索星",
      "調舒星",
      "鳳閣星",
      "司禄星",
      "禄存星",
      "牽牛星",
      "車騎星",
    ],
  },
  {
    dayStem: "戊",
    expected: [
      "車騎星",
      "牽牛星",
      "龍高星",
      "玉堂星",
      "貫索星",
      "石門星",
      "鳳閣星",
      "調舒星",
      "禄存星",
      "司禄星",
    ],
  },
  {
    dayStem: "己",
    expected: [
      "牽牛星",
      "車騎星",
      "玉堂星",
      "龍高星",
      "石門星",
      "貫索星",
      "調舒星",
      "鳳閣星",
      "司禄星",
      "禄存星",
    ],
  },
  {
    dayStem: "庚",
    expected: [
      "禄存星",
      "司禄星",
      "車騎星",
      "牽牛星",
      "龍高星",
      "玉堂星",
      "貫索星",
      "石門星",
      "鳳閣星",
      "調舒星",
    ],
  },
  {
    dayStem: "辛",
    expected: [
      "司禄星",
      "禄存星",
      "牽牛星",
      "車騎星",
      "玉堂星",
      "龍高星",
      "石門星",
      "貫索星",
      "調舒星",
      "鳳閣星",
    ],
  },
  {
    dayStem: "壬",
    expected: [
      "鳳閣星",
      "調舒星",
      "禄存星",
      "司禄星",
      "車騎星",
      "牽牛星",
      "龍高星",
      "玉堂星",
      "貫索星",
      "石門星",
    ],
  },
  {
    dayStem: "癸",
    expected: [
      "調舒星",
      "鳳閣星",
      "司禄星",
      "禄存星",
      "牽牛星",
      "車騎星",
      "玉堂星",
      "龍高星",
      "石門星",
      "貫索星",
    ],
  },
] as const satisfies readonly {
  dayStem: HeavenlyStem;
  expected: readonly JuudaiShusei[];
}[];

describe.each(expectedJuudaiByDayStem)(
  "十大主星 日干 $dayStem",
  ({ dayStem, expected }) => {
    test.each(stemOrder.map((targetStem, index) => [targetStem, expected[index]]))(
      "対象干 %s は %s",
      (targetStem, expectedStar) => {
        expect(getJuudaiShusei(dayStem, targetStem)).toBe(expectedStar);
      },
    );
  },
);

const branchOrder = [
  "子",
  "丑",
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
] as const satisfies readonly EarthlyBranch[];

const expectedJuunidaiByDayStem = [
  {
    dayStem: "甲",
    expected: [
      "天恍星",
      "天南星",
      "天禄星",
      "天将星",
      "天堂星",
      "天胡星",
      "天極星",
      "天庫星",
      "天馳星",
      "天報星",
      "天印星",
      "天貴星",
    ],
  },
  {
    dayStem: "乙",
    expected: [
      "天胡星",
      "天堂星",
      "天将星",
      "天禄星",
      "天南星",
      "天恍星",
      "天貴星",
      "天印星",
      "天報星",
      "天馳星",
      "天庫星",
      "天極星",
    ],
  },
  {
    dayStem: "丙",
    expected: [
      "天報星",
      "天印星",
      "天貴星",
      "天恍星",
      "天南星",
      "天禄星",
      "天将星",
      "天堂星",
      "天胡星",
      "天極星",
      "天庫星",
      "天馳星",
    ],
  },
  {
    dayStem: "丁",
    expected: [
      "天馳星",
      "天庫星",
      "天極星",
      "天胡星",
      "天堂星",
      "天将星",
      "天禄星",
      "天南星",
      "天恍星",
      "天貴星",
      "天印星",
      "天報星",
    ],
  },
  {
    dayStem: "戊",
    expected: [
      "天報星",
      "天印星",
      "天貴星",
      "天恍星",
      "天南星",
      "天禄星",
      "天将星",
      "天堂星",
      "天胡星",
      "天極星",
      "天庫星",
      "天馳星",
    ],
  },
  {
    dayStem: "己",
    expected: [
      "天馳星",
      "天庫星",
      "天極星",
      "天胡星",
      "天堂星",
      "天将星",
      "天禄星",
      "天南星",
      "天恍星",
      "天貴星",
      "天印星",
      "天報星",
    ],
  },
  {
    dayStem: "庚",
    expected: [
      "天極星",
      "天庫星",
      "天馳星",
      "天報星",
      "天印星",
      "天貴星",
      "天恍星",
      "天南星",
      "天禄星",
      "天将星",
      "天堂星",
      "天胡星",
    ],
  },
  {
    dayStem: "辛",
    expected: [
      "天貴星",
      "天印星",
      "天報星",
      "天馳星",
      "天庫星",
      "天極星",
      "天胡星",
      "天堂星",
      "天将星",
      "天禄星",
      "天南星",
      "天恍星",
    ],
  },
  {
    dayStem: "壬",
    expected: [
      "天将星",
      "天堂星",
      "天胡星",
      "天極星",
      "天庫星",
      "天馳星",
      "天報星",
      "天印星",
      "天貴星",
      "天恍星",
      "天南星",
      "天禄星",
    ],
  },
  {
    dayStem: "癸",
    expected: [
      "天禄星",
      "天南星",
      "天恍星",
      "天貴星",
      "天印星",
      "天報星",
      "天馳星",
      "天庫星",
      "天極星",
      "天胡星",
      "天堂星",
      "天将星",
    ],
  },
] as const satisfies readonly {
  dayStem: HeavenlyStem;
  expected: readonly JuunidaiJusei[];
}[];

describe.each(expectedJuunidaiByDayStem)(
  "十二大従星 日干 $dayStem",
  ({ dayStem, expected }) => {
    test.each(
      branchOrder.map((targetBranch, index) => [targetBranch, expected[index]]),
    )("対象支 %s は %s", (targetBranch, expectedStar) => {
      expect(getJuunidaiJusei(dayStem, targetBranch).star).toBe(expectedStar);
    });
  },
);

const expectedEnergyMatrix = {
  甲: {
    子: 7,
    丑: 10,
    寅: 11,
    卯: 12,
    辰: 8,
    巳: 4,
    午: 2,
    未: 5,
    申: 1,
    酉: 3,
    戌: 6,
    亥: 9,
  },
  乙: {
    子: 4,
    丑: 8,
    寅: 12,
    卯: 11,
    辰: 10,
    巳: 7,
    午: 9,
    未: 6,
    申: 3,
    酉: 1,
    戌: 5,
    亥: 2,
  },
  丙: {
    子: 3,
    丑: 6,
    寅: 9,
    卯: 7,
    辰: 10,
    巳: 11,
    午: 12,
    未: 8,
    申: 4,
    酉: 2,
    戌: 5,
    亥: 1,
  },
  丁: {
    子: 1,
    丑: 5,
    寅: 2,
    卯: 4,
    辰: 8,
    巳: 12,
    午: 11,
    未: 10,
    申: 7,
    酉: 9,
    戌: 6,
    亥: 3,
  },
  戊: {
    子: 3,
    丑: 6,
    寅: 9,
    卯: 7,
    辰: 10,
    巳: 11,
    午: 12,
    未: 8,
    申: 4,
    酉: 2,
    戌: 5,
    亥: 1,
  },
  己: {
    子: 1,
    丑: 5,
    寅: 2,
    卯: 4,
    辰: 8,
    巳: 12,
    午: 11,
    未: 10,
    申: 7,
    酉: 9,
    戌: 6,
    亥: 3,
  },
  庚: {
    子: 2,
    丑: 5,
    寅: 1,
    卯: 3,
    辰: 6,
    巳: 9,
    午: 7,
    未: 10,
    申: 11,
    酉: 12,
    戌: 8,
    亥: 4,
  },
  辛: {
    子: 9,
    丑: 6,
    寅: 3,
    卯: 1,
    辰: 5,
    巳: 2,
    午: 4,
    未: 8,
    申: 12,
    酉: 11,
    戌: 10,
    亥: 7,
  },
  壬: {
    子: 12,
    丑: 8,
    寅: 4,
    卯: 2,
    辰: 5,
    巳: 1,
    午: 3,
    未: 6,
    申: 9,
    酉: 7,
    戌: 10,
    亥: 11,
  },
  癸: {
    子: 11,
    丑: 10,
    寅: 7,
    卯: 9,
    辰: 6,
    巳: 3,
    午: 1,
    未: 5,
    申: 2,
    酉: 4,
    戌: 8,
    亥: 12,
  },
} as const satisfies Record<
  HeavenlyStem,
  Record<EarthlyBranch, number>
>;

const expectedEnergyCases = stemOrder.flatMap((dayStem) =>
  branchOrder.map((targetBranch) => ({
    dayStem,
    targetBranch,
    expectedEnergy: expectedEnergyMatrix[dayStem][targetBranch],
    caseKey: `${dayStem}:${targetBranch}`,
  })),
);

describe("十二大従星 エネルギー値", () => {
  beforeAll(() => {
    expect(Object.keys(expectedEnergyMatrix)).toEqual(stemOrder);

    for (const dayStem of stemOrder) {
      expect(Object.keys(expectedEnergyMatrix[dayStem])).toEqual(branchOrder);
    }

    expect(expectedEnergyCases).toHaveLength(120);
    expect(
      new Set(expectedEnergyCases.map(({ caseKey }) => caseKey)).size,
    ).toBe(120);

    const expectedEnergies = expectedEnergyCases.map(
      ({ expectedEnergy }) => expectedEnergy,
    );

    expect(expectedEnergies.every((energy) => energy !== undefined)).toBe(true);
    expect(expectedEnergies.every((energy) => Number.isInteger(energy))).toBe(
      true,
    );
    expect(
      expectedEnergies.every((energy) => energy >= 1 && energy <= 12),
    ).toBe(true);
    expect([...new Set(expectedEnergies)].sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  test.each(expectedEnergyCases)(
    "$dayStem × $targetBranch は $expectedEnergy",
    ({ dayStem, targetBranch, expectedEnergy }) => {
      expect(getJuunidaiJusei(dayStem, targetBranch).energy).toBe(
        expectedEnergy,
      );
    },
  );
});
