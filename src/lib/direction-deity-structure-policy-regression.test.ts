import { beforeAll, describe, expect, it } from "vitest";

import { scoreBestDay } from "@/lib/best-day-score";
import { getCalendarDays, type CalendarDay } from "@/lib/calendar-day";
import { searchCalendarDb } from "@/lib/calendar-db-view";
import {
  getPalaceBlendType,
  getPalaceStarBlend,
} from "@/lib/direction-palace-blend-master";
import {
  getTendoTrineByBranch,
  getTendoTrineByMonthBranch,
  tendoTrineVirtueMaster,
} from "@/lib/feng-shui-virtue-master";
import {
  judgeGoodFortuneDirectionConflicts,
  type DirectionConflictKind,
  type GoodFortuneDirectionJudgment,
} from "@/lib/good-fortune-direction-policy";
import { getGoodFortuneDirections } from "@/lib/good-fortune-directions";

const expectedTrines = [
  { name: "三合水局", branches: ["申", "子", "辰"] },
  { name: "三合木局", branches: ["亥", "卯", "未"] },
  { name: "三合火局", branches: ["寅", "午", "戌"] },
  { name: "三合金局", branches: ["巳", "酉", "丑"] },
] as const;

const allBranches = [
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
] as const;

const eightDirections = new Set([
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
]);

type ConflictSample = {
  day: CalendarDay;
  judgment: GoodFortuneDirectionJudgment;
};

const conflictKinds = [
  "gohosatsu",
  "ankensatsu",
  "ha",
  "doyo_satsu",
] as const satisfies readonly DirectionConflictKind[];
const matrixConflictKinds = [
  "gohosatsu",
  "ankensatsu",
  "ha",
] as const satisfies readonly DirectionConflictKind[];
const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

const conflictSamples = new Map<DirectionConflictKind, ConflictSample>();
let gettokuDay: CalendarDay | null = null;

function getBoardLabels(value: string) {
  const separatorIndex = value.indexOf("] ");
  const labels = separatorIndex >= 0 ? value.slice(separatorIndex + 2) : value;

  return labels === "-" ? [] : labels.split("・");
}

function requireConflictSample(kind: DirectionConflictKind) {
  const sample = conflictSamples.get(kind);

  expect(sample, `${kind} と吉神が同一方位に重なる実在ケース`).toBeDefined();

  if (!sample) {
    throw new Error(`${kind} の回帰サンプルが見つかりませんでした。`);
  }

  return sample;
}

beforeAll(() => {
  const days = getCalendarDays({
    start: "2026-01-01",
    end: "2026-12-31",
  });

  for (const day of days) {
    if (
      !gettokuDay &&
      (day.calendarNotes.activeDefinitions.some(
        (definition) => definition.name === "月徳日",
      ) || day.calendarNotes.legacyRaw.summary.includes("月徳日"))
    ) {
      gettokuDay = day;
    }

    const policyResult = judgeGoodFortuneDirectionConflicts(day);
    const judgments = policyResult.judgments;

    if (!conflictSamples.has("doyo_satsu") && policyResult.doyo.isDoyo) {
      for (const stem of heavenlyStems) {
        const candidateDay: CalendarDay = {
          ...day,
          stems: { ...day.stems, year: stem },
        };
        const judgment = judgeGoodFortuneDirectionConflicts(
          candidateDay,
        ).judgments.find((candidate) =>
          candidate.conflicts.some(
            (conflict) => conflict.kind === "doyo_satsu",
          ),
        );

        if (judgment) {
          conflictSamples.set("doyo_satsu", { day: candidateDay, judgment });
          break;
        }
      }
    }

    for (const judgment of judgments) {
      for (const kind of conflictKinds) {
        if (conflictSamples.has(kind)) {
          continue;
        }

        const hasTargetConflict = judgment.conflicts.some(
          (conflict) => conflict.kind === kind,
        );
        if (hasTargetConflict) {
          conflictSamples.set(kind, { day, judgment });
        }
      }
    }

    if (gettokuDay && conflictSamples.size === conflictKinds.length) {
      break;
    }
  }
});

describe("三合4局の確認済み構造", () => {
  it("独立期待値の4局が全12支を重複・欠落なく一度ずつ含む", () => {
    expect(expectedTrines).toHaveLength(4);
    expect(new Set(expectedTrines.map((trine) => trine.name))).toHaveLength(4);

    const branches = expectedTrines.flatMap((trine) => {
      expect(trine.branches).toHaveLength(3);
      expect(trine.branches.every(Boolean)).toBe(true);
      return [...trine.branches];
    });

    expect(branches).toHaveLength(12);
    expect(new Set(branches)).toHaveLength(12);
    expect(new Set(branches)).toEqual(new Set(allBranches));
    expect(expectedTrines.some((trine) => trine.name.includes("三盤一致"))).toBe(
      false,
    );
  });

  it("各月支から所属する三合局が一意に得られる", () => {
    expect(tendoTrineVirtueMaster).toHaveLength(12);
    expect(new Set(tendoTrineVirtueMaster.map((entry) => entry.branch))).toEqual(
      new Set(allBranches),
    );

    for (const expected of expectedTrines) {
      for (const branch of expected.branches) {
        const entry = getTendoTrineByMonthBranch(branch);

        expect(entry, `${branch}月の所属局`).not.toBeNull();
        expect(entry?.name).toBe(expected.name);
        expect(entry?.dayBranches).toEqual(expected.branches);
      }
    }
  });

  it("各支の日支lookupが局外支をactiveな構成員として返さない", () => {
    for (const expected of expectedTrines) {
      for (const branch of expected.branches) {
        const entry = getTendoTrineByBranch(branch);

        expect(entry, `${branch}日支の所属局`).not.toBeNull();
        expect(entry?.name).toBe(expected.name);
        expect(entry?.dayBranches).toEqual(expected.branches);
        expect(
          new Set(
            allBranches.filter((candidate) =>
              entry?.dayBranches.includes(candidate),
            ),
          ),
        ).toEqual(new Set(expected.branches));
      }
    }
  });

  it("三合の方向は具体値を固定せず3方向・一意・8方位内を保つ", () => {
    for (const expected of expectedTrines) {
      const entries = tendoTrineVirtueMaster.filter(
        (entry) => entry.name === expected.name,
      );
      const directionSignatures = new Set(
        entries.map((entry) => entry.dayDirections.join("|")),
      );

      expect(entries).toHaveLength(3);
      expect(directionSignatures).toHaveLength(1);

      for (const entry of entries) {
        expect(entry.dayDirections).toHaveLength(3);
        expect(new Set(entry.dayDirections)).toHaveLength(3);
        expect(entry.dayDirections.every((direction) => eightDirections.has(direction))).toBe(
          true,
        );
        expect(entry.dayDirections.every(Boolean)).toBe(true);
      }
    }
  });
});

describe("吉神ラベルと凶殺ラベルの併存", () => {
  it.each(matrixConflictKinds)(
    "%s が重なる公開結果で吉神・凶殺の両ラベルを上書きしない",
    (kind) => {
      const { day, judgment } = requireConflictSample(kind);
      const result = searchCalendarDb({
        start: day.date,
        end: day.date,
        limit: 1,
        view: "kyusei",
      });
      const row = result.rows[0];
      const targetConflicts = judgment.conflicts.filter(
        (conflict) => conflict.kind === kind,
      );

      expect(row).toBeDefined();
      expect(targetConflicts.length).toBeGreaterThan(0);
      expect(judgment.entry.name).not.toBe("");

      const boardCells = Object.values(
        row.directionBoardValues[
          judgment.normalizedDirection as keyof typeof row.directionBoardValues
        ],
      );
      const labels = boardCells.flatMap(getBoardLabels);

      expect(
        labels.some(
          (label) =>
            label === judgment.entry.name ||
            label.startsWith(`${judgment.entry.name}(`),
        ),
      ).toBe(true);
      for (const conflict of targetConflicts) {
        expect(labels).toContain(conflict.name);
      }
      for (const cell of boardCells) {
        const cellLabels = getBoardLabels(cell);
        expect(new Set(cellLabels)).toHaveLength(cellLabels.length);
      }
    },
  );
});

describe("吉神より凶殺を優先する現行policy", () => {
  it.each(["gohosatsu", "ankensatsu", "ha"] as const)(
    "%s は吉神が同一方位にあってもblockedを維持する",
    (kind) => {
      const { judgment } = requireConflictSample(kind);

      expect(judgment.conflicts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind, severity: "strong" }),
        ]),
      );
      expect(judgment.entry.name).not.toBe("");
      expect(judgment.recommendation).toBe("blocked");
      expect(judgment.recommendation).not.toBe("recommended");
    },
  );

  it("土用殺単独は吉神があってもblockedではなくnot_recommendedを維持する", () => {
    const { day, judgment: originalJudgment } =
      requireConflictSample("doyo_satsu");
    const noWarnings = { ankensatsu: "", gohosatsu: "", saiha: "" };
    const isolatedDay: CalendarDay = {
      ...day,
      directionWarnings: {
        year: { ...noWarnings },
        month: { ...noWarnings },
        day: { ...noWarnings },
      },
    };
    const judgment = judgeGoodFortuneDirectionConflicts(
      isolatedDay,
    ).judgments.find((candidate) => candidate.entry.code === originalJudgment.entry.code);

    expect(judgment).toBeDefined();

    if (!judgment) {
      throw new Error("土用殺単独policyの回帰対象が見つかりませんでした。");
    }

    expect(judgment.conflicts).toEqual([
      expect.objectContaining({ kind: "doyo_satsu", severity: "medium" }),
    ]);
    expect(judgment.entry.name).not.toBe("");
    expect(judgment.recommendation).toBe("not_recommended");
    expect(judgment.recommendation).not.toBe("blocked");
    expect(judgment.recommendation).not.toBe("recommended");
  });
});

describe("候補rankと別層の表示情報", () => {
  it("複数の吉神や天道・天徳を候補scoreへ直接加点しない", () => {
    const { day } = requireConflictSample("gohosatsu");
    const goodEntries = getGoodFortuneDirections(day).entries;
    const result = scoreBestDay(day);
    const scoreLabels = new Set(result.reasons.map((reason) => reason.label));

    expect(goodEntries.length).toBeGreaterThanOrEqual(2);
    expect(goodEntries.some((entry) => entry.code === "tendo")).toBe(true);
    expect(goodEntries.some((entry) => entry.code === "tentoku")).toBe(true);
    expect(
      goodEntries.filter((entry) => scoreLabels.has(entry.name)),
    ).toEqual([]);
    expect(scoreLabels.has("天道")).toBe(false);
    expect(scoreLabels.has("天徳")).toBe(false);
  });

  it("月徳日は日次暦注のままで方位値や方位候補へ自動接続されない", () => {
    expect(gettokuDay, "月徳日を含む実在日").not.toBeNull();

    if (!gettokuDay) {
      throw new Error("月徳日を含む回帰サンプルが見つかりませんでした。");
    }

    const hasDailyNote =
      gettokuDay.calendarNotes.activeDefinitions.some(
        (definition) => definition.name === "月徳日",
      ) || gettokuDay.calendarNotes.legacyRaw.summary.includes("月徳日");
    const result = searchCalendarDb({
      start: gettokuDay.date,
      end: gettokuDay.date,
      limit: 1,
      view: "kyusei",
      purpose: "travel",
    });
    const row = result.rows[0];
    const directionValues = Object.values(row.directionBoardValues).flatMap(
      (boards) => Object.values(boards),
    );

    expect(hasDailyNote).toBe(true);
    expect(row.values["主要選日"]).toContain("月徳日");
    expect(directionValues.some((value) => value.includes("月徳"))).toBe(false);
    expect(row.purposeTags.some((tag) => tag.includes("月徳"))).toBe(false);
  });

  it("生気blendの内部score 2を候補rank加点や凶殺相殺へ流用しない", () => {
    const blend = getPalaceStarBlend("北", "3");
    const { day, judgment } = requireConflictSample("ankensatsu");
    const bestDay = scoreBestDay(day);

    expect(getPalaceBlendType("水", "木")).toBe("生気");
    expect(blend).not.toBeNull();
    expect(blend?.type).toBe("生気");
    expect(blend?.score).toBe(2);
    expect(blend?.isBlocking).toBe(false);
    expect(bestDay.reasons.some((reason) => reason.label === "生気")).toBe(false);
    expect(judgment.recommendation).toBe("blocked");
  });
});
