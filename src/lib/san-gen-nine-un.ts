export type SanGenCycle = "上元" | "中元" | "下元";

export type SanGenNineUnDefinition = {
  period: number;
  cycle: SanGenCycle;
  starName: string;
  element: "木" | "火" | "土" | "金" | "水";
  trigram: string;
  startOffset: number;
  themeKeywords: string[];
  interpretation: string;
  llmPromptHint: string;
};

export type SanGenNineUnContext = {
  year: number;
  period: number;
  cycle: SanGenCycle;
  startYear: number;
  endYear: number;
  starName: string;
  element: SanGenNineUnDefinition["element"];
  trigram: string;
  themeKeywords: string[];
  interpretation: string;
  llmPromptHint: string;
  sourceStatus: "rule_v0";
  verificationStatus: "needs_feng_shui_reference_check";
  sourceNote: string;
};

const cycleLengthYears = 180;
const periodLengthYears = 20;
const knownNinthPeriodStartYear = 2024;

const definitions: Record<number, SanGenNineUnDefinition> = {
  1: {
    period: 1,
    cycle: "上元",
    starName: "一白水星",
    element: "水",
    trigram: "坎",
    startOffset: 0,
    themeKeywords: ["始まり", "流動", "知恵", "移動", "学び", "基盤形成"],
    interpretation:
      "水のように流れを作り、知識や移動によって次の時代の基盤を整える時期。",
    llmPromptHint:
      "個人の命式では、水性・知性・移動・学習との相性を見て、環境変化への適応力として解釈する。",
  },
  2: {
    period: 2,
    cycle: "上元",
    starName: "二黒土星",
    element: "土",
    trigram: "坤",
    startOffset: 20,
    themeKeywords: ["育成", "労働", "土地", "生活基盤", "協調", "蓄積"],
    interpretation:
      "地道な蓄積、生活基盤、育成の力が強まり、形になるまで支える時期。",
    llmPromptHint:
      "個人の命式では、土性・実務・家庭・継続力との関係を見て、長期的な土台作りとして解釈する。",
  },
  3: {
    period: 3,
    cycle: "上元",
    starName: "三碧木星",
    element: "木",
    trigram: "震",
    startOffset: 40,
    themeKeywords: ["発芽", "革新", "音", "若さ", "発信", "変化"],
    interpretation:
      "新しい動きが立ち上がり、発信・革新・若い力が社会に響きやすい時期。",
    llmPromptHint:
      "個人の命式では、木性・発信力・行動開始・変化耐性を見て、挑戦の仕方として解釈する。",
  },
  4: {
    period: 4,
    cycle: "中元",
    starName: "四緑木星",
    element: "木",
    trigram: "巽",
    startOffset: 60,
    themeKeywords: ["信用", "縁", "流通", "情報伝達", "結婚", "調整"],
    interpretation:
      "縁、信用、流通、情報の巡りが重要になり、つながりを整える力が増す時期。",
    llmPromptHint:
      "個人の命式では、木性・人間関係・信用形成・遠方との縁を見て、広げ方と整え方として解釈する。",
  },
  5: {
    period: 5,
    cycle: "中元",
    starName: "五黄土星",
    element: "土",
    trigram: "中宮",
    startOffset: 80,
    themeKeywords: ["中心", "再編", "破壊と再生", "権力", "混沌", "統合"],
    interpretation:
      "中心が揺らぎ、破壊と再生、再編成、統合の力が強く働く時期。",
    llmPromptHint:
      "個人の命式では、土性・中心性・責任・再編の負荷を見て、壊して作り直すテーマとして解釈する。",
  },
  6: {
    period: 6,
    cycle: "中元",
    starName: "六白金星",
    element: "金",
    trigram: "乾",
    startOffset: 100,
    themeKeywords: ["権威", "秩序", "責任", "国家", "資本", "完成"],
    interpretation:
      "権威、秩序、責任、資本の構造が強まり、完成度や統治力が問われる時期。",
    llmPromptHint:
      "個人の命式では、金性・責任・地位・管理能力を見て、社会的役割の引き受け方として解釈する。",
  },
  7: {
    period: 7,
    cycle: "下元",
    starName: "七赤金星",
    element: "金",
    trigram: "兌",
    startOffset: 120,
    themeKeywords: ["消費", "金融", "娯楽", "会話", "喜び", "不足"],
    interpretation:
      "金融、消費、娯楽、会話の力が強まり、楽しさと欠けの両面が現れやすい時期。",
    llmPromptHint:
      "個人の命式では、金性・表現・収益化・楽しみ方を見て、喜びと浪費のバランスとして解釈する。",
  },
  8: {
    period: 8,
    cycle: "下元",
    starName: "八白土星",
    element: "土",
    trigram: "艮",
    startOffset: 140,
    themeKeywords: ["変化", "不動産", "相続", "山", "蓄財", "境界"],
    interpretation:
      "変化と停止、不動産、相続、蓄財、境界線のテーマが強まる時期。",
    llmPromptHint:
      "個人の命式では、土性・資産・家系・変化の受け止め方を見て、止まる力と変える力として解釈する。",
  },
  9: {
    period: 9,
    cycle: "下元",
    starName: "九紫火星",
    element: "火",
    trigram: "離",
    startOffset: 160,
    themeKeywords: [
      "精神性",
      "AI・テクノロジー",
      "個人",
      "二極化",
      "美",
      "可視化",
      "直感",
      "情報",
    ],
    interpretation:
      "火と離の時代。見えない価値が可視化され、情報、AI、美意識、精神性、個の輝きが強まる時期。",
    llmPromptHint:
      "個人の命式では、火性・表現力・直感・美意識・情報発信との相性を見て、可視化される才能と過熱リスクを解釈する。",
  },
};

function getCycleStartYear(year: number) {
  const currentCycleStart = knownNinthPeriodStartYear - definitions[9].startOffset;
  const cycleOffset =
    Math.floor((year - currentCycleStart) / cycleLengthYears) *
    cycleLengthYears;

  return currentCycleStart + cycleOffset;
}

export function getSanGenNineUnContext(year: number): SanGenNineUnContext {
  const cycleStartYear = getCycleStartYear(year);
  const period =
    Math.floor((year - cycleStartYear) / periodLengthYears) + 1;
  const definition = definitions[period] ?? definitions[1];
  const startYear = cycleStartYear + definition.startOffset;

  return {
    year,
    period: definition.period,
    cycle: definition.cycle,
    startYear,
    endYear: startYear + periodLengthYears - 1,
    starName: definition.starName,
    element: definition.element,
    trigram: definition.trigram,
    themeKeywords: definition.themeKeywords,
    interpretation: definition.interpretation,
    llmPromptHint: definition.llmPromptHint,
    sourceStatus: "rule_v0",
    verificationStatus: "needs_feng_shui_reference_check",
    sourceNote:
      "三元九運を180年周期・20年単位で扱うv0。第7運=1984-2003、第8運=2004-2023、第9運=2024-2043を基準に逆算する。",
  };
}
