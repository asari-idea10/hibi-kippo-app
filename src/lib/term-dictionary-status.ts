export type TermDictionarySeoStatus =
  | "未着手"
  | "下書き"
  | "公開候補"
  | "公開済み";
export type TermDictionaryImplementationStatus =
  | "正式採用"
  | "仮実装"
  | "検証中"
  | "未接続";
export type TermDictionaryVerificationStatus =
  | "検証済み"
  | "サンプル確認済み"
  | "要検証"
  | "未検証";
export type TermDictionaryTextStatus =
  | "本文あり"
  | "本文未整備"
  | "逆引き中心"
  | "辞典未整備";
export type TermDictionaryTextQualityStage =
  | "逆引き"
  | "基本説明"
  | "読める本文"
  | "記事下書き"
  | "公開品質";
export type TermDictionaryEditorialPriority = "高" | "中" | "低";

export const termDictionarySeoStatuses: TermDictionarySeoStatus[] = [
  "未着手",
  "下書き",
  "公開候補",
  "公開済み",
];

export const termDictionaryImplementationStatuses: TermDictionaryImplementationStatus[] = [
  "正式採用",
  "仮実装",
  "検証中",
  "未接続",
];

export const termDictionaryVerificationStatuses: TermDictionaryVerificationStatus[] = [
  "検証済み",
  "サンプル確認済み",
  "要検証",
  "未検証",
];

export const termDictionaryTextStatuses: TermDictionaryTextStatus[] = [
  "本文あり",
  "本文未整備",
  "逆引き中心",
  "辞典未整備",
];

export const termDictionaryTextQualityStages: TermDictionaryTextQualityStage[] = [
  "逆引き",
  "基本説明",
  "読める本文",
  "記事下書き",
  "公開品質",
];

export type TermDictionaryStatusRow = {
  id: string;
  category: string;
  routeLabel: string;
  routeExample?: string;
  calendarLinkStatus: string;
  masterStatus: string;
  implementationStatus: TermDictionaryImplementationStatus;
  verificationStatus: TermDictionaryVerificationStatus;
  textStatus: TermDictionaryTextStatus;
  textQualityStage: TermDictionaryTextQualityStage;
  editorialPriority: TermDictionaryEditorialPriority;
  seoArticleStatus: TermDictionarySeoStatus;
  articleSeed: string;
  source: string;
  nextAction: string;
};

export const termDictionaryStatusRows: TermDictionaryStatusRow[] = [
  {
    id: "rokuyo",
    category: "六曜",
    routeLabel: "六曜 / 大安",
    routeExample: "/calendar-notes/rokuyo/大安",
    calendarLinkStatus: "接続済み",
    masterStatus: "基本説明あり",
    implementationStatus: "正式採用",
    verificationStatus: "サンプル確認済み",
    textStatus: "本文あり",
    textQualityStage: "基本説明",
    editorialPriority: "中",
    seoArticleStatus: "未着手",
    articleSeed: "六曜それぞれの時間帯・向く行動・避けたい使い方",
    source: "共通暦DB / 六曜表示",
    nextAction: "各六曜の読み物化",
  },
  {
    id: "junichoku",
    category: "十二直",
    routeLabel: "十二直 / 成",
    routeExample: "/calendar-notes/junichoku/成",
    calendarLinkStatus: "接続済み",
    masterStatus: "基本説明あり",
    implementationStatus: "正式採用",
    verificationStatus: "サンプル確認済み",
    textStatus: "本文あり",
    textQualityStage: "基本説明",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "建・除・満など十二直ごとの行動処方箋",
    source: "十二直マスター",
    nextAction: "吉凶だけでなく行動例を補強",
  },
  {
    id: "nijuhachishuku",
    category: "二十八宿",
    routeLabel: "二十八宿 / 牛",
    routeExample: "/calendar-notes/nijuhachishuku/牛",
    calendarLinkStatus: "接続済み",
    masterStatus: "基本説明あり",
    implementationStatus: "正式採用",
    verificationStatus: "サンプル確認済み",
    textStatus: "本文あり",
    textQualityStage: "基本説明",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "二十八宿ごとの得意行動・注意行動・神社参拝との相性",
    source: "二十八宿マスター",
    nextAction: "宿ごとの得意行動を補強",
  },
  {
    id: "selected-days",
    category: "選日",
    routeLabel: "選日 / 天赦日",
    routeExample: "/calendar-notes/selected-days/天赦日",
    calendarLinkStatus: "接続済み",
    masterStatus: "採用ステータス管理中",
    implementationStatus: "検証中",
    verificationStatus: "要検証",
    textStatus: "本文未整備",
    textQualityStage: "基本説明",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "天赦日・一粒万倍日・三隣亡などを行動タグへ翻訳",
    source: "選日採用マスター / 共通暦DB",
    nextAction: "混合タグの分割と本文精査",
  },
  {
    id: "kyusei",
    category: "九星",
    routeLabel: "九星 / 一白水星",
    routeExample: "/calendar-notes/kyusei/一白水星",
    calendarLinkStatus: "接続済み",
    masterStatus: "星マスター接続済み",
    implementationStatus: "正式採用",
    verificationStatus: "サンプル確認済み",
    textStatus: "本文あり",
    textQualityStage: "読める本文",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "本命星・回座星・方位の象意を分けた九星基礎記事",
    source: "九星マスター",
    nextAction: "本命星・回座星の説明を分離",
  },
  {
    id: "nacchin",
    category: "納音",
    routeLabel: "納音 / 天河水性",
    routeExample: "/calendar-notes/nacchin/天河水性",
    calendarLinkStatus: "接続済み",
    masterStatus: "納音本文マスター接続済み",
    implementationStatus: "仮実装",
    verificationStatus: "要検証",
    textStatus: "本文あり",
    textQualityStage: "読める本文",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "30納音の象意・性格・日々吉方での使い方",
    source: "納音シート / 六十干支マスター",
    nextAction: "本文の原典精査とSEO記事化",
  },
  {
    id: "kuubou",
    category: "空亡",
    routeLabel: "空亡 / 申酉",
    routeExample: "/calendar-notes/kuubou/申酉",
    calendarLinkStatus: "接続済み",
    masterStatus: "算命計算シート接続済み",
    implementationStatus: "仮実装",
    verificationStatus: "サンプル確認済み",
    textStatus: "本文あり",
    textQualityStage: "読める本文",
    editorialPriority: "中",
    seoArticleStatus: "未着手",
    articleSeed: "空亡と天中殺の違い、欠ける場所と求めるもの",
    source: "算命計算 A875:G882",
    nextAction: "天中殺としての読み物を補強",
  },
  {
    id: "direction-deities",
    category: "方位神",
    routeLabel: "方位神 / 天道",
    routeExample: "/calendar-notes/direction-deities/天道",
    calendarLinkStatus: "接続済み",
    masterStatus: "方位神採用マスター接続済み",
    implementationStatus: "検証中",
    verificationStatus: "要検証",
    textStatus: "本文あり",
    textQualityStage: "基本説明",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "太歳・歳破・大将軍・金神など方位神の採用方針",
    source: "方位神API / 天道マスター",
    nextAction: "各方位神の根拠表と本文を精査",
  },
  {
    id: "tendo",
    category: "天道",
    routeLabel: "天道 / 三合局",
    routeExample: "/calendar-notes/direction-deities/天道",
    calendarLinkStatus: "方位神盤・日セルに表示中",
    masterStatus: "天道マスター接続済み",
    implementationStatus: "検証中",
    verificationStatus: "要検証",
    textStatus: "本文未整備",
    textQualityStage: "基本説明",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "天道、三合局、方位の後押しを日々の整え方へ翻訳",
    source: "天道マスター / 日運シート照合",
    nextAction: "月天道・日天道の採用範囲と三合局説明を確定",
  },
  {
    id: "twenty-four-mountains",
    category: "24山",
    routeLabel: "24山辞典",
    calendarLinkStatus: "方位神盤で表示中",
    masterStatus: "v0検証中",
    implementationStatus: "検証中",
    verificationStatus: "要検証",
    textStatus: "辞典未整備",
    textQualityStage: "逆引き",
    editorialPriority: "高",
    seoArticleStatus: "未着手",
    articleSeed: "八方位を24山へ分ける理由、十干十二支と方位角",
    source: "24山リング / 方位神盤",
    nextAction: "十干十二支と方位角の説明を作成",
  },
  {
    id: "zassetsu",
    category: "雑節",
    routeLabel: "雑節 / 土用",
    routeExample: "/calendar-notes/selected-days/土用入り",
    calendarLinkStatus: "暦注リンクへ仮接続",
    masterStatus: "共通暦DB接続済み",
    implementationStatus: "仮実装",
    verificationStatus: "要検証",
    textStatus: "本文未整備",
    textQualityStage: "基本説明",
    editorialPriority: "中",
    seoArticleStatus: "未着手",
    articleSeed: "土用・彼岸・節分など季節の変わり目の整え方",
    source: "雑節マスター / 共通暦DB",
    nextAction: "専用辞典化と季節の整え方を追加",
  },
];

export function getTermDictionaryStatusRows() {
  return termDictionaryStatusRows;
}

export function getTermDictionaryStatusSummary() {
  const total = termDictionaryStatusRows.length;
  const connected = termDictionaryStatusRows.filter((row) =>
    row.calendarLinkStatus.includes("接続済み"),
  ).length;
  const visible = termDictionaryStatusRows.filter((row) =>
    row.calendarLinkStatus.includes("表示中"),
  ).length;
  const seoNotStarted = termDictionaryStatusRows.filter(
    (row) => row.seoArticleStatus === "未着手",
  ).length;
  const provisional = termDictionaryStatusRows.filter(
    (row) => row.implementationStatus === "仮実装",
  ).length;
  const needsVerification = termDictionaryStatusRows.filter(
    (row) => row.verificationStatus === "要検証" || row.verificationStatus === "未検証",
  ).length;
  const textMissing = termDictionaryStatusRows.filter(
    (row) => row.textStatus === "本文未整備" || row.textStatus === "辞典未整備",
  ).length;
  const readableText = termDictionaryStatusRows.filter(
    (row) =>
      row.textQualityStage === "読める本文" ||
      row.textQualityStage === "記事下書き" ||
      row.textQualityStage === "公開品質",
  ).length;
  const highEditorialPriority = termDictionaryStatusRows.filter(
    (row) => row.editorialPriority === "高",
  ).length;
  const seoByStatus = Object.fromEntries(
    termDictionarySeoStatuses.map((status) => [
      status,
      termDictionaryStatusRows.filter((row) => row.seoArticleStatus === status)
        .length,
    ]),
  ) as Record<TermDictionarySeoStatus, number>;
  const implementationByStatus = Object.fromEntries(
    termDictionaryImplementationStatuses.map((status) => [
      status,
      termDictionaryStatusRows.filter((row) => row.implementationStatus === status)
        .length,
    ]),
  ) as Record<TermDictionaryImplementationStatus, number>;
  const verificationByStatus = Object.fromEntries(
    termDictionaryVerificationStatuses.map((status) => [
      status,
      termDictionaryStatusRows.filter((row) => row.verificationStatus === status)
        .length,
    ]),
  ) as Record<TermDictionaryVerificationStatus, number>;
  const textByStatus = Object.fromEntries(
    termDictionaryTextStatuses.map((status) => [
      status,
      termDictionaryStatusRows.filter((row) => row.textStatus === status)
        .length,
    ]),
  ) as Record<TermDictionaryTextStatus, number>;
  const textQualityByStage = Object.fromEntries(
    termDictionaryTextQualityStages.map((stage) => [
      stage,
      termDictionaryStatusRows.filter((row) => row.textQualityStage === stage)
        .length,
    ]),
  ) as Record<TermDictionaryTextQualityStage, number>;

  return {
    total,
    connected,
    visible,
    seoNotStarted,
    provisional,
    needsVerification,
    textMissing,
    readableText,
    highEditorialPriority,
    seoByStatus,
    implementationByStatus,
    verificationByStatus,
    textByStatus,
    textQualityByStage,
  };
}
