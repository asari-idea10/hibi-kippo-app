import type { CalendarDay } from "@/lib/calendar-day";
import {
  getDirection8ByMountain,
  getMountainEntry,
  getOppositeBranch,
  shiftBranch,
  type Direction8,
  type DirectionMountain,
} from "@/lib/direction-mountains";

export type DirectionDeityCycle = "year" | "month" | "day";
export type DirectionDeityCategory = "吉神" | "凶神" | "吉凶" | "注意";
export type DirectionDeityRuleStatus =
  | "rule_v0"
  | "partial_rule_v0"
  | "planned";

export type DirectionDeityEntry = {
  code: string;
  name: string;
  cycle: DirectionDeityCycle;
  category: DirectionDeityCategory;
  basis: string;
  mountains: DirectionMountain[];
  direction8: Direction8[];
  meaning: string;
  actionAdvice: string;
  caution: string | null;
  ruleStatus: DirectionDeityRuleStatus;
  verificationStatus: "needs_manual_almanac_check";
};

const saitokuByYearStem: Record<string, DirectionMountain> = {
  甲: "甲",
  己: "甲",
  乙: "庚",
  庚: "庚",
  丙: "丙",
  辛: "丙",
  戊: "丙",
  癸: "丙",
  丁: "壬",
  壬: "壬",
};

const daishogunByYearBranch: Record<string, DirectionMountain> = {
  亥: "酉",
  子: "酉",
  丑: "酉",
  寅: "子",
  卯: "子",
  辰: "子",
  巳: "卯",
  午: "卯",
  未: "卯",
  申: "午",
  酉: "午",
  戌: "午",
};

const saikeiByYearBranch: Record<string, DirectionMountain> = {
  子: "卯",
  丑: "戌",
  寅: "巳",
  卯: "子",
  辰: "辰",
  巳: "申",
  午: "午",
  未: "丑",
  申: "寅",
  酉: "酉",
  戌: "未",
  亥: "亥",
};

const trineTombByYearBranch: Record<string, DirectionMountain> = {
  申: "辰",
  子: "辰",
  辰: "辰",
  寅: "戌",
  午: "戌",
  戌: "戌",
  巳: "丑",
  酉: "丑",
  丑: "丑",
  亥: "未",
  卯: "未",
  未: "未",
};

const saisatsuByYearBranch: Record<string, DirectionMountain[]> = {
  申: ["巳", "午", "未"],
  子: ["巳", "午", "未"],
  辰: ["巳", "午", "未"],
  寅: ["亥", "子", "丑"],
  午: ["亥", "子", "丑"],
  戌: ["亥", "子", "丑"],
  巳: ["寅", "卯", "辰"],
  酉: ["寅", "卯", "辰"],
  丑: ["寅", "卯", "辰"],
  亥: ["申", "酉", "戌"],
  卯: ["申", "酉", "戌"],
  未: ["申", "酉", "戌"],
};

const yearKonjinByStem: Partial<Record<string, DirectionMountain[]>> = {
  甲: ["午", "未", "申", "酉"],
  己: ["午", "未", "申", "酉"],
  乙: ["辰", "巳"],
  庚: ["辰", "巳"],
  丙: ["子", "丑", "寅", "卯"],
  辛: ["子", "丑", "寅", "卯"],
};

const tenichijinByDayKanshiNumber: Array<{
  from: number;
  to: number;
  mountain: DirectionMountain | null;
  label: string;
}> = [
  { from: 30, to: 45, mountain: null, label: "天一天上" },
  { from: 46, to: 50, mountain: "艮", label: "艮" },
  { from: 51, to: 55, mountain: "卯", label: "卯" },
  { from: 56, to: 60, mountain: "巽", label: "巽" },
];

function uniqueDirections(mountains: DirectionMountain[]) {
  return Array.from(
    new Set(
      mountains
        .map((mountain) => getDirection8ByMountain(mountain))
        .filter((direction): direction is Direction8 => Boolean(direction)),
    ),
  );
}

function makeEntry(
  entry: Omit<DirectionDeityEntry, "direction8" | "verificationStatus">,
): DirectionDeityEntry {
  return {
    ...entry,
    direction8: uniqueDirections(entry.mountains),
    verificationStatus: "needs_manual_almanac_check",
  };
}

function mountainOrNull(mountain: string | null) {
  if (!mountain) {
    return null;
  }

  return getMountainEntry(mountain)?.mountain ?? null;
}

function getTenichijin(day: CalendarDay): DirectionDeityEntry {
  const dayNumber = day.numbers.day;
  const range = tenichijinByDayKanshiNumber.find(
    (entry) => dayNumber >= entry.from && dayNumber <= entry.to,
  );

  if (!range) {
    return makeEntry({
      code: "tenichijin",
      name: "天一神",
      cycle: "day",
      category: "注意",
      basis: `日干支 ${day.pillars.day} / ${dayNumber}`,
      mountains: [],
      meaning:
        "天一神の在所は60日周期で巡る。現段階では確認済み範囲のみを採用し、それ以外は未確定として扱う。",
      actionAdvice:
        "該当範囲の万年暦照合が済むまでは、方位候補の強い除外条件には使わず、検証用情報として扱う。",
      caution: "天一神の完全な巡行表を高島易断・万年暦で確認する。",
      ruleStatus: "partial_rule_v0",
    });
  }

  if (!range.mountain) {
    return makeEntry({
      code: "tenichijin",
      name: "天一神",
      cycle: "day",
      category: "吉神",
      basis: `日干支 ${day.pillars.day} / ${dayNumber}`,
      mountains: [],
      meaning:
        "天一神が天上へ帰る期間。天一天上として、方位の障りが弱まりやすい期間とされる。",
      actionAdvice:
        "大きな移動を断定的に勧めるより、方位の候補を広げやすい期間として扱う。",
      caution: null,
      ruleStatus: "partial_rule_v0",
    });
  }

  return makeEntry({
    code: "tenichijin",
    name: "天一神",
    cycle: "day",
    category: "注意",
    basis: `日干支 ${day.pillars.day} / ${dayNumber}`,
    mountains: [range.mountain],
    meaning:
      "陰陽道で重視される日単位の方位神。所在方位への動土・強い移動は慎重に扱う。",
    actionAdvice:
      "吉方位と重なる場合も、派手な動きより参拝・確認・静かな滞在に寄せる。",
    caution: "日盤の注意神として表示。完全表への照合後に候補除外の強さを決める。",
    ruleStatus: "partial_rule_v0",
  });
}

export function getDirectionDeities(day: CalendarDay) {
  const entries: DirectionDeityEntry[] = [];
  const yearStem = day.stems.year;
  const yearBranch = day.branches.year;
  const saitoku = mountainOrNull(saitokuByYearStem[yearStem] ?? null);
  const taisai = mountainOrNull(yearBranch);
  const saiha = mountainOrNull(getOppositeBranch(yearBranch));
  const daishogun = mountainOrNull(daishogunByYearBranch[yearBranch] ?? null);
  const taiin = mountainOrNull(shiftBranch(yearBranch, -3));
  const saikei = mountainOrNull(saikeiByYearBranch[yearBranch] ?? null);
  const kohan = mountainOrNull(trineTombByYearBranch[yearBranch] ?? null);
  const hyobi = mountainOrNull(kohan ? getOppositeBranch(kohan) : null);
  const saisatsu = saisatsuByYearBranch[yearBranch] ?? [];
  const yearKonjin = yearKonjinByStem[yearStem] ?? [];

  if (saitoku) {
    entries.push(
      makeEntry({
        code: "saitokujin",
        name: "歳徳神",
        cycle: "year",
        category: "吉神",
        basis: `年干 ${yearStem}`,
        mountains: [saitoku],
        meaning: "その年の福徳を司る吉神。恵方として扱われる。",
        actionAdvice:
          "新しいことの開始、参拝、願意を整える行動に向く。九星の吉方と重なる場合は候補の後押しとして扱う。",
        caution: null,
        ruleStatus: "rule_v0",
      }),
    );
  }

  if (taisai) {
    entries.push(
      makeEntry({
        code: "taisai",
        name: "太歳神",
        cycle: "year",
        category: "吉凶",
        basis: `年支 ${yearBranch}`,
        mountains: [taisai],
        meaning:
          "八将神の中心。建設的な行動には吉とされる一方、伐採・破壊的な行為は慎む。",
        actionAdvice:
          "願意を立てる、学びを始める、整った参拝には使いやすい。動土や争いは避ける。",
        caution: "太歳方位への動土・伐採は注意。",
        ruleStatus: "rule_v0",
      }),
    );
  }

  if (saiha) {
    entries.push(
      makeEntry({
        code: "saiha",
        name: "歳破神",
        cycle: "year",
        category: "凶神",
        basis: `年支 ${yearBranch} の冲`,
        mountains: [saiha],
        meaning:
          "太歳の反対方位。破れ・不成立・交渉の乱れを象徴する年の注意方位。",
        actionAdvice:
          "契約・交渉・大きな移転は慎重に。行く場合は確認、見直し、静かな参拝に寄せる。",
        caution: "九星の年破と近い扱い。大きな予定では強めの注意にする。",
        ruleStatus: "rule_v0",
      }),
    );
  }

  if (daishogun) {
    entries.push(
      makeEntry({
        code: "daishogun",
        name: "大将軍",
        cycle: "year",
        category: "凶神",
        basis: `年支 ${yearBranch} の三年塞がり`,
        mountains: [daishogun],
        meaning:
          "八将神の強い凶神。建築・移転・動土のような大きく動かす行為を忌む。",
        actionAdvice:
          "大きな予定では避ける候補。日常利用なら下見、準備、静かな滞在に翻訳する。",
        caution: "遊行期間の例外は未実装。後続で日付表を追加する。",
        ruleStatus: "rule_v0",
      }),
    );
  }

  if (taiin) {
    entries.push(
      makeEntry({
        code: "taiin",
        name: "太陰神",
        cycle: "year",
        category: "吉神",
        basis: `太歳から三支戻り / 年支 ${yearBranch}`,
        mountains: [taiin],
        meaning: "学問・芸術・女性や出産に関わる吉神とされる。",
        actionAdvice:
          "学び、制作、身体をいたわる予定、穏やかな相談に意味づけしやすい。",
        caution: null,
        ruleStatus: "rule_v0",
      }),
    );
  }

  if (saikei) {
    entries.push(
      makeEntry({
        code: "saikei",
        name: "歳刑神",
        cycle: "year",
        category: "凶神",
        basis: `十二支の刑 / 年支 ${yearBranch}`,
        mountains: [saikei],
        meaning: "刑の関係から出る年の注意方位。契約・種まきなどに慎重さを求める。",
        actionAdvice:
          "新規の約束より、条件確認・境界線の整理・手続きの見直しに寄せる。",
        caution: "刑の表は流派差を確認する。",
        ruleStatus: "partial_rule_v0",
      }),
    );
  }

  if (saisatsu.length > 0) {
    entries.push(
      makeEntry({
        code: "saisatsu",
        name: "歳殺神",
        cycle: "year",
        category: "凶神",
        basis: `三合局から見た殺方 / 年支 ${yearBranch}`,
        mountains: saisatsu,
        meaning:
          "三合局から導く年の注意方位。単一の24山ではなく、まとまった方位帯として扱う。",
        actionAdvice:
          "結婚・勝負・武事的な強い行動は控え、確認や整えの行動に寄せる。",
        caution: "歳殺の幅と対象山は万年暦で照合する。",
        ruleStatus: "partial_rule_v0",
      }),
    );
  }

  if (kohan) {
    entries.push(
      makeEntry({
        code: "kohan",
        name: "黄幡神",
        cycle: "year",
        category: "凶神",
        basis: `三合局の墓 / 年支 ${yearBranch}`,
        mountains: [kohan],
        meaning: "土動かし・武事に注意とされる方位神。",
        actionAdvice:
          "大きな工事や強引な進行より、整地・計画・静かな準備へ翻訳する。",
        caution: "三合墓の採用表を手元資料で確認する。",
        ruleStatus: "partial_rule_v0",
      }),
    );
  }

  if (hyobi) {
    entries.push(
      makeEntry({
        code: "hyobi",
        name: "豹尾神",
        cycle: "year",
        category: "凶神",
        basis: `黄幡神の反対方位 / 年支 ${yearBranch}`,
        mountains: [hyobi],
        meaning: "不浄を嫌うとされる年の注意方位。",
        actionAdvice:
          "清掃、浄化、持ち物の整理など、清める行動へ寄せる。",
        caution: "黄幡との対応表を手元資料で確認する。",
        ruleStatus: "partial_rule_v0",
      }),
    );
  }

  if (yearKonjin.length > 0) {
    entries.push(
      makeEntry({
        code: "konjin_year",
        name: "金神",
        cycle: "year",
        category: "凶神",
        basis: `年干 ${yearStem}`,
        mountains: yearKonjin,
        meaning:
          "殺伐の気を持つとされる強い注意神。年干により複数の24山を占有する。",
        actionAdvice:
          "移転・建築・動土は慎重に。日常利用では祓い、確認、静かな滞在へ寄せる。",
        caution: "丁壬・戊癸など未入力の年干表、巡金神は後続で追加する。",
        ruleStatus: "partial_rule_v0",
      }),
    );
  }

  entries.push(getTenichijin(day));

  return {
    date: day.date,
    basis: {
      year: day.pillars.year,
      month: day.pillars.month,
      day: day.pillars.day,
      yearStem,
      yearBranch,
      dayKanshiNumber: day.numbers.day,
    },
    entries,
    summary: {
      total: entries.length,
      year: entries.filter((entry) => entry.cycle === "year").length,
      month: entries.filter((entry) => entry.cycle === "month").length,
      day: entries.filter((entry) => entry.cycle === "day").length,
      needsCheck: entries.filter(
        (entry) => entry.ruleStatus !== "rule_v0",
      ).length,
    },
    note:
      "方位神は24山・角度ベースで扱う。九星の8方位判定とは別レイヤーとして計算し、表示時に8方位へ丸める。",
  } as const;
}
