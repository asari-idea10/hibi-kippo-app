export type VerificationPriority = "高" | "中" | "低";

export type VerificationStatus =
  | "検証済み"
  | "サンプル検証中"
  | "外部照合待ち"
  | "設計中";

export type VerificationSourceRef = {
  label: string;
  url: string | null;
  role: string;
  sourceType:
    | "internal_master"
    | "spreadsheet"
    | "manual_almanac"
    | "official"
    | "external_site"
    | "pdf"
    | "engine";
};

export type VerificationRegistryItem = {
  id: string;
  category: string;
  target: string;
  status: VerificationStatus;
  priority: VerificationPriority;
  scope: string;
  internalRoute: string | null;
  internalApis: string[];
  sources: VerificationSourceRef[];
  samplePolicy: string;
  nextAction: string;
};

export const verificationRegistryItems: VerificationRegistryItem[] = [
  {
    id: "common-calendar-core",
    category: "共通暦",
    target: "年月日・干支・九星・旧暦・六曜",
    status: "サンプル検証中",
    priority: "高",
    scope: "1900〜2050年の基礎暦DB。全占術の土台。",
    internalRoute: "/calendar-db",
    internalApis: ["/api/calendar-day", "/api/calendar-days", "/api/calendar-db"],
    sources: [
      {
        label: "フォーチューンマイレージマスタ",
        url: null,
        role: "既存スプシDBの取り込み元",
        sourceType: "spreadsheet",
      },
      {
        label: "手元の万年暦",
        url: null,
        role: "日付・干支・旧暦の目視検算",
        sourceType: "manual_almanac",
      },
      {
        label: "こよみのページ",
        url: "https://koyomi8.com/",
        role: "日次暦注の外部照合",
        sourceType: "external_site",
      },
    ],
    samplePolicy:
      "月初、節入り前後、旧暦月切替、六十干支の境界日を固定サンプル化する。",
    nextAction: "代表日セットに明治・昭和・令和の年代別サンプルを追加する。",
  },
  {
    id: "solar-terms-zassetsu",
    category: "天文暦",
    target: "二十四節気・雑節・土用",
    status: "サンプル検証中",
    priority: "高",
    scope: "節入り、土用入り、入梅、半夏生など時刻・黄経が絡む暦。",
    internalRoute: "/adoption-status#calendar-regression-samples",
    internalApis: ["/api/solar-terms", "/api/zassetsu", "/api/doyo-checks"],
    sources: [
      {
        label: "国立天文台 暦計算室",
        url: "https://eco.mtk.nao.ac.jp/koyomi/",
        role: "二十四節気・天文系の公的検算",
        sourceType: "official",
      },
      {
        label: "こよみのページ 土用と間日",
        url: "https://koyomi8.com/sub/doyou.html",
        role: "土用・間日の外部正本候補",
        sourceType: "external_site",
      },
      {
        label: "高精度計算サイト",
        url: "https://keisan.site/",
        role: "太陽黄経が絡む雑節の照合候補",
        sourceType: "external_site",
      },
    ],
    samplePolicy:
      "立春・立夏・立秋・立冬、土用入り、土用明け、間日、入梅、半夏生を固定する。",
    nextAction: "時刻差分が出る項目はJST時刻つきで検証ログを残す。",
  },
  {
    id: "calendar-notes",
    category: "暦注",
    target: "十二直・二十八宿・二十七宿・選日",
    status: "サンプル検証中",
    priority: "高",
    scope: "カレンダー表示と用語辞典の中心になる日次暦注。",
    internalRoute: "/calendar-notes",
    internalApis: ["/api/calendar-notes", "/api/calendar-note-occurrences"],
    sources: [
      {
        label: "こよみのページ 暦注",
        url: "https://koyomi8.com/sub/rekicyuu.html",
        role: "十二直・宿曜・選日の外部正本候補",
        sourceType: "external_site",
      },
      {
        label: "暦注.com",
        url: "https://rekichu.com/",
        role: "日別の暦注下段・選日の目視照合",
        sourceType: "external_site",
      },
      {
        label: "手元の万年暦",
        url: null,
        role: "紙面での抜き打ち照合",
        sourceType: "manual_almanac",
      },
    ],
    samplePolicy:
      "三隣亡、一粒万倍日、天赦日、不成就日、受死日など混在日を優先して固定する。",
    nextAction: "複合表記の日を分解し、辞典リンクと検証ログを一致させる。",
  },
  {
    id: "kyusei-direction-calendar",
    category: "九星気学",
    target: "年盤・月盤・日盤・時盤・三大凶方位",
    status: "サンプル検証中",
    priority: "高",
    scope: "九星方位カレンダー、時盤、同行者判定、方位一致判定。",
    internalRoute: "/purpose-calendar",
    internalApis: [
      "/api/good-fortune-directions",
      "/api/hour-board",
      "/api/direction-warning-checks",
    ],
    sources: [
      {
        label: "フォーチューンマイレージマスタ",
        url: null,
        role: "年盤・月盤・日盤・吉方判定の基礎",
        sourceType: "spreadsheet",
      },
      {
        label: "八雲院",
        url: "https://yakumoin.info/",
        role: "UI・機能粒度・九星表示の外部ベンチマーク",
        sourceType: "external_site",
      },
      {
        label: "手元の万年暦",
        url: null,
        role: "盤・凶方位・節入り境界の検算",
        sourceType: "manual_almanac",
      },
    ],
    samplePolicy:
      "節入り前後、三盤一致、四盤一致、同行者あり、土用殺ありの日を固定する。",
    nextAction: "八雲院・万年暦と代表日を照合し、差分理由を記録する。",
  },
  {
    id: "direction-deities",
    category: "方位神",
    target: "天道・太歳・歳破・大将軍・小児殺",
    status: "外部照合待ち",
    priority: "高",
    scope: "24山リングと方位神盤の表示。年神・月神・日神の採用範囲。",
    internalRoute: "/purpose-calendar",
    internalApis: ["/api/direction-deities", "/api/child-satsu"],
    sources: [
      {
        label: "天道マスター スプレッドシート",
        url: null,
        role: "三合局・天道方位の採用元",
        sourceType: "spreadsheet",
      },
      {
        label: "高島易断系資料",
        url: null,
        role: "24山と方位神の概念整理",
        sourceType: "manual_almanac",
      },
      {
        label: "手元の万年暦",
        url: null,
        role: "年神・月神・日神の目視検算",
        sourceType: "manual_almanac",
      },
    ],
    samplePolicy:
      "天道該当日、天道なしの日、三合局ごとの代表日、凶方位と重なる日を固定する。",
    nextAction: "年神・月神・日神の採用ステータスを分け、参照資料ごとに照合する。",
  },
  {
    id: "zokan-sanmeigaku",
    category: "算命学",
    target: "蔵干・陰占・流派別司令",
    status: "サンプル検証中",
    priority: "高",
    scope: "算命学ページの陰占入口。年支・月支・日支の蔵干採用方式と流派差。",
    internalRoute: "/sanmeigaku#zokan-verification",
    internalApis: ["/api/calendar-day", "/api/zokan-comparisons"],
    sources: [
      {
        label: "丑子子.pdf",
        url: null,
        role: "PDF十二支月令 v0 の転記元",
        sourceType: "pdf",
      },
      {
        label: "フォーチューンマイレージマスタ",
        url: null,
        role: "既存スプシ蔵干との差分監査",
        sourceType: "spreadsheet",
      },
      {
        label: "算命のアプリ フリー版",
        url: "https://sanmeiapp.net/sanmei/free/",
        role: "陰占・陽占の外部照合",
        sourceType: "external_site",
      },
      {
        label: "算命学Stock",
        url: "https://sanmei-stock.com/#free-uranai_output-area",
        role: "高尾学館方式の陰占・天中殺・学習UXの外部照合",
        sourceType: "external_site",
      },
      {
        label: "suimei.com 四柱推命精密運命式",
        url: "https://suimei.com/suimei-p.html",
        role: "阿部泰山式、淵海子平、三命通会、太陽黄経按分の流派別比較",
        sourceType: "external_site",
      },
      {
        label: "手元の万年暦・算命学資料",
        url: null,
        role: "蔵干・司令の目視検算",
        sourceType: "manual_almanac",
      },
    ],
    samplePolicy:
      "1976/3/19を初回サンプルにし、節入り直後、余気/中気/本気の切替日、月支ごとの代表日を追加する。",
    nextAction:
      "算命学Stockの陽占・数理法を追加照合しつつ、suimei.comで蔵干算出法を切り替えて年・月・日支の司令蔵干と陽占差分を手入力で固定する。",
  },
  {
    id: "nacchin-kuubou",
    category: "干支派生",
    target: "納音・空亡",
    status: "サンプル検証中",
    priority: "中",
    scope: "干支辞典、算命学、九星方位カレンダーの日セルリンク。",
    internalRoute: "/calendar-notes",
    internalApis: ["/api/calendar-day"],
    sources: [
      {
        label: "フォーチューンマイレージマスタ",
        url: null,
        role: "納音・空亡マスターの取り込み元",
        sourceType: "spreadsheet",
      },
      {
        label: "手元の万年暦",
        url: null,
        role: "干支別の納音・空亡照合",
        sourceType: "manual_almanac",
      },
    ],
    samplePolicy:
      "甲子から癸亥までの六十干支を数件ずつ固定し、空亡切替を確認する。",
    nextAction: "辞典本文と逆引きテーブルを増補する。",
  },
];

export function getVerificationRegistryItems() {
  return verificationRegistryItems;
}

export function getVerificationRegistrySummary() {
  const total = verificationRegistryItems.length;

  return {
    total,
    highPriority: verificationRegistryItems.filter(
      (item) => item.priority === "高",
    ).length,
    externalPending: verificationRegistryItems.filter(
      (item) => item.status === "外部照合待ち",
    ).length,
    sourceCount: new Set(
      verificationRegistryItems.flatMap((item) =>
        item.sources.map((source) => source.label),
      ),
    ).size,
  };
}
