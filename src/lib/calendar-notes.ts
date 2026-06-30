export type CalendarNoteKind =
  | "junichoku"
  | "nijuhachishuku"
  | "selected_day";
type CalendarNoteIndexedKind = "junichoku" | "nijuhachishuku";

export type CalendarNoteCode =
  | "tensha_bi"
  | "tenten_satsu"
  | "jiten_satsu"
  | "shihai_nichi"
  | "ichiryumanbaibi"
  | "fujoju"
  | "sanrinbou"
  | "hassen"
  | "jippo_gure"
  | "tenichi_tenjo"
  | "roujitsu"
  | "kasshi"
  | "koushin"
  | "shinnyu"
  | "tsuchinoto_mi"
  | "otsuchi_start"
  | "daimyo_nichi"
  | "tenon_nichi"
  | "jikabi"
  | "taika_nichi";

export type CalendarNoteMasterEntry = {
  kind: CalendarNoteKind;
  name: string;
  reading: string;
  fortune: "good" | "bad" | "mixed" | "neutral";
  summary: string;
  recommended: string[];
  caution: string[];
  sourceStatus: "legacy_promoted_v0";
  verificationStatus: "pending_manual_almanac_check";
};

export type CalendarNoteDefinition = {
  code: CalendarNoteCode;
  name: string;
  category: "good_luck" | "bad_luck" | "mixed_luck";
  fortune: "good" | "bad" | "mixed" | "neutral";
  weight: number;
  displayText: string;
  aiExplanation: string;
  cautionText: string;
  sourceStatus: "legacy_promoted_v0";
  verificationStatus: "pending_manual_almanac_check";
};

export type LegacyCalendarNoteFlags = {
  sanrinbou: boolean;
  ichiryumanbaibi: boolean;
  fujoju: boolean;
  hassen: boolean;
  jippoGure: boolean;
  tenichiTenjo: boolean;
  roujitsu: boolean;
  kasshi: boolean;
  koushin: boolean;
  shinnyu: boolean;
  tsuchinotoMi: boolean;
  tenshaBi: boolean;
};

const commonStatus = {
  sourceStatus: "legacy_promoted_v0",
  verificationStatus: "pending_manual_almanac_check",
} as const;

const calendarNoteDefinitionEntries = [
  {
    code: "tensha_bi",
    name: "天赦日",
    category: "good_luck",
    fortune: "good",
    weight: 18,
    displayText: "天が万物の罪を赦すとされる大吉日。",
    aiExplanation:
      "新しいことを始める、願いを立てる、重要な決断をする日の候補として扱う。ただし他の凶日や方位条件と重なる場合は総合判断する。",
    cautionText: "万能日として断定せず、方位殺・不成就日・本人固有条件を合わせて見る。",
  },
  {
    code: "tenten_satsu",
    name: "天轉殺",
    category: "bad_luck",
    fortune: "bad",
    weight: -10,
    displayText: "天の気の転じ目として、強い注意を置く下段の凶日。",
    aiExplanation:
      "大きな開始、契約、婚礼、移転などは慎重に扱う。避けられない予定は準備、確認、祓い、控えめな行動へ寄せる。",
    cautionText: "恐怖を煽らず、手元万年暦由来の下段注意日として慎重に表現する。",
  },
  {
    code: "jiten_satsu",
    name: "地轉殺",
    category: "bad_luck",
    fortune: "bad",
    weight: -10,
    displayText: "地の気の転じ目として、土地・移動・着手に注意を置く下段の凶日。",
    aiExplanation:
      "土地、建築、引越し、移動、契約など、地に関わる行動では別候補日も見る。日常行動は過度に止めず、整える日に寄せる。",
    cautionText: "流派差を前提に、断定ではなく日取り確認の材料として扱う。",
  },
  {
    code: "shihai_nichi",
    name: "四癈日",
    category: "bad_luck",
    fortune: "bad",
    weight: -8,
    displayText: "四季の気が衰えるとされ、開始や大事には慎重さを添える下段の凶日。",
    aiExplanation:
      "新規開始や大きな決断よりも、休息、整理、見直しに寄せる日として扱う。季節ごとの日干支で判定する。",
    cautionText: "「癈」の字は資料表記に従う。現代表記ゆれがあるため検証メモを残す。",
  },
  {
    code: "ichiryumanbaibi",
    name: "一粒万倍日",
    category: "good_luck",
    fortune: "good",
    weight: 10,
    displayText: "一粒の種が万倍に実るとされる日。",
    aiExplanation:
      "開始、積立、学習、発信、申し込みなど、育てたい行動に向く。借金や悪習慣も膨らむ象意として注意する。",
    cautionText: "増やしたくない行動、借入、揉めごとの開始には注意する。",
  },
  {
    code: "tenichi_tenjo",
    name: "天一天上",
    category: "good_luck",
    fortune: "good",
    weight: 4,
    displayText: "天一神が天上に帰る期間とされ、方位の障りが軽くなると見る。",
    aiExplanation:
      "移動や掃除、環境整備の後押しとして扱う。単独で強い吉日とはせず、他の暦注や方位条件と合わせる。",
    cautionText: "日遊神の考え方など流派差があるため、細部は後続検証する。",
  },
  {
    code: "fujoju",
    name: "不成就日",
    category: "bad_luck",
    fortune: "bad",
    weight: -16,
    displayText: "物事が成就しにくいとされる注意日。",
    aiExplanation:
      "契約、開始、願掛け、婚礼など、形にしたい行動は慎重に扱う。日常行動を過度に止めるのではなく、大きな決定の注意材料にする。",
    cautionText: "不安を煽らず、別日の候補確認や整える行動へ誘導する。",
  },
  {
    code: "sanrinbou",
    name: "三隣亡",
    category: "bad_luck",
    fortune: "bad",
    weight: -12,
    displayText: "建築関係で忌まれることが多い注意日。",
    aiExplanation:
      "建築、棟上げ、引越し、住まいに関する大きな着手の注意材料として扱う。現代利用では過度に一般化しない。",
    cautionText: "特に建築・住居系の文脈で注意し、すべての行動を凶と断定しない。",
  },
  {
    code: "jippo_gure",
    name: "十方暮",
    category: "bad_luck",
    fortune: "bad",
    weight: -8,
    displayText: "天地の気が通じにくいとされる期間。",
    aiExplanation:
      "交渉、相談、遠出、勝負事では停滞や行き違いの注意材料として扱う。静かに整える行動は候補に残す。",
    cautionText: "期間性の暦注なので、前後関係と重なりを確認する。",
  },
  {
    code: "hassen",
    name: "八専",
    category: "mixed_luck",
    fortune: "mixed",
    weight: -6,
    displayText: "同気が重なり、偏りやすい期間とされる。",
    aiExplanation:
      "勢いが出る一方で、偏り、衝突、判断の硬直に注意する。集中作業や内省には使える可能性がある。",
    cautionText: "間日や流派差を後続で検証し、単純な凶日扱いに固定しない。",
  },
  {
    code: "roujitsu",
    name: "老日",
    category: "bad_luck",
    fortune: "bad",
    weight: -6,
    displayText: "物事が老いる、勢いが衰えるとされる注意日。",
    aiExplanation:
      "新規開始や勢いを必要とする行動には慎重さを添える。整理、見直し、休息などには使える日として扱う。",
    cautionText: "すべてを止める日ではなく、開始より整理向きの日として表現する。",
  },
  {
    code: "kasshi",
    name: "甲子",
    category: "good_luck",
    fortune: "good",
    weight: 8,
    displayText: "六十干支の始まりにあたり、物事の開始に向くとされる日。",
    aiExplanation:
      "新しい習慣、事業、学び、願掛けなど、始まりの象意を持つ行動の候補として扱う。",
    cautionText: "他の注意暦注や方位殺が重なる場合は、開始の規模を調整する。",
  },
  {
    code: "koushin",
    name: "庚申",
    category: "mixed_luck",
    fortune: "mixed",
    weight: -2,
    displayText: "庚申信仰と結びつく、身を慎む意味合いを持つ日。",
    aiExplanation:
      "節制、内省、健康管理、夜更かしや行動の乱れへの注意として扱う。強い吉凶よりも身を整える日として読む。",
    cautionText: "信仰・民俗色が強いため、断定的な凶日表現は避ける。",
  },
  {
    code: "shinnyu",
    name: "神吉日",
    category: "good_luck",
    fortune: "good",
    weight: 6,
    displayText: "神事、参拝、祈願に向くとされる吉日。",
    aiExplanation:
      "神社参拝、祈願、感謝、清め、方位取りの目的づけに使いやすい。日々吉方の世界観と相性が良い暦注。",
    cautionText: "神仏への敬意を前提にし、商業的に煽りすぎない表現にする。",
  },
  {
    code: "otsuchi_start",
    name: "大土始まり",
    category: "mixed_luck",
    fortune: "mixed",
    weight: -2,
    displayText: "大土の期間に入る節目。土に関する行動は慎重に見る。",
    aiExplanation:
      "土を動かす、建築、庭、基礎、引越しなどの文脈では注意材料として扱う。期間性の暦注なので、開始日だけでなく期間全体と間日を後続で整理する。",
    cautionText:
      "大土・小土の採用ルールは資料差を確認し、土用や三隣亡と混同しない。",
  },
  {
    code: "daimyo_nichi",
    name: "大明日",
    category: "good_luck",
    fortune: "good",
    weight: 6,
    displayText: "天地が明るく照らされるとされる吉日。",
    aiExplanation:
      "移動、建築、婚礼、開店など、広く行動を後押しする暦注として扱う。ただし他の凶日や方位条件と重なる場合は総合判断する。",
    cautionText: "吉意を保証表現にせず、行動を整える後押しとして表現する。",
  },
  {
    code: "tenon_nichi",
    name: "天恩日",
    category: "good_luck",
    fortune: "good",
    weight: 5,
    displayText: "天の恩恵を受けるとされる吉日。",
    aiExplanation:
      "祝い事、感謝、祈願、関係を整える行動の後押しとして扱う。期間性や重なりを確認し、他の凶日がある場合は総合判断する。",
    cautionText: "吉意を断定せず、感謝や整える行動に結びつけて表現する。",
  },
  {
    code: "jikabi",
    name: "地火日",
    category: "bad_luck",
    fortune: "bad",
    weight: -6,
    displayText: "地と火の障りを意識する注意日。",
    aiExplanation:
      "土木、建築、火気、土地に関する行動では慎重さを添える。日常を止めるのではなく、危険作業や大きな着手の確認材料にする。",
    cautionText: "恐怖を煽らず、火気・土地・作業安全の確認へ誘導する。",
  },
  {
    code: "taika_nichi",
    name: "大禍日",
    category: "bad_luck",
    fortune: "bad",
    weight: -10,
    displayText: "大きな禍を避ける意識を持つ注意日。",
    aiExplanation:
      "婚礼、契約、新規開始、重大な決断では別候補日も見る。避けられない予定は準備・確認・祓いの行動で整える。",
    cautionText: "断定的に不幸を予言せず、慎重な日取り確認として扱う。",
  },
  {
    code: "tsuchinoto_mi",
    name: "己巳",
    category: "good_luck",
    fortune: "good",
    weight: 8,
    displayText: "弁財天や財運の象意と結びつけて語られることが多い日。",
    aiExplanation:
      "金運、芸事、学び、商売、弁財天参拝などの候補として扱う。財を整える日として表現する。",
    cautionText: "金運上昇を保証する表現は避け、整える行動や参拝のきっかけとして扱う。",
  },
] satisfies Omit<
  CalendarNoteDefinition,
  "sourceStatus" | "verificationStatus"
>[];

export const calendarNoteDefinitions = Object.fromEntries(
  calendarNoteDefinitionEntries.map((entry) => [
    entry.code,
    { ...entry, ...commonStatus },
  ]),
) as Record<CalendarNoteCode, CalendarNoteDefinition>;

const legacyFlagToDefinitionCode = [
  ["tenshaBi", "tensha_bi"],
  ["ichiryumanbaibi", "ichiryumanbaibi"],
  ["tenichiTenjo", "tenichi_tenjo"],
  ["fujoju", "fujoju"],
  ["sanrinbou", "sanrinbou"],
  ["jippoGure", "jippo_gure"],
  ["hassen", "hassen"],
  ["roujitsu", "roujitsu"],
  ["kasshi", "kasshi"],
  ["koushin", "koushin"],
  ["shinnyu", "shinnyu"],
  ["tsuchinotoMi", "tsuchinoto_mi"],
] as const satisfies ReadonlyArray<
  readonly [keyof LegacyCalendarNoteFlags, CalendarNoteCode]
>;

const junichokuEntries = [
  {
    name: "建",
    reading: "たつ",
    fortune: "good",
    summary: "物事を始める力が立ち上がる日。",
    recommended: ["開始", "開店", "神仏参拝", "建築の着手"],
    caution: ["土を動かす作業", "蔵開き"],
  },
  {
    name: "除",
    reading: "のぞく",
    fortune: "mixed",
    summary: "不要なものを取り除き、整える日。",
    recommended: ["掃除", "治療開始", "厄除け", "片付け"],
    caution: ["婚礼", "大きな契約"],
  },
  {
    name: "満",
    reading: "みつ",
    fortune: "good",
    summary: "満ちる気配を受け取りやすい日。",
    recommended: ["祝い事", "移転", "開店", "種まき"],
    caution: ["薬の服用開始"],
  },
  {
    name: "平",
    reading: "たいら",
    fortune: "good",
    summary: "物事が平らかに整いやすい日。",
    recommended: ["相談", "婚礼", "旅行", "地固め"],
    caution: ["穴掘り", "争いごと"],
  },
  {
    name: "定",
    reading: "さだん",
    fortune: "good",
    summary: "決める、定める、落ち着かせる日。",
    recommended: ["契約", "結納", "移転", "方針決定"],
    caution: ["訴訟", "旅行の出発"],
  },
  {
    name: "執",
    reading: "とる",
    fortune: "mixed",
    summary: "執り行う、取りまとめる力が出る日。",
    recommended: ["祭祀", "祝い事", "収穫", "集金"],
    caution: ["金銭の大きな支出"],
  },
  {
    name: "破",
    reading: "やぶる",
    fortune: "bad",
    summary: "破る、崩す、区切る作用が強い日。",
    recommended: ["解体", "破棄", "断捨離"],
    caution: ["契約", "婚礼", "新規開始"],
  },
  {
    name: "危",
    reading: "あやぶ",
    fortune: "bad",
    summary: "危うさを点検し、慎重に進める日。",
    recommended: ["安全確認", "静養", "リスク点検"],
    caution: ["旅行", "登山", "大きな挑戦"],
  },
  {
    name: "成",
    reading: "なる",
    fortune: "good",
    summary: "成就、完成、実りにつながりやすい日。",
    recommended: ["開業", "契約", "婚礼", "願掛け"],
    caution: ["訴訟", "争いごと"],
  },
  {
    name: "納",
    reading: "おさん",
    fortune: "mixed",
    summary: "収める、納める、締める動きに向く日。",
    recommended: ["納品", "収納", "支払い", "整理"],
    caution: ["婚礼", "見合い"],
  },
  {
    name: "開",
    reading: "ひらく",
    fortune: "good",
    summary: "開く、広げる、通す作用が出る日。",
    recommended: ["開店", "移転", "旅行", "相談"],
    caution: ["葬送", "不浄事"],
  },
  {
    name: "閉",
    reading: "とづ",
    fortune: "bad",
    summary: "閉じる、固める、内側を守る日。",
    recommended: ["金銭管理", "墓参", "静養", "締め作業"],
    caution: ["開店", "婚礼", "新規開始"],
  },
] satisfies Omit<CalendarNoteMasterEntry, keyof typeof commonStatus | "kind">[];

const nijuhachishukuBaseEntries = [
  ["角", "かく", "good", "始まりと伸長の宿。祝い事や新規事に向く。"],
  ["亢", "こう", "bad", "争いや強硬さが出やすい宿。大事は慎重にする。"],
  ["氐", "てい", "good", "根を張る宿。婚礼や移転など生活基盤に向く。"],
  ["房", "ぼう", "good", "喜びが広がる宿。祝い事、契約、移転に向く。"],
  ["心", "しん", "bad", "心労や乱れに注意する宿。静かに整える。"],
  ["尾", "び", "good", "完成と継承の宿。婚礼や建築に向く。"],
  ["箕", "き", "mixed", "動きが強い宿。旅行や普請は注意を添える。"],
  ["斗", "と", "good", "蓄えと安定の宿。土台づくりに向く。"],
  ["牛", "ぎゅう", "good", "吉意が強い宿。祝い事や開業に向く。"],
  ["女", "じょ", "bad", "控えめに過ごす宿。婚礼や新規事は避けたい。"],
  ["虚", "きょ", "bad", "虚しさや不安定さを見やすい宿。大事は控える。"],
  ["危", "き", "bad", "危険の点検が必要な宿。旅行や高所は慎重に。"],
  ["室", "しつ", "good", "家や器を整える宿。建築、婚礼、祈願に向く。"],
  ["壁", "へき", "good", "守りと整備の宿。修理や学びに向く。"],
  ["奎", "けい", "good", "文章と品位の宿。学び、届け出、祝い事に向く。"],
  ["婁", "ろう", "good", "人を集め整える宿。契約、相談、旅立ちに向く。"],
  ["胃", "い", "good", "蓄える宿。開店、求財、建築に向く。"],
  ["昴", "ぼう", "mixed", "華やかさの宿。祝い事は良いが散財に注意。"],
  ["畢", "ひつ", "good", "完成と保持の宿。祭祀、建築、契約に向く。"],
  ["觜", "し", "bad", "口論や誤解に注意する宿。交渉は慎重に。"],
  ["参", "しん", "good", "勢いと行動の宿。旅行、商い、開拓に向く。"],
  ["井", "せい", "good", "公共性と整備の宿。神仏参拝、種まきに向く。"],
  ["鬼", "き", "good", "吉意の強い宿。祝い事、祈願、開業に向く。"],
  ["柳", "りゅう", "bad", "迷いや衰えに注意する宿。大事は控える。"],
  ["星", "せい", "mixed", "華やかさと揺れの宿。芸事は良く、大事は慎重に。"],
  ["張", "ちょう", "good", "広げる宿。祝い事、開店、交渉に向く。"],
  ["翼", "よく", "good", "整えて飛ぶ宿。旅行、学び、準備に向く。"],
  ["軫", "しん", "mixed", "整備と区切りの宿。修理や整理に向く。"],
] as const satisfies ReadonlyArray<
  readonly [
    string,
    string,
    CalendarNoteMasterEntry["fortune"],
    string,
  ]
>;

const nijuhachishukuEntries = nijuhachishukuBaseEntries.map(
  ([name, reading, fortune, summary]) => ({
  name,
  reading,
  fortune,
  summary,
  recommended: [],
  caution: [],
}),
) satisfies Omit<CalendarNoteMasterEntry, keyof typeof commonStatus | "kind">[];

export const calendarNoteMaster = {
  junichoku: Object.fromEntries(
    junichokuEntries.map((entry) => [
      entry.name,
      { kind: "junichoku", ...entry, ...commonStatus },
    ]),
  ) as Record<string, CalendarNoteMasterEntry>,
  nijuhachishuku: Object.fromEntries(
    nijuhachishukuEntries.map((entry) => [
      entry.name,
      { kind: "nijuhachishuku", ...entry, ...commonStatus },
    ]),
  ) as Record<string, CalendarNoteMasterEntry>,
};

function normalizeCalendarNoteName(kind: CalendarNoteIndexedKind, name: string) {
  const trimmed = name.trim();

  if (kind === "nijuhachishuku" && trimmed === "氏") {
    return "氐";
  }

  return trimmed;
}

export function getCalendarNoteEntry(
  kind: CalendarNoteIndexedKind,
  name: string,
) {
  if (!name) {
    return null;
  }

  return calendarNoteMaster[kind][normalizeCalendarNoteName(kind, name)] ?? null;
}

export function getActiveCalendarNoteDefinitions(
  flags: LegacyCalendarNoteFlags,
) {
  return legacyFlagToDefinitionCode
    .filter(([flag]) => flags[flag])
    .map(([, code]) => calendarNoteDefinitions[code]);
}

export function getCalendarNoteMasterSummary() {
  return {
    sourceStatus: commonStatus.sourceStatus,
    verificationStatus: commonStatus.verificationStatus,
    junichokuCount: Object.keys(calendarNoteMaster.junichoku).length,
    nijuhachishukuCount: Object.keys(calendarNoteMaster.nijuhachishuku).length,
    selectedDayDefinitionCount: Object.keys(calendarNoteDefinitions).length,
    note:
      "十二直・二十八宿・二十七宿は正式採用。主要選日は定義マスターとして外部正本との照合を継続する。",
  };
}
