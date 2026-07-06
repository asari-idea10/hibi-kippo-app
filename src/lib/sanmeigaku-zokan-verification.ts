export type ZokanVerificationStatus =
  | "adopted_current"
  | "partially_matched"
  | "external_pending"
  | "not_started";

export type ZokanVerificationMethodId =
  | "hibi_kippo_standard"
  | "sanmei_app_free"
  | "sanmei_stock_takao"
  | "suimei_abe_taizan"
  | "suimei_enkai_shihei"
  | "suimei_sanmei_tsukai"
  | "suimei_solar_longitude";

export type ZokanVerificationSample = {
  id: string;
  birthDate: string;
  gender: "male" | "female" | "unknown";
  label: string;
  purpose: string;
  expectedPillars: {
    year: string;
    month: string;
    day: string;
  };
  currentApp: {
    daysFromSetsuiri: number;
    yearZokan: string[];
    monthZokan: string[];
    dayZokan: string[];
    activeStems: {
      year: string;
      month: string;
      day: string;
    };
    yosen: {
      head: string;
      leftHand: string;
      center: string;
      rightHand: string;
      belly: string;
      early: string;
      middle: string;
      late: string;
    };
  };
  references: ZokanMethodComparison[];
};

export type ZokanMethodComparison = {
  methodId: ZokanVerificationMethodId;
  methodName: string;
  sourceName: string;
  sourceUrl?: string;
  status: ZokanVerificationStatus;
  statusLabel: string;
  zokanPolicy: string;
  yearActiveStem?: string;
  monthActiveStem?: string;
  dayActiveStem?: string;
  yosenMatch?: "一致" | "一部一致" | "未確認" | "不一致";
  note: string;
  nextAction: string;
};

export const zokanVerificationSources = [
  {
    name: "算命のアプリ フリー版",
    url: "https://sanmeiapp.net/sanmei/free/",
    role: "人体星図と陰占表示の外部照合。流派選択は不可。",
  },
  {
    name: "算命学Stock",
    url: "https://sanmei-stock.com/#free-uranai_output-area",
    role: "高尾学館方式と明記された陰占・天中殺・学習UXの外部照合。",
  },
  {
    name: "四柱推命 精密運命式 suimei.com",
    url: "https://suimei.com/suimei-p.html",
    role: "阿部泰山式、淵海子平、三命通会、太陽黄経按分などの流派別蔵干照合。",
  },
  {
    name: "丑子子.pdf / PDF十二支月令",
    role: "日々吉方標準の蔵干・司令候補。現行アプリの採用マスター。",
  },
];

export const zokanVerificationSamples: ZokanVerificationSample[] = [
  {
    id: "sample-1976-03-19-male",
    birthDate: "1976-03-19",
    gender: "male",
    label: "1976/3/19 男性",
    purpose:
      "ユーザー本人サンプル。外部サイトの人体星図と、現行アプリの蔵干・陽占配置を照合する初回固定サンプル。",
    expectedPillars: {
      year: "丙辰",
      month: "辛卯",
      day: "庚午",
    },
    currentApp: {
      daysFromSetsuiri: 15,
      yearZokan: ["戊", "癸", "乙"],
      monthZokan: ["乙", "乙", "乙"],
      dayZokan: ["己", "己", "丙"],
      activeStems: {
        year: "戊",
        month: "乙",
        day: "己",
      },
      yosen: {
        head: "車騎星",
        leftHand: "玉堂星",
        center: "司禄星",
        rightHand: "龍高星",
        belly: "石門星",
        early: "天印星",
        middle: "天報星",
        late: "天恍星",
      },
    },
    references: [
      {
        methodId: "hibi_kippo_standard",
        methodName: "日々吉方標準",
        sourceName: "PDF十二支月令 v0 / 共通暦DB",
        status: "adopted_current",
        statusLabel: "現行採用",
        zokanPolicy:
          "年支・月支・日支へ同じ節入り日数ルールを適用し、司令蔵干を陽占に使う。",
        yearActiveStem: "戊",
        monthActiveStem: "乙",
        dayActiveStem: "己",
        yosenMatch: "一部一致",
        note: "外部サイトと干支は一致。人体星図は左右配置を修正済み。陰占の蔵干表示順は引き続き要検証。",
        nextAction:
          "陰占表示を、司令蔵干と蔵干一覧に分けて表示し、外部サイトとの差分を見える化する。",
      },
      {
        methodId: "sanmei_app_free",
        methodName: "算命のアプリ表示",
        sourceName: "算命のアプリ フリー版",
        sourceUrl: "https://sanmeiapp.net/sanmei/free/",
        status: "partially_matched",
        statusLabel: "一部確認",
        zokanPolicy:
          "サイト側の採用流派は未明示。出力結果を照合値として扱う。",
        yearActiveStem: "戊",
        monthActiveStem: "乙",
        dayActiveStem: "己",
        yosenMatch: "一致",
        note: "1976/3/19の人体星図は、頭 車騎、左手 玉堂、中心 司禄、右手 龍高、腹 石門の並びを目視確認。",
        nextAction:
          "陰占欄に表示される蔵干段の順序と省略ルールを、スクリーンショット付きで固定する。",
      },
      {
        methodId: "sanmei_stock_takao",
        methodName: "算命学Stock（高尾学館方式）",
        sourceName: "算命学Stock",
        sourceUrl: "https://sanmei-stock.com/#free-uranai_output-area",
        status: "partially_matched",
        statusLabel: "高尾学館式 一部確認",
        zokanPolicy:
          "画面に高尾学館方式と明記。陰占の蔵干段と天中殺表示を外部照合値として扱う。",
        yearActiveStem: "戊",
        monthActiveStem: "乙",
        dayActiveStem: "己",
        yosenMatch: "未確認",
        note: "1976/3/19は日柱 庚午、月柱 辛卯、年柱 丙辰、戌亥天中殺が一致。蔵干表示は日 己/丁、月 乙、年 戊/乙/癸として目視確認。",
        nextAction:
          "同じ日付で陽占、数理法、位相法の出力も確認し、Stock系の固定サンプルとして分離する。",
      },
      {
        methodId: "suimei_abe_taizan",
        methodName: "阿部泰山式",
        sourceName: "suimei.com 精密運命式",
        sourceUrl: "https://suimei.com/suimei-p.html",
        status: "external_pending",
        statusLabel: "外部照合待ち",
        zokanPolicy:
          "suimei.com の蔵干算出法で阿部泰山式を選択し、按分設定も併記する。",
        yosenMatch: "未確認",
        note: "流派別比較の最初の候補。算命学側の実用採用候補として検証する。",
        nextAction:
          "1976/3/19を入力し、年・月・日支の蔵干と陽占結果を手入力で転記する。",
      },
      {
        methodId: "suimei_enkai_shihei",
        methodName: "淵海子平",
        sourceName: "suimei.com 精密運命式",
        sourceUrl: "https://suimei.com/suimei-p.html",
        status: "external_pending",
        statusLabel: "外部照合待ち",
        zokanPolicy:
          "suimei.com の蔵干算出法で淵海子平を選択し、按分設定も併記する。",
        yosenMatch: "未確認",
        note: "四柱推命系の蔵干差分を見るための比較枠。",
        nextAction:
          "阿部泰山式と同じサンプルで、蔵干差分だけを先に確認する。",
      },
      {
        methodId: "suimei_sanmei_tsukai",
        methodName: "三命通会",
        sourceName: "suimei.com 精密運命式",
        sourceUrl: "https://suimei.com/suimei-p.html",
        status: "external_pending",
        statusLabel: "外部照合待ち",
        zokanPolicy:
          "suimei.com の蔵干算出法で三命通会を選択し、按分設定も併記する。",
        yosenMatch: "未確認",
        note: "古典系の採用候補として比較。日々吉方標準との差を明示する。",
        nextAction:
          "年支・月支・日支の司令が変わるか、1976/3/19で確認する。",
      },
      {
        methodId: "suimei_solar_longitude",
        methodName: "太陽黄経による角度按分",
        sourceName: "suimei.com 精密運命式",
        sourceUrl: "https://suimei.com/suimei-p.html",
        status: "external_pending",
        statusLabel: "外部照合待ち",
        zokanPolicy:
          "節入り日数ではなく、太陽黄経の角度按分で蔵干を決める。",
        yosenMatch: "未確認",
        note: "天文計算寄りの検証枠。節入り境界付近のサンプルで差が出やすい可能性がある。",
        nextAction:
          "1976/3/19のあと、節入り直後・直前のサンプルも追加して差分を見る。",
      },
    ],
  },
];

export function getZokanVerificationSamples() {
  return zokanVerificationSamples;
}

export function getZokanVerificationSummary() {
  const comparisons = zokanVerificationSamples.flatMap(
    (sample) => sample.references,
  );

  return {
    sampleCount: zokanVerificationSamples.length,
    comparisonCount: comparisons.length,
    adoptedCurrent: comparisons.filter(
      (comparison) => comparison.status === "adopted_current",
    ).length,
    partiallyMatched: comparisons.filter(
      (comparison) => comparison.status === "partially_matched",
    ).length,
    externalPending: comparisons.filter(
      (comparison) => comparison.status === "external_pending",
    ).length,
    notStarted: comparisons.filter(
      (comparison) => comparison.status === "not_started",
    ).length,
  };
}
