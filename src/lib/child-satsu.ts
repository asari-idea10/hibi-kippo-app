import type { CalendarDay } from "@/lib/calendar-day";

export type ChildSatsuStatus = "active" | "center_no_direction" | "unknown";

export type ChildSatsuResult = {
  date: string;
  name: "小児殺";
  status: ChildSatsuStatus;
  yearBranch: string;
  monthKyuseiCenter: number | null;
  targetStar: number | null;
  targetStarName: string | null;
  direction: string | null;
  directionDetail: string | null;
  board: "month";
  targetCondition: {
    primary: "12歳以下";
    caution: "18歳以下まで見る流派あり";
    note: string;
  };
  sourceStatus: "rule_v0";
  verificationStatus: "needs_manual_almanac_check";
  sourceUrls: string[];
  sourceNote: string;
  displayText: string;
};

const kyuseiNames: Record<number, string> = {
  1: "一白水星",
  2: "二黒土星",
  3: "三碧木星",
  4: "四緑木星",
  5: "五黄土星",
  6: "六白金星",
  7: "七赤金星",
  8: "八白土星",
  9: "九紫火星",
};

const baseDirectionsByStar: Record<
  number,
  { direction: string; detail: string }
> = {
  1: { direction: "北", detail: "坎" },
  2: { direction: "南西", detail: "坤" },
  3: { direction: "東", detail: "震" },
  4: { direction: "南東", detail: "巽" },
  5: { direction: "中央", detail: "中宮" },
  6: { direction: "北西", detail: "乾" },
  7: { direction: "西", detail: "兌" },
  8: { direction: "北東", detail: "艮" },
  9: { direction: "南", detail: "離" },
};

const childSatsuTargetStarByYearBranch: Record<string, number> = {
  子: 8,
  午: 8,
  卯: 3,
  酉: 3,
  丑: 9,
  未: 9,
  辰: 5,
  戌: 5,
  寅: 2,
  申: 2,
  巳: 6,
  亥: 6,
};

function toKyuseiNumber(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 9
    ? parsed
    : null;
}

function wrapKyusei(value: number) {
  return ((value - 1) % 9) + 1;
}

function getStarDirection(targetStar: number, centerStar: number) {
  const baseStar = wrapKyusei(targetStar - centerStar + 5);

  return baseDirectionsByStar[baseStar] ?? null;
}

export function getChildSatsu(day: CalendarDay): ChildSatsuResult {
  const yearBranch = day.branches.year;
  const monthKyuseiCenter = toKyuseiNumber(day.kyusei.month);
  const targetStar = childSatsuTargetStarByYearBranch[yearBranch] ?? null;
  const targetStarName = targetStar ? kyuseiNames[targetStar] : null;
  const direction =
    targetStar && monthKyuseiCenter
      ? getStarDirection(targetStar, monthKyuseiCenter)
      : null;
  const isCenter = direction?.direction === "中央";
  const status: ChildSatsuStatus =
    targetStar && monthKyuseiCenter
      ? isCenter
        ? "center_no_direction"
        : "active"
      : "unknown";

  return {
    date: day.date,
    name: "小児殺",
    status,
    yearBranch,
    monthKyuseiCenter,
    targetStar,
    targetStarName,
    direction: isCenter ? null : direction?.direction ?? null,
    directionDetail: direction?.detail ?? null,
    board: "month",
    targetCondition: {
      primary: "12歳以下",
      caution: "18歳以下まで見る流派あり",
      note:
        "v0では12歳以下を主対象として扱い、18歳以下説は注意注記として保持する。",
    },
    sourceStatus: "rule_v0",
    verificationStatus: "needs_manual_almanac_check",
    sourceUrls: [
      "https://kaiun-kigyojyuku.com/words/syounisatu/",
      "https://yakumoin.info/about/direction",
      "https://micane.jp/bad-direction-syounisatu",
    ],
    sourceNote:
      "年支ごとに対象九星を決め、その九星が月盤で廻座する方位を小児殺とするv0。中央に入る場合は方位なしとして扱う。",
    displayText:
      status === "active"
        ? `小児殺は月盤の${direction?.direction}方位です。12歳以下の子どもを伴う旅行・引越し・通院先選びでは注意方位として扱います。`
        : status === "center_no_direction"
          ? "小児殺の対象九星が中宮に入るため、v0では小児殺方位なしとして扱います。"
          : "小児殺の計算に必要な年支または月盤九星が不足しています。",
  };
}
