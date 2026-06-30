import type { CalendarDay } from "@/lib/calendar-day";

export type GoodFortuneDirectionCode =
  | "saitoku"
  | "taisai"
  | "tentoku"
  | "tendo";

export type GoodFortuneDirectionEntry = {
  code: GoodFortuneDirectionCode;
  name: string;
  board: "year" | "month";
  direction: string;
  directionDetail: string;
  basis: string;
  sourceStatus: "rule_v0";
  verificationStatus: "needs_manual_almanac_check";
  caution: string;
  sourceUrl: string;
  sourceNote: string;
};

const branchDirections: Record<string, { direction: string; detail: string }> = {
  子: { direction: "北", detail: "子" },
  丑: { direction: "北北東", detail: "丑" },
  寅: { direction: "東北東", detail: "寅" },
  卯: { direction: "東", detail: "卯" },
  辰: { direction: "東南東", detail: "辰" },
  巳: { direction: "南南東", detail: "巳" },
  午: { direction: "南", detail: "午" },
  未: { direction: "南南西", detail: "未" },
  申: { direction: "西南西", detail: "申" },
  酉: { direction: "西", detail: "酉" },
  戌: { direction: "西北西", detail: "戌" },
  亥: { direction: "北北西", detail: "亥" },
};

const saitokuByYearStem: Record<
  string,
  { direction: string; detail: string }
> = {
  甲: { direction: "東北東", detail: "甲・寅卯の間" },
  己: { direction: "東北東", detail: "甲・寅卯の間" },
  乙: { direction: "西南西", detail: "庚・申酉の間" },
  庚: { direction: "西南西", detail: "庚・申酉の間" },
  丙: { direction: "南南東", detail: "丙・巳午の間" },
  辛: { direction: "南南東", detail: "丙・巳午の間" },
  戊: { direction: "南南東", detail: "丙・巳午の間" },
  癸: { direction: "南南東", detail: "丙・巳午の間" },
  丁: { direction: "北北西", detail: "壬・亥子の間" },
  壬: { direction: "北北西", detail: "壬・亥子の間" },
};

const solarMonthByBranch: Record<string, number> = {
  寅: 1,
  卯: 2,
  辰: 3,
  巳: 4,
  午: 5,
  未: 6,
  申: 7,
  酉: 8,
  戌: 9,
  亥: 10,
  子: 11,
  丑: 12,
};

const tentokuBySolarMonth: Record<
  number,
  { direction: string; detail: string }
> = {
  1: { direction: "南", detail: "丁" },
  2: { direction: "西南", detail: "坤・未" },
  3: { direction: "北", detail: "壬・子" },
  4: { direction: "西", detail: "辛・酉" },
  5: { direction: "西北", detail: "乾・戌" },
  6: { direction: "東", detail: "甲・寅" },
  7: { direction: "北", detail: "癸・亥" },
  8: { direction: "東北", detail: "艮・丑" },
  9: { direction: "南", detail: "丙・午" },
  10: { direction: "東", detail: "乙・辰" },
  11: { direction: "東南", detail: "巽・巳" },
  12: { direction: "西", detail: "庚・申" },
};

const tendoBySolarMonth: Record<
  number,
  { direction: string; detail: string }
> = {
  1: { direction: "南", detail: "午" },
  2: { direction: "西南", detail: "坤" },
  3: { direction: "北", detail: "子" },
  4: { direction: "西", detail: "酉" },
  5: { direction: "西北", detail: "乾" },
  6: { direction: "東", detail: "卯" },
  7: { direction: "北", detail: "子" },
  8: { direction: "東北", detail: "艮" },
  9: { direction: "南", detail: "午" },
  10: { direction: "東", detail: "卯" },
  11: { direction: "東南", detail: "巽" },
  12: { direction: "西", detail: "酉" },
};

function getSolarMonth(day: CalendarDay) {
  return solarMonthByBranch[day.branches.month] ?? null;
}

export function getGoodFortuneDirections(day: CalendarDay) {
  const entries: GoodFortuneDirectionEntry[] = [];
  const yearStem = day.stems.year;
  const yearBranch = day.branches.year;
  const solarMonth = getSolarMonth(day);
  const saitoku = saitokuByYearStem[yearStem];
  const taisai = branchDirections[yearBranch];

  if (saitoku) {
    entries.push({
      code: "saitoku",
      name: "歳徳",
      board: "year",
      direction: saitoku.direction,
      directionDetail: saitoku.detail,
      basis: `年干 ${yearStem}`,
      sourceStatus: "rule_v0",
      verificationStatus: "needs_manual_almanac_check",
      caution:
        "恵方として使われる吉方。現段階では共通吉神として表示し、個人別吉方との重なりは後続で判定する。",
      sourceUrl: "https://komonjyo.net/toshitokushintoha.html",
      sourceNote: "年干ごとの歳徳方。戊癸の扱いは流派差があるため万年暦で確認する。",
    });
  }

  if (taisai) {
    entries.push({
      code: "taisai",
      name: "太歳",
      board: "year",
      direction: taisai.direction,
      directionDetail: taisai.detail,
      basis: `年支 ${yearBranch}`,
      sourceStatus: "rule_v0",
      verificationStatus: "needs_manual_almanac_check",
      caution:
        "建設的な行動には吉とされる一方、破壊的な行為は注意。方位取りでの扱いは目的別に分ける。",
      sourceUrl: "https://kinendar.com/calendar/hoijin.html",
      sourceNote: "太歳はその年の十二支方位に在位するという説明を採用。",
    });
  }

  if (solarMonth) {
    const tentoku = tentokuBySolarMonth[solarMonth];
    const tendo = tendoBySolarMonth[solarMonth];

    entries.push({
      code: "tentoku",
      name: "天徳",
      board: "month",
      direction: tentoku.direction,
      directionDetail: tentoku.detail,
      basis: `節月 ${solarMonth}月 / 月支 ${day.branches.month}`,
      sourceStatus: "rule_v0",
      verificationStatus: "needs_manual_almanac_check",
      caution:
        "建築・旅行・移転などに吉とされる。月ごとの在所は古典由来のため、手元万年暦で確認する。",
      sourceUrl: "https://rirc.or.jp/media/pdfs/baba_201703.pdf",
      sourceNote: "暦林問答集の解説に見える月ごとの天徳神方位をv0採用。",
    });

    entries.push({
      code: "tendo",
      name: "天道",
      board: "month",
      direction: tendo.direction,
      directionDetail: tendo.detail,
      basis: `節月 ${solarMonth}月 / 月支 ${day.branches.month}`,
      sourceStatus: "rule_v0",
      verificationStatus: "needs_manual_almanac_check",
      caution:
        "月の吉方位として扱う。流派差があるため、まずは節月ベースのv0として表示する。",
      sourceUrl: "https://nakshatra.tokyo/02/03/tendo.html",
      sourceNote: "節月と太陽黄経範囲に基づく天道方位表をv0採用。",
    });
  }

  return {
    date: day.date,
    solarMonth,
    entries,
    sourceStatus: "rule_v0",
    verificationStatus: "needs_manual_almanac_check",
    note:
      "吉神系方位の入口。歳徳・太歳は年、天徳・天道は節月で算出し、手元万年暦と外部資料で検証する。",
  } as const;
}

export function getGoodFortuneDirectionSummary(day: CalendarDay) {
  const result = getGoodFortuneDirections(day);

  return {
    date: day.date,
    total: result.entries.length,
    year: result.entries.filter((entry) => entry.board === "year").length,
    month: result.entries.filter((entry) => entry.board === "month").length,
    sourceStatus: result.sourceStatus,
    verificationStatus: result.verificationStatus,
  } as const;
}
