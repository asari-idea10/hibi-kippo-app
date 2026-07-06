export type SanmeigakuMasterStatus =
  | "adopted"
  | "extracting"
  | "designing"
  | "pending";

export type SanmeigakuMasterPriority = "高" | "中" | "低";

export type SanmeigakuMasterInventoryItem = {
  id: string;
  category: string;
  name: string;
  status: SanmeigakuMasterStatus;
  statusLabel: string;
  priority: SanmeigakuMasterPriority;
  sourceSheet: string;
  sourceRange: string;
  outputRange?: string;
  role: string;
  connectionTarget: string;
  nextAction: string;
};

export const sanmeigakuMasterSpreadsheet = {
  title: "★フォーチューンマイレージvol.05",
  url: "https://docs.google.com/spreadsheets/d/128NYUsqnlhEuzYsBPQl6zhtG8Mhl8HrWJco0O88jUbU/edit?gid=1833310362#gid=1833310362",
};

export const sanmeigakuMasterStatusTone: Record<
  SanmeigakuMasterStatus,
  string
> = {
  adopted: "採用済み",
  extracting: "抽出中",
  designing: "設計中",
  pending: "後続",
};

export const sanmeigakuMasterInventoryItems: SanmeigakuMasterInventoryItem[] = [
  {
    id: "inzen-pillars",
    category: "陰占",
    name: "年柱・月柱・日柱",
    status: "adopted",
    statusLabel: "採用済み",
    priority: "高",
    sourceSheet: "算命計算",
    sourceRange: "共通暦DB / 年月日干支",
    outputRange: "算命結果!生年・生月・生日",
    role: "算命学ページの入口。干支、納音、空亡、蔵干を束ねる土台。",
    connectionTarget: "/sanmeigaku 陰占表",
    nextAction: "出生時刻を使う時柱は真太陽時・出生地補正後に接続する。",
  },
  {
    id: "zokan-classical-pdf",
    category: "陰占",
    name: "蔵干・司令",
    status: "adopted",
    statusLabel: "PDF十二支月令 v0 採用",
    priority: "高",
    sourceSheet: "丑子子.pdf / 算命計算",
    sourceRange: "十二支 各月の分析",
    outputRange: "算命結果!天干・地支・蔵干",
    role: "年支・月支・日支に同じ節入り日数ルールを適用して司令を読む。",
    connectionTarget: "/sanmeigaku 蔵干マスター",
    nextAction: "流派差のあるスプシ方式は差分検証用に保持する。",
  },
  {
    id: "juudai-shusei",
    category: "陽占",
    name: "十大主星",
    status: "extracting",
    statusLabel: "抽出対象",
    priority: "高",
    sourceSheet: "算命計算",
    sourceRange: "A1:AV1131 内の星意味・出力ルール",
    outputRange: "算命結果!主星・主星概要・良いところ・悪いところ",
    role: "日干を基準に、天干・蔵干との関係から人体星図の主星を出す。",
    connectionTarget: "/sanmeigaku 陽占カード / 将来の辞典ページ",
    nextAction: "貫索星から玉堂星までの意味マスターと算出ルールを分離する。",
  },
  {
    id: "jintai-seizu",
    category: "陽占",
    name: "人体星図",
    status: "designing",
    statusLabel: "設計中",
    priority: "高",
    sourceSheet: "算命計算",
    sourceRange: "陽占出力ロジック / 算命結果 横持ち出力",
    outputRange: "算命結果!陽占〜初年期・中年期・老年期",
    role: "中心・東西南北の星を、陰占のどの要素から出したか検証できる形で表示する。",
    connectionTarget: "/sanmeigaku 陽占 v0",
    nextAction: "算命結果の既存出力をゴールデンサンプル化し、配置差分を確認する。",
  },
  {
    id: "juunidai-juusei",
    category: "陽占",
    name: "十二大従星・エネルギー値",
    status: "extracting",
    statusLabel: "抽出対象",
    priority: "高",
    sourceSheet: "算命計算",
    sourceRange: "A1:AV80",
    outputRange: "算命結果!初年・中年・老年 / エネルギーチャート",
    role: "十二大従星とエネルギー値を人生段階・エネルギーチャートに接続する。",
    connectionTarget: "/sanmeigaku 十二大従星カード",
    nextAction: "干支別エネルギー値の表をTypeScriptマスター化する。",
  },
  {
    id: "isouhou",
    category: "構造判定",
    name: "位相法・合法散法",
    status: "extracting",
    statusLabel: "抽出対象",
    priority: "中",
    sourceSheet: "算命計算",
    sourceRange: "A930:AV1131",
    outputRange: "算命結果!位相法1〜20 / 位相法グラフ",
    role: "支合、三合、対沖、害、破、刑などの関係を命式内の構造として読む。",
    connectionTarget: "/sanmeigaku 構造メモ",
    nextAction: "まず日支・月支・年支の組み合わせだけを固定サンプルで検証する。",
  },
  {
    id: "tenchusatsu-special",
    category: "特殊判定",
    name: "天中殺・宿命天中殺",
    status: "extracting",
    statusLabel: "抽出対象",
    priority: "高",
    sourceSheet: "算命計算",
    sourceRange: "A800:AV930",
    outputRange: "算命結果!生年中殺・生月中殺・生日中殺・日座中殺",
    role: "空亡と宿命上の中殺を分け、命式の注意点として表示する。",
    connectionTarget: "/sanmeigaku 特殊星 / 用語辞典",
    nextAction: "通常の空亡表示と宿命天中殺の判定を混ぜずに分ける。",
  },
  {
    id: "sangyou-ijou-kanshi",
    category: "特殊判定",
    name: "三業干支・異常干支",
    status: "extracting",
    statusLabel: "抽出対象",
    priority: "中",
    sourceSheet: "算命計算",
    sourceRange: "A800:AV930",
    outputRange: "算命結果!三業干支・通常異常干支・暗合異常干支",
    role: "該当干支がある場合だけ、命式の特記事項として控えめに表示する。",
    connectionTarget: "/sanmeigaku 特殊判定",
    nextAction: "本文が強くなりすぎないよう、まずは該当有無と原文参照を優先する。",
  },
  {
    id: "daiun-nenun",
    category: "運勢展開",
    name: "大運・年運・月運・日運",
    status: "pending",
    statusLabel: "後続",
    priority: "中",
    sourceSheet: "算命計算 / 算命結果",
    sourceRange: "大運年齢表 / 生年・生月・生日・大運・年運・月運・日運",
    role: "命式固定情報の次に、時期運として展開する領域。",
    connectionTarget: "将来の算命学詳細ページ",
    nextAction: "先に人体星図と十二大従星を安定させてから接続する。",
  },
  {
    id: "shikihou-life",
    category: "解釈補助",
    name: "四季法・生き方分類",
    status: "pending",
    statusLabel: "後続",
    priority: "低",
    sourceSheet: "算命計算",
    sourceRange: "A930:AV1131",
    outputRange: "算命結果!生き方 / 宇宙盤説明",
    role: "命式の読み物化、AI向けプロンプト、将来の本文生成に使う補助マスター。",
    connectionTarget: "AI向け出力 / 読み物ページ",
    nextAction: "陽占の主要計算が固まったあと、本文品質管理へ回す。",
  },
];

export function getSanmeigakuMasterInventoryItems() {
  return sanmeigakuMasterInventoryItems;
}

export function getSanmeigakuMasterInventorySummary() {
  return {
    total: sanmeigakuMasterInventoryItems.length,
    adopted: sanmeigakuMasterInventoryItems.filter(
      (item) => item.status === "adopted",
    ).length,
    extracting: sanmeigakuMasterInventoryItems.filter(
      (item) => item.status === "extracting",
    ).length,
    designing: sanmeigakuMasterInventoryItems.filter(
      (item) => item.status === "designing",
    ).length,
    pending: sanmeigakuMasterInventoryItems.filter(
      (item) => item.status === "pending",
    ).length,
  };
}
