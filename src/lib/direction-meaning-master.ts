export type DirectionMeaningEntry = {
  bagua: string;
  starNumber: string;
  starName: string;
  direction: string;
  meaning: string;
  shortMeaning: string;
  qiTone: string;
  oppositeDirection: string;
};

export const directionMeaningMaster = [
  {
    bagua: "坎",
    starNumber: "1",
    starName: "一白水星",
    direction: "北",
    meaning: "交際運、部下運、子供・家族運",
    shortMeaning: "交際・部下・家族",
    qiTone: "男性的な気をつくる",
    oppositeDirection: "南",
  },
  {
    bagua: "坤",
    starNumber: "2",
    starName: "二黒土星",
    direction: "南西",
    meaning: "妻・母運、盟友運、勤め運、不動産運",
    shortMeaning: "家庭・勤め・不動産",
    qiTone: "女性的な気をつくる",
    oppositeDirection: "北東",
  },
  {
    bagua: "震",
    starNumber: "3",
    starName: "三碧木星",
    direction: "東",
    meaning: "才能運、発展運、新規事業運、発明運",
    shortMeaning: "発展・新規・才能",
    qiTone: "中康",
    oppositeDirection: "西",
  },
  {
    bagua: "巽",
    starNumber: "4",
    starName: "四緑木星",
    direction: "南東",
    meaning: "結婚運、交際運、旅行運、取引・信用運",
    shortMeaning: "信用・縁・旅行",
    qiTone: "女性的な気をつくる",
    oppositeDirection: "北西",
  },
  {
    bagua: "中宮",
    starNumber: "5",
    starName: "五黄土星",
    direction: "中央",
    meaning: "決算、中心、総括",
    shortMeaning: "中心・総括",
    qiTone: "中心の気",
    oppositeDirection: "-",
  },
  {
    bagua: "乾",
    starNumber: "6",
    starName: "六白金星",
    direction: "北西",
    meaning: "夫・父運、資金・援助運、権威、活動運",
    shortMeaning: "援助・権威・活動",
    qiTone: "男性的な気をつくる",
    oppositeDirection: "南東",
  },
  {
    bagua: "兌",
    starNumber: "7",
    starName: "七赤金星",
    direction: "西",
    meaning: "金運、結婚運、勝負運、遊興・飲食運",
    shortMeaning: "金運・喜び・飲食",
    qiTone: "中康",
    oppositeDirection: "東",
  },
  {
    bagua: "艮",
    starNumber: "8",
    starName: "八白土星",
    direction: "北東",
    meaning: "家庭運、兄弟運、親戚運、財運、相続運",
    shortMeaning: "家庭・相続・転機",
    qiTone: "男性的な気をつくる",
    oppositeDirection: "南西",
  },
  {
    bagua: "離",
    starNumber: "9",
    starName: "九紫火星",
    direction: "南",
    meaning: "地位・名誉運、裁判運、公官庁関連運",
    shortMeaning: "名誉・地位・評価",
    qiTone: "女性的な気をつくる",
    oppositeDirection: "北",
  },
] satisfies DirectionMeaningEntry[];

export function getDirectionMeaning(direction: string) {
  return directionMeaningMaster.find((entry) => entry.direction === direction) ?? null;
}

export function getDirectionHeaderMeaning(direction: string) {
  const entry = getDirectionMeaning(direction);

  if (!entry) {
    return null;
  }

  return {
    main: entry.direction,
    sub:
      entry.direction === "中央"
        ? entry.starName.replace("土星", "")
        : `${entry.bagua}・${entry.starName.replace("水星", "").replace("土星", "").replace("木星", "").replace("金星", "").replace("火星", "")}`,
    shortMeaning: entry.shortMeaning,
  };
}

export function getDirectionMeaningSummary() {
  return directionMeaningMaster
    .map(
      (entry) =>
        `${entry.direction}: ${entry.bagua}/${entry.starName} ${entry.meaning}`,
    )
    .join(" ｜ ");
}
