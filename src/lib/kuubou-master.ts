export type KuubouMasterEntry = {
  name: string;
  alternateName: string;
  blessed: string;
  missing: string;
  seeks: string;
  feature: string;
  summary: string;
  sourceStatus: string;
  verificationStatus: string;
};

const kuubouMasterEntries: KuubouMasterEntry[] = [
  {
    name: "子丑",
    alternateName: "天中殺",
    blessed: "初代運・目下・部下",
    missing: "父親・目上（意思が通じにくい）",
    seeks: "子ども・目下・部下",
    feature:
      "晩年運。歳を重ねていくほど生きやすい。人情家で世話好き、自分で人生を開拓していく。",
    summary:
      "初代運や目下との縁を活かしながら、自分で人生を開いていく空亡です。",
    sourceStatus: "spreadsheet:算命計算!A875:G882",
    verificationStatus: "pending_text_review",
  },
  {
    name: "寅卯",
    alternateName: "天中殺",
    blessed: "2・3代目運・補佐役",
    missing: "母親・友達・兄弟（波長が違う方が自分らしさを出せる）",
    seeks: "配偶者・家庭・補佐役",
    feature:
      "忠実に受け継ぎ、受け継がせる。結婚運に恵まれる。本来の行動力はダイナミック。",
    summary:
      "受け継ぐ力と補佐役としての安定感を持ち、関係性の中で伸びる空亡です。",
    sourceStatus: "spreadsheet:算命計算!A875:G882",
    verificationStatus: "pending_text_review",
  },
  {
    name: "辰巳",
    alternateName: "天中殺",
    blessed: "独立運・現実味",
    missing: "精神的なもの（言葉や気持ちを汲み取るのが荒い）",
    seeks: "現実的なもの、経済運",
    feature:
      "現実主義、経験主義。言葉での表現が苦手。自分が体を張って得た体験の中から人生に必要なものを知る。",
    summary:
      "体験と現実感を通して自分の道を切り開く、独立性の強い空亡です。",
    sourceStatus: "spreadsheet:算命計算!A875:G882",
    verificationStatus: "pending_text_review",
  },
  {
    name: "午未",
    alternateName: "天中殺",
    blessed: "末代運・親・上司",
    missing: "子ども・目下・部下（理屈っぽいので目下より目上に好かれる）",
    seeks: "父親・目上・上司",
    feature:
      "冷静で理論派。まとめ役を受け持つ。目上に好かれるので若年運。目上がいるうちに人生を立ち上げておく。",
    summary:
      "目上の引き立てや理論性を活かし、早い段階で人生の土台を整える空亡です。",
    sourceStatus: "spreadsheet:算命計算!A875:G882",
    verificationStatus: "pending_text_review",
  },
  {
    name: "申酉",
    alternateName: "天中殺",
    blessed: "2・3代目運・社会運・友人関係",
    missing: "配偶者・家庭・補佐役（家庭での休息が少ない）",
    seeks: "母親・友人・兄弟",
    feature:
      "受け継いだものをスケールアップさせる。事業家運。フットワークが軽く何かと動いている。女性は共働きに向く。",
    summary:
      "社会運と機動力を活かし、受け継いだものを広げていく空亡です。",
    sourceStatus: "spreadsheet:算命計算!A875:G882",
    verificationStatus: "pending_text_review",
  },
  {
    name: "戌亥",
    alternateName: "天中殺",
    blessed: "独立運・精神性",
    missing: "現実性",
    seeks: "心の支え、理想",
    feature:
      "理想主義の哲学者。夢追いによって現実を知る。自分の心は揺れやすく、お人好し。",
    summary:
      "精神性と理想を軸にしながら、現実との接点を探していく空亡です。",
    sourceStatus: "spreadsheet:算命計算!A875:G882",
    verificationStatus: "pending_text_review",
  },
];

export function getKuubouMasterEntries() {
  return kuubouMasterEntries;
}

export function getKuubouMasterEntry(name: string) {
  return kuubouMasterEntries.find((entry) => entry.name === name) ?? null;
}
