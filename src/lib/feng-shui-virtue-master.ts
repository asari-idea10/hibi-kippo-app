export type FengShuiStarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type FengShuiVirtueEntry = {
  number: FengShuiStarNumber;
  starName: string;
  bagua: string;
  nature: string;
  direction: string;
  element: string;
  symbolicKeywords: string[];
  virtueTags: string[];
  actionTags: string[];
  microCopy: string;
};

export type TendoTrineVirtueEntry = {
  branch: string;
  monthDirection: string;
  dayBranches: string[];
  dayDirections: string[];
  name: string;
  virtue: string;
  virtueTags: string[];
};

export type ActionScaleVirtueEntry = {
  id: "near" | "day_trip" | "overnight" | "base" | "hour_precision";
  virtueTags: string[];
  starNumbers: FengShuiStarNumber[];
  trineBoosts: string[];
  note: string;
};

export const fengShuiVirtueMaster = [
  {
    number: 1,
    starName: "一白水星",
    bagua: "坎",
    nature: "水",
    direction: "北",
    element: "水",
    symbolicKeywords: ["始め", "交わり", "忍耐", "思考", "秘密", "健康", "部下"],
    virtueTags: ["浄化", "健康", "相談", "人脈", "内省"],
    actionTags: ["温泉", "水回り掃除", "静養", "相談", "計画の下準備"],
    microCopy: "水の象意。心身を整え、見えない関係や準備を深める方徳。",
  },
  {
    number: 2,
    starName: "二黒土星",
    bagua: "坤",
    nature: "地",
    direction: "南西",
    element: "土",
    symbolicKeywords: ["勤勉", "従順", "大衆", "土地", "母親", "育成", "蓄積"],
    virtueTags: ["家庭", "健康", "生活安定", "蓄財", "育成"],
    actionTags: ["台所を整える", "作り置き", "家族の用事", "地道な準備", "胃腸を休める"],
    microCopy: "大地の象意。暮らしの基盤、家庭、日々の積み重ねを整える方徳。",
  },
  {
    number: 3,
    starName: "三碧木星",
    bagua: "震",
    nature: "雷",
    direction: "東",
    element: "木",
    symbolicKeywords: ["動く", "繁栄", "明朗", "音", "通信", "発展", "新規"],
    virtueTags: ["発展", "起業", "発信", "若さ", "学び始め"],
    actionTags: ["朝活", "発信", "新規着手", "音楽", "アイデア出し"],
    microCopy: "雷と芽吹きの象意。新しく始め、声に出し、流れを起こす方徳。",
  },
  {
    number: 4,
    starName: "四緑木星",
    bagua: "巽",
    nature: "風",
    direction: "南東",
    element: "木",
    symbolicKeywords: ["出入", "遠方", "風", "信用", "取引", "縁", "旅行"],
    virtueTags: ["良縁", "信用", "旅行", "商談", "紹介"],
    actionTags: ["連絡", "紹介依頼", "商談", "旅程づくり", "香りを整える"],
    microCopy: "風の象意。縁を運び、信用と連絡を整えて広げる方徳。",
  },
  {
    number: 5,
    starName: "五黄土星",
    bagua: "中宮",
    nature: "土",
    direction: "中央",
    element: "土",
    symbolicKeywords: ["中心", "破壊", "再起", "核", "統制", "廃棄", "土用"],
    virtueTags: ["再生", "厄除け", "断捨離", "問題整理", "リセット"],
    actionTags: ["不用品処分", "掃除", "問題の棚卸し", "仕切り直し", "休む"],
    microCopy: "中心の象意。強い変化を、再生と整理へ向けるための方徳。",
  },
  {
    number: 6,
    starName: "六白金星",
    bagua: "乾",
    nature: "天",
    direction: "北西",
    element: "金",
    symbolicKeywords: ["目上", "気品", "父", "権威", "勝負", "信仰", "高級"],
    virtueTags: ["事業運", "出世", "勝負", "神仏加護", "資金"],
    actionTags: ["神社参拝", "目上への相談", "目標設定", "寄付", "重要計画"],
    microCopy: "天の象意。格式、援助、目標達成、神仏への感謝を整える方徳。",
  },
  {
    number: 7,
    starName: "七赤金星",
    bagua: "兌",
    nature: "澤",
    direction: "西",
    element: "金",
    symbolicKeywords: ["喜び", "弁舌", "金銭", "恋愛", "飲食", "結婚", "収穫"],
    virtueTags: ["金運", "恋愛", "会食", "収穫", "喜び"],
    actionTags: ["会食", "買い物", "感謝を伝える", "趣味", "財布を整える"],
    microCopy: "沢と収穫の象意。喜び、金運、会話、実りを受け取る方徳。",
  },
  {
    number: 8,
    starName: "八白土星",
    bagua: "艮",
    nature: "山",
    direction: "北東",
    element: "土",
    symbolicKeywords: ["変化", "貯まる", "止まる", "相続", "不動産", "改革", "山"],
    virtueTags: ["転機", "不動産", "貯蓄", "家族", "再出発"],
    actionTags: ["模様替え", "貯金計画", "家族相談", "山や高台", "区切りをつける"],
    microCopy: "山の象意。節目をつくり、蓄積と再出発を整える方徳。",
  },
  {
    number: 9,
    starName: "九紫火星",
    bagua: "離",
    nature: "火",
    direction: "南",
    element: "火",
    symbolicKeywords: ["文書", "火", "学者", "光", "精神", "発覚", "名誉"],
    virtueTags: ["名誉", "美容", "学業", "発表", "手放し"],
    actionTags: ["美容院", "発表", "試験準備", "書類整理", "不用品処分"],
    microCopy: "火と光の象意。見える化、評価、美しさ、手放しを整える方徳。",
  },
] satisfies FengShuiVirtueEntry[];

export const tendoTrineVirtueMaster = [
  {
    branch: "子",
    monthDirection: "北",
    dayBranches: ["申", "子", "辰"],
    dayDirections: ["南西", "北", "南東"],
    name: "三合水局",
    virtue: "人脈",
    virtueTags: ["人脈", "相談", "交流"],
  },
  {
    branch: "丑",
    monthDirection: "北東",
    dayBranches: ["巳", "酉", "丑"],
    dayDirections: ["南東", "西", "北東"],
    name: "三合金局",
    virtue: "金運",
    virtueTags: ["金運", "収穫", "資金"],
  },
  {
    branch: "寅",
    monthDirection: "北東",
    dayBranches: ["寅", "午", "戌"],
    dayDirections: ["北東", "南", "北西"],
    name: "三合火局",
    virtue: "名誉・名声",
    virtueTags: ["名誉", "発表", "評価"],
  },
  {
    branch: "卯",
    monthDirection: "東",
    dayBranches: ["亥", "卯", "未"],
    dayDirections: ["北西", "東", "南西"],
    name: "三合木局",
    virtue: "才能・発展",
    virtueTags: ["才能", "発展", "成長"],
  },
  {
    branch: "辰",
    monthDirection: "南東",
    dayBranches: ["申", "子", "辰"],
    dayDirections: ["南西", "北", "南東"],
    name: "三合水局",
    virtue: "人脈",
    virtueTags: ["人脈", "相談", "交流"],
  },
  {
    branch: "巳",
    monthDirection: "南東",
    dayBranches: ["巳", "酉", "丑"],
    dayDirections: ["南東", "西", "北東"],
    name: "三合金局",
    virtue: "金運",
    virtueTags: ["金運", "収穫", "資金"],
  },
  {
    branch: "午",
    monthDirection: "南",
    dayBranches: ["寅", "午", "戌"],
    dayDirections: ["北東", "南", "北西"],
    name: "三合火局",
    virtue: "名誉・名声",
    virtueTags: ["名誉", "発表", "評価"],
  },
  {
    branch: "未",
    monthDirection: "南西",
    dayBranches: ["亥", "卯", "未"],
    dayDirections: ["北西", "東", "南西"],
    name: "三合木局",
    virtue: "才能・発展",
    virtueTags: ["才能", "発展", "成長"],
  },
  {
    branch: "申",
    monthDirection: "南西",
    dayBranches: ["申", "子", "辰"],
    dayDirections: ["南西", "北", "南東"],
    name: "三合水局",
    virtue: "人脈",
    virtueTags: ["人脈", "相談", "交流"],
  },
  {
    branch: "酉",
    monthDirection: "西",
    dayBranches: ["巳", "酉", "丑"],
    dayDirections: ["南東", "西", "北東"],
    name: "三合金局",
    virtue: "金運",
    virtueTags: ["金運", "収穫", "資金"],
  },
  {
    branch: "戌",
    monthDirection: "北西",
    dayBranches: ["寅", "午", "戌"],
    dayDirections: ["北東", "南", "北西"],
    name: "三合火局",
    virtue: "名誉・名声",
    virtueTags: ["名誉", "発表", "評価"],
  },
  {
    branch: "亥",
    monthDirection: "北西",
    dayBranches: ["亥", "卯", "未"],
    dayDirections: ["北西", "東", "南西"],
    name: "三合木局",
    virtue: "才能・発展",
    virtueTags: ["才能", "発展", "成長"],
  },
] satisfies TendoTrineVirtueEntry[];

export const actionScaleVirtueMaster = [
  {
    id: "near",
    virtueTags: ["浄化", "健康", "生活安定", "小さな発展"],
    starNumbers: [1, 2, 3, 9],
    trineBoosts: ["三合水局", "三合木局"],
    note: "日常の整えは、心身・生活・小さな始動の象意を優先する。",
  },
  {
    id: "day_trip",
    virtueTags: ["旅行", "良縁", "金運", "美容", "会食"],
    starNumbers: [1, 4, 7, 9],
    trineBoosts: ["三合水局", "三合金局", "三合木局"],
    note: "半日から一日の外出は、縁・楽しみ・リフレッシュの象意を重ねる。",
  },
  {
    id: "overnight",
    virtueTags: ["運気転換", "温泉", "神仏加護", "再出発", "蓄積"],
    starNumbers: [1, 6, 8, 4],
    trineBoosts: ["三合水局", "三合木局", "三合火局"],
    note: "宿泊は遠方で気を定着させるため、月盤・日盤に方徳の意味を足す。",
  },
  {
    id: "base",
    virtueTags: ["事業運", "不動産", "家庭", "信用", "名誉"],
    starNumbers: [2, 4, 6, 8, 9],
    trineBoosts: ["三合火局", "三合木局", "三合金局"],
    note: "大きな予定は、年月の盤と土台・信用・格式の象意を重く見る。",
  },
  {
    id: "hour_precision",
    virtueTags: ["勝負", "神仏加護", "発表", "契約", "願掛け"],
    starNumbers: [3, 4, 6, 9],
    trineBoosts: ["三合火局", "三合金局"],
    note: "特別時刻は、四盤一致に勝負・祈願・公開の象意を重ねる。",
  },
] satisfies ActionScaleVirtueEntry[];

export function getFengShuiVirtueByStar(number: number | string) {
  const normalized = Number(number);

  return (
    fengShuiVirtueMaster.find((entry) => entry.number === normalized) ?? null
  );
}

export function getActionScaleVirtue(id: ActionScaleVirtueEntry["id"]) {
  return actionScaleVirtueMaster.find((entry) => entry.id === id) ?? null;
}

export function getTendoTrineByBranch(branch: string) {
  const baseBranch = branch.trim();

  return (
    tendoTrineVirtueMaster.find((entry) =>
      entry.dayBranches.includes(baseBranch),
    ) ?? null
  );
}

export function getTendoTrineByMonthBranch(branch: string) {
  const baseBranch = branch.trim();

  return tendoTrineVirtueMaster.find((entry) => entry.branch === baseBranch) ?? null;
}
