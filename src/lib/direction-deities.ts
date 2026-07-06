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

export type DirectionDeityAdoptionStatus =
  | "正式採用"
  | "検証中"
  | "将来対応";

export type DirectionDeityAdoptionEntry = {
  name: string;
  cycle: DirectionDeityCycle | "multi";
  category: DirectionDeityCategory;
  adoptionStatus: DirectionDeityAdoptionStatus;
  displayLayer: "通常表示" | "説明内表示" | "未表示";
  implementationStatus: DirectionDeityRuleStatus;
  currentScope: string;
  nextCheck: string;
  note: string;
};

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

export const directionDeityAdoptionMaster = [
  {
    name: "歳徳神",
    cycle: "year",
    category: "吉神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "rule_v0",
    currentScope: "年干から恵方を24山で算出",
    nextCheck: "手元万年暦と年干ごとの恵方表を照合する",
    note: "年の福徳を司る吉神。九星の吉方と重なる場合の後押しとして扱う。",
  },
  {
    name: "太歳神",
    cycle: "year",
    category: "吉凶",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "rule_v0",
    currentScope: "年支と同じ24山に配置",
    nextCheck: "動土・伐採など行動別の注意表現を調整する",
    note: "万事に吉の側面と、破壊的行為への注意を併せ持つため吉凶扱い。",
  },
  {
    name: "歳破神",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "rule_v0",
    currentScope: "年支の冲を24山で算出",
    nextCheck: "九星の年破との表示重複を整理する",
    note: "大きな予定では強い注意。日常利用では確認・見直しへ翻訳する。",
  },
  {
    name: "大将軍",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "rule_v0",
    currentScope: "年支の三年塞がりを24山で算出",
    nextCheck: "遊行期間の例外表を追加する",
    note: "建築・移転・動土のような大きく動かす行為で重視する。",
  },
  {
    name: "太陰神",
    cycle: "year",
    category: "吉神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "rule_v0",
    currentScope: "太歳から三支戻りで算出",
    nextCheck: "手元資料で年支別配置を照合する",
    note: "学問・芸術・女性や出産に関わる吉神として採用。",
  },
  {
    name: "歳刑神",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "十二支の刑表から算出",
    nextCheck: "刑の採用表に流派差がないか確認する",
    note: "契約・種まきなどに慎重さを求める年の注意神。",
  },
  {
    name: "歳殺神",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "三合局から見た殺方を複数24山で算出",
    nextCheck: "方位帯の幅と対象山を万年暦で照合する",
    note: "単一山ではなく方位帯として扱うため、表示密度に注意する。",
  },
  {
    name: "黄幡神",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "三合局の墓から算出",
    nextCheck: "三合墓の採用表を手元資料で確認する",
    note: "土動かし・武事に注意とされる方位神。",
  },
  {
    name: "豹尾神",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "黄幡神の反対方位で算出",
    nextCheck: "黄幡神との対応表を手元資料で確認する",
    note: "不浄を嫌うとされるため、清掃・浄化の行動翻訳に寄せる。",
  },
  {
    name: "金神",
    cycle: "year",
    category: "凶神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "年干から一部の複数24山を算出",
    nextCheck: "丁壬・戊癸、巡金神、遊行例外を整理する",
    note: "現状は年金神の一部採用。月・日金神とは分けて扱う。",
  },
  {
    name: "天道",
    cycle: "month",
    category: "吉神",
    adoptionStatus: "正式採用",
    displayLayer: "通常表示",
    implementationStatus: "rule_v0",
    currentScope: "月支から三合局を算出し、日支一致時のみ日盤に表示",
    nextCheck: "日運シートCX:DMと継続照合する",
    note: "月盤は月の天道候補、日盤は該当日だけ三角ラインを表示する。",
  },
  {
    name: "天一神",
    cycle: "day",
    category: "注意",
    adoptionStatus: "正式採用",
    displayLayer: "説明内表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "日干支番号の一部範囲のみ実装",
    nextCheck: "60日周期の完全巡行表を高島易断・万年暦で確認する",
    note: "天一天上を含め、候補除外ではなく検証用の注意情報として扱う。",
  },
  {
    name: "天一天上",
    cycle: "day",
    category: "吉神",
    adoptionStatus: "正式採用",
    displayLayer: "説明内表示",
    implementationStatus: "partial_rule_v0",
    currentScope: "日干支30〜45を天上期間として扱う",
    nextCheck: "始点・終点の表記と日付照合を確認する",
    note: "天一神が天上へ帰る期間。方位の障りが弱まりやすい期間として表示。",
  },
  {
    name: "月金神",
    cycle: "month",
    category: "凶神",
    adoptionStatus: "検証中",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "月干支ごとの巡金神表を確定する",
    note: "年金神と混ざると画面が重くなるため、検証後に説明内表示から始める。",
  },
  {
    name: "日金神",
    cycle: "day",
    category: "凶神",
    adoptionStatus: "検証中",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "日干支ごとの巡金神表を確定する",
    note: "日盤に入れるとノイズが強いため、行動別の影響度設計が必要。",
  },
  {
    name: "日遊神",
    cycle: "day",
    category: "注意",
    adoptionStatus: "検証中",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "日の十干別配置を資料で照合する",
    note: "動土・伐採を嫌う日神として、通常移動とは別扱いにする。",
  },
  {
    name: "大将軍遊行",
    cycle: "day",
    category: "吉凶",
    adoptionStatus: "検証中",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "遊行期間の年別・日別表を追加する",
    note: "大将軍の凶作用例外。導入すると精度が上がるが表の確認が必要。",
  },
  {
    name: "天徳・月徳",
    cycle: "month",
    category: "吉神",
    adoptionStatus: "検証中",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "採用流派と月支/月干の算出方式を決める",
    note: "吉神追加候補。天道と役割が近いため、表示名と作用の差を整理する。",
  },
  {
    name: "目的地24山判定",
    cycle: "multi",
    category: "注意",
    adoptionStatus: "将来対応",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "現在地から目的地の方位角を算出し24山へ落とす",
    note: "8方位判定では拾えない方位神の本命機能。地図連携後に実装する。",
  },
  {
    name: "行動別影響度",
    cycle: "multi",
    category: "注意",
    adoptionStatus: "将来対応",
    displayLayer: "未表示",
    implementationStatus: "planned",
    currentScope: "未実装",
    nextCheck: "移動・引越し・土動かし・参拝で方位神の重みを分ける",
    note: "方位神を不安表示にせず、行動の選び方へ翻訳するための中核設計。",
  },
] satisfies DirectionDeityAdoptionEntry[];

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
