import { describe, expect, test } from "vitest";

import { getSanmeigakuProfile } from "@/lib/sanmeigaku-profile";

const lifeStagePlacementCases = [
  {
    birthDate: "1976-03-19",
    expected: {
      dayStem: "庚",
      branches: { year: "辰", month: "卯", day: "午" },
      early: {
        key: "early",
        label: "初年運",
        theme: "若年期",
        sourceLabel: "日干 × 年支",
        dayStem: "庚",
        targetBranch: "辰",
        star: "天印星",
        energy: 6,
      },
      middle: {
        key: "middle",
        label: "中年運",
        theme: "現役期",
        sourceLabel: "日干 × 月支",
        dayStem: "庚",
        targetBranch: "卯",
        star: "天報星",
        energy: 3,
      },
      late: {
        key: "late",
        label: "老年運",
        theme: "晩年期",
        sourceLabel: "日干 × 日支",
        dayStem: "庚",
        targetBranch: "午",
        star: "天恍星",
        energy: 7,
      },
      energyTotal: 16,
      strengthLabel: "身中",
    },
  },
  {
    birthDate: "2008-07-12",
    expected: {
      dayStem: "癸",
      branches: { year: "子", month: "未", day: "丑" },
      early: {
        key: "early",
        label: "初年運",
        theme: "若年期",
        sourceLabel: "日干 × 年支",
        dayStem: "癸",
        targetBranch: "子",
        star: "天禄星",
        energy: 11,
      },
      middle: {
        key: "middle",
        label: "中年運",
        theme: "現役期",
        sourceLabel: "日干 × 月支",
        dayStem: "癸",
        targetBranch: "未",
        star: "天庫星",
        energy: 5,
      },
      late: {
        key: "late",
        label: "老年運",
        theme: "晩年期",
        sourceLabel: "日干 × 日支",
        dayStem: "癸",
        targetBranch: "丑",
        star: "天南星",
        energy: 10,
      },
      energyTotal: 26,
      strengthLabel: "身強",
    },
  },
  {
    birthDate: "2008-10-02",
    expected: {
      dayStem: "乙",
      branches: { year: "子", month: "酉", day: "亥" },
      early: {
        key: "early",
        label: "初年運",
        theme: "若年期",
        sourceLabel: "日干 × 年支",
        dayStem: "乙",
        targetBranch: "子",
        star: "天胡星",
        energy: 4,
      },
      middle: {
        key: "middle",
        label: "中年運",
        theme: "現役期",
        sourceLabel: "日干 × 月支",
        dayStem: "乙",
        targetBranch: "酉",
        star: "天馳星",
        energy: 1,
      },
      late: {
        key: "late",
        label: "老年運",
        theme: "晩年期",
        sourceLabel: "日干 × 日支",
        dayStem: "乙",
        targetBranch: "亥",
        star: "天極星",
        energy: 2,
      },
      energyTotal: 7,
      strengthLabel: "身弱",
    },
  },
] as const;

describe.each(lifeStagePlacementCases)(
  "算命学プロフィール $birthDate の初年・中年・老年配置",
  ({ birthDate, expected }) => {
    test("年支・月支・日支由来の十二大従星を正しい人生区分へ配置する", () => {
      const profile = getSanmeigakuProfile(birthDate);

      expect(profile).not.toBeNull();

      if (!profile) {
        throw new Error(`算命学プロフィールを生成できませんでした: ${birthDate}`);
      }

      expect(profile.birthDate).toBe(birthDate);
      expect(profile.birthDay.stems.day).toBe(expected.dayStem);
      expect(profile.birthDay.branches).toMatchObject(expected.branches);
      expect({
        year: profile.pillars.year.branch,
        month: profile.pillars.month.branch,
        day: profile.pillars.day.branch,
      }).toEqual(expected.branches);
      expect(profile.yosenChart.dayStem).toBe(expected.dayStem);
      expect(Object.keys(profile.yosenChart.juunidai)).toEqual([
        "early",
        "middle",
        "late",
      ]);
      expect(profile.yosenChart.juunidai.early).toEqual(expected.early);
      expect(profile.yosenChart.juunidai.middle).toEqual(expected.middle);
      expect(profile.yosenChart.juunidai.late).toEqual(expected.late);

      const lifeStageEnergyTotal = [
        profile.yosenChart.juunidai.early.energy,
        profile.yosenChart.juunidai.middle.energy,
        profile.yosenChart.juunidai.late.energy,
      ].reduce((sum, energy) => sum + (energy ?? 0), 0);

      expect(lifeStageEnergyTotal).toBe(expected.energyTotal);
      expect(profile.yosenChart.energyTotal).toBe(expected.energyTotal);
      expect(profile.yosenChart.strengthLabel).toBe(expected.strengthLabel);
    });
  },
);
