import { describe, expect, test } from "vitest";

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
