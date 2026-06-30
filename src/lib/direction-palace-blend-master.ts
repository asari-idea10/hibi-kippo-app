import {
  BLEND_TRANSLATION_RULES,
  DIRECTION_BASE_TAGS,
  STAR_BASE_TAGS_BY_NUMBER,
  type DirectionBaseTag,
  type PalaceBlendTranslationRule,
  type StarBaseTag,
} from "./direction-blend-tag-master";
import { PALACE_STAR_BLEND_OVERRIDES } from "./direction-blend-overrides";

export type FiveElement = "木" | "火" | "土" | "金" | "水";

export type DirectionPalaceKey =
  | "北"
  | "北東"
  | "東"
  | "南東"
  | "南"
  | "南西"
  | "西"
  | "北西";

export type PalaceBlendGrade = "大吉" | "中吉" | "吉" | "凶" | "大凶";
export type PalaceBlendType = "生気" | "退気" | "比和" | "抑気" | "衝気";

export type KyuseiStarElementEntry = {
  starNumber: string;
  starName: string;
  element: FiveElement;
  keywords: string[];
};

export type DirectionPalaceEntry = {
  direction: DirectionPalaceKey;
  bagua: string;
  palaceStarNumber: string;
  palaceStarName: string;
  element: FiveElement;
  theme: string;
  keywords: string[];
  suitableActions: string[];
  carefulActions: string[];
  gentleAdvice: string;
};

export type PalaceBlendRule = {
  grade: PalaceBlendGrade;
  type: PalaceBlendType;
  score: number;
  relation: string;
  logic: string;
  summary: string;
  benefitText: string;
  cautionText: string;
  recommendedActionLabels: string[];
  calendarTone: "good" | "mixed" | "bad";
};

export type PalaceStarBlendResult = PalaceBlendRule & {
  direction: DirectionPalaceKey;
  palace: DirectionPalaceEntry;
  star: KyuseiStarElementEntry;
  elementalRelationLabel: string;
  displayGrade: PalaceBlendTranslationRule["displayGrade"];
  uiBadge: string;
  shortBadge: string;
  isBlocking: boolean;
  tone: PalaceBlendTranslationRule["tone"];
  microCopy: string;
  directionBase: DirectionBaseTag;
  starBase: StarBaseTag;
  actionTags: string[];
  effectTags: string[];
  benefitTags: string[];
  protectiveTags: string[];
};

type PalaceBlendCopyOverride = Partial<
  Pick<PalaceBlendRule, "summary" | "benefitText" | "cautionText">
> & {
  actionTags?: string[];
  effectTags?: string[];
  benefitTags?: string[];
  protectiveTags?: string[];
};

const generatingElementMap: Record<FiveElement, FiveElement> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const controllingElementMap: Record<FiveElement, FiveElement> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

const elementEffectTags: Record<FiveElement, string[]> = {
  木: ["始動", "発展", "縁を育てる", "声に出す"],
  火: ["発表", "美意識", "見える化", "手放し"],
  土: ["基盤づくり", "生活整備", "蓄積", "準備"],
  金: ["収穫", "金運整理", "喜び", "会話"],
  水: ["癒やし", "交流", "浄化", "内省"],
};

const blendTypeEffectTags: Record<PalaceBlendType, string[]> = {
  生気: ["後押し", "発展", "流れに乗る"],
  退気: ["整える", "貢献", "準備"],
  比和: ["深める", "集中", "定着"],
  抑気: ["点検", "休息", "熱を冷ます"],
  衝気: ["見直し", "低刺激", "撤退"],
};

const directionBenefitTags: Record<DirectionPalaceKey, string[]> = {
  北: ["厄除け", "浄化", "健康運", "心願成就"],
  北東: ["厄除け", "家内安全", "住まい運", "再出発"],
  東: ["仕事運", "発展運", "起業運", "学業成就"],
  南東: ["縁結び", "良縁", "商売繁盛", "旅行安全"],
  南: ["芸能上達", "名誉運", "試験運", "美容運"],
  南西: ["家庭円満", "健康運", "子育て運", "蓄財運"],
  西: ["金運", "恋愛運", "商売繁盛", "収穫運"],
  北西: ["出世運", "勝負運", "仕事運", "神仏加護"],
};

const starBenefitTags: Record<string, string[]> = {
  "1": ["浄化", "癒やし", "健康運", "相談運"],
  "2": ["家庭円満", "生活安定", "蓄財運", "健康運"],
  "3": ["発展運", "起業運", "仕事運", "若返り"],
  "4": ["縁結び", "信用運", "商談成就", "旅行安全"],
  "5": ["厄除け", "再生運", "断捨離", "開運"],
  "6": ["出世運", "勝負運", "資金運", "神仏加護"],
  "7": ["金運", "恋愛運", "商売繁盛", "喜び運"],
  "8": ["不動産運", "家内安全", "貯蓄運", "転機運"],
  "9": ["美容運", "芸能上達", "学業成就", "名誉運"],
};

const blendTypeBenefitTags: Record<PalaceBlendType, string[]> = {
  生気: ["開運", "心願成就"],
  退気: ["積徳", "ご縁育成"],
  比和: ["運気安定", "願意強化"],
  抑気: ["厄除け", "無事安全"],
  衝気: ["厄除け", "浄化"],
};

const defensiveBenefitTags: Record<Extract<PalaceBlendType, "抑気" | "衝気">, string[]> = {
  抑気: ["厄除け", "無事安全", "現状維持", "トラブル回避"],
  衝気: ["厄除け", "浄化", "現状維持", "トラブル回避"],
};

const directionDefensiveBenefitTags: Record<DirectionPalaceKey, string[]> = {
  北: ["厄除け", "浄化", "健康運"],
  北東: ["厄除け", "家内安全", "再出発"],
  東: ["無事安全", "現状維持"],
  南東: ["旅行安全", "信用回復"],
  南: ["厄落とし", "冷静判断"],
  南西: ["健康運", "生活安定"],
  西: ["金銭管理", "浪費防止"],
  北西: ["神仏加護", "トラブル回避"],
};

export const kyuseiStarElementMaster: Record<string, KyuseiStarElementEntry> = {
  "1": {
    starNumber: "1",
    starName: "一白水星",
    element: "水",
    keywords: ["癒やし", "交流", "秘密", "深い思考", "再生"],
  },
  "2": {
    starNumber: "2",
    starName: "二黒土星",
    element: "土",
    keywords: ["育成", "継続", "生活", "準備", "受容"],
  },
  "3": {
    starNumber: "3",
    starName: "三碧木星",
    element: "木",
    keywords: ["発展", "始動", "音", "若さ", "突破"],
  },
  "4": {
    starNumber: "4",
    starName: "四緑木星",
    element: "木",
    keywords: ["信用", "縁", "風", "旅行", "調整"],
  },
  "5": {
    starNumber: "5",
    starName: "五黄土星",
    element: "土",
    keywords: ["中心", "腐熟", "破壊と再生", "支配", "総括"],
  },
  "6": {
    starNumber: "6",
    starName: "六白金星",
    element: "金",
    keywords: ["権威", "援助", "資金", "完成", "活動"],
  },
  "7": {
    starNumber: "7",
    starName: "七赤金星",
    element: "金",
    keywords: ["喜び", "飲食", "金運", "会話", "収穫"],
  },
  "8": {
    starNumber: "8",
    starName: "八白土星",
    element: "土",
    keywords: ["変化", "相続", "蓄積", "転機", "山"],
  },
  "9": {
    starNumber: "9",
    starName: "九紫火星",
    element: "火",
    keywords: ["知性", "美", "名誉", "発見", "手放し"],
  },
};

export const directionPalaceMaster = {
  北: {
    direction: "北",
    bagua: "坎",
    palaceStarNumber: "1",
    palaceStarName: "一白水星",
    element: "水",
    theme: "始まり、癒やし、精神性、秘密、深いご加護",
    keywords: ["癒やし", "浄化", "内省", "交流", "再出発"],
    suitableActions: ["温泉", "静養", "相談", "水辺", "一人時間"],
    carefulActions: ["焦った決断", "感情的な連絡", "冷えすぎる場所"],
    gentleAdvice:
      "深く整える方位。急いで成果を取りに行くより、心身を水のようにほどく行動と相性がよいです。",
  },
  北東: {
    direction: "北東",
    bagua: "艮",
    palaceStarNumber: "8",
    palaceStarName: "八白土星",
    element: "土",
    theme: "変化、節目、蓄積、相続、山のような切り替え",
    keywords: ["転機", "蓄積", "整理", "家族", "相続"],
    suitableActions: ["整理整頓", "計画変更", "家族相談", "山・高台", "区切りをつける"],
    carefulActions: ["強引な方向転換", "衝動的な契約", "頑固な押し通し"],
    gentleAdvice:
      "節目を整える方位。大きく動かすより、古い流れを仕分けて次の土台を作る意識が合います。",
  },
  東: {
    direction: "東",
    bagua: "震",
    palaceStarNumber: "3",
    palaceStarName: "三碧木星",
    element: "木",
    theme: "成長、発展、若さ、音、新規の芽吹き",
    keywords: ["始動", "発信", "成長", "新規", "朝"],
    suitableActions: ["新規着手", "発信", "学び始め", "朝活", "企画出し"],
    carefulActions: ["短気な発言", "勢いだけの出費", "準備不足の発表"],
    gentleAdvice:
      "芽吹きの方位。小さく始める、声に出す、朝の行動に変えると気が立ち上がりやすくなります。",
  },
  南東: {
    direction: "南東",
    bagua: "巽",
    palaceStarNumber: "4",
    palaceStarName: "四緑木星",
    element: "木",
    theme: "信用、縁、風、旅行、取引、遠方とのつながり",
    keywords: ["縁", "信用", "旅行", "調整", "紹介"],
    suitableActions: ["会食", "紹介", "遠出", "商談準備", "お礼"],
    carefulActions: ["約束を曖昧にする", "八方美人", "連絡の放置"],
    gentleAdvice:
      "ご縁を運ぶ方位。人に会う、紹介を受ける、丁寧に連絡を整える行動とよく響きます。",
  },
  南: {
    direction: "南",
    bagua: "離",
    palaceStarNumber: "9",
    palaceStarName: "九紫火星",
    element: "火",
    theme: "光、知性、美、名誉、見える化、手放し",
    keywords: ["知性", "美", "評価", "発見", "離別"],
    suitableActions: ["発表", "美容", "学習", "作品鑑賞", "見直し"],
    carefulActions: ["見栄", "炎上", "言い切りすぎる判断"],
    gentleAdvice:
      "光を当てる方位。隠れていたものを見つける、整えて見せる、不要なものを手放す行動に向きます。",
  },
  南西: {
    direction: "南西",
    bagua: "坤",
    palaceStarNumber: "2",
    palaceStarName: "二黒土星",
    element: "土",
    theme: "基盤、育成、生活、母性、勤め、日々の積み重ね",
    keywords: ["生活", "育成", "準備", "勤め", "土台"],
    suitableActions: ["買い出し", "生活改善", "準備", "片付け", "家族の用事"],
    carefulActions: ["抱え込み", "先延ばし", "地味な疲れの放置"],
    gentleAdvice:
      "暮らしを育てる方位。派手な勝負より、生活・準備・体調を整えるほど運の土台が安定します。",
  },
  西: {
    direction: "西",
    bagua: "兌",
    palaceStarNumber: "7",
    palaceStarName: "七赤金星",
    element: "金",
    theme: "収穫、喜び、飲食、金運、会話、遊び",
    keywords: ["喜び", "金運", "飲食", "会話", "収穫"],
    suitableActions: ["会食", "買い物", "収支確認", "楽しむ", "感謝を伝える"],
    carefulActions: ["浪費", "口の災い", "快楽への偏り"],
    gentleAdvice:
      "喜びを受け取る方位。人との会話、食事、感謝、収支の見直しを通じて豊かさを整えます。",
  },
  北西: {
    direction: "北西",
    bagua: "乾",
    palaceStarNumber: "6",
    palaceStarName: "六白金星",
    element: "金",
    theme: "天、権威、援助、資金、父性、大きな活動",
    keywords: ["援助", "上司", "資金", "決断", "活動"],
    suitableActions: ["上司相談", "祈願", "大きな計画", "資金相談", "移動"],
    carefulActions: ["強硬姿勢", "高圧的な交渉", "完璧主義"],
    gentleAdvice:
      "大きな後押しを受ける方位。目上への相談、祈願、長期計画の確認に使うと姿勢が整います。",
  },
} satisfies Record<DirectionPalaceKey, DirectionPalaceEntry>;

export const palaceBlendRules = {
  生気: {
    grade: "大吉",
    type: "生気",
    score: 2,
    relation: "宮が星を生じる",
    logic: "環境が行動を育てる",
    summary: "その方位の土台が、回座星の働きを自然に育てる強い後押しです。",
    benefitText:
      "実力以上の流れを受けやすく、始動・発展・吉方旅の候補として見やすい状態です。",
    cautionText: "順調さに乗りすぎず、目的を絞ると気が散りません。",
    recommendedActionLabels: ["吉方旅向き", "発展向き", "始動向き"],
    calendarTone: "good",
  },
  退気: {
    grade: "中吉",
    type: "退気",
    score: 1,
    relation: "星が宮を生じる",
    logic: "行動が環境を育てる",
    summary: "自分の行動が場を整え、後から評価や成果が育つ関係です。",
    benefitText:
      "準備・貢献・環境整備に向きます。目立つ成果より、後から効く行動に向いています。",
    cautionText: "エネルギーを使う側なので、予定を詰め込みすぎないのがコツです。",
    recommendedActionLabels: ["整え向き", "準備向き", "貢献向き"],
    calendarTone: "good",
  },
  比和: {
    grade: "吉",
    type: "比和",
    score: 1,
    relation: "宮と星が同じ五行",
    logic: "環境と行動が共鳴する",
    summary: "方位のテーマと回座星のテーマが重なり、作用がまっすぐ出やすい関係です。",
    benefitText:
      "集中・深掘り・定着に向きます。その星のよさがわかりやすく現れます。",
    cautionText: "良くも悪くも強まるため、偏りすぎないように整える視点を持ちます。",
    recommendedActionLabels: ["集中向き", "定着向き", "確認向き"],
    calendarTone: "good",
  },
  抑気: {
    grade: "凶",
    type: "抑気",
    score: 0,
    relation: "宮が星を剋する",
    logic: "環境が行動を抑える",
    summary:
      "場の力が回座星の働きを抑え、派手に進めるより整える行動が合う関係です。",
    benefitText:
      "休む・点検する・熱を冷ます行動に翻訳すると使いやすくなります。",
    cautionText:
      "凶方位ではありません。大きな勝負より、予定に余白を持たせると安心です。",
    recommendedActionLabels: ["整え向き", "点検向き", "静の行動"],
    calendarTone: "mixed",
  },
  衝気: {
    grade: "大凶",
    type: "衝気",
    score: 0,
    relation: "星が宮を剋する",
    logic: "行動が環境と衝突する",
    summary:
      "自分の行動がその方位の土台とぶつかりやすく、手放しや浄化に翻訳しやすい関係です。",
    benefitText:
      "拡大より、断捨離・掃除・予定の見直しなど、摩擦をデトックスする行動に向きます。",
    cautionText:
      "凶方位ではありません。強引に進めず、手放す・軽くする方向へ翻訳します。",
    recommendedActionLabels: ["浄化向き", "手放し向き", "リセット"],
    calendarTone: "mixed",
  },
} satisfies Record<PalaceBlendType, PalaceBlendRule>;

const palaceStarBlendCopyOverrides: Partial<
  Record<DirectionPalaceKey, Partial<Record<string, PalaceBlendCopyOverride>>>
> = {
  北: {
    "1": {
      summary:
        "環境の水と行動の水がシンクロし、心身のクリアリングが進みやすい比和の組み合わせです。",
      benefitText:
        "環境の水と行動の水が完全にシンクロする時。深い内省、温泉での静養、信頼できる人への相談で心身をクリアにすると、次の展開が自然と起動します。",
      cautionText:
        "感情が深くなりやすいので、孤独に沈みすぎず、信頼できる人との短い対話を入れると整います。",
      effectTags: ["温泉", "内省", "相談", "再出発"],
    },
    "2": {
      summary:
        "堅実な土の動きが北の静かな流れをせき止め、生活圏の調整が必要になる衝気の組み合わせです。",
      benefitText:
        "堅実な動きが北の静かな流れをせき止め、濁りが生じやすい時。大きな決断や移動は控え、部屋の片付けや胃腸の休息など、身近な生活圏のメンテナンスに留めると安全です。",
      cautionText:
        "抱え込みや義務感で気が重くなりやすいので、人の世話をしすぎない余白を残します。",
      effectTags: ["片付け", "予定整理", "静養", "低刺激"],
    },
    "3": {
      summary:
        "北の豊かな水脈が三碧の新しいアイデアを支え、仕込みが育ちやすい生気の組み合わせです。",
      benefitText:
        "北の豊かな水脈が、新しいアイデアを強力にバックアップする時。表立って動くより、水面下で企画を練り、学びを深める仕込みに徹すると後から大きく育ちます。",
      cautionText:
        "勢いをすぐ外に出すより、準備と学習に一拍置くと、伸びる力が安定します。",
      effectTags: ["学び", "企画", "新規準備", "朝活"],
    },
    "4": {
      summary:
        "澄んだ水が四緑のご縁のネットワークを潤し、信用構築が進みやすい生気の組み合わせです。",
      benefitText:
        "澄んだ水が、ご縁のネットワークを隅々まで潤す時。遠方との丁寧な連絡、紹介の下準備、旅程の計画など、人知れず信用を構築する行動が後の発展につながります。",
      cautionText:
        "曖昧な約束は水に流れやすいので、連絡文や予定は短く明確に整えます。",
      effectTags: ["紹介準備", "お礼", "旅程づくり", "信用"],
    },
    "5": {
      summary:
        "北の清流に五黄の土砂が入り込み、環境のデトックスが必要になる衝気の組み合わせです。",
      benefitText:
        "北の清流に強い土砂が入り込み、物事が停滞しやすい時。無理に状況を動かそうとせず、水回りの徹底掃除や不要物の処分など、環境のデトックスに専念してください。",
      cautionText:
        "停滞を力で破ろうとすると摩擦が出やすいため、今日は引き算で整えるのが安全です。",
      effectTags: ["水回り掃除", "処分", "体調回復", "撤退"],
    },
    "6": {
      summary:
        "六白の確かな行動が北の新しい流れを生み、後から援助を引き出しやすい退気の組み合わせです。",
      benefitText:
        "確固たる行動が、北の新たな流れを生み出す時。目上の人への真摯な相談や資金計画の見直しなど、現実的な土台を静かに固めることで、後から大きな援助が引き出せます。",
      cautionText:
        "正しさを押し出しすぎると冷たく見えるので、相談は柔らかい言葉で始めます。",
      effectTags: ["上司相談", "資金計画", "祈願", "書類確認"],
    },
    "7": {
      summary:
        "七赤の喜びが北の冷えた空気を和らげ、会話で状況をほぐしやすい退気の組み合わせです。",
      benefitText:
        "喜びや楽しさが、冷えがちな北の空気を優しく和らげる時。親しい人との気軽な会食や、感謝を伝える短い連絡が、硬直した状況を心地よく解きほぐします。",
      cautionText:
        "楽しさで出費や発言が緩みやすいので、長居せず軽やかに切り上げると品よく整います。",
      effectTags: ["会食", "近況報告", "感謝", "気分転換"],
    },
    "8": {
      summary:
        "八白の山が北の繊細な水流を塞ぎ、現状打破より境界整理が必要になる衝気の組み合わせです。",
      benefitText:
        "重厚な山が北の繊細な水流を塞ぎ、閉塞感を覚えやすい時。焦って現状打破を狙わず、家族との対話や予定のリスケジュールなど、一度立ち止まって境界線を引くのが吉です。",
      cautionText:
        "頑固さや過去へのこだわりが出やすいので、結論を急がず保留する判断も吉です。",
      effectTags: ["保留", "境界整理", "家族確認", "休息"],
    },
    "9": {
      summary:
        "北の冷気が九紫の情熱や自己主張を鎮火させ、熱量調整が必要になる抑気の組み合わせです。",
      benefitText:
        "北の冷気が、情熱や自己主張を急速に鎮火させる時。目立つ発表や派手な動きは避け、資料のブラッシュアップや十分な睡眠など、熱を冷まし英気を養う時間にあててください。",
      cautionText:
        "見栄や焦りで火を燃やそうとすると空回りします。今日は光らせるより、熱を整えます。",
      effectTags: ["資料見直し", "美容整備", "休息", "熱を冷ます"],
    },
  },
  北東: {
    "1": {
      summary:
        "北東の強固な山が一白の柔軟な動きを止め、再スタート前の環境浄化が必要になる抑気の組み合わせです。",
      benefitText:
        "北東の強固な山が、柔軟な動きをせき止める時。無理に進めず、情報整理や水回りの清掃など、足元の環境を浄化して再スタートの時期を待つのが賢明です。",
      cautionText:
        "感情で流れを変えようとすると詰まりやすいため、判断を保留し、環境の整理から始めます。",
      effectTags: ["情報整理", "水回り清掃", "保留", "再準備"],
    },
    "2": {
      summary:
        "北東の土台と二黒の日々の積み重ねが噛み合い、地盤固めが進みやすい比和の組み合わせです。",
      benefitText:
        "北東の土台と、日々の積み重ねが力強く噛み合う時。生活習慣の抜本的な見直しや、長期的な資産形成の準備など、地道な地盤固めが今後の変化を支えます。",
      cautionText:
        "地味な作業ほど効きます。短期成果を急がず、続けられる仕組みに落とし込みます。",
      effectTags: ["生活改善", "資産準備", "地盤固め", "習慣化"],
    },
    "3": {
      summary:
        "三碧の新しい試みが北東の固い地盤と衝突しやすく、守りの再点検が必要な衝気の組み合わせです。",
      benefitText:
        "新しい試みが、北東の固い地盤と衝突しやすい時。新規事業や目立つ発信は控え、過去の計画の見直しや撤退ラインの再確認など、守りの姿勢に徹してください。",
      cautionText:
        "勢いで突破しようとすると足元が崩れます。今日は始めるより、止め方を整える日です。",
      effectTags: ["計画見直し", "撤退ライン", "守り", "発信控えめ"],
    },
    "4": {
      summary:
        "四緑の広がる縁が北東の山に阻まれ、拡大より関係整理が必要になる衝気の組み合わせです。",
      benefitText:
        "拡大しようとするご縁が、北東のそびえ立つ山に阻まれる時。無理な営業や遠方への移動は避け、既存の人間関係の整理や、身近な家族との関係修復に時間を使ってください。",
      cautionText:
        "広げるほど摩擦が出やすいので、今日は連絡先や約束を整理し、関係の密度を整えます。",
      effectTags: ["関係整理", "家族対話", "営業控えめ", "約束整理"],
    },
    "5": {
      summary:
        "五黄の強い刷新力が北東の節目と一致し、古い体制を入れ替えやすい比和の組み合わせです。",
      benefitText:
        "強力な推進力が、北東の節目の気質と完全に一致する時。不要なものを根こそぎ手放す断捨離や、古い体制を壊して新しいルールを敷くような刷新に向きます。",
      cautionText:
        "破壊力が強く出やすいので、人間関係ではなく物や仕組みの入れ替えに使うと安全です。",
      effectTags: ["断捨離", "ルール刷新", "体制変更", "仕組み整理"],
    },
    "6": {
      summary:
        "北東の豊かな山が六白の大きな目標を支え、蓄積が成果へ変わりやすい生気の組み合わせです。",
      benefitText:
        "北東の豊かな山が、大きな目標を生み出し支える時。目上の人からの引き立てや、事業計画の重要な承認など、これまでの蓄積が形となって確かな成果を得られます。",
      cautionText:
        "成果を急いで誇示せず、承認・相談・報告を丁寧に積み上げると安定します。",
      effectTags: ["事業計画", "承認", "目上相談", "成果確認"],
    },
    "7": {
      summary:
        "北東の確かな土台が七赤の収穫を育て、努力の評価を受け取りやすい生気の組み合わせです。",
      benefitText:
        "北東の確かな土台が、喜びや収穫を大いに育む時。これまでの努力が評価されやすいタイミングです。親しい人や家族と豊かさを分かち合い、感謝を伝えることで次の運気が巡ります。",
      cautionText:
        "受け取る喜びが浪費に流れないよう、感謝と収支確認をセットにすると整います。",
      effectTags: ["感謝", "家族会食", "評価確認", "収支確認"],
    },
    "8": {
      summary:
        "北東の気質と八白の切り替え力が同調し、次の一手の土台を作りやすい比和の組み合わせです。",
      benefitText:
        "北東の気質と行動の特性が完全に同調する、大きな切り替えの時。貯蓄の計画、引継ぎ業務、家や実家に関する整理など、人生の次の一手に向けた土台作りに最も適したタイミングです。",
      cautionText:
        "大きな変更ほど段取りが要です。感情ではなく、手順と期限を決めて進めます。",
      effectTags: ["貯蓄計画", "引継ぎ", "実家整理", "次の一手"],
    },
    "9": {
      summary:
        "九紫の知性や情熱が北東の土台を焼き固め、知識の還元が効きやすい退気の組み合わせです。",
      benefitText:
        "知性や情熱が、北東の土台をさらに強固に焼き固める時。目立つ成果を追うより、知識のアーカイブ化や後進への指導など、自分のリソースを環境に還元する行動が吉です。",
      cautionText:
        "目立とうとすると熱が強くなります。今日は見せるより、残す・教える・整理する方向が合います。",
      effectTags: ["知識整理", "後進指導", "記録化", "還元"],
    },
  },
  東: {
    "1": {
      summary:
        "一白の準備や内省が東の芽吹きを潤し、新しい行動の土台を整えやすい退気の組み合わせです。",
      benefitText:
        "静かな準備や内省が、東の新しい芽吹きを潤す時。いきなり発信するより、学習メモ、相談、企画の下書きなど、朝から小さく整える行動が後の始動を支えます。",
      cautionText:
        "考え込みすぎると動き出しが遅れます。短い準備時間を決めて、ひとつだけ形にします。",
      effectTags: ["学習メモ", "相談", "企画下書き", "朝の準備"],
    },
    "2": {
      summary:
        "東の伸びる木が二黒の土を締め付け、生活や作業のペースが乱れやすい抑気の組み合わせです。",
      benefitText:
        "東のスピード感が、地道な二黒のリズムを乱しやすい時。新規着手より、家事、在庫整理、作業手順の点検など、生活と仕事の足元を整える行動に切り替えると安全です。",
      cautionText:
        "周囲の勢いに巻き込まれやすいので、予定を増やさず、今日やる範囲を小さく区切ります。",
      effectTags: ["手順点検", "家事整理", "在庫確認", "範囲を絞る"],
    },
    "3": {
      summary:
        "東の木と三碧の木が同調し、始動や発信のスイッチが入りやすい比和の組み合わせです。",
      benefitText:
        "東の芽吹きと三碧の始動力がシンクロする時。起業アイデアの初期メモ、朝活、企画出し、短い発信など、まず声に出して小さく動くことで、停滞していた流れが一気に立ち上がります。",
      cautionText:
        "勢いが強く出る分、言葉が粗くなりやすい日です。発信前に一度だけ読み返します。",
      effectTags: ["起業初動", "企画出し", "朝活", "短い発信"],
    },
    "4": {
      summary:
        "東の木と四緑の木が共鳴し、新しい縁や情報が広がりやすい比和の組み合わせです。",
      benefitText:
        "東の始動力と四緑のネットワークが重なり、情報やご縁が広がりやすい時。紹介依頼、日程調整、SNSの整備、遠方への連絡など、軽やかな接点づくりに向きます。",
      cautionText:
        "広げすぎると約束が薄くなります。連絡先や日程を整理しながら進めると信用が残ります。",
      effectTags: ["紹介依頼", "日程調整", "SNS整備", "遠方連絡"],
    },
    "5": {
      summary:
        "東の成長力が五黄の土を揺らし、古い問題が表面化しやすい抑気の組み合わせです。",
      benefitText:
        "東の成長力が、五黄の重い土台を揺らす時。新しい挑戦より、放置していた問題の洗い出し、壊れた仕組みの点検、不要なタスクの停止に使うと整います。",
      cautionText:
        "強引に突破すると問題が大きくなります。今日は始めるより、詰まりを見つける日です。",
      effectTags: ["問題洗い出し", "仕組み点検", "タスク停止", "詰まり確認"],
    },
    "6": {
      summary:
        "六白の強い金が東の若い木を切り込み、成長の芽を傷つけやすい衝気の組み合わせです。",
      benefitText:
        "六白の強い判断力が、東の若い芽を切り込みやすい時。大きな決裁や強い交渉は控え、上司への事前相談、資料の整備、期限の確認など、衝突を避ける準備に徹します。",
      cautionText:
        "正論を急ぐほど反発が出ます。決める前に、関係者の温度感を確認します。",
      effectTags: ["事前相談", "資料整備", "期限確認", "決裁保留"],
    },
    "7": {
      summary:
        "七赤の金が東の木を傷つけ、軽い会話や楽しさが成長の芽を乱しやすい衝気の組み合わせです。",
      benefitText:
        "七赤の楽しさが、東の新しい流れを軽くしすぎる時。会食や買い物を広げるより、発言の確認、予算の見直し、約束の整理で、後から芽を摘まない状態に整えます。",
      cautionText:
        "口の軽さや浪費が響きやすい日です。楽しい予定ほど、時間と金額の上限を決めます。",
      effectTags: ["発言確認", "予算見直し", "約束整理", "上限設定"],
    },
    "8": {
      summary:
        "東の木が八白の山土を締め付け、変化を急ぎすぎると土台が崩れやすい抑気の組み合わせです。",
      benefitText:
        "東の始動力が、八白の大きな節目を急かしすぎる時。急な方向転換は避け、引継ぎ表、家族予定、長期計画の確認など、変化に耐える足場づくりに向きます。",
      cautionText:
        "焦って変えるほど抵抗が出ます。今日は動かす前に、支える仕組みを確認します。",
      effectTags: ["引継ぎ表", "家族予定", "長期計画", "足場づくり"],
    },
    "9": {
      summary:
        "東の木が九紫の火を生み、発信や見える化が勢いよく進みやすい生気の組み合わせです。",
      benefitText:
        "東の成長力が、九紫の知性や見える化を力強く後押しする時。事業コンセプトの言語化、発表資料の公開、学びの共有など、準備してきたものを明るく見せる行動に向きます。",
      cautionText:
        "目立つほど反応も増えます。公開前に表現を整え、誇張を避けると品よく伝わります。",
      effectTags: ["事業構想", "資料公開", "学び共有", "見える化"],
    },
  },
  南東: {
    "1": {
      summary:
        "一白の相談や内省が南東の縁を潤し、信用の導線を静かに整えやすい退気の組み合わせです。",
      benefitText:
        "一白の静かな対話が、南東のご縁の流れを潤す時。紹介前の相談、問い合わせ対応、旅程や商談メモの整理など、相手に届く前の準備を丁寧に整えると信用が育ちます。",
      cautionText:
        "迷いを抱えたまま広げると話がぼやけます。伝える相手と目的を絞ってから動きます。",
      effectTags: ["紹介前相談", "問い合わせ対応", "商談メモ", "旅程整理"],
    },
    "2": {
      summary:
        "南東の広がる木が二黒の土を締め付け、生活や実務の負荷が出やすい抑気の組み合わせです。",
      benefitText:
        "南東の広がるご縁が、二黒の地道な実務を圧迫しやすい時。新しい約束を増やすより、家族予定、納期、請求、持ち物の確認など、足元の段取りを整える行動に向きます。",
      cautionText:
        "人に合わせすぎると自分の生活が乱れます。引き受ける範囲を先に決めます。",
      effectTags: ["納期確認", "請求確認", "家族予定", "持ち物点検"],
    },
    "3": {
      summary:
        "三碧の始動力と南東の縁が共鳴し、新しい接点を作りやすい比和の組み合わせです。",
      benefitText:
        "三碧の始動力と南東のネットワークが重なる時。初回アポイント、サービス告知、紹介先への連絡、朝の営業連絡など、新しい接点を軽やかに作る行動が響きます。",
      cautionText:
        "勢いで広げすぎると管理が追いつきません。次の連絡日までセットで決めます。",
      effectTags: ["初回アポ", "サービス告知", "紹介連絡", "営業連絡"],
    },
    "4": {
      summary:
        "南東の木と四緑の木が同調し、信用・紹介・遠方のつながりが強まりやすい比和の組み合わせです。",
      benefitText:
        "南東のご縁と四緑の調整力が完全にシンクロする時。紹介依頼、商談準備、遠方連絡、契約前の条件整理など、人との信頼導線を作る行動に最も向きます。",
      cautionText:
        "八方美人になると信用が薄まります。返事・条件・期限を明確にして進めます。",
      effectTags: ["紹介依頼", "商談準備", "遠方連絡", "条件整理"],
    },
    "5": {
      summary:
        "南東の広がる木が五黄の土台を揺らし、関係や取引の詰まりが表面化しやすい抑気の組み合わせです。",
      benefitText:
        "南東の広がる流れが、五黄の重い土台を揺らす時。強い営業や新規契約は控え、未返信、滞留案件、古い取引条件の洗い出しなど、関係の詰まりをデトックスします。",
      cautionText:
        "問題を人にぶつけるより、仕組みや条件の詰まりとして扱うと安全です。",
      effectTags: ["未返信整理", "滞留案件", "取引条件", "関係デトックス"],
    },
    "6": {
      summary:
        "六白の強い金が南東の木を切り込み、信用や交渉が硬くなりやすい衝気の組み合わせです。",
      benefitText:
        "六白の強い判断力が、南東の柔らかな縁を切り込みやすい時。強い交渉や上からの指示は控え、稟議資料、紹介文、契約条項の確認など、角が立たない準備に徹します。",
      cautionText:
        "正論だけで進めると関係が冷えます。依頼文は柔らかく、根回しを先にします。",
      effectTags: ["稟議資料", "紹介文", "契約確認", "根回し"],
    },
    "7": {
      summary:
        "七赤の楽しさや会話が南東の信用を傷つけやすく、軽さの調整が必要な衝気の組み合わせです。",
      benefitText:
        "七赤の会話や楽しさが、南東の信用導線を軽くしすぎる時。会食や買い物を広げるより、発言の見直し、会計確認、約束の記録など、信頼を損なわない調整に使います。",
      cautionText:
        "冗談や口約束が後で響きやすい日です。楽しい場ほど、記録とお礼を残します。",
      effectTags: ["発言見直し", "会計確認", "約束記録", "お礼"],
    },
    "8": {
      summary:
        "南東の広がる木が八白の山土を締め付け、遠方や家族の調整で負荷が出やすい抑気の組み合わせです。",
      benefitText:
        "南東の広がりが、八白の大きな節目を急かしやすい時。遠方移動や関係拡大は控え、家族相談、引継ぎ、住所・契約情報の整理など、変化に備える調整へ切り替えます。",
      cautionText:
        "急な方向転換は関係者を疲れさせます。変更点を一覧化してから共有します。",
      effectTags: ["家族相談", "引継ぎ", "住所整理", "変更一覧"],
    },
    "9": {
      summary:
        "南東の木が九紫の火を生み、魅せ方や発表が信用拡大につながりやすい生気の組み合わせです。",
      benefitText:
        "南東のご縁が、九紫の見える化を力強く後押しする時。プロフィール更新、提案資料の磨き込み、作品公開、ブランド発信など、信用が伝わる見せ方を整える行動に向きます。",
      cautionText:
        "目立つほど評価も集まります。華やかさより、実績と約束が伝わる表現に整えます。",
      effectTags: ["プロフィール更新", "提案資料", "作品公開", "ブランド発信"],
    },
  },
  南: {
    "1": {
      summary:
        "一白の水が南の火を消しやすく、見える化や自己表現の熱量が下がりやすい衝気の組み合わせです。",
      benefitText:
        "一白の冷静さが、南の発表や自己表現の熱を抑えやすい時。大きな公開や派手な演出は控え、資料の事実確認、睡眠、温かい飲み物で心身の温度を戻す行動に向きます。",
      cautionText:
        "不安なまま目立とうとすると消耗します。今日は見せるより、整えて温め直します。",
      effectTags: ["事実確認", "睡眠", "温め直し", "公開控えめ"],
    },
    "2": {
      summary:
        "南の火が二黒の土を温め、生活や実務の基盤を明るく整えやすい生気の組み合わせです。",
      benefitText:
        "南の光が、二黒の生活基盤を温める時。家事動線の見直し、健康管理、資料の分類、日々の作業の見える化など、地味な整備を明るく続ける仕組みに変えられます。",
      cautionText:
        "人のために動きすぎると疲れます。生活改善は、自分が続けられる形に小さくします。",
      effectTags: ["家事動線", "健康管理", "資料分類", "作業見える化"],
    },
    "3": {
      summary:
        "三碧の木が南の火を生み、新しい発信や学びが明るく広がりやすい退気の組み合わせです。",
      benefitText:
        "三碧の始動力が、南の光をさらに明るくする時。新しい学びの発表、短い動画や文章の公開、企画のプレゼンなど、自分の考えを見える形にして場を温める行動が響きます。",
      cautionText:
        "勢いだけで出すと粗さも見えます。短くても、タイトルと結論を整えてから公開します。",
      effectTags: ["学び発表", "短い公開", "企画プレゼン", "結論整理"],
    },
    "4": {
      summary:
        "四緑の木が南の火を支え、信用や縁を美しく見せやすい退気の組み合わせです。",
      benefitText:
        "四緑の調整力が、南の見える化を品よく支える時。プロフィール、提案資料、紹介文、SNS導線を整え、相手に伝わる見せ方へ磨くことで信用が自然に広がります。",
      cautionText:
        "見栄えを整えすぎて中身が薄くならないよう、実績や約束も同時に確認します。",
      effectTags: ["プロフィール整備", "提案資料", "紹介文", "SNS導線"],
    },
    "5": {
      summary:
        "南の火が五黄の土を温め、古い問題を明るみに出して刷新しやすい生気の組み合わせです。",
      benefitText:
        "南の光が、五黄の重い土台に熱を入れる時。隠れていた問題の可視化、古いルールの棚卸し、不要な権限や役割の整理など、根の深い課題を見える形にして刷新できます。",
      cautionText:
        "問題を暴くほど反発も出ます。人を責めず、仕組みの改善として扱うと安全です。",
      effectTags: ["課題可視化", "ルール棚卸し", "権限整理", "刷新"],
    },
    "6": {
      summary:
        "南の火が六白の金を溶かし、権威や決断に熱が入りすぎやすい抑気の組み合わせです。",
      benefitText:
        "南の熱が、六白の強い判断力を過熱させやすい時。大きな決裁や強い発言は控え、上申資料の表現調整、肩書きや責任範囲の確認など、圧を下げる準備に使います。",
      cautionText:
        "正しさを強く見せるほど衝突します。言い切る前に、余白のある表現へ整えます。",
      effectTags: ["表現調整", "責任範囲", "上申資料", "圧を下げる"],
    },
    "7": {
      summary:
        "南の火が七赤の金を熱し、楽しさや会話が目立ちすぎやすい抑気の組み合わせです。",
      benefitText:
        "南の熱が、七赤の会話や楽しさを過熱させやすい時。会食や買い物は控えめにし、発言の見直し、写真や投稿の選別、収支確認など、見え方とお金を整える行動に向きます。",
      cautionText:
        "軽い一言や浪費が目立ちやすい日です。公開するものと財布の出口を絞ります。",
      effectTags: ["投稿選別", "発言見直し", "収支確認", "買い物控えめ"],
    },
    "8": {
      summary:
        "南の火が八白の土を温め、節目や継承を明るく形にしやすい生気の組み合わせです。",
      benefitText:
        "南の光が、八白の節目や蓄積を温める時。引継ぎ資料、家や資産の整理、長期計画の見直しなど、次の段階へ進むための情報を見える形にまとめる行動が合います。",
      cautionText:
        "大きな変更を急がず、まずは一覧化します。見える形にするだけでも流れが整います。",
      effectTags: ["引継ぎ資料", "資産整理", "長期計画", "一覧化"],
    },
    "9": {
      summary:
        "南の火と九紫の火が同調し、知性・美・評価が強く表に出やすい比和の組み合わせです。",
      benefitText:
        "南の光と九紫の知性が完全にシンクロする時。発表、作品公開、美容、学習成果の共有など、見せるべきものを明るく整える行動に向きます。評価を受け取る準備も整います。",
      cautionText:
        "光が強い分、欠点も見えます。誇張より、洗練と余白を意識すると品よく伝わります。",
      effectTags: ["発表", "作品公開", "美容", "成果共有"],
    },
  },
  南西: {
    "1": {
      summary:
        "南西の土が一白の水を吸い込み、生活の中で感情や体調が滞りやすい抑気の組み合わせです。",
      benefitText:
        "南西の生活基盤が、一白の繊細な流れを吸い込みやすい時。遠出や深い相談は控え、台所の片付け、胃腸を休める食事、洗濯や水回りの確認など、暮らしの湿度を整えます。",
      cautionText:
        "感情を抱え込むと疲れが出ます。家の用事を小さく片付け、早めに休む判断が合います。",
      effectTags: ["台所片付け", "胃腸休息", "洗濯", "水回り確認"],
    },
    "2": {
      summary:
        "南西の土と二黒の土が同調し、生活習慣や準備を着実に整えやすい比和の組み合わせです。",
      benefitText:
        "南西の暮らしの土台と、二黒の日々の積み重ねがぴったり噛み合う時。食材の買い出し、作り置き、家計の確認、ルーティンの見直しなど、生活を支える行動が安定します。",
      cautionText:
        "地味な用事を増やしすぎると重くなります。今日整える範囲を決めて、淡々と進めます。",
      effectTags: ["買い出し", "作り置き", "家計確認", "ルーティン"],
    },
    "3": {
      summary:
        "三碧の木が南西の土を締め付け、生活のペースを急かしやすい衝気の組み合わせです。",
      benefitText:
        "三碧のスピード感が、南西のゆっくり育てる土台を急かしやすい時。新規着手や強い発信は控え、家事の段取り、明日の準備、連絡の優先順位づけに切り替えると整います。",
      cautionText:
        "急いで増やすほど生活が乱れます。まずは未完了の小さな用事を終わらせます。",
      effectTags: ["家事段取り", "明日の準備", "優先順位", "未完了処理"],
    },
    "4": {
      summary:
        "四緑の木が南西の土に根を張りすぎ、家族や予定の調整で負荷が出やすい衝気の組み合わせです。",
      benefitText:
        "四緑のご縁や調整が、南西の生活基盤に入り込みすぎる時。約束を増やすより、家族予定、食事、送迎、支払いなど、身近な段取りを整えて生活の余白を守ります。",
      cautionText:
        "人に合わせすぎると自分の暮らしが崩れます。断る用事と引き受ける用事を分けます。",
      effectTags: ["家族予定", "食事準備", "送迎確認", "支払い整理"],
    },
    "5": {
      summary:
        "南西の土と五黄の土が重なり、生活基盤の古い詰まりを整理しやすい比和の組み合わせです。",
      benefitText:
        "南西の暮らしの土台に、五黄の刷新力が重なる時。冷蔵庫、収納、古い書類、使っていない日用品など、生活の奥に残った詰まりを一気に整理する行動に向きます。",
      cautionText:
        "家族や人を責めると重くなります。物と仕組みの整理に絞ると、安全に刷新できます。",
      effectTags: ["冷蔵庫整理", "収納整理", "書類処分", "日用品見直し"],
    },
    "6": {
      summary:
        "南西の土が六白の金を育て、生活の積み重ねが資金や責任の安定につながる生気の組み合わせです。",
      benefitText:
        "南西の地道な土台が、六白の大きな責任や資金を育てる時。家計の長期計画、保険やローンの確認、上司への報告準備など、暮らしから仕事の安定へつながる整備に向きます。",
      cautionText:
        "重いテーマほど一気に片付けようとしないこと。確認項目を分けて着実に進めます。",
      effectTags: ["家計計画", "保険確認", "ローン確認", "報告準備"],
    },
    "7": {
      summary:
        "南西の土が七赤の金を育て、日々の積み重ねが喜びや収穫に変わりやすい生気の組み合わせです。",
      benefitText:
        "南西の生活の安定が、七赤の喜びや収穫を育てる時。家族との食事、感謝を伝える買い物、収支の見直しなど、暮らしの中で豊かさを受け取る行動に向きます。",
      cautionText:
        "ご褒美が浪費に変わりやすいので、予算を決めて楽しむと品よく整います。",
      effectTags: ["家族食事", "感謝の買い物", "収支見直し", "予算設定"],
    },
    "8": {
      summary:
        "南西の土と八白の土が同調し、暮らしの基盤や家族の節目を整えやすい比和の組み合わせです。",
      benefitText:
        "南西の生活基盤と、八白の節目の力が重なる時。実家や住まいの整理、家族会議、貯蓄計画、引継ぎ準備など、次の生活段階へ進むための土台作りに向きます。",
      cautionText:
        "家族テーマは重くなりやすいので、結論よりも情報整理と役割分担を優先します。",
      effectTags: ["住まい整理", "家族会議", "貯蓄計画", "役割分担"],
    },
    "9": {
      summary:
        "九紫の火が南西の土を温め、暮らしや準備を見える形に整えやすい退気の組み合わせです。",
      benefitText:
        "九紫の見える化が、南西の生活基盤を温める時。献立表、家事リスト、健康記録、学習計画など、日々の積み重ねを見える形にして、続けやすい仕組みに変えられます。",
      cautionText:
        "完璧な管理を目指すと疲れます。見える化は、続けられる簡単な形式にします。",
      effectTags: ["献立表", "家事リスト", "健康記録", "学習計画"],
    },
  },
  西: {
    "1": {
      summary:
        "西の金が一白の水を生み、会話や楽しみが心の潤いへ変わりやすい生気の組み合わせです。",
      benefitText:
        "西の収穫や会話が、一白の心の潤いを生み出す時。気軽な会食、感謝の連絡、温泉やカフェでの休息など、喜びを受け取りながら心身をゆるめる行動に向きます。",
      cautionText:
        "楽しさで予定が長引きやすい日です。滞在時間と予算を決めると、品よく整います。",
      effectTags: ["会食", "感謝連絡", "カフェ休息", "予算設定"],
    },
    "2": {
      summary:
        "二黒の土が西の金を育て、日々の実務が収穫や金運整理につながりやすい退気の組み合わせです。",
      benefitText:
        "二黒の地道な積み重ねが、西の収穫を育てる時。家計簿、買い出し、在庫確認、請求や支払いの整理など、暮らしの実務を整えることで小さな豊かさを受け取りやすくなります。",
      cautionText:
        "節約だけに寄ると楽しさが減ります。必要な支出と喜びの支出を分けて確認します。",
      effectTags: ["家計簿", "買い出し", "在庫確認", "支払い整理"],
    },
    "3": {
      summary:
        "西の金が三碧の木を切り込み、勢いある発信や新規行動が軽く傷つきやすい抑気の組み合わせです。",
      benefitText:
        "西の収穫ムードが、三碧の勢いを少し切り込みやすい時。新規発信や強い主張は控え、発言の見直し、初回連絡の下書き、予算確認など、軽率さを防ぐ点検に向きます。",
      cautionText:
        "思いつきの発言や買い物が後で響きます。送信前、購入前に一度だけ止まります。",
      effectTags: ["発言見直し", "下書き", "予算確認", "購入前確認"],
    },
    "4": {
      summary:
        "西の金が四緑の木を切り込み、縁や信用の広がりが削られやすい抑気の組み合わせです。",
      benefitText:
        "西の金の切れ味が、四緑のご縁や調整を傷つけやすい時。会食や紹介を広げるより、連絡文の見直し、約束の確認、お礼の送信など、信用を損なわない整備に使います。",
      cautionText:
        "冗談や条件の曖昧さが誤解を生みやすい日です。言葉を短く、正確に整えます。",
      effectTags: ["連絡文見直し", "約束確認", "お礼送信", "条件整理"],
    },
    "5": {
      summary:
        "五黄の土が西の金を育て、古い滞りを整理すると収穫へ変わりやすい退気の組み合わせです。",
      benefitText:
        "五黄の刷新力が、西の収穫を生み出す時。古い領収書、不要なサブスク、使っていない物、滞った会計を整理すると、重さが抜けて金運の流れが見えやすくなります。",
      cautionText:
        "一気に壊すより、不要なものから静かに外します。人間関係の断定は避けます。",
      effectTags: ["領収書整理", "サブスク見直し", "不要品整理", "会計整理"],
    },
    "6": {
      summary:
        "六白の金と西の金が同調し、責任ある収穫や大きな成果を受け取りやすい比和の組み合わせです。",
      benefitText:
        "六白の大きな実績と、西の収穫の気質が重なる時。報酬確認、上司への報告、資金計画、重要な会食など、成果を受け取り、次の責任へつなげる行動に向きます。",
      cautionText:
        "成果を強く主張しすぎると硬くなります。感謝と報告をセットにして受け取ります。",
      effectTags: ["報酬確認", "上司報告", "資金計画", "重要会食"],
    },
    "7": {
      summary:
        "西の金と七赤の金が同調し、喜び・会話・収穫がストレートに出やすい比和の組み合わせです。",
      benefitText:
        "西の喜びと七赤の楽しさが完全にシンクロする時。会食、買い物、感謝を伝える場、収支の見直しなど、豊かさを受け取りながら人との距離を心地よく整えられます。",
      cautionText:
        "良くも悪くも楽しさが強まります。浪費、口の軽さ、飲みすぎには上限を決めます。",
      effectTags: ["会食", "買い物", "感謝", "収支見直し"],
    },
    "8": {
      summary:
        "八白の土が西の金を育て、蓄積や節目が収穫へ変わりやすい退気の組み合わせです。",
      benefitText:
        "八白の蓄積が、西の収穫を支える時。貯蓄計画、資産の棚卸し、家族との会計相談、引継ぎ確認など、これまで積み上げたものを受け取れる形へ整える行動が合います。",
      cautionText:
        "大きな金額や家族テーマは慎重に扱います。数字を見える形にしてから話します。",
      effectTags: ["貯蓄計画", "資産棚卸し", "会計相談", "引継ぎ確認"],
    },
    "9": {
      summary:
        "九紫の火が西の金を溶かし、見栄や評価が収穫を乱しやすい衝気の組み合わせです。",
      benefitText:
        "九紫の目立つ熱が、西の収穫や喜びを溶かしやすい時。派手な買い物や強い自己演出は控え、投稿の選別、領収書確認、美容のメンテナンスなど、見え方と支出を整えます。",
      cautionText:
        "見栄で動くと大切な価値を失いやすい日です。今日は華やかさより、洗練を選びます。",
      effectTags: ["投稿選別", "領収書確認", "美容整備", "支出調整"],
    },
  },
  北西: {
    "1": {
      summary:
        "北西の金が一白の水を生み、目上の援助や大きな流れを静かに引き出しやすい生気の組み合わせです。",
      benefitText:
        "北西の大きな後押しが、一白の新しい流れを生み出す時。目上への相談、祈願、資金や契約の下調べ、静かな一人時間を通じて、次の展開に必要な支援が見えやすくなります。",
      cautionText:
        "大きな話ほど急がないこと。相談前に要点を整理し、相手が判断しやすい形にします。",
      effectTags: ["目上相談", "祈願", "契約下調べ", "要点整理"],
    },
    "2": {
      summary:
        "二黒の土が北西の金を育て、地道な準備が責任ある成果へつながりやすい退気の組み合わせです。",
      benefitText:
        "二黒の地道な準備が、北西の大きな責任を支える時。提出物の整備、家計や資金の確認、報告準備、長期計画の下書きなど、目立たない実務が後の信頼につながります。",
      cautionText:
        "完璧に抱え込むと重くなります。担当範囲と期限を明確にして進めます。",
      effectTags: ["提出物整備", "資金確認", "報告準備", "計画下書き"],
    },
    "3": {
      summary:
        "北西の金が三碧の木を切り込み、勢いある発信や初動が上位の圧に当たりやすい抑気の組み合わせです。",
      benefitText:
        "北西の強い判断力が、三碧の初動を切り込みやすい時。勢いで提案するより、上司への事前共有、企画の根拠確認、発信内容の調整など、承認を得る準備に使います。",
      cautionText:
        "急な主張は反発を受けやすい日です。声を上げる前に、根拠と順番を整えます。",
      effectTags: ["事前共有", "根拠確認", "発信調整", "承認準備"],
    },
    "4": {
      summary:
        "北西の金が四緑の木を切り込み、縁や調整が権威や責任に押されやすい抑気の組み合わせです。",
      benefitText:
        "北西の強いルール感が、四緑の柔らかな調整を硬くしやすい時。紹介や商談を広げるより、依頼文の整備、契約条件の確認、目上への根回しで関係の摩擦を減らします。",
      cautionText:
        "正しさだけで進めると縁が切れやすくなります。礼儀と順番を丁寧に扱います。",
      effectTags: ["依頼文整備", "契約条件", "根回し", "礼儀確認"],
    },
    "5": {
      summary:
        "五黄の土が北西の金を育て、大きな体制変更や責任整理が進みやすい退気の組み合わせです。",
      benefitText:
        "五黄の刷新力が、北西の大きな活動を支える時。組織のルール見直し、権限整理、古い契約の棚卸し、資金計画の再構築など、重いテーマを仕組みとして整えられます。",
      cautionText:
        "人を動かそうとすると圧が出ます。まずは制度、権限、契約の整理から始めます。",
      effectTags: ["ルール見直し", "権限整理", "契約棚卸し", "資金再構築"],
    },
    "6": {
      summary:
        "北西の金と六白の金が同調し、責任・援助・大きな決断が強く作用する比和の組み合わせです。",
      benefitText:
        "北西の天の力と六白の責任感が完全にシンクロする時。祈願、上司相談、重要な意思決定、資金や事業計画の確認など、大きな方向性を定める行動に向きます。",
      cautionText:
        "力が強く出る分、高圧的に見えやすい日です。決断には説明と感謝を添えます。",
      effectTags: ["祈願", "上司相談", "重要決定", "事業計画"],
    },
    "7": {
      summary:
        "北西の金と七赤の金が共鳴し、目上との会話や豊かさの受け取りが進みやすい比和の組み合わせです。",
      benefitText:
        "北西の大きな支援と七赤の会話が重なる時。目上との会食、感謝を伝える場、報酬や条件の確認など、喜びを品よく受け取りながら次の支援につなげられます。",
      cautionText:
        "楽しさが出ても、礼節は崩さないこと。会食や交渉では支払いとお礼を丁寧にします。",
      effectTags: ["目上会食", "感謝", "報酬確認", "条件確認"],
    },
    "8": {
      summary:
        "八白の土が北西の金を育て、蓄積や節目が大きな計画の支えになりやすい退気の組み合わせです。",
      benefitText:
        "八白の蓄積が、北西の大きな計画を支える時。相続や資産の確認、事業承継、長期計画、家や土地に関する相談など、次世代へ渡す準備に向きます。",
      cautionText:
        "大きなテーマほど関係者が多くなります。資料を一覧化し、段階を分けて進めます。",
      effectTags: ["資産確認", "事業承継", "長期計画", "土地相談"],
    },
    "9": {
      summary:
        "九紫の火が北西の金を溶かし、権威や大きな価値が熱で乱れやすい衝気の組み合わせです。",
      benefitText:
        "九紫の目立つ熱が、北西の大きな責任や価値を溶かしやすい時。派手な発表や強い主張は控え、資料の表現調整、肩書きや役割の確認、十分な休息で熱を下げます。",
      cautionText:
        "見栄や正義感で動くと衝突が大きくなります。今日は目立つより、品よく整える日です。",
      effectTags: ["表現調整", "役割確認", "休息", "熱を下げる"],
    },
  },
};

export function getKyuseiStarElement(starNumber: string) {
  return kyuseiStarElementMaster[starNumber] ?? null;
}

export function getDirectionPalace(direction: string) {
  return directionPalaceMaster[direction as DirectionPalaceKey] ?? null;
}

export function getPalaceBlendType(
  palaceElement: FiveElement,
  starElement: FiveElement,
): PalaceBlendType {
  if (palaceElement === starElement) {
    return "比和";
  }

  if (generatingElementMap[palaceElement] === starElement) {
    return "生気";
  }

  if (generatingElementMap[starElement] === palaceElement) {
    return "退気";
  }

  if (controllingElementMap[palaceElement] === starElement) {
    return "抑気";
  }

  return "衝気";
}

export function getElementalRelationLabel(
  palaceElement: FiveElement,
  starElement: FiveElement,
): string {
  const type = getPalaceBlendType(palaceElement, starElement);

  if (type === "比和") {
    return `${palaceElement}=${starElement}`;
  }

  if (type === "生気") {
    return `${palaceElement}生${starElement}`;
  }

  if (type === "退気") {
    return `${starElement}生${palaceElement}`;
  }

  if (type === "抑気") {
    return `${palaceElement}剋${starElement}`;
  }

  return `${starElement}剋${palaceElement}`;
}

function uniqueTags(tags: string[], limit: number): string[] {
  return Array.from(new Set(tags.filter(Boolean))).slice(0, limit);
}

function blendOrderedTags(...groups: string[][]): string[] {
  return groups.flatMap((group) => group);
}

function getStarBaseTag(star: KyuseiStarElementEntry): StarBaseTag {
  return STAR_BASE_TAGS_BY_NUMBER[
    star.starNumber as keyof typeof STAR_BASE_TAGS_BY_NUMBER
  ];
}

function buildActionTags(
  palace: DirectionPalaceEntry,
  star: KyuseiStarElementEntry,
  type: PalaceBlendType,
  overrideTags: string[] = [],
): string[] {
  const directionBase = DIRECTION_BASE_TAGS[palace.direction];
  const starBase = getStarBaseTag(star);
  const translation = BLEND_TRANSLATION_RULES[type];
  const baseTags =
    type === "抑気" || type === "衝気"
      ? blendOrderedTags(
          directionBase.actionTags,
          starBase.actionTags,
          translation.actionFocus,
          blendTypeEffectTags[type],
          directionBase.cautionTags,
          starBase.cautionTags,
        )
      : type === "生気"
        ? blendOrderedTags(
            starBase.actionTags,
            directionBase.actionTags,
            translation.actionFocus,
            elementEffectTags[star.element],
            blendTypeEffectTags[type],
          )
        : type === "退気"
          ? blendOrderedTags(
              directionBase.actionTags,
              starBase.actionTags,
              translation.actionFocus,
              elementEffectTags[star.element],
              blendTypeEffectTags[type],
            )
          : blendOrderedTags(
              directionBase.actionTags,
              starBase.actionTags,
              translation.actionFocus,
              elementEffectTags[star.element],
              blendTypeEffectTags[type],
            );

  return uniqueTags([...overrideTags, ...baseTags, ...palace.suitableActions], 3);
}

function buildBenefitTags(
  palace: DirectionPalaceEntry,
  star: KyuseiStarElementEntry,
  type: PalaceBlendType,
  overrideTags: string[] = [],
): string[] {
  const directionBase = DIRECTION_BASE_TAGS[palace.direction];
  const starBase = getStarBaseTag(star);

  if (type === "抑気" || type === "衝気") {
    return uniqueTags(
      [
        ...overrideTags,
        ...(type === "抑気"
          ? ["厄除け", "無事安全", "現状維持"]
          : ["浄化", "手放し", "現状維持"]),
        ...directionBase.cautionTags,
        ...starBase.cautionTags,
      ],
      3,
    );
  }

  const prioritizedTags =
    type === "生気"
      ? blendOrderedTags(
          overrideTags,
          starBase.benefitTags,
          directionBase.benefitTags,
          blendTypeBenefitTags[type],
          directionBenefitTags[palace.direction],
          starBenefitTags[star.starNumber],
        )
      : type === "退気"
        ? blendOrderedTags(
            overrideTags,
            directionBase.benefitTags,
            starBase.benefitTags,
            blendTypeBenefitTags[type],
            directionBenefitTags[palace.direction],
            starBenefitTags[star.starNumber],
          )
        : blendOrderedTags(
            overrideTags,
            directionBase.benefitTags,
            starBase.benefitTags,
            blendTypeBenefitTags[type],
            directionBenefitTags[palace.direction],
            starBenefitTags[star.starNumber],
          );

  return uniqueTags(
    prioritizedTags,
    2,
  );
}

function buildProtectiveTags(
  palace: DirectionPalaceEntry,
  type: PalaceBlendType,
  overrideTags: string[] = [],
): string[] {
  const directionBase = DIRECTION_BASE_TAGS[palace.direction];

  if (type !== "抑気" && type !== "衝気") {
    return uniqueTags(overrideTags, 3);
  }

  return uniqueTags(
    [
      ...overrideTags,
      ...defensiveBenefitTags[type],
      ...blendTypeBenefitTags[type],
      ...directionDefensiveBenefitTags[palace.direction],
      ...directionBase.cautionTags,
    ],
    5,
  );
}

export function getPalaceStarBlend(
  direction: string,
  starNumber: string,
): PalaceStarBlendResult | null {
  const palace = getDirectionPalace(direction);
  const star = getKyuseiStarElement(starNumber);

  if (!palace || !star) {
    return null;
  }

  const type = getPalaceBlendType(palace.element, star.element);
  const rule = palaceBlendRules[type];
  const translation = BLEND_TRANSLATION_RULES[type];
  const directionBase = DIRECTION_BASE_TAGS[palace.direction];
  const starBase = getStarBaseTag(star);
  const elementalRelationLabel = getElementalRelationLabel(
    palace.element,
    star.element,
  );
  const override =
    palaceStarBlendCopyOverrides[palace.direction]?.[star.starNumber] ?? null;
  const messageOverride =
    PALACE_STAR_BLEND_OVERRIDES[palace.direction]?.[star.starNumber] ?? null;
  const effectiveOverride: PalaceBlendCopyOverride | null = messageOverride
    ? {
        ...override,
        summary: messageOverride.customMessage,
        benefitText:
          "吉方判定を下げるものではなく、この方位で得る報徳・象意として扱います。",
        actionTags: messageOverride.customActionTags,
      }
    : override;
  const actionTags = buildActionTags(
    palace,
    star,
    type,
    effectiveOverride?.actionTags ?? effectiveOverride?.effectTags ?? [],
  );
  const benefitTags = buildBenefitTags(
    palace,
    star,
    type,
    effectiveOverride?.benefitTags ?? [],
  );
  const protectiveTags = buildProtectiveTags(
    palace,
    type,
    effectiveOverride?.protectiveTags ?? [],
  );

  return {
    ...rule,
    ...effectiveOverride,
    direction: palace.direction,
    palace,
    star,
    elementalRelationLabel,
    displayGrade: translation.displayGrade,
    uiBadge: translation.uiBadge,
    shortBadge: translation.shortBadge,
    isBlocking: translation.isBlocking,
    tone: translation.tone,
    microCopy: translation.microCopy,
    directionBase,
    starBase,
    actionTags,
    effectTags: actionTags,
    benefitTags,
    protectiveTags,
  };
}

export function getPalaceBlendSummary(direction: string, starNumber: string) {
  const blend = getPalaceStarBlend(direction, starNumber);

  if (!blend) {
    return "-";
  }

  return `${blend.direction} ${blend.palace.bagua}宮(${blend.palace.element}) × ${blend.star.starName}(${blend.star.element}) = ${blend.elementalRelationLabel} / ${blend.grade}/${blend.type}`;
}
