import type { CalendarDay } from "@/lib/calendar-day";
import { getDoyoComparison } from "@/lib/doyo";
import type { GoodFortuneDirectionEntry } from "@/lib/good-fortune-directions";
import { getGoodFortuneDirections } from "@/lib/good-fortune-directions";

export type DirectionRecommendationLevel =
  | "recommended"
  | "caution_good"
  | "not_recommended"
  | "blocked";

export type DirectionConflictKind =
  | "ankensatsu"
  | "gohosatsu"
  | "ha"
  | "doyo_satsu";

export type DirectionConflict = {
  kind: DirectionConflictKind;
  name: string;
  board: "year" | "month" | "day" | "doyo";
  direction: string;
  severity: "strong" | "medium";
  note: string;
};

export type GoodFortuneDirectionJudgment = {
  entry: GoodFortuneDirectionEntry;
  normalizedDirection: string;
  recommendation: DirectionRecommendationLevel;
  recommendationLabel: string;
  conflicts: DirectionConflict[];
  policyNote: string;
  displayText: string;
};

const directionAliases: Record<string, string> = {
  東北: "北東",
  西北: "北西",
  東南: "南東",
  西南: "南西",
  北北東: "北東",
  東北東: "北東",
  東南東: "南東",
  南南東: "南東",
  南南西: "南西",
  西南西: "南西",
  西北西: "北西",
  北北西: "北西",
};

const conflictNames: Record<DirectionConflictKind, string> = {
  ankensatsu: "暗剣殺",
  gohosatsu: "五黄殺",
  ha: "破",
  doyo_satsu: "土用殺",
};

function normalizeDirection(direction: string) {
  return directionAliases[direction] ?? direction;
}

function pushDirectionWarningConflicts(
  conflicts: DirectionConflict[],
  normalizedDirection: string,
  board: "year" | "month" | "day",
  warnings: CalendarDay["directionWarnings"]["day"],
) {
  const checks = [
    {
      kind: "ankensatsu",
      direction: warnings.ankensatsu,
      note: "他動的・突発的な凶意として扱い、吉神よりも優先して避ける。",
    },
    {
      kind: "gohosatsu",
      direction: warnings.gohosatsu,
      note: "強い凶方位として扱い、天道が重なっても使用不可を基本とする。",
    },
    {
      kind: "ha",
      direction: warnings.saiha,
      note: "年破・月破・日破を含む破の方位として、方位取りでは慎重に扱う。",
    },
  ] as const;

  checks.forEach((check) => {
    if (!check.direction) {
      return;
    }

    if (normalizeDirection(check.direction) !== normalizedDirection) {
      return;
    }

    conflicts.push({
      kind: check.kind,
      name: conflictNames[check.kind],
      board,
      direction: check.direction,
      severity: "strong",
      note: check.note,
    });
  });
}

function getRecommendation(
  entry: GoodFortuneDirectionEntry,
  conflicts: DirectionConflict[],
): {
  recommendation: DirectionRecommendationLevel;
  recommendationLabel: string;
  policyNote: string;
  displayText: string;
} {
  const hasStrongConflict = conflicts.some(
    (conflict) => conflict.severity === "strong",
  );
  const hasDoyoSatsu = conflicts.some(
    (conflict) => conflict.kind === "doyo_satsu",
  );

  if (hasStrongConflict) {
    return {
      recommendation: "blocked",
      recommendationLabel: "使用不可",
      policyNote:
        "五黄殺・暗剣殺・破などの強い凶方位が重なる場合は、吉神よりも凶殺を優先する。",
      displayText:
        entry.code === "tendo"
          ? "天道が巡る方位ですが、強い凶方位と重なるため、方位取りとしては推奨しません。"
          : "吉神はありますが、強い凶方位と重なるため、方位取りとしては避ける判断を優先します。",
    };
  }

  if (hasDoyoSatsu) {
    return {
      recommendation: "not_recommended",
      recommendationLabel: "非推奨",
      policyNote:
        "土用殺が重なる場合は、期間限定の注意方位として安全側に倒して避ける。",
      displayText:
        "吉神はありますが、土用期間の注意方位と重なるため、方位取りとしては避ける判断を優先します。",
    };
  }

  if (entry.code === "tendo") {
    return {
      recommendation: "caution_good",
      recommendationLabel: "注意つき吉",
      policyNote:
        "天道は凶意を和らげる考え方があるため別枠で表示する。ただし強い共通凶殺の打ち消しはv0では採用しない。",
      displayText:
        "天道が巡る方位です。凶意を和らげる考え方がありますが、現段階では安全側に倒して総合判断します。",
    };
  }

  return {
    recommendation: "recommended",
    recommendationLabel: "推奨",
    policyNote:
      "凶殺や土用殺との重なりがないため、共通吉神として候補に残す。",
    displayText:
      "吉神が巡り、現在の共通凶殺・土用殺との重なりはありません。候補方位として扱えます。",
  };
}

export function judgeGoodFortuneDirectionConflicts(day: CalendarDay) {
  const goodFortuneDirections = getGoodFortuneDirections(day);
  const doyoComparison = getDoyoComparison(day);
  const doyoSatsuDirection =
    doyoComparison.calculated.isDoyo
      ? doyoComparison.calculated.doyoSatsuDirection
      : null;

  const judgments: GoodFortuneDirectionJudgment[] =
    goodFortuneDirections.entries.map((entry) => {
      const normalizedDirection = normalizeDirection(entry.direction);
      const conflicts: DirectionConflict[] = [];

      pushDirectionWarningConflicts(
        conflicts,
        normalizedDirection,
        "year",
        day.directionWarnings.year,
      );
      pushDirectionWarningConflicts(
        conflicts,
        normalizedDirection,
        "month",
        day.directionWarnings.month,
      );
      pushDirectionWarningConflicts(
        conflicts,
        normalizedDirection,
        "day",
        day.directionWarnings.day,
      );

      if (
        doyoSatsuDirection &&
        normalizeDirection(doyoSatsuDirection) === normalizedDirection
      ) {
        conflicts.push({
          kind: "doyo_satsu",
          name: conflictNames.doyo_satsu,
          board: "doyo",
          direction: doyoSatsuDirection,
          severity: "medium",
          note:
            "土用期間中の注意方位。五黄殺などより軽く扱う流派もあるが、v0では方位取りを避ける。",
        });
      }

      return {
        entry,
        normalizedDirection,
        conflicts,
        ...getRecommendation(entry, conflicts),
      };
    });

  return {
    date: day.date,
    sourceStatus: "policy_v0",
    verificationStatus: "needs_manual_almanac_check",
    policy:
      "吉神があっても、強い方位殺・土用殺が重なる場合は避ける。天道は別枠で表示するが、五黄殺・暗剣殺・破の打ち消しはv0では採用しない。",
    doyo: {
      isDoyo: doyoComparison.calculated.isDoyo,
      label: doyoComparison.calculated.period?.label ?? null,
      doyoSatsuDirection,
    },
    summary: {
      total: judgments.length,
      recommended: judgments.filter(
        (judgment) => judgment.recommendation === "recommended",
      ).length,
      cautionGood: judgments.filter(
        (judgment) => judgment.recommendation === "caution_good",
      ).length,
      notRecommended: judgments.filter(
        (judgment) => judgment.recommendation === "not_recommended",
      ).length,
      blocked: judgments.filter(
        (judgment) => judgment.recommendation === "blocked",
      ).length,
    },
    judgments,
  } as const;
}
