export type BirthGender = "male" | "female";

export type KeishaPalace =
  | "坎"
  | "坤"
  | "震"
  | "巽"
  | "乾"
  | "兌"
  | "艮"
  | "離";

export type KeishaProfile = {
  palace: KeishaPalace;
  label: string;
  star: string;
  good: string;
  caution: string;
};

const keishaByHonmeiGetsumei: Record<string, KeishaPalace | { male: KeishaPalace; female: KeishaPalace }> = {
  "1-1": "離",
  "1-2": "巽",
  "1-3": "震",
  "1-4": "坤",
  "1-5": "坎",
  "1-6": "離",
  "1-7": "艮",
  "1-8": "兌",
  "1-9": "乾",
  "2-1": "乾",
  "2-2": "乾",
  "2-3": "巽",
  "2-4": "震",
  "2-5": "坤",
  "2-6": "坎",
  "2-7": "離",
  "2-8": "艮",
  "2-9": "兌",
  "3-1": "兌",
  "3-2": "乾",
  "3-3": "巽",
  "3-4": "巽",
  "3-5": "震",
  "3-6": "坤",
  "3-7": "坎",
  "3-8": "離",
  "3-9": "艮",
  "4-1": "艮",
  "4-2": "兌",
  "4-3": "乾",
  "4-4": "震",
  "4-5": "巽",
  "4-6": "震",
  "4-7": "坤",
  "4-8": "坎",
  "4-9": "離",
  "5-1": "離",
  "5-2": "艮",
  "5-3": "兌",
  "5-4": "乾",
  "5-5": { male: "兌", female: "乾" },
  "5-6": "巽",
  "5-7": "震",
  "5-8": "坤",
  "5-9": "坎",
  "6-1": "坎",
  "6-2": "離",
  "6-3": "艮",
  "6-4": "兌",
  "6-5": "乾",
  "6-6": "坤",
  "6-7": "巽",
  "6-8": "震",
  "6-9": "坤",
  "7-1": "坤",
  "7-2": "坎",
  "7-3": "離",
  "7-4": "艮",
  "7-5": "兌",
  "7-6": "乾",
  "7-7": "艮",
  "7-8": "巽",
  "7-9": "震",
  "8-1": "震",
  "8-2": "坤",
  "8-3": "坎",
  "8-4": "離",
  "8-5": "艮",
  "8-6": "兌",
  "8-7": "乾",
  "8-8": "兌",
  "8-9": "巽",
  "9-1": "巽",
  "9-2": "震",
  "9-3": "坤",
  "9-4": "坎",
  "9-5": "離",
  "9-6": "艮",
  "9-7": "兌",
  "9-8": "乾",
  "9-9": "坎",
};

export const keishaProfiles: Record<KeishaPalace, KeishaProfile> = {
  坎: {
    palace: "坎",
    label: "坎宮傾斜",
    star: "一白水星",
    good: "思慮深く、論理的。計画的で用心深いので大きな失敗は少ない。仕事に忠実で、自分の才能を活用することが上手。辛抱強い。",
    caution: "健康面に不安がある。理屈っぽい。猜疑心が強く、臆病で人を信用しない。秘密主義で自分の気持をオープンにしない。情に流されやすい。",
  },
  坤: {
    palace: "坤",
    label: "坤宮傾斜",
    star: "二黒土星",
    good: "真面目で実直な努力家。素直で面倒見がよく人に親切。安定志向で無茶をしない。忠誠心が高く、地道にコツコツ職務を果たす。",
    caution: "決断力に欠け、自主性に欠ける。指示待ち的で責任をとらない。短絡的で目先の欲特に弱い。リーダーシップがとれない。向上心に欠ける。",
  },
  震: {
    palace: "震",
    label: "震宮傾斜",
    star: "三碧木星",
    good: "前向きで、積極的で明るい。行動的で、チャレンジ精神と好奇心が強い。直感力と決断力がある。進取の気性があり発想力がある。",
    caution: "落ち着きがなく計画性に欠ける。せっかちで神経質で怒りっぽい。気分屋で一貫性に欠ける。大言壮語を好み、虚言に対する罪悪感が少ない。",
  },
  巽: {
    palace: "巽",
    label: "巽宮傾斜",
    star: "四緑木星",
    good: "バランス感覚に優れ商才や社交の才がある。温厚な平和主義者で調整役に適任。物事を上手にまとめる。情報力に優れ幅広い視野を持つ。",
    caution: "調子がよく、八方美人的。外面が良い分内面は悪い。優柔不断で決断力に欠ける。放浪癖があり外出好きで落ち着きがない。お人好し。",
  },
  乾: {
    palace: "乾",
    label: "乾宮傾斜",
    star: "六白金星",
    good: "大局的に物事を考え社会的。責任感、正義感が強く真面目。リーダーシップをとれる。完璧主義で規則を守る。負けず嫌いで努力家。",
    caution: "気位が高く人を見下す。無愛想で協調性がない。人の上に立って仕切りたがる。融通性がなく頑固。負けず嫌いで勝負にこだわる。",
  },
  兌: {
    palace: "兌",
    label: "兌宮傾斜",
    star: "七赤金星",
    good: "柔軟で器用。社交的で如才ない。弁が立ち説得力がある。お洒落で楽しい。サービス精神旺盛。楽観的で心の潤いを大切にする。味覚が鋭い。",
    caution: "自己中心的でわがまま。アバウトで責任感に欠ける。道楽や色情や酒食に溺れやすい。自己制御が苦手。規則にルーズ。楽をしたがる。",
  },
  艮: {
    palace: "艮",
    label: "艮宮傾斜",
    star: "八白土星",
    good: "家庭的で家族、身内を大切にする。独立心、向上心が旺盛。改良、改善の工夫をする。専門性が高く、こだわりの職人気質。清潔で凝り性。",
    caution: "強欲で頑固。融通性がない。思い込みが激しく説明不足。安定性がなく常に変化を求め、移り気で飽きっぽい。他人の気持ちに無頓着。",
  },
  離: {
    palace: "離",
    label: "離宮傾斜",
    star: "九紫火星",
    good: "発想力が豊かなアイデアマン。高尚の気性で、上昇志向が強く名誉を重んじる。派手好きで陽気な情熱家。白黒を明確にし決断力を有する。",
    caution: "移り気で飽きっぽく、熱しやすく冷めやすい。傲慢な態度で人を見下す。勝ち気で嫉妬深い。感情的になって争いを生じがち。見栄っ張り。",
  },
};

export function normalizeBirthGender(value: string | null | undefined): BirthGender {
  return value === "female" ? "female" : "male";
}

export function getKeishaPalace(
  honmeiStar: string,
  getsumeiStar: string,
  gender: BirthGender,
): KeishaPalace | null {
  const entry = keishaByHonmeiGetsumei[`${honmeiStar}-${getsumeiStar}`];

  if (!entry) {
    return null;
  }

  return typeof entry === "string" ? entry : entry[gender];
}

export function getKeishaProfile(
  honmeiStar: string,
  getsumeiStar: string,
  gender: BirthGender,
): KeishaProfile | null {
  const palace = getKeishaPalace(honmeiStar, getsumeiStar, gender);

  return palace ? keishaProfiles[palace] : null;
}
