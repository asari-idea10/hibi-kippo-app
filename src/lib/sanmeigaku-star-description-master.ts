import type {
  JuudaiShusei,
  JuunidaiJusei,
} from "@/lib/sanmeigaku-yosen-master";

export type JuunidaiStrengthClass = "最身弱" | "身弱" | "身中" | "身強";

export type JuunidaiJuseiDescription = {
  name: JuunidaiJusei;
  power: number;
  energy: string;
  ageRange: string;
  strengthClass: JuunidaiStrengthClass;
  animal: string;
  group: string;
  tribe: string;
  notation: string;
  axis: string;
  goalType: string;
  colors: string[];
  keywords: string[];
};

export type JuudaiShuseiPosition = "中心" | "頭" | "腹" | "右手" | "左手";

export type JuudaiShuseiPositionDescription = {
  position: JuudaiShuseiPosition;
  star: JuudaiShusei;
  key: string;
  theme: string;
  description: string;
};

export type SanmeigakuEnergyStrengthRule = {
  energyTotal: number;
  strengthClass: "身弱" | "身中" | "身強";
};

export const sanmeigakuStarDescriptionSource = {
  spreadsheetTitle: "★Fortune Mileage.改",
  spreadsheetUrl:
    "https://docs.google.com/spreadsheets/d/1cA4_swLTarSTJkz2nSxvF6oBlrAo363A4U5xTWOQv7g/edit?gid=1235637842#gid=1235637842",
  sheetName: "算命計算",
  juunidaiRange: "算命計算!B512:N524",
  juudaiRange: "算命計算!A528:E577",
  energyStrengthRange: "算命計算!A580:B616",
} as const;

export const juunidaiJuseiDescriptions: JuunidaiJuseiDescription[] = [
  {
    name: "天報星",
    power: 3,
    energy: "胎児",
    ageRange: "-",
    strengthClass: "身弱",
    animal: "狼",
    group: "地球",
    tribe: "他人との競争にはいつも勝ちたい種族",
    notation: "漢字表記",
    axis: "自分軸",
    goalType: "目標志向型",
    colors: ["レッド", "ブルー", "オレンジ", "ブラウン", "パープル", "ブラック"],
    keywords: ["変転変化", "多芸多才", "お天気屋", "無の形成"],
  },
  {
    name: "天印星",
    power: 6,
    energy: "赤ちゃん",
    ageRange: "０才〜３才・５才",
    strengthClass: "身中",
    animal: "こじか",
    group: "新月",
    tribe: "人からめんどうをみてもらえる種族",
    notation: "ひらがな表記",
    axis: "相手軸",
    goalType: "状況対応型",
    colors: ["イエロー", "ゴールド", "グリーン", "シルバー"],
    keywords: ["無心", "甘受", "かわいい", "ユーモア", "長男", "養子"],
  },
  {
    name: "天貴星",
    power: 9,
    energy: "幼年",
    ageRange: "５才〜１５才",
    strengthClass: "身中",
    animal: "サル",
    group: "地球",
    tribe: "他人との競争にはいつも勝ちたい種族",
    notation: "漢字表記",
    axis: "自分軸",
    goalType: "目標志向型",
    colors: ["レッド", "ブルー", "ブラウン", "オレンジ", "パープル", "ブラック"],
    keywords: ["長男長女", "プライド", "品位", "学問", "習得", "信頼", "お洒落"],
  },
  {
    name: "天恍星",
    power: 7,
    energy: "青少年",
    ageRange: "１５才〜２０才",
    strengthClass: "身中",
    animal: "チーター",
    group: "太陽",
    tribe: "すごい人だと思われたい種族",
    notation: "カタカナ表記",
    axis: "自分軸",
    goalType: "状況対応型",
    colors: ["イエロー", "ゴールド", "グリーン", "シルバー"],
    keywords: ["自由", "タレント性", "芸術", "夢", "優雅", "恋", "離郷", "色気"],
  },
  {
    name: "天南星",
    power: 10,
    energy: "青年",
    ageRange: "２０才〜３０代半ば",
    strengthClass: "身強",
    animal: "黒ひょう",
    group: "満月",
    tribe: "いい人に見られたい種族",
    notation: "ひらがな表記",
    axis: "相手軸",
    goalType: "目標志向型",
    colors: ["ブラウン", "オレンジ", "パープル", "レッド", "ブラック", "ブルー"],
    keywords: ["批判精神", "前進力", "頑固", "負けず嫌い", "ネバリ", "反骨"],
  },
  {
    name: "天禄星",
    power: 11,
    energy: "壮年",
    ageRange: "３５才〜５０才",
    strengthClass: "身強",
    animal: "ライオン",
    group: "太陽",
    tribe: "すごい人だと思われたい種族",
    notation: "カタカナ表記",
    axis: "自分軸",
    goalType: "状況対応型",
    colors: ["イエロー", "グリーン", "ゴールド", "シルバー"],
    keywords: ["安定", "堅実", "忍耐", "説得力", "バランス", "慎重", "論理", "守備"],
  },
  {
    name: "天将星",
    power: 12,
    energy: "頭領",
    ageRange: "５０才〜６０才",
    strengthClass: "身強",
    animal: "虎",
    group: "地球",
    tribe: "他人との競争にはいつも勝ちたい種族",
    notation: "漢字表記",
    axis: "自分軸",
    goalType: "目標志向型",
    colors: ["ブラック", "レッド", "ブルー", "オレンジ", "ブラウン", "パープル"],
    keywords: ["王様", "リーダー", "エネルギッシュ", "苦境", "創始者"],
  },
  {
    name: "天堂星",
    power: 8,
    energy: "老人",
    ageRange: "６５才〜７５才",
    strengthClass: "身弱",
    animal: "たぬき",
    group: "新月",
    tribe: "人からめんどうをみてもらえる種族",
    notation: "ひらがな表記",
    axis: "相手軸",
    goalType: "状況対応型",
    colors: ["グリーン", "シルバー", "イエロー", "ゴールド"],
    keywords: ["落ち着き", "理性", "自制心", "バランス", "常識", "引っ込み思案"],
  },
  {
    name: "天胡星",
    power: 4,
    energy: "病人",
    ageRange: "-",
    strengthClass: "身弱",
    animal: "コアラ",
    group: "地球",
    tribe: "他人との競争にはいつも勝ちたい種族",
    notation: "漢字表記",
    axis: "自分軸",
    goalType: "目標志向型",
    colors: ["オレンジ", "パープル", "ブラック", "レッド", "ブルー", "ブラウン"],
    keywords: ["夢", "ロマンチスト", "音感", "直感", "感受性", "懐古趣味"],
  },
  {
    name: "天極星",
    power: 2,
    energy: "死人",
    ageRange: "-",
    strengthClass: "最身弱",
    animal: "ゾウ",
    group: "太陽",
    tribe: "すごい人だと思われたい種族",
    notation: "カタカナ表記",
    axis: "自分軸",
    goalType: "状況対応型",
    colors: ["グリーン", "シルバー", "イエロー", "ゴールド"],
    keywords: ["柔軟性", "宗教", "直感", "広がり", "純粋", "お人好し", "技術"],
  },
  {
    name: "天庫星",
    power: 5,
    energy: "入墓",
    ageRange: "-",
    strengthClass: "身弱",
    animal: "ひつじ",
    group: "満月",
    tribe: "いい人に見られたい種族",
    notation: "ひらがな表記",
    axis: "相手軸",
    goalType: "目標志向型",
    colors: ["オレンジ", "パープル", "レッド", "ブラック", "ブルー", "ブラウン"],
    keywords: ["コリ性", "探究心", "墓守り", "長男長女", "歴史", "頑固"],
  },
  {
    name: "天馳星",
    power: 1,
    energy: "あの世",
    ageRange: "-",
    strengthClass: "身弱",
    animal: "ペガサス",
    group: "太陽",
    tribe: "すごい人だと思われたい種族",
    notation: "カタカナ表記",
    axis: "自分軸",
    goalType: "状況対応型",
    colors: ["イエロー", "グリーン", "ゴールド", "シルバー"],
    keywords: ["多忙", "活動", "瞬間の大器", "スピード", "無欲"],
  },
];

export const juudaiShuseiPositionDescriptions: JuudaiShuseiPositionDescription[] = [
  {
    position: "中心",
    star: "貫索星",
    key: "中心貫索星",
    theme: "守り",
    description:
      "大変強いエネルギーを持っていて、人生もゆっくり進んでいくタイプ。要領は悪く、組織に合わせることも苦手。長距離ランナー",
  },
  {
    position: "頭",
    star: "貫索星",
    key: "頭貫索星",
    theme: "頑固",
    description:
      "権力と地位を守ろうとする力が強く、頑固になる傾向がある。執着心が強くなるのも特徴。一匹狼的要素が強まる。",
  },
  {
    position: "腹",
    star: "貫索星",
    key: "腹貫索星",
    theme: "忍耐",
    description:
      "忍耐力が大変強い性格になっていく傾向。ガミガミ言われても、ただうなずいて聞き流す。自分のペースは崩さない。",
  },
  {
    position: "右手",
    star: "貫索星",
    key: "右手貫索星",
    theme: "マイペース",
    description:
      "個人プレーで、どこまでもマイペースで進む傾向。嫌なことがあったら面倒なので黙ってしまうタイプ。黙って耐えて自分から積極的にはならない。",
  },
  {
    position: "左手",
    star: "貫索星",
    key: "左手貫索星",
    theme: "自我",
    description:
      "うまく行ってるときはワンマン。逆だと嵐が通り過ぎるのをじっと待っている。自ら攻撃はしない。最終的には自分の意志通りに物事をすすめていく。",
  },
  {
    position: "中心",
    star: "石門星",
    key: "中心石門星",
    theme: "和合性",
    description:
      "典型的な外柔内剛のリーダー型。欠点は対等意識が強いため、上下関係の厳しい縦社会では素直さや従順さに欠ける面がでる。",
  },
  {
    position: "頭",
    star: "石門星",
    key: "頭石門星",
    theme: "政治力",
    description:
      "味方だけでなく敵も仲間に入れてしまうという統率力の持ち主。仕事によっては政治力、説得力が備わりカリスマ的な存在に。じっとしているのが苦痛",
  },
  {
    position: "腹",
    star: "石門星",
    key: "腹石門星",
    theme: "大衆性",
    description:
      "ざっくばらんで庶民的な性格。人との交流が非常に盛んになっていく。気楽な井戸端会議のような雰囲気が強い。子供に対しては支配的。",
  },
  {
    position: "右手",
    star: "石門星",
    key: "右手石門星",
    theme: "社交性",
    description:
      "社交性が強まり、友達との交流が広がっていく。誰であろうと上手に付き合い、感情で評価しない。しかも相手にさとられない。",
  },
  {
    position: "左手",
    star: "石門星",
    key: "左手石門星",
    theme: "対等意識",
    description:
      "苦楽を家族全員で受け止めようとします。上限関係の意識がないので、忙しいときには親でも子供でも手伝うのは当たり前。家族を巻き込む。",
  },
  {
    position: "中心",
    star: "鳳閣星",
    key: "中心鳳閣星",
    theme: "伝達",
    description:
      "柔軟でおおらかだが、粘り強さに欠ける自然児。中康を保ち冷静で情に流されたりすることはない。執着心がなく、あきらめが早い。夢を持つといい。",
  },
  {
    position: "頭",
    star: "鳳閣星",
    key: "頭鳳閣星",
    theme: "自由",
    description:
      "長寿の星。子供みたいに世話の焼けるタイプ。自由人でわがまま。食べたいときに食べ、寝たいときに寝る。内面はかなり勝ち気なところがありせっかち。",
  },
  {
    position: "腹",
    star: "鳳閣星",
    key: "腹鳳閣星",
    theme: "自然体",
    description:
      "自然体で枠にはまらない自由な生き方を望む。生涯食べることには困らないという宿命で、怠け者になる可能性は大。なんとかなるさで楽しめる人。",
  },
  {
    position: "右手",
    star: "鳳閣星",
    key: "右手鳳閣星",
    theme: "遊び",
    description:
      "遊び心が強く出る。仕事を楽しくなるように工夫できる。感情的にはならず、常に冷静で公平。悩み相談を持ち込まれることが多い。",
  },
  {
    position: "左手",
    star: "鳳閣星",
    key: "左手鳳閣星",
    theme: "趣味",
    description:
      "趣味の広い人。やりたいとなれば朝から晩まで動き回るが、やりたくないと一日中ゴロゴロしている。心温かい人情家。自然を愛する気持ちは人一倍。",
  },
  {
    position: "中心",
    star: "調舒星",
    key: "中心調舒星",
    theme: "反骨精神",
    description:
      "鋭い感性と強烈な個性を持つ、涙もろい人情家。個性が強いので、考え方も人間関係も偏って感情に起伏が激しい。完璧主義者。負けず嫌い。",
  },
  {
    position: "頭",
    star: "調舒星",
    key: "頭調舒星",
    theme: "孤独",
    description:
      "孤独で寂しがり屋。それを素直に言えないタイプ。意地を張って強がってみせたり、自分から壁をつくる。一人できる趣味を持つと晩年寂しくない。",
  },
  {
    position: "腹",
    star: "調舒星",
    key: "腹調舒星",
    theme: "芸術性",
    description:
      "特別な才能がある。才能を早く！見つけてください。大変ユニークな創造性を発揮できる。カンの鋭さも抜群。成長するほど扱いにくいタイプ。",
  },
  {
    position: "右手",
    star: "調舒星",
    key: "右手調舒星",
    theme: "個性",
    description:
      "強い個性が全面に出てくる。行動に文句を言われると強引に突っかかっていくタイプ。協調性はない。サラリーマンには不向き。意気投合できれば◎",
  },
  {
    position: "左手",
    star: "調舒星",
    key: "左手調舒星",
    theme: "あきらめ",
    description:
      "自分の世界を持っている人は、これから花が咲き続ける時代になる。逆に平凡な生き方をしてきた人は世をすねて生きることになる。",
  },
  {
    position: "中心",
    star: "禄存星",
    key: "中心禄存星",
    theme: "自己顕示欲",
    description:
      "自己顕示欲が強く、財と愛は人を惹き付ける道具に。成功もしたが失敗もしたといった経験がないと、星の魅力は発揮されない。お節介やきは注意。",
  },
  {
    position: "頭",
    star: "禄存星",
    key: "頭禄存星",
    theme: "自意識",
    description:
      "大きな包容力を持った人。ただし力量に左右される。力量あれば気前よくお金を使い、逆は同情で人を引きつける。お人好しの目立ちたがり屋。",
  },
  {
    position: "腹",
    star: "禄存星",
    key: "腹禄存星",
    theme: "同情の愛",
    description:
      "困っている人がいると、黙って見過ごすことができないタイプ。そして愛の対象は再限りなく広がる。熱心さが度をすぎると宗教的な博愛主義者。",
  },
  {
    position: "右手",
    star: "禄存星",
    key: "右手禄存星",
    theme: "八方美人",
    description:
      "自分をアピールするために誰にでも愛を注ぐ傾向。惚れやすいタイプ。愛情に格差はない。仕事を愛する気持ちも強く金運に恵まれる。",
  },
  {
    position: "左手",
    star: "禄存星",
    key: "左手禄存星",
    theme: "奉仕の愛",
    description:
      "愛する人には一生懸命尽くすタイプ。不言実行の人。無視されることを一番嫌う。必要とされないと思ったら、次の対象物を見つける。存在を認めてもらいたい人。",
  },
  {
    position: "中心",
    star: "司禄星",
    key: "中心司禄星",
    theme: "堅実",
    description:
      "家庭的だが用心深い倹約家。今日一日を精一杯生きることがモットー。育った環境が性格の一部となる。不安からくる準備で蓄財に励む。",
  },
  {
    position: "頭",
    star: "司禄星",
    key: "頭司禄星",
    theme: "家庭人",
    description:
      "家庭第一の人。安全と安定を望む。安定した企業や公務員などを選ぶ。転職は考えない。結婚願望が強い。へそくり上手な倹約家。平凡な生き方。",
  },
  {
    position: "腹",
    star: "司禄星",
    key: "腹司禄星",
    theme: "常識人",
    description:
      "きわめて几帳面で常識をわきまえた人。誠実で頼りがいがある。無駄な出費は極力避けて、合理的に物事を進めていく。",
  },
  {
    position: "右手",
    star: "司禄星",
    key: "右手司禄星",
    theme: "けち",
    description:
      "堅実でまじめなタイプ。しまり屋さんで無駄遣いはしない。常識人で世間並みの義理だけは果たす。しっかりしているようでどこか抜けている。",
  },
  {
    position: "左手",
    star: "司禄星",
    key: "左手司禄星",
    theme: "準備",
    description:
      "堅実で質素な生活になり、子供のため、老後のため、いざというときのため蓄財する。ちょっと窮屈。集めるのが趣味で飾るのも趣味。",
  },
  {
    position: "中心",
    star: "車騎星",
    key: "中心車騎星",
    theme: "行動力",
    description:
      "一本気で逆境に強い行動派。考えるより行動。行き当たりばったりな人生。欠点は口は禍の元。異性運に恵まれにくい暗示あり。",
  },
  {
    position: "頭",
    star: "車騎星",
    key: "頭車騎星",
    theme: "間接的な攻撃",
    description:
      "支配者の戦い。同じ攻撃でも自分が直接アタックするのではなく、他人を介して戦うやり方になる。働き者で一生現役。過労になりやすい。",
  },
  {
    position: "腹",
    star: "車騎星",
    key: "腹車騎星",
    theme: "野次馬",
    description:
      "群集心理に流されやすい傾向。火事・ケンカと聞けばじっとしていられない。ミーハー要素が多分で流行にもすぐ飛びつく。つい悪い仲間に入ってしまう。",
  },
  {
    position: "右手",
    star: "車騎星",
    key: "右手車騎星",
    theme: "働き者",
    description:
      "なにしろよく動くから働き者に見える。周囲の評価も頑張り屋さん、気が利く人。でも、本人は無理に頑張っているわけではない。そそっかしい。",
  },
  {
    position: "左手",
    star: "車騎星",
    key: "左手車騎星",
    theme: "短気",
    description:
      "働き者で、よく動き回る人。のんびりお茶を飲んでいる人を見るとイライラする。商店の奥さんにピッタリ。口よりも手が早いので暴力ザダにならないように。",
  },
  {
    position: "中心",
    star: "牽牛星",
    key: "中心牽牛星",
    theme: "責任感・プライド",
    description:
      "プライドが高く、几帳面で責任感が強い常識人。反面融通がきかない、堅苦しい、面白みがないなど評価を受ける。体制から外れた生き方はできない。",
  },
  {
    position: "頭",
    star: "牽牛星",
    key: "頭牽牛星",
    theme: "地位",
    description:
      "実を捨てて名を取る人。お金よりも他人の評価を気にし、名誉、名声、地位を一番に考える。別名「名誉の花」亡くなる寸前に賞をもらいやすい。",
  },
  {
    position: "腹",
    star: "牽牛星",
    key: "腹牽牛星",
    theme: "人気・売名",
    description:
      "非常に世話好きなタイプ。この人は良い人と言われたい。人気者でいたいので大変庶民的でざっくばらんな人。存在を無視されるのが一番傷つく。",
  },
  {
    position: "右手",
    star: "牽牛星",
    key: "右手牽牛星",
    theme: "特別意識",
    description:
      "自分は他の人と違うという特別意識。表面に出ると偉ぶって見られる。とっつきにくい印象。実際はそうでもない。地位や名誉で張り切る。",
  },
  {
    position: "左手",
    star: "牽牛星",
    key: "左手牽牛星",
    theme: "品性",
    description:
      "自己中心的になる。世間体と品性を重視した理想の家庭像を抱き、家庭をはめ込もうとする。自分にも厳しく、家族にも厳しい厳格な生き方。",
  },
  {
    position: "中心",
    star: "龍高星",
    key: "中心龍高星",
    theme: "同化",
    description:
      "自由な発送と旺盛なチャレンジ精神の持ち主。自由な旅人。旅行が好き。地位・名誉には執着心がない。何を考えているかわからない人。不言実行の人。",
  },
  {
    position: "頭",
    star: "龍高星",
    key: "頭龍高星",
    theme: "改革",
    description:
      "生まれ故郷に縛られることなく、国境を超えて自由に羽ばたけるタイプ。親の助けは得られない。悲しみにも耐えられる努力家。目的があれば見事な花が咲く。",
  },
  {
    position: "腹",
    star: "龍高星",
    key: "腹龍高星",
    theme: "創造",
    description:
      "自由気ままに創作活動をやっていきたい人。やりたいことを決めなくてはならない。目的がないと放浪の人生になる。",
  },
  {
    position: "右手",
    star: "龍高星",
    key: "右手龍高星",
    theme: "忍耐",
    description:
      "サラリーマンには不向きなタイプ。自分一人でできる仕事のほうが才能を伸ばせる。ユニークな発想で、人生の目標早く決めることが開運のコツ。",
  },
  {
    position: "左手",
    star: "龍高星",
    key: "左手龍高星",
    theme: "放浪",
    description:
      "外出するのが好きな人。じっとしていられない。ノイローゼにならないためにも、趣味や習い事を持つと良い。",
  },
  {
    position: "中心",
    star: "玉堂星",
    key: "中心玉堂星",
    theme: "知恵",
    description:
      "他人と身内を区分する身内びいきタイプ。環境が性格に刷り込まれる。環境の壁を超えられない。知識を鵜呑みにする。保守的でガードが硬い。",
  },
  {
    position: "頭",
    star: "玉堂星",
    key: "頭玉堂星",
    theme: "権力の知恵",
    description:
      "純粋な学問や研究の世界で活躍する人。子供の頃はさほど成績が良くなくても、大学院生頃から頭角を表す。おだてると自分ほど頭が良い人はいないと過大評価。",
  },
  {
    position: "腹",
    star: "玉堂星",
    key: "腹玉堂星",
    theme: "母性",
    description:
      "勉強家で研究熱心なタイプ。自分だけでなく子供に対しても教育熱心な親。苦労しても一流大学・企業に入れたほうがいい。母性本能が強く子供を溺愛。",
  },
  {
    position: "右手",
    star: "玉堂星",
    key: "右手玉堂星",
    theme: "仕事の知恵",
    description:
      "本質は学問の星だが、仕事に役立つ知恵が働く。常識の枠は超えられない。中学校までは優秀だが高校以降は学力低下。知的なムードで庶民性は欠ける。",
  },
  {
    position: "左手",
    star: "玉堂星",
    key: "左手玉堂星",
    theme: "生活の知恵",
    description:
      "日常生活に役立つ知恵が働く。伝統や形式に拘るので明るく寛げる家庭にはならない。堅苦しく背広にネクタイという雰囲気。自分にも家族にも厳しい。",
  },
];

export const sanmeigakuEnergyStrengthRules: SanmeigakuEnergyStrengthRule[] = [
  ...Array.from({ length: 12 }, (_, index) => ({
    energyTotal: index + 1,
    strengthClass: "身弱" as const,
  })),
  ...Array.from({ length: 12 }, (_, index) => ({
    energyTotal: index + 13,
    strengthClass: "身中" as const,
  })),
  ...Array.from({ length: 12 }, (_, index) => ({
    energyTotal: index + 25,
    strengthClass: "身強" as const,
  })),
];

export function getJuunidaiJuseiDescription(name: string) {
  return juunidaiJuseiDescriptions.find((entry) => entry.name === name) ?? null;
}

export function getJuudaiShuseiPositionDescriptions(name: string) {
  return juudaiShuseiPositionDescriptions.filter((entry) => entry.star === name);
}

export function getEnergyStrengthRule(energyTotal: number) {
  return (
    sanmeigakuEnergyStrengthRules.find(
      (entry) => entry.energyTotal === energyTotal,
    ) ?? null
  );
}
