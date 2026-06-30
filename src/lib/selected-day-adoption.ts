import {
  calendarNoteDefinitions,
  type CalendarNoteCode,
  type CalendarNoteDefinition,
} from "@/lib/calendar-notes";

export type SelectedDayAdoptionCategory =
  | "great_luck"
  | "shrine_prayer"
  | "money_business"
  | "land_building"
  | "strong_caution"
  | "period_caution"
  | "folk_custom";

export type SelectedDayAdoptionRow = {
  code: string;
  name: string;
  category: SelectedDayAdoptionCategory;
  categoryLabel: string;
  status: "implemented" | "candidate";
  statusLabel: string;
  fortune: CalendarNoteDefinition["fortune"] | "unknown";
  weight: number | null;
  source: string;
  nextAction: string;
  note: string;
};

const categoryLabels: Record<SelectedDayAdoptionCategory, string> = {
  great_luck: "大吉日",
  shrine_prayer: "神事・参拝",
  money_business: "金運・商売",
  land_building: "建築・土地注意",
  strong_caution: "強い注意日",
  period_caution: "期間性注意",
  folk_custom: "民俗・行事",
};

const implementedCategoryByCode: Record<CalendarNoteCode, SelectedDayAdoptionCategory> = {
  tensha_bi: "great_luck",
  tenten_satsu: "strong_caution",
  jiten_satsu: "strong_caution",
  shihai_nichi: "strong_caution",
  ichiryumanbaibi: "great_luck",
  tenichi_tenjo: "period_caution",
  fujoju: "strong_caution",
  sanrinbou: "land_building",
  jippo_gure: "period_caution",
  hassen: "period_caution",
  roujitsu: "strong_caution",
  kasshi: "great_luck",
  koushin: "folk_custom",
  shinnyu: "shrine_prayer",
  otsuchi_start: "land_building",
  daimyo_nichi: "shrine_prayer",
  tenon_nichi: "shrine_prayer",
  jikabi: "land_building",
  taika_nichi: "strong_caution",
  tsuchinoto_mi: "money_business",
};

const unimplementedCandidates = [
  {
    code: "jushi_nichi",
    name: "受死日",
    category: "strong_caution",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "日干支・節月など算出条件を確認して定義化する",
    note: "強い凶日として扱われることが多い。大事・開始・契約の注意候補。",
  },
  {
    code: "jisshi_nichi",
    name: "十死日",
    category: "strong_caution",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "受死日と並べて発生ルールを確認する",
    note: "受死日と同系統の強い注意日候補。",
  },
  {
    code: "kiko_nichi",
    name: "帰忌日",
    category: "strong_caution",
    source: "こよみのページ / 暦注.com",
    nextAction: "採用範囲と意味文を確認する",
    note: "帰宅・移動・葬送文脈などの注意日として候補化。",
  },
  {
    code: "chimi_nichi",
    name: "血忌日",
    category: "strong_caution",
    source: "こよみのページ / 暦注.com",
    nextAction: "医療・刃物・血に関する表現ガイドラインを作る",
    note: "現代表現では恐怖を煽らず、安全確認の注意として扱う。",
  },
  {
    code: "fukunichi",
    name: "復日",
    category: "period_caution",
    source: "こよみのページ / スプシ legacySummary",
    nextAction: "既存summary出現分をコード化する",
    note: "同じことが繰り返される象意。吉凶は行動内容で分ける。",
  },
  {
    code: "ju_nichi",
    name: "重日",
    category: "period_caution",
    source: "こよみのページ / 暦注.com",
    nextAction: "復日と並べて意味・重みを整理する",
    note: "重なる象意。祝い事には吉、凶事には注意など文脈依存で扱う候補。",
  },
  {
    code: "bokuso_nichi",
    name: "母倉日",
    category: "shrine_prayer",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "吉日系として発生ルールを定義する",
    note: "天が人を慈しむ吉日。婚礼・祝い・育てる行動と相性が良い。",
  },
  {
    code: "gettoku_nichi",
    name: "月徳日",
    category: "shrine_prayer",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "月徳方・吉神方位との関係も含めて整理する",
    note: "月の徳がある日。神事・感謝・整える行動の候補。",
  },
  {
    code: "tenka_nichi",
    name: "天火日",
    category: "land_building",
    source: "こよみのページ / 暦注.com",
    nextAction: "地火日と対で採用ルールを確認する",
    note: "火に関する注意日候補。建築・火気・作業安全の文脈で扱う。",
  },
  {
    code: "roujaku_nichi",
    name: "狼藉日",
    category: "strong_caution",
    source: "こよみのページ / 暦注.com",
    nextAction: "大禍日・滅門日とのセットで下段系として整理する",
    note: "乱れやすさを注意する候補。強い断定は避ける。",
  },
  {
    code: "metsumon_nichi",
    name: "滅門日",
    category: "strong_caution",
    source: "こよみのページ / スプシ legacySummary",
    nextAction: "既存summary出現分をコード化する",
    note: "下段系の強い注意日候補。大禍日などと合わせて整理する。",
  },
  {
    code: "otsuchi",
    name: "大土",
    category: "land_building",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "大土始まりだけでなく期間全体をコード化する",
    note: "土を動かす行為、建築、基礎、庭、引越しの注意候補。",
  },
  {
    code: "kotsuchi",
    name: "小土",
    category: "land_building",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "大土と同じ期間系マスターへ入れる",
    note: "大土と合わせて土地・土木行為の注意材料にする。",
  },
  {
    code: "sanpuku",
    name: "三伏",
    category: "period_caution",
    source: "こよみのページ / 暦注.com / 万年暦",
    nextAction: "初伏・中伏・末伏の扱いを決める",
    note: "暑気・養生・無理を避ける文脈に向く季節性の候補。",
  },
  {
    code: "tsuchi",
    name: "犯土",
    category: "land_building",
    source: "こよみのページ / 暦注.com",
    nextAction: "大犯土・小犯土との親子関係を整理する",
    note: "土を犯す注意。土用・大土・小土との違いを明確にする。",
  },
  {
    code: "ootsuchi",
    name: "大犯土",
    category: "land_building",
    source: "こよみのページ / 暦注.com",
    nextAction: "期間性の発生ルールを確認する",
    note: "土地・建築系の注意候補。",
  },
  {
    code: "kotsuchi_satsu",
    name: "小犯土",
    category: "land_building",
    source: "こよみのページ / 暦注.com",
    nextAction: "大犯土と合わせて発生ルールを確認する",
    note: "土地・建築系の注意候補。",
  },
  {
    code: "mi_no_hi",
    name: "巳の日",
    category: "money_business",
    source: "日干支 / 暦注.com / 万年暦",
    nextAction: "己巳との重複表示ルールを作る",
    note: "弁財天・財運文脈で使いやすい。己巳は上位表示にする。",
  },
  {
    code: "tora_no_hi",
    name: "寅の日",
    category: "money_business",
    source: "日干支 / 暦注.com / 万年暦",
    nextAction: "金運・旅行文脈の意味文を作る",
    note: "出て戻る象意。金運・旅・財布などの文脈で候補。",
  },
  {
    code: "kishuku_nichi",
    name: "鬼宿日",
    category: "shrine_prayer",
    source: "二十八宿 / 暦注.com / 万年暦",
    nextAction: "二十八宿の鬼と選日としての鬼宿日の表示を分ける",
    note: "婚礼以外は大吉とされることが多い。注釈が重要。",
  },
  {
    code: "oumou_nichi",
    name: "往亡日",
    category: "strong_caution",
    source: "こよみのページ / 暦注.com",
    nextAction: "発生ルールと適用行動を確認する",
    note: "遠行・移転・開始などの注意日候補。",
  },
] as const satisfies ReadonlyArray<{
  code: string;
  name: string;
  category: SelectedDayAdoptionCategory;
  source: string;
  nextAction: string;
  note: string;
}>;

function toImplementedRow(
  definition: CalendarNoteDefinition,
): SelectedDayAdoptionRow {
  const category = implementedCategoryByCode[definition.code];

  return {
    code: definition.code,
    name: definition.name,
    category,
    categoryLabel: categoryLabels[category],
    status: "implemented",
    statusLabel: "正式リスト",
    fortune: definition.fortune,
    weight: definition.weight,
    source: "calendar-note-definitions",
    nextAction: "発生日・外部正本との差分が出た場合だけ個別調整する",
    note: definition.displayText,
  };
}

function toCandidateRow(
  candidate: (typeof unimplementedCandidates)[number],
): SelectedDayAdoptionRow {
  return {
    ...candidate,
    categoryLabel: categoryLabels[candidate.category],
    status: "candidate",
    statusLabel: "未実装候補",
    fortune: "unknown",
    weight: null,
  };
}

export function getSelectedDayImplementedRows() {
  return Object.values(calendarNoteDefinitions).map(toImplementedRow);
}

export function getSelectedDayCandidateRows() {
  return unimplementedCandidates.map(toCandidateRow);
}

export function getSelectedDayAdoptionRows() {
  return [
    ...getSelectedDayImplementedRows(),
    ...getSelectedDayCandidateRows(),
  ];
}

export function getSelectedDayAdoptionSummary() {
  const implementedRows = getSelectedDayImplementedRows();
  const candidateRows = getSelectedDayCandidateRows();

  return {
    total: implementedRows.length + candidateRows.length,
    implemented: implementedRows.length,
    candidates: candidateRows.length,
    categories: Object.values(categoryLabels).length,
  };
}
