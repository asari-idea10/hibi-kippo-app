import type {
  DirectionPalaceKey,
  FiveElement,
  PalaceBlendType,
} from "./direction-palace-blend-master";

export type DirectionBaseTag = {
  bagua: string;
  baseStar: string;
  element: FiveElement;
  baseTheme: string;
  benefitTags: string[];
  actionTags: string[];
  cautionTags: string[];
  searchKeywords: string[];
  microCopy: string;
  shortCopy: string;
  longCopy: string;
};

export type StarBaseTag = {
  number: number;
  starName: string;
  element: FiveElement;
  baseTheme: string;
  benefitTags: string[];
  actionTags: string[];
  cautionTags: string[];
  searchKeywords: string[];
  microCopy: string;
  shortCopy: string;
  longCopy: string;
};

export type BlendTone = "active" | "harmony" | "relax" | "quiet" | "clear";

export type PalaceBlendTranslationRule = {
  type: PalaceBlendType;
  traditionalMeaning: "大吉" | "中吉" | "吉" | "凶" | "大凶";
  displayGrade: "活性" | "共鳴" | "休息" | "整え" | "浄化";
  uiBadge: string;
  shortBadge: string;
  isBlocking: boolean;
  tone: BlendTone;
  actionFocus: string[];
  microCopy: string;
  blendStrategy: string;
  commentDirection: string;
};

export const DIRECTION_BASE_TAGS = {
  北: {
    bagua: "坎",
    baseStar: "一白水星",
    element: "水",
    baseTheme: "始まり、癒やし、精神性、秘密",
    benefitTags: ["厄除け", "浄化", "健康", "子宝", "縁結び"],
    actionTags: ["温泉", "水回り掃除", "静養", "内省", "親しい人との食事"],
    cautionTags: ["冷え", "孤独感", "考えすぎ", "秘密の抱え込み"],
    searchKeywords: ["厄除け", "温泉", "癒やし", "健康", "睡眠"],
    microCopy: "心身を深く癒やし、気を浄化する方位",
    shortCopy:
      "静寂の中で心身を浄化し、新たな始まりに向けてエネルギーを蓄える方位です。",
    longCopy:
      "水の気を持つ北は、すべての始まりであり、心と体を深く癒やす浄化の方位です。静かな時間を持ち、自分自身と向き合う内省に向いています。温泉に浸かったり、水回りを整えたりすることで、溜まった疲れや厄を洗い流すことができるでしょう。",
  },
  北東: {
    bagua: "艮",
    baseStar: "八白土星",
    element: "土",
    baseTheme: "変化、蓄積、節目、不動産",
    benefitTags: ["心願成就", "家族", "蓄財", "転機", "事業運"],
    actionTags: ["部屋の模様替え", "貯金の計画", "実家への連絡", "山歩き", "断捨離"],
    cautionTags: ["急な変化", "頑固さ", "関節の冷え", "停滞感"],
    searchKeywords: ["転機", "貯金", "家族", "変化", "リフレッシュ"],
    microCopy: "人生の節目を整え、新しい流れを呼ぶ方位",
    shortCopy:
      "変化と蓄積を象徴し、人生の節目や新しいステージへの移行を後押しする方位です。",
    longCopy:
      "山のようにどっしりとした土の気を持つ北東は、変化と蓄積を司る方位です。現状を一度リセットし、新しい流れを呼び込む力があります。身の回りの整理整頓や、長期的な土台作りに向きます。",
  },
  東: {
    bagua: "震",
    baseStar: "三碧木星",
    element: "木",
    baseTheme: "始まり、若さ、発展、情報",
    benefitTags: ["開運", "仕事運", "若さ", "情報", "発展"],
    actionTags: ["新しい趣味の開始", "起業準備", "早起き", "音楽を聴く", "発信"],
    cautionTags: ["焦り", "言葉の行き違い", "軽はずみな行動", "音のストレス"],
    searchKeywords: ["スタート", "仕事運", "若さ", "情報", "スピード"],
    microCopy: "若々しい勢いで、新しい挑戦を応援する方位",
    shortCopy:
      "太陽が昇る勢いと若々しいエネルギーで、新しい挑戦や発展を力強く応援する方位です。",
    longCopy:
      "朝日を浴びて万物が成長するような、若々しく勢いのある木の気を持つ方位です。新しいことを始めたり、仕事や発信で飛躍したい時に向きます。スピード感がある分、言葉は丁寧に整えると安心です。",
  },
  南東: {
    bagua: "巽",
    baseStar: "四緑木星",
    element: "木",
    baseTheme: "縁、調和、遠方、香り",
    benefitTags: ["良縁", "商売繁盛", "旅行", "信用", "対人"],
    actionTags: ["旅行の計画", "アロマを楽しむ", "換気", "手紙を書く", "カフェで交流"],
    cautionTags: ["優柔不断", "風邪", "噂話", "スケジュールの詰め込み"],
    searchKeywords: ["ご縁", "恋愛運", "旅行", "香り", "人間関係"],
    microCopy: "良縁を結び、物事をなめらかに調和させる方位",
    shortCopy:
      "爽やかな風に乗って良縁を運び、人間関係や物事をなめらかに調和させる方位です。",
    longCopy:
      "柔らかい風のような木の気を持つ南東は、あらゆるご縁を結び、整える方位です。恋愛、紹介、仕事の取引、遠方とのつながりに向きます。部屋の換気や香りを整える行動とも相性がよいです。",
  },
  南: {
    bagua: "離",
    baseStar: "九紫火星",
    element: "火",
    baseTheme: "直感、美、知性、手放す",
    benefitTags: ["学業", "才能", "悪縁切り", "美容", "勝負"],
    actionTags: ["読書や勉強", "美容院に行く", "美術館巡り", "不用品の処分", "日光浴"],
    cautionTags: ["感情的な発言", "目の疲れ", "見栄の張りすぎ", "熱中しすぎ"],
    searchKeywords: ["美容", "勉強", "インスピレーション", "断捨離", "芸術"],
    microCopy: "直感と美意識を磨き、不要なものを手放す方位",
    shortCopy:
      "太陽のように明るく照らし出し、直感力や美意識、隠れた才能を花開かせる方位です。",
    longCopy:
      "燃え上がる火の気を持つ南は、知性や美しさ、直感力を高める方位です。学びや表現、美容、クリエイティブな活動に向きます。不要なものや悪縁を手放し、本当に大切なものを明らかにする力も持ちます。",
  },
  南西: {
    bagua: "坤",
    baseStar: "二黒土星",
    element: "土",
    baseTheme: "日常、育成、安定、家庭",
    benefitTags: ["家庭", "安産", "健康", "安定", "日常"],
    actionTags: ["手料理を作る", "ガーデニング", "古い布の整理", "日常のルーティン", "台所片付け"],
    cautionTags: ["胃腸の疲れ", "マンネリ感", "取り越し苦労", "動きの鈍さ"],
    searchKeywords: ["家族", "安定", "健康", "土いじり", "日常"],
    microCopy: "日々の暮らしの基盤を固め、心を安定させる方位",
    shortCopy:
      "母なる大地のような包容力で、日々の暮らしの基盤を安定させ、優しく育む方位です。",
    longCopy:
      "ふかふかの土の気を持つ南西は、家庭や日常の基盤を固める方位です。手料理、掃除、胃腸を休める行動、暮らしの見直しに向きます。派手さよりも、安心できる足元を整える力があります。",
  },
  西: {
    bagua: "兌",
    baseStar: "七赤金星",
    element: "金",
    baseTheme: "喜び、豊かさ、飲食、交流",
    benefitTags: ["金運", "恋愛", "商売繁盛", "交流", "喜び"],
    actionTags: ["会食", "友人との会話", "趣味を楽しむ", "少しの贅沢", "歯のケア"],
    cautionTags: ["散財", "食べ過ぎ", "言葉のトラブル", "気の緩み"],
    searchKeywords: ["金運", "恋愛運", "食事", "楽しみ", "レジャー"],
    microCopy: "豊かな実りと、心弾む喜びをもたらす方位",
    shortCopy:
      "豊かな実りと喜びのエネルギーに溢れ、心弾む楽しみや金運、豊かな対人関係を導く方位です。",
    longCopy:
      "収穫の秋を思わせる金の気を持つ西は、人生の喜びや楽しみ、そして豊かさを象徴する方位です。食事、会話、買い物、趣味に向きます。楽しさのあまり散財しすぎないよう、ほどよい節度も大切です。",
  },
  北西: {
    bagua: "乾",
    baseStar: "六白金星",
    element: "金",
    baseTheme: "天、格式、リーダーシップ、投資",
    benefitTags: ["事業運", "出世", "勝負運", "投資", "神仏加護"],
    actionTags: ["神社参拝", "高級な品に触れる", "仕事の目標設定", "寄付や募金", "時計の手入れ"],
    cautionTags: ["完璧主義", "プライドの高さ", "独断専行", "肩や首の凝り"],
    searchKeywords: ["仕事運", "神社", "ステータス", "目標達成", "投資"],
    microCopy: "格式を高め、強力な後援と目標達成を授ける方位",
    shortCopy:
      "天のような高潔なエネルギーを持ち、仕事の飛躍や強力な後援、リーダーシップを授ける方位です。",
    longCopy:
      "凛とした天の気を持つ北西は、格式の高さやリーダーシップ、事業の成功をサポートする方位です。目標設定、祈願、目上への相談、資金や計画の確認に向きます。完璧を目指しすぎず、肩の力を抜くことも大切です。",
  },
} satisfies Record<DirectionPalaceKey, DirectionBaseTag>;

export const STAR_BASE_TAGS_BY_NUMBER = {
  "1": {
    number: 1,
    starName: "一白水星",
    element: "水",
    baseTheme: "癒やし、内省、秘密、浄化",
    benefitTags: ["厄除け", "浄化", "健康", "縁結び"],
    actionTags: ["温泉", "相談", "睡眠を整える", "水回り掃除"],
    cautionTags: ["冷え", "考えすぎ", "孤独感", "秘密の抱え込み"],
    searchKeywords: ["癒やし", "健康", "相談", "睡眠", "温泉"],
    microCopy: "心身を深く癒やし、気を浄化する星回り",
    shortCopy:
      "静かな時間の中で心身を浄化し、新たな始まりに向けてエネルギーを蓄える時です。",
    longCopy:
      "水のように柔軟で、深い癒やしと浄化の力を持つ星回りです。温泉、水回り掃除、睡眠の見直し、信頼できる人への相談に向きます。",
  },
  "2": {
    number: 2,
    starName: "二黒土星",
    element: "土",
    baseTheme: "育成、日常、安定、基盤づくり",
    benefitTags: ["家内安全", "健康", "基礎固め", "心願成就"],
    actionTags: ["手料理を作る", "古いものの整理", "散歩", "基礎学習"],
    cautionTags: ["胃腸の疲れ", "マンネリ感", "迷い", "取り越し苦労"],
    searchKeywords: ["安定", "家族", "健康", "日常", "ルーティン"],
    microCopy: "日々の基盤を固め、心を穏やかに整える時",
    shortCopy:
      "日常のルーティンを丁寧にこなし、足元を固めるのに適した星回りです。",
    longCopy:
      "母なる大地のように、あらゆるものを育み、基礎を固める星回りです。料理、散歩、基礎学習、暮らしの整理に向きます。",
  },
  "3": {
    number: 3,
    starName: "三碧木星",
    element: "木",
    baseTheme: "始まり、若さ、発展、情報",
    benefitTags: ["発展", "開運", "情報", "若さ", "起業"],
    actionTags: ["新しい趣味の開始", "起業準備", "早起き", "音楽を聴く", "発信"],
    cautionTags: ["焦り", "言葉の行き違い", "軽はずみな行動", "音のストレス"],
    searchKeywords: ["スタート", "仕事運", "情報", "音楽", "早起き"],
    microCopy: "若々しい勢いで、新しい挑戦を後押しする星",
    shortCopy:
      "太陽が昇るような勢いで、新しい挑戦や物事の発展を力強く応援する時です。",
    longCopy:
      "若芽が伸びるような明るく勢いのある星回りです。新規着手、発信、起業準備、朝活に向きます。",
  },
  "4": {
    number: 4,
    starName: "四緑木星",
    element: "木",
    baseTheme: "縁、調和、風、香り",
    benefitTags: ["良縁", "商売繁盛", "信用", "人間関係", "旅行"],
    actionTags: ["カフェで交流", "換気", "アロマを楽しむ", "手紙を書く", "紹介を受ける"],
    cautionTags: ["優柔不断", "風邪", "噂話", "スケジュールの詰め込み"],
    searchKeywords: ["ご縁", "恋愛運", "旅行", "香り", "人間関係"],
    microCopy: "良いご縁を結び、物事をなめらかに調和させる星",
    shortCopy:
      "爽やかな風に乗って良縁を運び、人間関係や物事をなめらかに調和させる時です。",
    longCopy:
      "柔らかい風のように、ご縁を結ぶ星回りです。紹介、商談、旅行計画、信用づくりに向きます。",
  },
  "5": {
    number: 5,
    starName: "五黄土星",
    element: "土",
    baseTheme: "中心、リセット、強力な力、再生",
    benefitTags: ["厄除け", "再生", "強運", "問題解決"],
    actionTags: ["大掃除", "不用品の処分", "根本的な見直し", "厄落とし"],
    cautionTags: ["強引な行動", "感情の爆発", "独りよがり", "腐敗"],
    searchKeywords: ["厄除け", "断捨離", "再生", "リセット", "大掃除"],
    microCopy: "不要なものを断ち、運気を根本から再生する星",
    shortCopy:
      "強いリセット力を持ち、古いものを手放して運気を根本から再生する時です。",
    longCopy:
      "中心の土の力を持つ星回りです。増やすより、壊れているもの・滞っているものを見直し、根本から整える行動に向きます。",
  },
  "6": {
    number: 6,
    starName: "六白金星",
    element: "金",
    baseTheme: "天、格式、リーダーシップ、投資",
    benefitTags: ["事業運", "勝負運", "神仏加護", "目標達成"],
    actionTags: ["神社参拝", "目標設定", "高級な品に触れる", "募金・寄付"],
    cautionTags: ["完璧主義", "プライドの高さ", "独断専行", "肩や首の凝り"],
    searchKeywords: ["仕事運", "神社", "ステータス", "投資", "目標達成"],
    microCopy: "格式を高め、強力な後援と目標達成を導く星",
    shortCopy:
      "仕事の飛躍や強力な後援、リーダーシップを授ける星回りです。",
    longCopy:
      "凛とした天の気を持つ、格式の高さやリーダーシップ、事業の成功をサポートする星回りです。祈願や目標設定と相性が良いです。",
  },
  "7": {
    number: 7,
    starName: "七赤金星",
    element: "金",
    baseTheme: "喜び、豊かさ、飲食、交流",
    benefitTags: ["金運", "恋愛", "対人円満", "福徳"],
    actionTags: ["会食", "友人との会話", "趣味を楽しむ", "歯のケア"],
    cautionTags: ["散財", "食べ過ぎ", "言葉のトラブル", "気の緩み"],
    searchKeywords: ["金運", "恋愛運", "食事", "楽しみ", "レジャー"],
    microCopy: "豊かな実りと、心弾む喜びをもたらす星",
    shortCopy:
      "心弾む楽しみや金運、豊かな対人関係を導く星回りです。",
    longCopy:
      "人生の喜びや楽しみ、豊かさを象徴する星回りです。会食、会話、趣味、少しの贅沢に向きます。",
  },
  "8": {
    number: 8,
    starName: "八白土星",
    element: "土",
    baseTheme: "変化、蓄積、節目、不動産",
    benefitTags: ["運気転換", "蓄財", "家内安全", "心願成就"],
    actionTags: ["部屋の模様替え", "貯金の計画", "山歩き", "実家への連絡"],
    cautionTags: ["急な変化", "頑固さ", "関節の冷え", "停滞感"],
    searchKeywords: ["転機", "貯金", "家族", "変化", "リフレッシュ"],
    microCopy: "人生の節目を整え、新しい流れを呼ぶ星",
    shortCopy:
      "人生の節目や新しいステージへの移行を力強く後押しする星回りです。",
    longCopy:
      "山のようにどっしりとした変化と蓄積を司る星回りです。整理、貯蓄、家族との対話、次の一手の準備に向きます。",
  },
  "9": {
    number: 9,
    starName: "九紫火星",
    element: "火",
    baseTheme: "直感、美、知性、手放す",
    benefitTags: ["才能開花", "悪縁切り", "学業", "美容"],
    actionTags: ["読書や勉強", "美容院に行く", "美術館巡り", "不用品の処分"],
    cautionTags: ["感情的な発言", "目の疲れ", "見栄の張りすぎ", "熱中しすぎ"],
    searchKeywords: ["美容", "勉強", "インスピレーション", "断捨離", "芸術"],
    microCopy: "直感と美意識を磨き、不要なものを手放す星",
    shortCopy:
      "直感力や美意識、隠れた才能を花開かせる星回りです。",
    longCopy:
      "知性や美しさ、直感力を高める星回りです。学び、美容、芸術鑑賞、不用品の処分と相性が良いです。",
  },
} satisfies Record<string, StarBaseTag>;

export const BLEND_TRANSLATION_RULES = {
  生気: {
    type: "生気",
    traditionalMeaning: "大吉",
    displayGrade: "活性",
    uiBadge: "動のチューニング",
    shortBadge: "動",
    isBlocking: false,
    tone: "active",
    actionFocus: ["アクティブ", "吸収", "前進"],
    microCopy: "スムーズに気が流れ、活力が湧く星回り",
    blendStrategy:
      "方位と星の行動タグから、外向きでアクティブなものを優先して抽出する。",
    commentDirection:
      "追い風が吹いている状態。外に向かってエネルギーを発散し、新しいものを吸収する行動を促す。",
  },
  退気: {
    type: "退気",
    traditionalMeaning: "中吉",
    displayGrade: "休息",
    uiBadge: "癒やしのチューニング",
    shortBadge: "癒やし",
    isBlocking: false,
    tone: "relax",
    actionFocus: ["リラックス", "還元", "受容"],
    microCopy: "焦らずゆっくりと、気を養う星回り",
    blendStrategy:
      "方位と星の行動タグから、静かで受け身なものを優先して抽出する。",
    commentDirection:
      "エネルギーを外に出すより、内側に蓄える状態。心身のメンテナンスを促す。",
  },
  比和: {
    type: "比和",
    traditionalMeaning: "吉",
    displayGrade: "共鳴",
    uiBadge: "共鳴のチューニング",
    shortBadge: "共鳴",
    isBlocking: false,
    tone: "harmony",
    actionFocus: ["増幅", "交流", "自己表現"],
    microCopy: "本来の魅力が引き出され、共鳴する星回り",
    blendStrategy:
      "星と方位の波長が一致するため、ご利益タグを多めに抽出し、対人や交流系のアクションを優先する。",
    commentDirection:
      "星と方位の波長が合う状態。好きなこと、得意なことに素直にエネルギーを注ぐことを促す。",
  },
  抑気: {
    type: "抑気",
    traditionalMeaning: "凶",
    displayGrade: "整え",
    uiBadge: "静のチューニング",
    shortBadge: "静",
    isBlocking: false,
    tone: "quiet",
    actionFocus: ["メンテナンス", "内観", "整理"],
    microCopy: "立ち止まり、身の回りを丁寧に整える星回り",
    blendStrategy:
      "星の注意タグに気を配りつつ、方位の行動タグから整理・内省系を優先して抽出する。",
    commentDirection:
      "環境との摩擦で進みにくい状態。派手に動かず、一人の時間や点検を吉として提案する。",
  },
  衝気: {
    type: "衝気",
    traditionalMeaning: "大凶",
    displayGrade: "浄化",
    uiBadge: "浄化のチューニング",
    shortBadge: "浄化",
    isBlocking: false,
    tone: "clear",
    actionFocus: ["デトックス", "手放し", "リセット"],
    microCopy: "摩擦をデトックスし、心身を洗い流す星回り",
    blendStrategy:
      "方位と星が持つ浄化アクションを最優先で抽出する。",
    commentDirection:
      "エネルギーが強くぶつかる状態。不要なものを手放すデトックス日として提案する。",
  },
} satisfies Record<PalaceBlendType, PalaceBlendTranslationRule>;

