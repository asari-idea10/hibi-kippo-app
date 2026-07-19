import Link from "next/link";

import {
  DirectionCompass,
  type DirectionCompassDirection,
  type DirectionCompassOrientation,
  type DirectionCompassState,
} from "@/components/direction-compass";
import {
  DirectionMountainRing,
  type DirectionMountainRingFocus,
  type DirectionMountainRingNatal,
  type DirectionMountainRingTendoTriangle,
  type DirectionMountainRingVoid,
} from "@/components/direction-mountain-ring";
import { MonthlyPlateSourceCoverage } from "@/components/monthly-plate-source-markers";
import { SiteSectionNav } from "@/components/site-section-nav";
import {
  calendarNoteDefinitions,
  getCalendarNoteEntry,
} from "@/lib/calendar-notes";
import { getCalendarDay } from "@/lib/calendar-day";
import {
  searchCalendarDb,
  type CalendarDbDirection,
  type CalendarDbKyuseiBoard,
  type CalendarDbRow,
} from "@/lib/calendar-db-view";
import type { DirectionDeityEntry } from "@/lib/direction-deities";
import { getPalaceStarBlend } from "@/lib/direction-palace-blend-master";
import {
  getHourBoardRowsForCalendarDay,
  getHourBranchByHour,
  type HourBoardEntry,
} from "@/lib/hour-board";
import {
  getActionScaleVirtue,
  getFengShuiVirtueByStar,
  getTendoTrineByMonthBranch,
} from "@/lib/feng-shui-virtue-master";
import { getKanshiByName } from "@/lib/kanshi-master";
import {
  favorablePersonalDirectionLabels,
  getPersonalDirectionCompatibilityLabel,
} from "@/lib/personal-star-compatibility-master";
import type { DirectionMountain } from "@/lib/direction-mountains";
import { getJapaneseEraDateContext } from "@/lib/japanese-era";
import {
  getMonthlyPlateSourceMarkerGroupForYearBranch,
  getMonthlyPlateSourceCoverageForDisplay,
} from "@/lib/monthly-plate-source-marker-display";

type PurposeCalendarPageProps = {
  searchParams?: Promise<{
    year?: string;
    month?: string;
    birthDate?: string;
    birthGender?: string;
    familyStars?: string | string[];
    purpose?: string;
    keyword?: string;
    auspiciousOnly?: string;
    showChildSatsu?: string;
    compassOrientation?: string;
    actionScale?: string | string[];
    companionJudgementMode?: string;
    candidateCondition?: string;
    candidate?: string;
    goodDirectionMatch?: string;
    kyuseiMatch?: string;
    selectedDate?: string;
  }>;
};

const startYear = 1900;
const endYear = 2050;
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const yearOptions = Array.from(
  { length: endYear - startYear + 1 },
  (_, index) => startYear + index,
);
const weekdayLabels = ["月", "火", "水", "木", "金", "土", "日"];
const boardOrder: CalendarDbKyuseiBoard[] = ["year", "month", "day"];
const boardLabels: Record<CalendarDbKyuseiBoard, string> = {
  year: "年",
  month: "月",
  day: "日",
};
const boardKeysByLabel: Record<string, CalendarDbKyuseiBoard> = {
  年: "year",
  月: "month",
  日: "day",
};
const directionOrder: DirectionCompassDirection[] = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
];
const stemMountainMap: Record<string, DirectionMountain | null> = {
  甲: "甲",
  乙: "乙",
  丙: "丙",
  丁: "丁",
  戊: null,
  己: null,
  庚: "庚",
  辛: "辛",
  壬: "壬",
  癸: "癸",
};
const branchMountainMap: Record<string, DirectionMountain> = {
  子: "子",
  丑: "丑",
  寅: "寅",
  卯: "卯",
  辰: "辰",
  巳: "巳",
  午: "午",
  未: "未",
  申: "申",
  酉: "酉",
  戌: "戌",
  亥: "亥",
};
const highlightedDayKanshi = new Set(["甲子", "己巳", "庚申"]);
const companionStarNames = [
  "一白水星",
  "二黒土星",
  "三碧木星",
  "四緑木星",
  "五黄土星",
  "六白金星",
  "七赤金星",
  "八白土星",
  "九紫火星",
];
const kyuseiShortNames: Record<string, string> = {
  "1": "一白",
  "2": "二黒",
  "3": "三碧",
  "4": "四緑",
  "5": "五黄",
  "6": "六白",
  "7": "七赤",
  "8": "八白",
  "9": "九紫",
};
const companionStarOptions = [
  {
    id: "self",
    label: "本人",
    star: "",
    display: "生年月日から判定",
  },
  ...Array.from({ length: 9 }, (_, index) => {
    const star = String(index + 1);
    const starName = companionStarNames[index];

    return {
      id: `star-${star}`,
      label: starName,
      star,
      display: starName,
    };
  }),
] as const;
const candidateConditionOptions = [
  {
    id: "all",
    label: "すべて表示",
    candidate: "all",
    goodDirectionMatch: "all",
    kyuseiMatch: "all",
  },
  {
    id: "has_candidate",
    label: "候補あり",
    candidate: "has_candidate",
    goodDirectionMatch: "all",
    kyuseiMatch: "all",
  },
  {
    id: "practical",
    label: "実用候補（月・日）",
    candidate: "has_candidate",
    goodDirectionMatch: "month_day",
    kyuseiMatch: "all",
  },
  {
    id: "long_term",
    label: "長期候補（年・月）",
    candidate: "has_candidate",
    goodDirectionMatch: "year_month",
    kyuseiMatch: "all",
  },
  {
    id: "strong",
    label: "強い候補（年・月・日）",
    candidate: "has_candidate",
    goodDirectionMatch: "year_month_day",
    kyuseiMatch: "all",
  },
] as const;
const actionScaleOptions = [
  {
    id: "near",
    label: "近場",
    summary: "今日すぐ整える",
    experience: "今日の気分を軽く切り替える",
    distanceLabel: "徒歩から近所、短時間の移動",
    actionExamples: "散歩、カフェ、買い物、近所の神社",
    actionTopics: [
      "散歩・ウォーキング",
      "カフェ作業・読書",
      "日常の買い出し",
      "近所の神社参拝",
      "ジム・ヨガ",
      "水回り掃除",
      "小さな断捨離",
      "新しい服や靴をおろす",
    ],
    candidateConditionId: "has_candidate",
    guide: "日盤中心。時盤が重なる時間帯を使い、近所で小さく整える",
    minimumCondition: "日盤が吉。日常の小さな移動は日盤を主に見る。",
    highlightCondition: "時盤も吉なら、今日すぐ動ける近場候補として強調する。",
    calendarNoteBoosts: [
      "一粒万倍日は買い物・新習慣の開始を後押し",
      "土用中は静かな整え・胃腸休息へ寄せる",
    ],
    warningPolicy: "年・月の凶殺は除外せず、注意表示に留める。",
  },
  {
    id: "day_trip",
    label: "日帰り",
    summary: "休日にしっかり整える",
    experience: "半日から一日かけて気を受け取る",
    distanceLabel: "市内から県内、日帰り圏",
    actionExamples: "温泉、神社、商談、日帰り旅行",
    actionTopics: [
      "日帰り温泉・サウナ",
      "神社仏閣巡り",
      "友人との食事",
      "デート",
      "重要な商談",
      "美容院・エステ",
      "病院の初診・検診",
      "財布の購入・使い始め",
    ],
    candidateConditionId: "has_candidate",
    guide: "日盤中心。月盤も重なれば、半日から一日の外出候補として強調",
    minimumCondition: "日盤が吉。日帰りでも基本は日盤を主に見る。",
    highlightCondition: "月盤も吉なら、休日にしっかり整える日帰り候補として強調する。",
    calendarNoteBoosts: [
      "巳の日・己巳は金運や芸術に触れる外出を後押し",
      "彼岸は神社仏閣・墓参・感謝の行動へ寄せる",
    ],
    warningPolicy: "月の強い凶殺は注意を強める。年の凶殺は注意表示を基本にする。",
  },
  {
    id: "overnight",
    label: "宿泊",
    summary: "一泊以上の方位取り",
    experience: "遠方で運気を底上げする",
    distanceLabel: "県外・遠方、宿泊を伴う移動",
    actionExamples: "宿泊旅行、重要参拝、遠出",
    actionTopics: [
      "国内旅行",
      "温泉旅行",
      "帰省",
      "遠方出張",
      "リトリート",
      "合宿",
      "海外旅行",
      "長めの参拝旅",
    ],
    candidateConditionId: "practical",
    guide: "月盤・日盤一致を基本に、遠方ほど年盤を重く見る",
    minimumCondition: "月盤と日盤が吉。短めの宿泊はここを基本に見る。",
    highlightCondition: "年盤も吉なら、宿泊・遠方の最有力候補にする。",
    calendarNoteBoosts: [
      "天赦日は遠方での決断や大きなリフレッシュを後押し",
      "土用中は遠出より休息・予定調整へ寄せる",
    ],
    warningPolicy: "遠方・長期ほど年・月の凶殺を重く扱い、強い凶殺は除外候補にする。",
  },
  {
    id: "base",
    label: "大きな予定",
    summary: "長期テーマの下見",
    experience: "暮らしや仕事の土台を整える",
    distanceLabel: "引っ越し・開業・長期拠点の下見",
    actionExamples: "移住下見、店舗候補、拠点探し",
    actionTopics: [
      "引越し・入居",
      "家の購入契約",
      "地鎮祭・上棟式",
      "独立・起業",
      "会社設立",
      "転職活動の開始",
      "入籍・結婚式",
      "店舗オープン",
      "資格勉強の開始",
      "長期的な自己投資",
    ],
    candidateConditionId: "long_term",
    guide: "年盤・月盤一致。引っ越し・開業・拠点下見",
    minimumCondition: "年盤と月盤が吉。生活拠点や長期テーマは年月を主に見る。",
    highlightCondition: "実行日の日盤も吉なら、行動日の補強として強調する。",
    calendarNoteBoosts: [
      "天赦日・天恩日は始まりや大きな決断を後押し",
      "節分・立春前後は切り替えの意味づけを強める",
    ],
    warningPolicy: "年・月の凶殺は厳しめに扱う。日盤は注意表示を基本にする。",
  },
  {
    id: "hour_precision",
    label: "特別時刻",
    summary: "四盤一致を見る特別な方位取り",
    experience: "出発時刻まで合わせる特別な整え",
    distanceLabel: "出発時刻まで合わせる特別な移動",
    actionExamples: "重要祈願、勝負前調整、時盤確認",
    actionTopics: [
      "お水取り・お砂取り",
      "恵方参り",
      "契約書へのサイン",
      "重要書類の提出",
      "受験・試験会場への出発",
      "大きな投資",
      "宝くじの購入",
      "告白・プロポーズ",
      "サービス公開",
    ],
    candidateConditionId: "strong",
    guide: "年盤・月盤・日盤候補に時盤を重ね、四盤一致を探す",
    minimumCondition:
      "年盤・月盤・日盤が重なる強い候補に、時盤の吉を重ねる。",
    highlightCondition:
      "年・月・日・時の四盤一致を、特別時刻の最有力候補にする。",
    calendarNoteBoosts: [
      "暦注よりも四盤一致の重なりを優先",
      "天赦日などは特別感の補助として扱う",
    ],
    warningPolicy:
      "四盤一致でも本命殺・的殺・三大凶方位などは候補から外す。",
  },
] as const;

type ActionScaleId = (typeof actionScaleOptions)[number]["id"];

const companionJudgementModeOptions = [
  {
    id: "strict",
    label: "厳格",
    description: "全員に吉",
  },
  {
    id: "standard",
    label: "標準",
    description: "本人は吉・同行者は凶回避",
  },
  {
    id: "loose",
    label: "ゆるめ",
    description: "同行者は強い凶だけ除外",
  },
] as const;

type CompanionJudgementModeId =
  (typeof companionJudgementModeOptions)[number]["id"];

function getCurrentDatePartsJst() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const hour = Number(values.hour);

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: hour === 24 ? 0 : hour,
    date: `${values.year}-${values.month}-${values.day}`,
  };
}

function getDatePartsForDisplay(date: string) {
  if (!date || date === "-") {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const weekday = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00+09:00`));

  return { year, month, day, weekday };
}

function normalizeYear(value: string | undefined, fallback: number) {
  const year = Number(value);

  return Number.isInteger(year) && year >= startYear && year <= endYear
    ? year
    : fallback;
}

function normalizeMonth(value: string | undefined, fallback: number) {
  const month = Number(value);

  return Number.isInteger(month) && month >= 1 && month <= 12
    ? month
    : fallback;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function getMonthRange(year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    start: formatDate(year, month, 1),
    end: formatDate(year, month, lastDay),
    lastDay,
  };
}

function isDateInRange(date: string, range: { start: string; end: string }) {
  return date >= range.start && date <= range.end;
}

function normalizeSelectedDate(
  value: string | undefined,
  range: { start: string; end: string },
  currentDate: string,
) {
  if (value && isDateInRange(value, range)) {
    return value;
  }

  return isDateInRange(currentDate, range) ? currentDate : range.start;
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  const next = new Date(Date.UTC(year, month - 1, day + days));

  return next.toISOString().slice(0, 10);
}

const calendarComputationPurpose = "yuki_tori";

function getCandidateConditionFromLegacy(params: {
  candidateCondition?: string;
  candidate?: string;
  goodDirectionMatch?: string;
}) {
  const direct = candidateConditionOptions.find(
    (option) => option.id === params.candidateCondition,
  );

  if (direct) {
    return direct;
  }

  if (params.goodDirectionMatch === "year_month_day") {
    return candidateConditionOptions.find((option) => option.id === "strong")!;
  }

  if (params.goodDirectionMatch === "year_month") {
    return candidateConditionOptions.find(
      (option) => option.id === "long_term",
    )!;
  }

  if (params.goodDirectionMatch === "month_day") {
    return candidateConditionOptions.find(
      (option) => option.id === "practical",
    )!;
  }

  if (params.candidate === "has_candidate") {
    return candidateConditionOptions.find(
      (option) => option.id === "has_candidate",
    )!;
  }

  return candidateConditionOptions.find(
    (option) => option.id === "has_candidate",
  )!;
}

function normalizeActionScale(
  value: string | string[] | undefined,
): ActionScaleId {
  const values = Array.isArray(value)
    ? value.flatMap((item) => item.split(","))
    : value
      ? value.split(",")
      : [];
  const validIds = new Set<ActionScaleId>(
    actionScaleOptions.map((option) => option.id),
  );
  const normalized = values
    .map((item) => item.trim())
    .filter((item): item is ActionScaleId => validIds.has(item as ActionScaleId));

  return normalized[0] ?? "near";
}

function getActionScaleFromParams(params: {
  actionScale?: string | string[];
  candidateCondition?: string;
  candidate?: string;
  goodDirectionMatch?: string;
}): ActionScaleId {
  if (params.actionScale) {
    return normalizeActionScale(params.actionScale);
  }

  const legacyCondition = getCandidateConditionFromLegacy(params);

  if (legacyCondition.id === "practical") {
    return "day_trip";
  }

  if (legacyCondition.id === "long_term") {
    return "base";
  }

  if (legacyCondition.id === "strong") {
    return "overnight";
  }

  return "near";
}

function getCandidateConditionForActionScale(actionScale: ActionScaleId) {
  const actionScaleOption = actionScaleOptions.find(
    (option) => option.id === actionScale,
  )!;

  return candidateConditionOptions.find(
    (option) => option.id === actionScaleOption.candidateConditionId,
  )!;
}

function normalizeFamilyStarIds(value: string | string[] | undefined) {
  const values = Array.isArray(value)
    ? value
    : value
      ? value.split(",")
      : ["self"];
  const validIds = new Set<string>(
    companionStarOptions.map((member) => member.id),
  );
  const normalized = values.filter((id) => validIds.has(id));

  return normalized.length > 0 ? normalized : ["self"];
}

function normalizeCompassOrientation(
  value: string | undefined,
): DirectionCompassOrientation {
  return value === "south-top" ? "south-top" : "north-top";
}

function normalizeCompanionJudgementMode(
  value: string | undefined,
): CompanionJudgementModeId {
  return companionJudgementModeOptions.some((option) => option.id === value)
    ? (value as CompanionJudgementModeId)
    : "standard";
}

function getDateFromRow(row: CalendarDbRow) {
  return row.values["西暦"].replace(/（.+$/, "");
}

function getSolarTermEntryRow(rows: CalendarDbRow[]) {
  return (
    rows.find(
      (row) =>
        row.values["当日節気"] &&
        row.values["当日節気"] !== "-" &&
        row.values["節入り時刻"] &&
        row.values["節入り時刻"] !== "-",
    ) ?? null
  );
}

function formatSolarTermEntry(row: CalendarDbRow | null | undefined) {
  if (!row || row.values["節入り時刻"] === "-") {
    return "-";
  }

  return `${getDateFromRow(row)} ${row.values["節入り時刻"]}`;
}

function getTonLabelForDate(date: string) {
  const [, monthText, dayText] = date.split("-");
  const month = Number(monthText);
  const day = Number(dayText);
  const monthDay = month * 100 + day;

  return monthDay >= 621 && monthDay < 1222 ? "陰遁" : "陽遁";
}

function getMonthlyTonLabel(rows: CalendarDbRow[], fallbackDate: string) {
  const hasSummerSolstice = rows.some((row) =>
    row.values["当日節気"]?.includes("夏至"),
  );
  const hasWinterSolstice = rows.some((row) =>
    row.values["当日節気"]?.includes("冬至"),
  );

  if (hasSummerSolstice) {
    return "陽遁→陰遁";
  }

  if (hasWinterSolstice) {
    return "陰遁→陽遁";
  }

  return getTonLabelForDate(fallbackDate);
}

function getKanshiParts(row: CalendarDbRow | null | undefined) {
  const value = row?.values["年/月/日干支"];
  if (!value || value === "-") {
    return { year: "-", month: "-", day: "-" };
  }

  const [year = "-", month = "-", day = "-"] = value
    .split(" / ")
    .map((part) => part.trim() || "-");

  return { year, month, day };
}

function formatKanshiWithNacchin(kanshi: string) {
  if (!kanshi || kanshi === "-") {
    return { id: "-", kanshi: "-", kuubou: "-", nacchin: "-", title: "" };
  }

  const entry = getKanshiByName(kanshi);

  return {
    id: entry ? String(entry.id) : "-",
    kanshi,
    kuubou: entry?.kuubou ?? "-",
    nacchin: entry?.nacchin ?? "-",
    title: entry
      ? `${entry.id} ${entry.kanshi} / ${entry.nacchin}\n空亡 ${entry.kuubou}\n${entry.meaning}\n${entry.note}`
      : "",
  };
}

function getKanshiMountainFocus(kanshi: string): DirectionMountainRingFocus[] {
  if (!kanshi || kanshi === "-" || kanshi.length < 2) {
    return [];
  }

  const stem = kanshi.slice(0, 1);
  const branch = kanshi.slice(1, 2);
  const focus: DirectionMountainRingFocus[] = [];

  if (stem in stemMountainMap) {
    focus.push({
      label: stem,
      mountain: stemMountainMap[stem],
      tone: "stem",
    });
  }

  if (branch in branchMountainMap) {
    focus.push({
      label: branch,
      mountain: branchMountainMap[branch],
      tone: "branch",
    });
  }

  return focus;
}

function getKuubouMountainVoid(kuubou: string): DirectionMountainRingVoid[] {
  if (!kuubou || kuubou === "-") {
    return [];
  }

  const branches = Array.from(kuubou).filter(
    (branch) => branch in branchMountainMap,
  );

  return branches.map((branch) => ({
    label: branch,
    mountain: branchMountainMap[branch],
    title: `空亡 ${kuubou}`,
  }));
}

function getTendoTrineTone(name: string): DirectionMountainRingTendoTriangle["tone"] {
  if (name.includes("水")) {
    return "water";
  }

  if (name.includes("金")) {
    return "metal";
  }

  if (name.includes("火")) {
    return "fire";
  }

  return "wood";
}

function getTendoTriangleMountains(
  monthBranch: string,
  scope: "month" | "day",
  activeBranch?: string,
): DirectionMountainRingTendoTriangle[] {
  if (!monthBranch || monthBranch === "-" || !(monthBranch in branchMountainMap)) {
    return [];
  }

  const trine = getTendoTrineByMonthBranch(monthBranch);

  if (!trine) {
    return [];
  }

  if (scope === "day" && (!activeBranch || !trine.dayBranches.includes(activeBranch))) {
    return [];
  }

  const mountains = trine.dayBranches
    .map((dayBranch) => branchMountainMap[dayBranch])
    .filter((mountain): mountain is DirectionMountain => Boolean(mountain));

  if (mountains.length < 3) {
    return [];
  }

  const scopeLabel = scope === "month" ? "月天道" : "日天道";
  const activeTargetBranch = activeBranch ?? monthBranch;
  const activeMountain = trine.dayBranches.includes(activeTargetBranch)
    ? branchMountainMap[activeTargetBranch]
    : null;
  const activeLabel = activeTargetBranch
    ? ` / 現在支 ${activeTargetBranch}${
        activeMountain ? "" : "（該当外）"
      }`
    : "";

  return [
    {
      activeMountain,
      effectLabel: trine.virtue,
      label: "天道",
      mountains,
      tone: getTendoTrineTone(trine.name),
      title: `${scopeLabel} ${trine.name} / ${trine.virtue} / ${trine.dayBranches.join("・")}${activeLabel}`,
    },
  ];
}

function getNatalKanshiMountainMarkers(
  parts: ReturnType<typeof getKanshiParts>,
  targetPillar?: "year" | "month" | "day",
): DirectionMountainRingNatal[] {
  const pillarDefinitions = [
    { key: "year", label: "年", title: "年柱", kanshi: parts.year },
    { key: "month", label: "月", title: "月柱", kanshi: parts.month },
    { key: "day", label: "日", title: "日柱", kanshi: parts.day },
  ] as const;

  return pillarDefinitions
    .filter((pillar) => !targetPillar || pillar.key === targetPillar)
    .flatMap((pillar) => {
    if (!pillar.kanshi || pillar.kanshi === "-" || pillar.kanshi.length < 2) {
      return [];
    }

    const stem = pillar.kanshi.slice(0, 1);
    const branch = pillar.kanshi.slice(1, 2);
    const markers: DirectionMountainRingNatal[] = [];

    if (stem in stemMountainMap) {
      markers.push({
        label: pillar.label,
        mountain: stemMountainMap[stem],
        pillar: pillar.key,
        title: `${pillar.title} ${pillar.kanshi} / 天干 ${stem}`,
      });
    }

    if (branch in branchMountainMap) {
      markers.push({
        label: pillar.label,
        mountain: branchMountainMap[branch],
        pillar: pillar.key,
        title: `${pillar.title} ${pillar.kanshi} / 地支 ${branch}`,
      });
    }

    return markers;
  });
}

type DirectionMountainGuideItem = {
  label: string;
  text: string;
  tone?: "good" | "caution" | "quiet";
};

type DirectionMountainScope = "year" | "month" | "day";

const directionMountainScopeCopy: Record<
  DirectionMountainScope,
  { guide: string; note: string; tone?: DirectionMountainGuideItem["tone"] }
> = {
  year: {
    guide:
      "年神を主軸。八将神・歳徳神・金神など、年単位で効く方位神を表示します。",
    note: "方位神: 年神を主軸",
  },
  month: {
    guide:
      "月神は補助レイヤー。現段階では天道・三合局を中心に、月の流れとして表示します。",
    note: "方位神: 月天道を補助",
    tone: "good",
  },
  day: {
    guide:
      "日神は限定採用。天一神と、月天道に該当する日の三合局を検証用に表示します。",
    note: "方位神: 日神を限定採用",
    tone: "quiet",
  },
};

function getDirectionDeityGuideText(entries: DirectionDeityEntry[]) {
  if (entries.length === 0) {
    return "方位神の該当なし";
  }

  const visibleEntries = entries.slice(0, 4).map((entry) => {
    const mountainLabel =
      entry.mountains.length > 0 ? entry.mountains.join("・") : "中宮";

    return `${entry.name}:${mountainLabel}`;
  });
  const restCount = entries.length - visibleEntries.length;

  return `${visibleEntries.join(" / ")}${
    restCount > 0 ? ` / ほか${restCount}件` : ""
  }`;
}

function getTendoGuideText(
  triangles: DirectionMountainRingTendoTriangle[],
  fallback?: string | null,
) {
  if (triangles.length === 0) {
    return fallback ?? "天道の該当表示なし";
  }

  return triangles
    .map(
      (triangle) =>
        `${triangle.title.replace(/^月天道 |^日天道 /, "")} / 山 ${triangle.mountains.join("・")}`,
    )
    .join(" / ");
}

function getDirectionMountainGuideItems({
  scope,
  kanshiLabel,
  focusMountains,
  voidMountains,
  natalMountains,
  deityEntries,
  tendoTriangles = [],
  tendoFallback,
}: {
  scope: DirectionMountainScope;
  kanshiLabel: string;
  focusMountains: DirectionMountainRingFocus[];
  voidMountains: DirectionMountainRingVoid[];
  natalMountains: DirectionMountainRingNatal[];
  deityEntries: DirectionDeityEntry[];
  tendoTriangles?: DirectionMountainRingTendoTriangle[];
  tendoFallback?: string | null;
}): DirectionMountainGuideItem[] {
  const focusText = focusMountains
    .map((focus) => `${focus.label}:${focus.mountain ?? "中宮"}`)
    .join(" / ");
  const voidText = voidMountains.map((voidEntry) => voidEntry.mountain).join("・");
  const natalText = natalMountains
    .map((natal) => `${natal.label}:${natal.mountain ?? "中宮"}`)
    .join(" / ");

  return [
    {
      label: "採用層",
      text: directionMountainScopeCopy[scope].guide,
      tone: directionMountainScopeCopy[scope].tone,
    },
    {
      label: "干支",
      text: `${kanshiLabel} → ${focusText || "-"}`,
    },
    {
      label: "空亡",
      text: voidText ? `${voidText} を暗色で表示` : "該当なし",
      tone: "quiet",
    },
    {
      label: "命式",
      text: natalText ? `本人 ${natalText}` : "生年月日未設定",
    },
    {
      label: "方位神",
      text: getDirectionDeityGuideText(deityEntries),
      tone: deityEntries.some((entry) => entry.category === "凶神")
        ? "caution"
        : deityEntries.some((entry) => entry.category === "吉神")
          ? "good"
          : undefined,
    },
    {
      label: "天道",
      text: getTendoGuideText(tendoTriangles, tendoFallback),
      tone: tendoTriangles.length > 0 ? "good" : undefined,
    },
  ];
}

function getCalendarNoteTone(
  kind: "junichoku" | "nijuhachishuku",
  value: string | undefined,
) {
  if (!value || value === "-") {
    return "neutral";
  }

  return getCalendarNoteEntry(kind, value)?.fortune ?? "neutral";
}

const selectedDayToneByName = new Map(
  Object.values(calendarNoteDefinitions).map((definition) => [
    definition.name,
    definition.fortune,
  ]),
);

function normalizeSelectedDayName(value: string) {
  return value
    .replace(/^※/, "")
    .replace(/終わり$/, "")
    .trim();
}

function getSelectedDayTone(value: string) {
  return selectedDayToneByName.get(normalizeSelectedDayName(value)) ?? "neutral";
}

const premiumSelectedDayNames = ["天赦日"];
const auspiciousSelectedDayNames = new Set(
  Object.values(calendarNoteDefinitions)
    .filter(
      (definition) =>
        definition.fortune === "good" &&
        definition.weight >= 5,
    )
    .map((definition) => definition.name),
);

function isPremiumSelectedDay(value: string) {
  const normalized = normalizeSelectedDayName(value);

  return premiumSelectedDayNames.some((name) => normalized.includes(name));
}

function getSelectedDayChips(value: string) {
  if (!value || value === "-") {
    return [];
  }

  return value
    .split(/[/、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      tone: getSelectedDayTone(label),
      premium: isPremiumSelectedDay(label),
    }));
}

function getCalendarNoteTermHref(
  kind:
    | "junichoku"
    | "nijuhachishuku"
    | "selected-days"
    | "rokuyo"
    | "kyusei"
    | "nacchin"
    | "kuubou",
  name: string,
) {
  const normalizedName = normalizeSelectedDayName(name)
    .replace(/始まり$/, "")
    .replace(/終わり$/, "")
    .trim();

  return `/calendar-notes/${kind}/${encodeURIComponent(normalizedName)}`;
}

function getKyuseiTermHref(value: string | null | undefined) {
  const starNumber = getKyuseiDisplayNumber(value);
  const starName = starNumber ? companionStarNames[Number(starNumber) - 1] : null;

  return starName ? getCalendarNoteTermHref("kyusei", starName) : null;
}

function getNacchinTermHref(value: string | null | undefined) {
  return value && value !== "-"
    ? getCalendarNoteTermHref("nacchin", value)
    : null;
}

function getKuubouTermHref(value: string | null | undefined) {
  return value && value !== "-"
    ? getCalendarNoteTermHref("kuubou", value)
    : null;
}

function renderDictionaryLink(
  label: string,
  href: string | null,
  title: string,
) {
  if (!href) {
    return label;
  }

  return (
    <a href={href} rel="noreferrer" target="_blank" title={title}>
      {label}
    </a>
  );
}

function renderKyuseiTermLink(
  value: string | null | undefined,
  className?: string,
) {
  const href = getKyuseiTermHref(value);
  const label = value ?? "-";

  if (!href || label === "-") {
    return className ? <span className={className}>{label}</span> : label;
  }

  return (
    <a
      className={className}
      href={href}
      rel="noreferrer"
      target="_blank"
      title={`${label}の説明を開く`}
    >
      {label}
    </a>
  );
}

function renderKyuseiShortTermLink(
  value: string | null | undefined,
  className?: string,
) {
  const href = getKyuseiTermHref(value);
  const label = value ?? "-";
  const starNumber = getKyuseiDisplayNumber(value);
  const shortLabel = starNumber ? (kyuseiShortNames[starNumber] ?? label) : label;

  if (!href || label === "-") {
    return className ? <span className={className}>{shortLabel}</span> : shortLabel;
  }

  return (
    <a
      className={className}
      href={href}
      rel="noreferrer"
      target="_blank"
      title={`${label}の説明を開く`}
    >
      {shortLabel}
    </a>
  );
}

function hasAuspiciousSelectedDay(value: string | undefined) {
  return getSelectedDayChips(value ?? "-").some((chip) =>
    auspiciousSelectedDayNames.has(normalizeSelectedDayName(chip.label)),
  );
}

function getMovementWarningChips(
  value: string | undefined,
  targetBoards: Array<"年" | "月" | "日"> = ["年", "月", "日"],
  doyoValue?: string,
  directionBoardValues?: CalendarDbRow["directionBoardValues"],
) {
  if (
    (!value || value === "-") &&
    (!doyoValue || doyoValue === "-") &&
    !directionBoardValues
  ) {
    return [];
  }

  const byDirection = new Map<string, string[]>();
  const targetBoardSet = new Set(targetBoards);
  const boardLabelMap: Record<string, string> = {
    年: "年盤",
    月: "月盤",
    日: "日盤",
  };
  const warningLabelMap: Record<string, string> = {
    暗剣: "暗剣殺",
    五黄: "五黄殺",
    破: "破",
  };
  const boardKeyMap: Record<"年" | "月" | "日", CalendarDbKyuseiBoard> = {
    年: "year",
    月: "month",
    日: "day",
  };
  const personalizedWarningLabels = [
    "暗剣殺",
    "五黄殺",
    "破",
    "本命殺",
    "的殺",
  ];

  const addWarning = (direction: string, detail: string) => {
    const details = byDirection.get(direction) ?? [];

    if (details.includes(detail)) {
      return;
    }

    details.push(detail);
    byDirection.set(direction, details);
  };

  value?.split(" / ").forEach((boardPart) => {
    const match = boardPart.match(/^(年|月|日):\s*(.+)$/);

    if (!match || match[2] === "-") {
      return;
    }

    const boardKey = match[1] as "年" | "月" | "日";

    if (!targetBoardSet.has(boardKey)) {
      return;
    }

    const board = boardLabelMap[boardKey];

    match[2].split("・").forEach((entry) => {
      const entryMatch = entry.match(/^(暗剣|五黄|破)\s+(.+)$/);

      if (!entryMatch) {
        return;
      }

      const warning = warningLabelMap[entryMatch[1]];
      const direction = entryMatch[2];

      addWarning(direction, `${board} ${warning}`);
    });
  });

  if (directionBoardValues) {
    directionOrder.forEach((direction) => {
      targetBoards.forEach((boardLabel) => {
        const boardKey = boardKeyMap[boardLabel];
        const value = directionBoardValues[direction]?.[boardKey] ?? "";

        personalizedWarningLabels.forEach((warning) => {
          if (value.includes(warning)) {
            const displayWarning = warning === "的殺" ? "本命的殺" : warning;

            addWarning(
              direction,
              `${boardLabelMap[boardLabel]} ${displayWarning}`,
            );
          }
        });
      });
    });
  }

  if (targetBoardSet.has("日")) {
    const isDoyoManichi = doyoValue?.includes("間日") ?? false;
    const doyoSatsuDirection = isDoyoManichi
      ? null
      : doyoValue?.match(/土用殺\s+([^/\s]+)/)?.[1];

    if (doyoSatsuDirection && doyoSatsuDirection !== "-") {
      addWarning(doyoSatsuDirection, "土用 土用殺");
    }
  }

  return directionOrder
    .filter((direction) => byDirection.has(direction))
    .map((direction) => ({
      direction,
      detail: byDirection.get(direction)?.join(" / ") ?? "",
    }));
}

function mergeMovementWarningChips(
  date: string,
  baseChips: Array<{ direction: string; detail: string }>,
  memberRows: MemberRowIndex[],
) {
  const byDirection = new Map<string, Set<string>>();

  const addChip = (chip: { direction: string; detail: string }) => {
    const details = byDirection.get(chip.direction) ?? new Set<string>();

    chip.detail.split(" / ").forEach((detail) => {
      if (detail) {
        details.add(detail);
      }
    });

    byDirection.set(chip.direction, details);
  };

  baseChips.forEach(addChip);
  memberRows.forEach((member) => {
    const memberRow = member.rowByDate.get(date);

    if (!memberRow) {
      return;
    }

    getMovementWarningChips(
      memberRow.values["方位殺"],
      ["日"],
      memberRow.values["土用"],
      memberRow.directionBoardValues,
    ).forEach(addChip);
  });

  return directionOrder
    .filter((direction) => byDirection.has(direction))
    .map((direction) => ({
      direction,
      detail: Array.from(byDirection.get(direction) ?? []).join(" / "),
    }));
}

function getDoyoPeriodChip(value: string | undefined) {
  if (!value || value === "-") {
    return null;
  }

  const label = value.match(/^(春土用|夏土用|秋土用|冬土用)\s+\d+日目/)?.[0];

  if (!label) {
    return null;
  }

  return {
    label,
    isManichi: value.includes("間日"),
    title: value,
  };
}

function getChildSatsuWarningChip(value: string | undefined) {
  if (!value || value === "-") {
    return null;
  }

  const direction = value.match(/^([^/\s]+)/)?.[1];

  if (!direction || direction === "方位なし") {
    return null;
  }

  return {
    direction,
    detail: `小児殺 ${value}`,
  };
}

function getPurposeDirectionTags(row: CalendarDbRow) {
  const grouped = new Map<string, Set<CalendarDbKyuseiBoard>>();

  row.purposeTags.forEach((tag) => {
    const [boardLabel, direction] = tag.split(" ");
    const board = boardKeysByLabel[boardLabel];

    if (!board || !direction) {
      return;
    }

    const entry = grouped.get(direction) ?? new Set<CalendarDbKyuseiBoard>();
    entry.add(board);
    grouped.set(direction, entry);
  });

  return directionOrder
    .filter((direction) => grouped.has(direction))
    .map((direction) => {
      const boards = boardOrder.filter((board) =>
        grouped.get(direction)?.has(board),
      );
      const starNumber =
        row.directionBoardValues[direction]?.day.match(/^\[(\d)\]/)?.[1] ??
        null;
      const blend = starNumber
        ? getPalaceStarBlend(direction, starNumber)
        : null;

      return {
        direction,
        boards,
        starNumber,
        blendType: blend?.type ?? null,
        blendGrade: blend?.grade ?? null,
        blendTone: blend?.tone ?? null,
        blendShortBadge: blend?.shortBadge ?? null,
        benefitLabel: blend
          ? blend.benefitTags.slice(0, 3).join("・")
          : "開運",
        protectiveLabel: blend
          ? blend.protectiveTags.slice(0, 3).join("・")
          : "",
        actionLabel: blend
          ? blend.actionTags.slice(0, 2).join("・")
          : "整え行動",
        blendReason: blend
          ? `根拠: ${blend.palace.bagua}宮(${blend.palace.element}) × ${blend.star.starName}(${blend.star.element}) = ${formatBlendReasonStatus(
              blend.elementalRelationLabel,
              blend.type,
              blend.grade,
            )}\n\nコメント:\n${blend.summary}\n${blend.benefitText}`
          : null,
      };
    });
}

function getRequiredBoardsForCandidateCondition(
  goodDirectionMatch: string,
): CalendarDbKyuseiBoard[] {
  if (goodDirectionMatch === "year_month_day") {
    return ["year", "month", "day"];
  }

  if (goodDirectionMatch === "year_month") {
    return ["year", "month"];
  }

  if (goodDirectionMatch === "month_day") {
    return ["month", "day"];
  }

  return [];
}

type PurposeDirectionTag = ReturnType<typeof getPurposeDirectionTags>[number];

type FamilyPurposeDirectionTag = {
  direction: CalendarDbDirection;
  starNumber: string | null;
  blendType: string | null;
  blendGrade: string | null;
  blendTone: string | null;
  blendShortBadge: string | null;
  benefitLabel: string;
  protectiveLabel: string;
  actionLabel: string;
  blendReason: string | null;
  boards: CalendarDbKyuseiBoard[];
  reason: string;
  members: Array<{
    label: string;
    boards: CalendarDbKyuseiBoard[];
    reason: string;
  }>;
};

type MemberRowIndex = {
  label: string;
  rowByDate: Map<string, CalendarDbRow>;
};

type MonthlyBestCandidate = {
  date: string;
  day: number;
  label: string;
  noteSummary: string;
  direction: CalendarDbDirection | null;
  starNumber: string | null;
  blendType: string | null;
  blendGrade: string | null;
  blendTone: string | null;
  blendShortBadge: string | null;
  benefitLabel: string;
  protectiveLabel: string;
  actionLabel: string;
  boards: CalendarDbKyuseiBoard[];
  score: number;
  reason: string;
  tone: "strong" | "practical" | "longTerm" | "conditional";
  isTenshaBi: boolean;
};

type FourBoardCandidate = {
  date: string;
  direction: CalendarDbDirection;
  star: number;
  branch: string;
  startTime: string;
  endTime: string;
};

function getBoardStarNumber(
  row: CalendarDbRow | undefined,
  direction: CalendarDbDirection,
  board: CalendarDbKyuseiBoard,
) {
  return row?.directionBoardValues[direction]?.[board].match(/^\[(\d)\]/)?.[1] ?? null;
}

function getKyuseiDisplayNumber(value: string | null | undefined) {
  return value?.match(/\((\d)\)/)?.[1] ?? value?.match(/^(\d)$/)?.[1] ?? null;
}

function formatCompanionStarDisplay(value: string | null | undefined) {
  return value?.replace(/\(\d\)$/, "") ?? null;
}

function formatPersonalProfileList(values: string[]) {
  return values.length > 0 ? values.join("・") : "-";
}

function getWarningCodes(detail: string | null | undefined) {
  if (!detail) {
    return [];
  }

  const codeEntries = [
    ["暗剣殺", "暗"],
    ["五黄殺", "五"],
    ["本命的殺", "的"],
    ["的殺", "的"],
    ["本命殺", "本"],
    ["土用殺", "土"],
    ["小児殺", "小"],
    ["破", "破"],
  ] as const;

  return Array.from(new Set(codeEntries
    .filter(([keyword]) => detail.includes(keyword))
    .map(([, code]) => code)));
}

const hourBoardFavorableLabels = favorablePersonalDirectionLabels;

const oppositeHourDirections: Partial<
  Record<DirectionCompassDirection, DirectionCompassDirection>
> = {
  北: "南",
  北東: "南西",
  東: "西",
  南東: "北西",
  南: "北",
  南西: "北東",
  西: "東",
  北西: "南東",
};

type HourBoardGoodDirectionItem = {
  direction: DirectionCompassDirection;
  star: number;
  label: string;
};

function getHourBoardTimeParts(hourBoard: HourBoardEntry) {
  const [startTime, endTime] = hourBoard.timeRange.label.split("〜");

  return { startTime, endTime };
}

function getHourBoardGoodDirectionItems(
  directions: Record<string, { star: number; warningLabel: string }>,
  personalStars: Array<{ star: string }>,
  companionJudgementMode: CompanionJudgementModeId,
): HourBoardGoodDirectionItem[] {
  if (personalStars.length === 0) {
    return [];
  }

  const primaryStar = personalStars[0];
  const personalBlocks = personalStars.map((member) => {
    const honmeiDirection =
      directionOrder.find(
        (direction) => String(directions[direction]?.star ?? "") === member.star,
      ) ?? null;

    return {
      star: member.star,
      honmeiDirection,
      tekiDirection: honmeiDirection
        ? oppositeHourDirections[honmeiDirection]
        : null,
    };
  });

  return directionOrder
    .map((direction) => {
      const state = directions[direction];

      if (!state || state.warningLabel) {
        return null;
      }

      const star = String(state.star);
      const blockTargets =
        companionJudgementMode === "loose"
          ? personalBlocks.filter((member) => member.star === primaryStar.star)
          : personalBlocks;
      const isPersonalBlocked = blockTargets.some(
        (member) =>
          member.honmeiDirection === direction ||
          member.tekiDirection === direction,
      );

      if (isPersonalBlocked) {
        return null;
      }

      const compatibilityTargets =
        companionJudgementMode === "strict"
          ? personalBlocks
          : personalBlocks.filter((member) => member.star === primaryStar.star);
      const labels = compatibilityTargets.map(
        (member) => getPersonalDirectionCompatibilityLabel(member.star, star),
      );

      if (
        labels.length === 0 ||
        labels.some((label) => !label || !hourBoardFavorableLabels.has(label))
      ) {
        return null;
      }

      return {
        direction,
        star: state.star,
        label: `${direction}[${state.star}]`,
      };
    })
    .filter((value): value is HourBoardGoodDirectionItem => Boolean(value));
}

function getHourBoardGoodDirectionTone(
  item: HourBoardGoodDirectionItem,
  dayTags: FamilyPurposeDirectionTag[],
) {
  const tag = dayTags.find((entry) => entry.direction === item.direction);

  if (!tag) {
    return "single";
  }

  if (
    tag.boards.includes("year") &&
    tag.boards.includes("month") &&
    tag.boards.includes("day")
  ) {
    return "triple";
  }

  if (tag.boards.includes("month") && tag.boards.includes("day")) {
    return "double";
  }

  return "day";
}

function hasYearMonthDayOverlap(tag: Pick<FamilyPurposeDirectionTag, "boards">) {
  return (
    tag.boards.includes("year") &&
    tag.boards.includes("month") &&
    tag.boards.includes("day")
  );
}

function getFourBoardCandidatesForDate(
  date: string,
  tags: FamilyPurposeDirectionTag[],
  personalStars: Array<{ star: string }>,
  companionJudgementMode: CompanionJudgementModeId,
): FourBoardCandidate[] {
  const yearMonthDayTags = tags.filter(hasYearMonthDayOverlap);

  if (yearMonthDayTags.length === 0 || personalStars.length === 0) {
    return [];
  }

  const matchingDirections = new Set(
    yearMonthDayTags.map((tag) => tag.direction),
  );
  const calendarDay = getCalendarDay(date);

  if (!calendarDay) {
    return [];
  }

  return getHourBoardRowsForCalendarDay(calendarDay).flatMap((hourBoard) => {
    const { startTime, endTime } = getHourBoardTimeParts(hourBoard);

    return getHourBoardGoodDirectionItems(
      hourBoard.directions,
      personalStars,
      companionJudgementMode,
    )
      .filter((item) =>
        matchingDirections.has(item.direction as CalendarDbDirection),
      )
      .map((item) => ({
        date,
        direction: item.direction as CalendarDbDirection,
        star: item.star,
        branch: hourBoard.branch,
        startTime,
        endTime,
      }));
  });
}

type DirectionDeityCycleFilter = "year" | "month" | "day";

function getDirectionDeityEntries(
  row: CalendarDbRow | undefined,
  cycles: DirectionDeityCycleFilter[],
): DirectionDeityEntry[] {
  if (!row) {
    return [];
  }

  const cycleSet = new Set(cycles);

  return row.directionDeityRows.filter((entry) => cycleSet.has(entry.cycle));
}

function getDirectionCompassStates(
  row: CalendarDbRow | undefined,
  tags: Array<Pick<FamilyPurposeDirectionTag, "direction" | "boards">>,
  warningChips: Array<{ direction: string; detail: string }>,
  tendoChip: { directions: CalendarDbDirection[] } | null,
  childSatsuChip: { direction: string } | null = null,
  board: CalendarDbKyuseiBoard = "day",
): DirectionCompassState[] {
  const tagByDirection = new Map<
    string,
    Pick<FamilyPurposeDirectionTag, "direction" | "boards">
  >();

  tags.forEach((tag) => {
    const current = tagByDirection.get(tag.direction);

    if (!current) {
      tagByDirection.set(tag.direction, {
        direction: tag.direction,
        boards: [...tag.boards],
      });
      return;
    }

    tag.boards.forEach((candidateBoard) => {
      if (!current.boards.includes(candidateBoard)) {
        current.boards.push(candidateBoard);
      }
    });
  });
  const warningByDirection = new Map(
    warningChips.map((chip) => [chip.direction, chip.detail]),
  );
  const tendoDirections = new Set(tendoChip?.directions ?? []);

  return directionOrder.map((direction) => {
    const tag = tagByDirection.get(direction);
    const isBoardCandidate = Boolean(tag?.boards.includes(board));
    const warningLabel = warningByDirection.get(direction) ?? null;
    const overlapLevel =
      tag &&
      tag.boards.includes("year") &&
      tag.boards.includes("month") &&
      tag.boards.includes("day")
        ? 3
        : tag && tag.boards.includes("month") && tag.boards.includes("day")
          ? 2
          : tag
            ? 1
            : 0;

    return {
      direction,
      starNumber: getBoardStarNumber(row, direction, board),
      warning: Boolean(warningLabel),
      warningLabel,
      warningCodes: getWarningCodes(warningLabel),
      candidate: isBoardCandidate,
      strong: Boolean(
        tag &&
          isBoardCandidate &&
          tag.boards.includes("year") &&
          tag.boards.includes("month") &&
          tag.boards.includes("day"),
      ),
      overlapLevel,
      tendo: tendoDirections.has(direction),
      childSatsu: childSatsuChip?.direction === direction,
    };
  });
}

function isBoardDirectionCandidateValue(value: string | undefined) {
  if (!value || value === "-" || value.startsWith("[5]")) {
    return false;
  }

  const hasFavorable = [...favorablePersonalDirectionLabels].some((label) =>
    value.includes(label),
  );
  const hasBlocking = directionBlockingKeywords.some((keyword) =>
    value.includes(keyword),
  );

  return hasFavorable && !hasBlocking && !value.includes("凶方位優先");
}

function getBoardCandidateTags(
  row: CalendarDbRow | undefined,
  board: CalendarDbKyuseiBoard,
): Array<Pick<FamilyPurposeDirectionTag, "direction" | "boards">> {
  if (!row) {
    return [];
  }

  return directionOrder
    .filter((direction) =>
      isBoardDirectionCandidateValue(row.directionBoardValues[direction]?.[board]),
    )
    .map((direction) => ({
      direction,
      boards: [board],
    }));
}

function getDirectionOrderIndex(
  direction: CalendarDbDirection | null | undefined,
) {
  const index = directionOrder.indexOf(direction as DirectionCompassDirection);

  return index >= 0 ? index : 99;
}

const directionBlockingKeywords = [
  "暗剣殺",
  "五黄殺",
  "破",
  "本命殺",
  "的殺",
  "土用殺",
  "凶方位優先",
];
const companionStandardBlockingKeywords = directionBlockingKeywords;
const companionLooseBlockingKeywords = [
  "暗剣殺",
  "五黄殺",
  "破",
  "土用殺",
  "凶方位優先",
];

function getBoardReason(value: string | undefined) {
  if (!value) {
    return "-";
  }

  const normalized = value.replace(/^\[\d\]\s*/, "").trim();

  return normalized || "-";
}

function isWeakBlendType(blendType: string | null) {
  return blendType === "抑気" || blendType === "衝気";
}

function formatBlendInterpretationStatus(
  blendType: string | null,
  blendShortBadge: string | null,
) {
  return blendShortBadge ?? blendType;
}

function formatBlendReasonStatus(
  elementalRelationLabel: string,
  blendType: string | null,
  blendGrade: string | null,
) {
  if (isWeakBlendType(blendType)) {
    return `${elementalRelationLabel} / ${blendType}（吉凶評価ではなく、報徳・整え方の注釈）`;
  }

  return `${elementalRelationLabel}${blendType ? ` / ${blendType}` : ""}${
    blendGrade ? ` / ${blendGrade}` : ""
  }`;
}

function formatPurposeBlendLabel(
  direction: CalendarDbDirection | null,
  starNumber: string | null,
) {
  if (!direction) {
    return "暦注候補";
  }

  const starLabel = starNumber
    ? (kyuseiShortNames[starNumber] ?? starNumber)
    : "-";

  return `${direction} × ${starLabel}`;
}

function formatPurposeBlendHoverHeader(
  direction: CalendarDbDirection | null,
  starNumber: string | null,
  blendType: string | null,
  blendShortBadge: string | null,
) {
  if (!direction) {
    return "暦注候補";
  }

  const starLabel = starNumber
    ? (kyuseiShortNames[starNumber] ?? starNumber)
    : "-";
  const status = formatBlendInterpretationStatus(blendType, blendShortBadge);

  return `${direction} × ${starLabel}${status ? ` / ${status}` : ""}`;
}

function getPurposeReason(
  row: CalendarDbRow,
  direction: CalendarDbDirection,
  boards: CalendarDbKyuseiBoard[],
) {
  const boardValues = row.directionBoardValues[direction];

  if (!boardValues) {
    return "理由未取得";
  }

  const boardReasons = boards.map(
    (board) => `${boardLabels[board]}盤: ${getBoardReason(boardValues[board])}`,
  );
  const hasBlocking = boards.some((board) =>
    directionBlockingKeywords.some((keyword) =>
      boardValues[board]?.includes(keyword),
    ),
  );

  return [...boardReasons, hasBlocking ? "凶方位あり" : "凶方位なし"].join(
    " / ",
  );
}

function hasDirectionBlockingKeyword(
  row: CalendarDbRow,
  direction: CalendarDbDirection,
  boards: CalendarDbKyuseiBoard[],
  keywords: string[],
) {
  const boardValues = row.directionBoardValues[direction];

  if (!boardValues) {
    return true;
  }

  return boards.some((board) =>
    keywords.some((keyword) => boardValues[board]?.includes(keyword)),
  );
}

function getCompanionAvoidanceReason(
  row: CalendarDbRow,
  direction: CalendarDbDirection,
  boards: CalendarDbKyuseiBoard[],
  mode: CompanionJudgementModeId,
) {
  const keywords =
    mode === "loose"
      ? companionLooseBlockingKeywords
      : companionStandardBlockingKeywords;
  const blocked = hasDirectionBlockingKeyword(row, direction, boards, keywords);
  const boardReasons = boards.map((board) => {
    const value = row.directionBoardValues[direction]?.[board];

    return `${boardLabels[board]}盤: ${getBoardReason(value)}`;
  });

  return [
    ...boardReasons,
    blocked
      ? mode === "loose"
        ? "強い凶方位あり"
        : "同行者の凶方位あり"
      : mode === "loose"
        ? "強い凶方位なし"
        : "同行者の凶方位なし",
  ].join(" / ");
}

function getDirectionBlendHref(state: DirectionCompassState) {
  if (!state.starNumber) {
    return null;
  }

  const params = new URLSearchParams({
    direction: state.direction,
    star: state.starNumber,
  });

  return `/direction-palace-blends?${params.toString()}`;
}

function hasDirectionBlocking(row: CalendarDbRow, direction: CalendarDbDirection) {
  const boardValues = row.directionBoardValues[direction];

  if (!boardValues) {
    return true;
  }

  return boardOrder.some((board) => {
    const value = boardValues[board] ?? "";

    return (
      value.startsWith("[5]") ||
      directionBlockingKeywords.some((keyword) => value.includes(keyword))
    );
  });
}

function getTendoDisplayChip(
  date: string,
  row: CalendarDbRow | undefined,
  memberRows: MemberRowIndex[],
) {
  if (!row) {
    return null;
  }

  const kanshiParts = getKanshiParts(row);
  const monthBranch = kanshiParts.month.match(
    /[甲乙丙丁戊己庚辛壬癸]?([子丑寅卯辰巳午未申酉戌亥])/,
  )?.[1];
  const dayBranch = kanshiParts.day.match(
    /[甲乙丙丁戊己庚辛壬癸]?([子丑寅卯辰巳午未申酉戌亥])/,
  )?.[1];
  const trine = monthBranch ? getTendoTrineByMonthBranch(monthBranch) : null;
  const isTendoDay = Boolean(
    trine && dayBranch && trine.dayBranches.includes(dayBranch),
  );

  if (!trine || !isTendoDay) {
    return null;
  }

  const directions = trine.dayDirections.filter(
    (direction): direction is CalendarDbDirection =>
      directionOrder.includes(direction as DirectionCompassDirection),
  );

  if (directions.length === 0) {
    return null;
  }

  const rowsToCheck = memberRows
    .map((member) => member.rowByDate.get(date))
    .filter(Boolean) as CalendarDbRow[];
  const effectiveRows = rowsToCheck.length > 0 ? rowsToCheck : [row];
  const blockedDirections = directions.filter((direction) =>
    effectiveRows.some((targetRow) => hasDirectionBlocking(targetRow, direction)),
  );
  const activeDirections = directions.filter(
    (direction) => !blockedDirections.includes(direction),
  );

  return {
    blocked: blockedDirections.length > 0,
    blockedDirections,
    directions,
    activeDirections,
    effectLabel: `${trine.name} / ${trine.virtue}`,
    title: [
      `天道該当日 ${dayBranch}`,
      `${trine.dayBranches.join("・")} / ${directions.join("・")}`,
      `${trine.name} / ${trine.virtue}`,
      blockedDirections.length > 0
        ? `注意重なり: ${blockedDirections.join("・")}`
        : null,
    ]
      .filter(Boolean)
      .join(" / "),
  };
}

function getFamilyPurposeDirectionTags(
  date: string,
  memberRows: MemberRowIndex[],
  goodDirectionMatch: string,
  companionJudgementMode: CompanionJudgementModeId,
) {
  if (memberRows.length === 0) {
    return [];
  }

  const requiredBoards = getRequiredBoardsForCandidateCondition(goodDirectionMatch);
  const memberTagMaps = memberRows
    .map((member) => {
      const row = member.rowByDate.get(date);

      if (!row) {
        return null;
      }

      return {
        label: member.label,
        row,
        tagsByDirection: new Map(
          getPurposeDirectionTags(row).map((tag) => [tag.direction, tag]),
        ),
      };
    })
    .filter(Boolean) as Array<{
      label: string;
      row: CalendarDbRow;
      tagsByDirection: Map<CalendarDbDirection, PurposeDirectionTag>;
    }>;

  if (memberTagMaps.length !== memberRows.length) {
    return [];
  }

  const primaryMember = memberTagMaps[0];

  return directionOrder.flatMap((direction) => {
    const primaryTag = primaryMember.tagsByDirection.get(direction);

    if (!primaryTag) {
      return [];
    }

    if (
      requiredBoards.length > 0 &&
      !requiredBoards.every((board) => primaryTag.boards.includes(board))
    ) {
      return [];
    }

    if (companionJudgementMode === "strict") {
      const memberTags = memberTagMaps.map((member) => {
        const tag = member.tagsByDirection.get(direction);

        if (!tag) {
          return null;
        }

        if (
          requiredBoards.length > 0 &&
          !requiredBoards.every((board) => tag.boards.includes(board))
        ) {
          return null;
        }

        return {
          label: member.label,
          row: member.row,
          tag,
        };
      });

      if (memberTags.some((tag) => !tag)) {
        return [];
      }

      const validMemberTags = memberTags as Array<{
        label: string;
        tag: PurposeDirectionTag;
        row: CalendarDbRow;
      }>;
      const firstTag = validMemberTags[0]?.tag;
      const displayBoards =
        requiredBoards.length > 0 ? requiredBoards : (firstTag?.boards ?? []);
      const firstRow = validMemberTags[0]?.row;
      const reason = firstRow
        ? getPurposeReason(firstRow, direction, displayBoards)
        : "理由未取得";

      return [
        {
          direction,
          starNumber: firstTag?.starNumber ?? null,
          blendType: firstTag?.blendType ?? null,
          blendGrade: firstTag?.blendGrade ?? null,
          blendTone: firstTag?.blendTone ?? null,
          blendShortBadge: firstTag?.blendShortBadge ?? null,
          actionLabel: firstTag?.actionLabel ?? "整え行動",
          benefitLabel: firstTag?.benefitLabel ?? "開運",
          protectiveLabel: firstTag?.protectiveLabel ?? "",
          blendReason: firstTag?.blendReason ?? null,
          boards: displayBoards,
          reason,
          members: validMemberTags.map((member) => ({
            label: member.label,
            boards:
              requiredBoards.length > 0 ? requiredBoards : member.tag.boards,
            reason: getPurposeReason(
              member.row,
              direction,
              requiredBoards.length > 0 ? requiredBoards : member.tag.boards,
            ),
          })),
        },
      ] satisfies FamilyPurposeDirectionTag[];
    }

    const displayBoards =
      requiredBoards.length > 0 ? requiredBoards : primaryTag.boards;
    const companionRows = memberTagMaps.slice(1);
    const companionKeywords =
      companionJudgementMode === "loose"
        ? companionLooseBlockingKeywords
        : companionStandardBlockingKeywords;
    const hasCompanionBlock = companionRows.some((member) =>
      hasDirectionBlockingKeyword(
        member.row,
        direction,
        displayBoards,
        companionKeywords,
      ),
    );

    if (hasCompanionBlock) {
      return [];
    }

    const reason = getPurposeReason(primaryMember.row, direction, displayBoards);

    return [
      {
        direction,
        starNumber: primaryTag.starNumber ?? null,
        blendType: primaryTag.blendType ?? null,
        blendGrade: primaryTag.blendGrade ?? null,
        blendTone: primaryTag.blendTone ?? null,
        blendShortBadge: primaryTag.blendShortBadge ?? null,
        actionLabel: primaryTag.actionLabel ?? "整え行動",
        benefitLabel: primaryTag.benefitLabel ?? "開運",
        protectiveLabel: primaryTag.protectiveLabel ?? "",
        blendReason: primaryTag.blendReason ?? null,
        boards: displayBoards,
        reason,
        members: [
          {
            label: primaryMember.label,
            boards: displayBoards,
            reason,
          },
          ...companionRows.map((member) => ({
            label: member.label,
            boards: displayBoards,
            reason: getCompanionAvoidanceReason(
              member.row,
              direction,
              displayBoards,
              companionJudgementMode,
            ),
          })),
        ],
      },
    ] satisfies FamilyPurposeDirectionTag[];
  });
}

function getCandidateRank(
  boards: CalendarDbKyuseiBoard[],
  goodChipCount: number,
  badChipCount: number,
) {
  const boardSet = new Set(boards);

  if (
    boardSet.has("year") &&
    boardSet.has("month") &&
    boardSet.has("day") &&
    badChipCount === 0
  ) {
    return {
      label: "最有力候補",
      tone: "strong" as const,
      baseScore: 90,
    };
  }

  if (boardSet.has("month") && boardSet.has("day")) {
    return {
      label: "実用候補",
      tone: "practical" as const,
      baseScore: 76,
    };
  }

  if (boardSet.has("year") && boardSet.has("month")) {
    return {
      label: "長期候補",
      tone: "longTerm" as const,
      baseScore: 68,
    };
  }

  return {
    label:
      goodChipCount > 0 && badChipCount === 0 ? "暦後押し候補" : "条件つき候補",
    tone: "conditional" as const,
    baseScore: 55,
  };
}

function formatBoardOverlap(boards: CalendarDbKyuseiBoard[]) {
  const boardSet = new Set(boards);

  return boardOrder
    .map((board) => `${boardLabels[board]}盤: ${boardSet.has(board) ? "成立" : "判定外"}`)
    .join(" / ");
}

function formatBoardList(boards: CalendarDbKyuseiBoard[]) {
  const boardSet = new Set(boards);
  const labels = boardOrder
    .filter((board) => boardSet.has(board))
    .map((board) => boardLabels[board]);

  return labels.length > 0 ? labels.join("・") : "-";
}

function formatMonthlyBestCandidateReason(candidate: MonthlyBestCandidate) {
  if (candidate.isTenshaBi && !candidate.direction) {
    return [
      "天赦日",
      candidate.noteSummary ? `暦注: ${candidate.noteSummary}` : null,
      candidate.label,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const direction = candidate.direction
    ? formatPurposeBlendLabel(candidate.direction, candidate.starNumber)
    : "暦注候補";
  const boardLine =
    candidate.boards.length > 0 ? `盤: ${formatBoardList(candidate.boards)}` : null;
  const effectLine =
    candidate.benefitLabel || candidate.protectiveLabel
      ? `効能: ${candidate.benefitLabel || candidate.protectiveLabel}`
      : null;
  const actionLine = candidate.actionLabel ? `行動: ${candidate.actionLabel}` : null;
  const noteLine = candidate.noteSummary ? `暦注: ${candidate.noteSummary}` : null;

  return [direction, boardLine, effectLine, actionLine, noteLine]
    .filter(Boolean)
    .join("\n");
}

function formatFourBoardCandidateSummary(candidates: FourBoardCandidate[]) {
  return candidates
    .slice(0, 3)
    .map(
      (candidate) =>
        `${candidate.startTime}-${candidate.endTime} ${candidate.direction}[${candidate.star}]`,
    )
    .join(" / ");
}

function formatMonthlyBestCandidateReasonWithFourBoard(
  candidate: MonthlyBestCandidate,
  fourBoardCandidates: FourBoardCandidate[],
) {
  const baseReason = formatMonthlyBestCandidateReason(candidate);
  const fourBoardLine =
    fourBoardCandidates.length > 0
      ? `四盤一致: ${formatFourBoardCandidateSummary(fourBoardCandidates)}`
      : null;

  return [baseReason, fourBoardLine].filter(Boolean).join("\n");
}

function getBoardOverlapLabel(boards: CalendarDbKyuseiBoard[]) {
  const boardSet = new Set(boards);

  if (
    boardSet.has("year") &&
    boardSet.has("month") &&
    boardSet.has("day")
  ) {
    return {
      label: "三盤一致",
      tone: "strong" as const,
      priority: 4,
    };
  }

  if (boardSet.has("month") && boardSet.has("day")) {
    return {
      label: "月・日一致",
      tone: "practical" as const,
      priority: 3,
    };
  }

  if (boardSet.has("year") && boardSet.has("month")) {
    return {
      label: "年・月一致",
      tone: "longTerm" as const,
      priority: 2,
    };
  }

  if (boards.length > 0) {
    return {
      label: `${formatBoardList(boards)}盤候補`,
      tone: "single" as const,
      priority: 1,
    };
  }

  return null;
}

function getBoardOverlapStatus(tags: FamilyPurposeDirectionTag[]) {
  const ranked = tags
    .map((tag) => ({
      direction: tag.direction,
      boards: tag.boards,
      status: getBoardOverlapLabel(tag.boards),
    }))
    .filter((entry) => entry.status !== null) as Array<{
    direction: CalendarDbDirection;
    boards: CalendarDbKyuseiBoard[];
    status: NonNullable<ReturnType<typeof getBoardOverlapLabel>>;
  }>;

  if (ranked.length === 0) {
    return null;
  }

  ranked.sort((a, b) => b.status.priority - a.status.priority);

  const topPriority = ranked[0].status.priority;
  const topEntries = ranked.filter(
    (entry) => entry.status.priority === topPriority,
  );
  const detail = topEntries
    .slice(0, 3)
    .map((entry) => `${entry.direction}: ${formatBoardList(entry.boards)}`)
    .join(" / ");

  return {
    label: ranked[0].status.label,
    tone: ranked[0].status.tone,
    detail:
      topEntries.length > 3
        ? `${detail} / ほか${topEntries.length - 3}件`
        : detail,
  };
}

function getMonthlyBestCandidates(
  rows: CalendarDbRow[],
  tagsByDate: Map<string, FamilyPurposeDirectionTag[]>,
  candidateConditionLabel: string,
) {
  const candidates = rows.flatMap((row) => {
    const date = getDateFromRow(row);
    const day = Number(date.slice(-2));
    const tags = tagsByDate.get(date) ?? [];
    const selectedDayChips = getSelectedDayChips(row.values["主要選日"] ?? "-");
    const goodChipCount = selectedDayChips.filter(
      (chip) => chip.tone === "good",
    ).length;
    const goodChipLabels = selectedDayChips
      .filter((chip) => chip.tone === "good")
      .map((chip) => chip.label.replace(/^※/, ""));
    const selectedDayLabels = selectedDayChips.map((chip) =>
      chip.label.replace(/^※/, ""),
    );
    const hasTenshaBi = selectedDayLabels.some((label) =>
      label.includes("天赦日"),
    );
    const candidateNoteLabels = [
      hasTenshaBi ? "天赦日" : null,
      ...goodChipLabels.filter((label) => !label.includes("天赦日")),
    ].filter(Boolean) as string[];
    const mixedChipCount = selectedDayChips.filter(
      (chip) => chip.tone === "mixed",
    ).length;
    const badChipCount = selectedDayChips.filter(
      (chip) => chip.tone === "bad",
    ).length;
    const junichoku = row.values["十二直"] ?? "-";
    const nijuhachishuku = row.values["二十八宿"] ?? "-";
    const junichokuTone = getCalendarNoteTone("junichoku", junichoku);
    const nijuhachishukuTone = getCalendarNoteTone(
      "nijuhachishuku",
      nijuhachishuku,
    );
    const goodAlmanacNoteLabels = [
      junichokuTone === "good" && junichoku !== "-"
        ? `十二直 ${junichoku}`
        : null,
      nijuhachishukuTone === "good" && nijuhachishuku !== "-"
        ? `二十八宿 ${nijuhachishuku}`
        : null,
    ].filter(Boolean) as string[];
    const almanacNoteScore =
      (junichokuTone === "good" ? 2 : junichokuTone === "bad" ? -2 : 0) +
      (nijuhachishukuTone === "good"
        ? 2
        : nijuhachishukuTone === "bad"
          ? -2
          : 0);
    const dayTypeBonus =
      row.dayType === "holiday" || row.dayType === "saturday" || row.dayType === "sunday"
        ? 3
        : 0;
    const almanacOnlyCandidates =
      hasTenshaBi && tags.length === 0
        ? [
            {
              date,
              day,
              label: "暦注候補",
              noteSummary: "天赦日",
              direction: null,
              starNumber: null,
              blendType: null,
              blendGrade: null,
              blendTone: null,
              blendShortBadge: null,
              benefitLabel: "開運",
              protectiveLabel: "",
              actionLabel: "暦注候補",
              boards: [],
              score: 96 + dayTypeBonus - badChipCount * 2,
              reason: [
                "天赦日",
                `候補条件: ${candidateConditionLabel}`,
                "方位条件: 九星方位の月盤・日盤候補は不成立",
                "暦注として別格に注目",
                badChipCount > 0 ? `注意暦注 ${badChipCount}件` : null,
                dayTypeBonus > 0 ? "土日祝で使いやすい" : null,
              ]
                .filter(Boolean)
                .join("\n"),
              tone: "conditional" as const,
              isTenshaBi: true,
            } satisfies MonthlyBestCandidate,
          ]
        : [];

    return [
      ...almanacOnlyCandidates,
      ...tags.map((tag) => {
      const rank = getCandidateRank(tag.boards, goodChipCount, badChipCount);
      const boardScore = tag.boards.reduce((total, board) => {
        if (board === "year") {
          return total + 4;
        }

        return total + 8;
      }, 0);
      const score =
        rank.baseScore +
        boardScore +
        goodChipCount * 3 +
        (hasTenshaBi ? 12 : 0) +
        mixedChipCount -
        badChipCount * 4 +
        almanacNoteScore +
        dayTypeBonus;
      const reasonParts = [
        `方位象意: ${formatPurposeBlendHoverHeader(
          tag.direction,
          tag.starNumber,
          tag.blendType,
          tag.blendShortBadge,
        )}`,
        `九星方位: ${tag.actionLabel}`,
        tag.benefitLabel
          ? `ご利益: ${tag.benefitLabel}`
          : tag.protectiveLabel
            ? `守り: ${tag.protectiveLabel}`
            : null,
        `候補条件: ${candidateConditionLabel}`,
        `盤の重なり: ${formatBoardOverlap(tag.boards)}`,
      ];

      if (goodChipCount > 0) {
        reasonParts.push(`吉暦注: ${goodChipLabels.join("・")}`);
      }

      if (hasTenshaBi) {
        reasonParts.push("天赦日を別格加点");
      }

      if (badChipCount > 0) {
        reasonParts.push(`注意暦注 ${badChipCount}件`);
      }

      if (goodAlmanacNoteLabels.length > 0) {
        reasonParts.push(`十二直・二十八宿: ${goodAlmanacNoteLabels.join("・")}`);
      }

      if (dayTypeBonus > 0) {
        reasonParts.push("土日祝で使いやすい");
      }

      reasonParts.push(tag.reason);
      if (tag.blendReason) {
        reasonParts.push(`方位ブレンド: ${tag.blendReason}`);
      }

      return {
        date,
        day,
        label: rank.label,
        noteSummary: candidateNoteLabels.slice(0, 2).join("・"),
        direction: tag.direction,
        starNumber: tag.starNumber,
        blendType: tag.blendType,
        blendGrade: tag.blendGrade,
        blendTone: tag.blendTone,
        blendShortBadge: tag.blendShortBadge,
        benefitLabel: tag.benefitLabel,
        protectiveLabel: tag.protectiveLabel,
        actionLabel: tag.actionLabel,
        boards: tag.boards,
        score,
        reason: reasonParts.filter(Boolean).join("\n"),
        tone: rank.tone,
        isTenshaBi: hasTenshaBi,
      } satisfies MonthlyBestCandidate;
      }),
    ];
  });

  const sortedCandidates = candidates.sort(
    (a, b) =>
      b.score - a.score ||
      a.date.localeCompare(b.date) ||
      getDirectionOrderIndex(a.direction) - getDirectionOrderIndex(b.direction),
  );
  const bestByDate: MonthlyBestCandidate[] = [];
  const usedDates = new Set<string>();
  const candidatesToPick = [
    ...sortedCandidates.filter((candidate) => candidate.isTenshaBi),
    ...sortedCandidates.filter((candidate) => !candidate.isTenshaBi),
  ];

  candidatesToPick.forEach((candidate) => {
    if (usedDates.has(candidate.date) || bestByDate.length >= 6) {
      return;
    }

    bestByDate.push(candidate);
    usedDates.add(candidate.date);
  });

  return bestByDate;
}

function buildCalendarCells(year: number, month: number, lastDay: number) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayStartOffset = (firstWeekday + 6) % 7;
  const cells: Array<number | null> = [
    ...Array.from({ length: mondayStartOffset }, () => null),
    ...Array.from({ length: lastDay }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default async function PurposeCalendarPage({
  searchParams,
}: PurposeCalendarPageProps) {
  const params = (await searchParams) ?? {};
  const current = getCurrentDatePartsJst();
  const year = normalizeYear(params.year, current.year);
  const month = normalizeMonth(params.month, current.month);
  const birthDate = params.birthDate ?? "";
  const birthGender = params.birthGender === "female" ? "female" : "male";
  const familyStars = normalizeFamilyStarIds(params.familyStars);
  const purpose = params.purpose ?? "travel";
  const keyword = params.keyword?.trim() ?? "";
  const auspiciousOnly = params.auspiciousOnly === "on";
  const showChildSatsu = params.showChildSatsu === "on";
  const compassOrientation = normalizeCompassOrientation(
    params.compassOrientation,
  );
  const actionScale = getActionScaleFromParams(params);
  const selectedActionScaleOption = actionScaleOptions.find(
    (option) => option.id === actionScale,
  )!;
  const selectedActionScaleVirtue = getActionScaleVirtue(actionScale);
  const companionJudgementMode = normalizeCompanionJudgementMode(
    params.companionJudgementMode,
  );
  const candidateCondition = getCandidateConditionForActionScale(actionScale);
  const candidate = candidateCondition.candidate;
  const goodDirectionMatch = candidateCondition.goodDirectionMatch;
  const kyuseiMatch = "all";
  const range = getMonthRange(year, month);
  const selectedDate = normalizeSelectedDate(
    params.selectedDate,
    range,
    current.date,
  );
  const selfBirthResult = birthDate
    ? searchCalendarDb({
        year: birthDate.slice(0, 4),
        start: birthDate,
        end: birthDate,
        birthDate,
        birthGender,
        limit: 1,
        view: "kyusei",
      })
    : null;
  const selfContext = selfBirthResult?.personal ?? null;
  const natalKanshiParts = getKanshiParts(selfBirthResult?.rows[0]);
  const natalYearMountainMarkers = birthDate
    ? getNatalKanshiMountainMarkers(natalKanshiParts, "year")
    : [];
  const natalMonthMountainMarkers = birthDate
    ? getNatalKanshiMountainMarkers(natalKanshiParts, "month")
    : [];
  const natalDayMountainMarkers = birthDate
    ? getNatalKanshiMountainMarkers(natalKanshiParts, "day")
    : [];
  const natalKanshiSummary = {
    year: formatKanshiWithNacchin(natalKanshiParts.year),
    month: formatKanshiWithNacchin(natalKanshiParts.month),
    day: formatKanshiWithNacchin(natalKanshiParts.day),
  };
  const selectedCompanionStars = companionStarOptions
    .filter((member) => familyStars.includes(member.id))
    .flatMap((member) => {
      if (member.id === "self") {
        return selfContext
          ? [
              {
                id: member.id,
                label: "本人",
                star: selfContext.honmeiStar,
                display: selfContext.honmeiStarDisplay,
              },
            ]
          : [];
      }

      return [
        {
          id: member.id,
          label: member.label,
          star: member.star,
          display: member.display,
        },
      ];
    });

  const fullMonthResult = searchCalendarDb({
    year: String(year),
    start: range.start,
    end: range.end,
    birthDate,
    birthGender,
    honmeiStar: selectedCompanionStars[0]?.star ?? "",
    purpose: calendarComputationPurpose,
    dayType: "all",
    candidate: "all",
    goodDirectionMatch: "all",
    kyuseiMatch: "all",
    limit: 31,
    view: "kyusei",
  });
  const rowByDate = new Map(
    fullMonthResult.rows.map((row) => [getDateFromRow(row), row]),
  );
  const familyMemberRows = selectedCompanionStars.map((member) => {
    const result = searchCalendarDb({
      year: String(year),
      start: range.start,
      end: range.end,
      birthDate: "",
      birthGender,
      honmeiStar: member.star,
      purpose: calendarComputationPurpose,
      keyword: "",
      dayType: "all",
      candidate: "all",
      goodDirectionMatch: "all",
      kyuseiMatch: "all",
      limit: 31,
      view: "kyusei",
    });

    return {
      label: member.label,
      rowByDate: new Map(result.rows.map((row) => [getDateFromRow(row), row])),
    };
  });
  const commonTagsByDate = new Map(
    fullMonthResult.rows.map((row) => {
      const date = getDateFromRow(row);

      return [
        date,
        getFamilyPurposeDirectionTags(
          date,
          familyMemberRows,
          goodDirectionMatch,
          companionJudgementMode,
        ),
      ];
    }),
  );
  const fourBoardCandidatesByDate = new Map(
    fullMonthResult.rows.map((row) => {
      const date = getDateFromRow(row);

      return [
        date,
        getFourBoardCandidatesForDate(
          date,
          commonTagsByDate.get(date) ?? [],
          selectedCompanionStars,
          companionJudgementMode,
        ),
      ];
    }),
  );
  const monthlyBestCandidates = getMonthlyBestCandidates(
    fullMonthResult.rows,
    commonTagsByDate,
    `${selectedActionScaleOption.label} / ${candidateCondition.label}`,
  );
  const monthlyBestCandidateByDate = new Map(
    monthlyBestCandidates.map((candidate) => [candidate.date, candidate]),
  );
  const keywordMatchedDates = new Set(
    searchCalendarDb({
      year: String(year),
      start: range.start,
      end: range.end,
      birthDate: "",
      birthGender,
      honmeiStar: selectedCompanionStars[0]?.star ?? "",
      purpose,
      keyword,
      dayType: "all",
      candidate: "all",
      goodDirectionMatch: "all",
      kyuseiMatch,
      limit: 31,
      view: "kyusei",
    }).rows.map((row) => getDateFromRow(row)),
  );
  const matchedDates = new Set(
    fullMonthResult.rows
      .map((row) => getDateFromRow(row))
      .filter((date) => {
        const row = rowByDate.get(date);
        const commonTags = commonTagsByDate.get(date) ?? [];
        const hasCandidate = commonTags.length > 0;
        const needsCandidate =
          candidate === "has_candidate" || goodDirectionMatch !== "all";
        const matchesAuspicious =
          !auspiciousOnly || hasAuspiciousSelectedDay(row?.values["主要選日"]);

        return (
          keywordMatchedDates.has(date) &&
          (keyword !== "" || !needsCandidate || hasCandidate) &&
          matchesAuspicious
        );
      }),
  );
  const calendarCells = buildCalendarCells(year, month, range.lastDay);
  const solarTermEntryRow = getSolarTermEntryRow(fullMonthResult.rows);
  const solarTermEntryLabel = formatSolarTermEntry(solarTermEntryRow);
  const monthlyTonLabel = getMonthlyTonLabel(fullMonthResult.rows, range.start);
  const monthAnchorRow =
    solarTermEntryRow ?? rowByDate.get(range.start) ?? fullMonthResult.rows[0] ?? null;
  const selectedDayRowInDisplayedMonth = rowByDate.get(selectedDate) ?? null;
  const datePremiseRow =
    selectedDayRowInDisplayedMonth ?? rowByDate.get(range.start) ?? monthAnchorRow;
  const yearPremiseRow = datePremiseRow;
  const monthPremiseRow = datePremiseRow;
  const yearBoard = yearPremiseRow?.kyuseiBoardRows.find(
    (board) => board.board === "year",
  );
  const monthBoard = monthPremiseRow?.kyuseiBoardRows.find(
    (board) => board.board === "month",
  );
  const yearMovementWarningChips = getMovementWarningChips(
    yearPremiseRow?.values["方位殺"],
    ["年"],
    undefined,
    yearPremiseRow?.directionBoardValues,
  );
  const monthMovementWarningChips = getMovementWarningChips(
    monthPremiseRow?.values["方位殺"],
    ["月"],
    undefined,
    monthPremiseRow?.directionBoardValues,
  );
  const yearDirectionDeityEntries = getDirectionDeityEntries(yearPremiseRow, [
    "year",
  ]);
  const monthDirectionDeityEntries = getDirectionDeityEntries(monthPremiseRow, [
    "month",
  ]);
  const premiseDayRow = datePremiseRow;
  const premiseDayDate = premiseDayRow ? getDateFromRow(premiseDayRow) : "-";
  const premiseDayTags = commonTagsByDate.get(premiseDayDate) ?? [];
  const premiseDayBoard = premiseDayRow?.kyuseiBoardRows.find(
    (board) => board.board === "day",
  );
  const premiseDayMovementWarningChips = getMovementWarningChips(
    premiseDayRow?.values["方位殺"],
    ["日"],
    premiseDayRow?.values["土用"],
    premiseDayRow?.directionBoardValues,
  );
  const premiseDayDirectionDeityEntries = getDirectionDeityEntries(
    premiseDayRow,
    ["day"],
  );
  const monthTendoChip = monthPremiseRow
    ? getTendoDisplayChip(
        getDateFromRow(monthPremiseRow),
        monthPremiseRow,
        familyMemberRows,
      )
    : null;
  const premiseDayTendoChip = premiseDayRow
    ? getTendoDisplayChip(premiseDayDate, premiseDayRow, familyMemberRows)
    : null;
  const premiseDayChildSatsuChip =
    showChildSatsu && premiseDayRow
      ? getChildSatsuWarningChip(premiseDayRow.values["小児殺"])
      : null;
  const yearCompassStates = getDirectionCompassStates(
    yearPremiseRow,
    [...premiseDayTags, ...getBoardCandidateTags(yearPremiseRow, "year")],
    yearMovementWarningChips,
    null,
    null,
    "year",
  );
  const monthCompassStates = getDirectionCompassStates(
    monthPremiseRow,
    [...premiseDayTags, ...getBoardCandidateTags(monthPremiseRow, "month")],
    monthMovementWarningChips,
    monthTendoChip?.blocked ? null : monthTendoChip,
    null,
    "month",
  );
  const premiseDayCompassStates = getDirectionCompassStates(
    premiseDayRow,
    [...premiseDayTags, ...getBoardCandidateTags(premiseDayRow, "day")],
    premiseDayMovementWarningChips,
    premiseDayTendoChip?.blocked ? null : premiseDayTendoChip,
    premiseDayChildSatsuChip,
    "day",
  );
  const yearBoardNumber = getKyuseiDisplayNumber(yearBoard?.kyusei);
  const monthBoardNumber = getKyuseiDisplayNumber(monthBoard?.kyusei);
  const premiseDayBoardNumber = getKyuseiDisplayNumber(premiseDayBoard?.kyusei);
  const yearEraContext = getJapaneseEraDateContext(`${year}-01-01`);
  const yearBoardHeaderLabel = `${yearEraContext.era.display} ${year}年`;
  const monthBoardHeaderLabel = `${month}月`;
  const monthBoardSourceDate = monthPremiseRow ? getDateFromRow(monthPremiseRow) : "-";
  const monthBoardSourceParts = getDatePartsForDisplay(monthBoardSourceDate);
  const monthBoardSourceLabel = monthBoardSourceParts
    ? `表示日 ${monthBoardSourceParts.month}/${monthBoardSourceParts.day}時点`
    : "表示日基準";
  const premiseDayRokuyo = premiseDayRow?.values["六曜"] ?? "-";
  const premiseDayDisplayParts = getDatePartsForDisplay(premiseDayDate);
  const premiseDayEraContext =
    premiseDayDate !== "-" ? getJapaneseEraDateContext(premiseDayDate) : null;
  const premiseDayHeaderLabel = premiseDayDisplayParts
    ? `${premiseDayDisplayParts.day}日`
    : "-";
  const anchorKanshi = getKanshiParts(yearPremiseRow);
  const monthPremiseKanshiParts = getKanshiParts(monthPremiseRow);
  const premiseDayKanshiParts = getKanshiParts(premiseDayRow);
  const yearKanshi = formatKanshiWithNacchin(anchorKanshi.year);
  const monthKanshi = formatKanshiWithNacchin(monthPremiseKanshiParts.month);
  const premiseDayKanshi = formatKanshiWithNacchin(premiseDayKanshiParts.day);
  const monthlySourceMarkerYearGroup =
    getMonthlyPlateSourceMarkerGroupForYearBranch(
      anchorKanshi.year.slice(1, 2),
    );
  const monthlySourceCoverage = getMonthlyPlateSourceCoverageForDisplay({
    yearBranchGroup: monthlySourceMarkerYearGroup,
    monthBranch: monthPremiseKanshiParts.month.slice(1, 2),
  });
  const premiseJunichoku = premiseDayRow?.values["十二直"] ?? "-";
  const premiseNijuhachishuku = premiseDayRow?.values["二十八宿"] ?? "-";
  const premiseDoyoPeriodChip = getDoyoPeriodChip(premiseDayRow?.values["土用"]);
  const premiseSelectedDayChips = getSelectedDayChips(
    premiseDayRow?.values["主要選日"] ?? "-",
  );
  const premiseTodayTitle = premiseDayDisplayParts
    ? `${premiseDayEraContext?.era.display ?? ""}（西暦${premiseDayDisplayParts.year}）${premiseDayDisplayParts.month}月${premiseDayDisplayParts.day}日（${premiseDayDisplayParts.weekday}）${premiseDayRokuyo !== "-" ? ` ${premiseDayRokuyo}` : ""}`
    : "-";
  const premiseDetailChips = [
    premiseDayRokuyo !== "-"
      ? {
          label: `六曜 ${premiseDayRokuyo}`,
          href: getCalendarNoteTermHref("rokuyo", premiseDayRokuyo),
          tone: "neutral",
          title: `六曜 ${premiseDayRokuyo}`,
        }
      : null,
    premiseJunichoku !== "-"
      ? {
          label: `十二直 ${premiseJunichoku}`,
          href: getCalendarNoteTermHref("junichoku", premiseJunichoku),
          tone: getCalendarNoteTone("junichoku", premiseJunichoku),
          title: `十二直 ${premiseJunichoku}`,
        }
      : null,
    premiseNijuhachishuku !== "-"
      ? {
          label: `二十八宿 ${premiseNijuhachishuku}`,
          href: getCalendarNoteTermHref(
            "nijuhachishuku",
            premiseNijuhachishuku,
          ),
          tone: getCalendarNoteTone("nijuhachishuku", premiseNijuhachishuku),
          title: `二十八宿 ${premiseNijuhachishuku}`,
        }
      : null,
    ...premiseSelectedDayChips.map((chip) => ({
      label: chip.label,
      href: getCalendarNoteTermHref("selected-days", chip.label),
      tone: chip.tone,
      title: `選日 ${chip.label}`,
    })),
    premiseDoyoPeriodChip
      ? {
          label: `土用 ${premiseDoyoPeriodChip.label}${
            premiseDoyoPeriodChip.isManichi ? " / 間日" : ""
          }`,
          href: null,
          tone: premiseDoyoPeriodChip.isManichi ? "mixed" : "bad",
          title: "土用",
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string | null;
    label: string;
    tone: "good" | "mixed" | "bad" | "neutral";
    title: string;
  }>;
  const yearKanshiFocus = getKanshiMountainFocus(anchorKanshi.year);
  const monthKanshiFocus = getKanshiMountainFocus(
    monthPremiseKanshiParts.month,
  );
  const premiseDayKanshiFocus = getKanshiMountainFocus(premiseDayKanshiParts.day);
  const yearKuubouVoid = getKuubouMountainVoid(yearKanshi.kuubou);
  const monthKuubouVoid = getKuubouMountainVoid(monthKanshi.kuubou);
  const premiseDayKuubouVoid = getKuubouMountainVoid(premiseDayKanshi.kuubou);
  const monthTendoBranch = monthKanshi.kanshi.slice(1, 2);
  const premiseDayTendoBranch = premiseDayKanshi.kanshi.slice(1, 2);
  const monthTendoTrine = getTendoTrineByMonthBranch(monthTendoBranch);
  const monthTendoTriangles = getTendoTriangleMountains(
    monthTendoBranch,
    "month",
  );
  const premiseDayTendoTriangles = getTendoTriangleMountains(
    monthTendoBranch,
    "day",
    premiseDayTendoBranch,
  );
  const premiseDayTendoFallback = monthTendoTrine
    ? `月天道 ${monthTendoTrine.name} / ${monthTendoTrine.virtue} / ${monthTendoTrine.dayBranches.join("・")} の該当日に表示。今日 ${premiseDayTendoBranch || "-"} は該当外`
    : null;
  const yearMountainGuideItems = getDirectionMountainGuideItems({
    deityEntries: yearDirectionDeityEntries,
    focusMountains: yearKanshiFocus,
    kanshiLabel: yearKanshi.kanshi,
    natalMountains: natalYearMountainMarkers,
    scope: "year",
    voidMountains: yearKuubouVoid,
  });
  const monthMountainGuideItems = getDirectionMountainGuideItems({
    deityEntries: monthDirectionDeityEntries,
    focusMountains: monthKanshiFocus,
    kanshiLabel: monthKanshi.kanshi,
    natalMountains: natalMonthMountainMarkers,
    scope: "month",
    tendoTriangles: monthTendoTriangles,
    voidMountains: monthKuubouVoid,
  });
  const premiseDayMountainGuideItems = getDirectionMountainGuideItems({
    deityEntries: premiseDayDirectionDeityEntries,
    focusMountains: premiseDayKanshiFocus,
    kanshiLabel: premiseDayKanshi.kanshi,
    natalMountains: natalDayMountainMarkers,
    scope: "day",
    tendoFallback: premiseDayTendoFallback,
    tendoTriangles: premiseDayTendoTriangles,
    voidMountains: premiseDayKuubouVoid,
  });
  const currentDateRow = rowByDate.get(current.date) ?? null;
  const currentCalendarDay = currentDateRow ? getCalendarDay(current.date) : null;
  const currentHourBranchForSummary = getHourBranchByHour(current.hour);
  const currentHourBoardForSummary =
    currentCalendarDay && currentHourBranchForSummary
      ? getHourBoardRowsForCalendarDay(currentCalendarDay).find(
          (hourBoard) => hourBoard.branch === currentHourBranchForSummary,
        ) ?? null
      : null;
  const todayYearMonthDayTags = (commonTagsByDate.get(current.date) ?? []).filter(
    hasYearMonthDayOverlap,
  );
  const todayFourBoardCandidates = currentHourBoardForSummary
      ? getHourBoardGoodDirectionItems(
          currentHourBoardForSummary.directions,
          selectedCompanionStars,
          companionJudgementMode,
        )
        .filter((item) =>
          todayYearMonthDayTags.some((tag) => tag.direction === item.direction),
        )
        .map((item) => ({
          ...item,
          ...getHourBoardTimeParts(currentHourBoardForSummary),
          branch: currentHourBoardForSummary.branch,
        }))
    : [];
  const previousSelectedDate = addDays(selectedDate, -1);
  const nextSelectedDate = addDays(selectedDate, 1);
  const previousSelectedDateHref = isDateInRange(previousSelectedDate, range)
    ? buildPurposeCalendarHref(previousSelectedDate)
    : null;
  const nextSelectedDateHref = isDateInRange(nextSelectedDate, range)
    ? buildPurposeCalendarHref(nextSelectedDate)
    : null;

  function appendPurposeCalendarParams(
    formData: URLSearchParams,
    date: string,
  ) {
    formData.set("purpose", calendarComputationPurpose);
    formData.set("candidateCondition", candidateCondition.id);
    formData.set("birthDate", birthDate);
    formData.set("birthGender", birthGender);
    familyStars.forEach((star) => formData.append("familyStars", star));
    formData.set("year", String(year));
    formData.set("month", String(month));
    formData.set("compassOrientation", compassOrientation);
    formData.set("keyword", keyword);
    formData.set("actionScale", actionScale);
    formData.set("companionJudgementMode", companionJudgementMode);
    formData.set("selectedDate", date);

    if (auspiciousOnly) {
      formData.set("auspiciousOnly", "on");
    }

    if (showChildSatsu) {
      formData.set("showChildSatsu", "on");
    }
  }

  function buildPurposeCalendarHref(date: string) {
    const formData = new URLSearchParams();
    appendPurposeCalendarParams(formData, date);

    return `/purpose-calendar?${formData.toString()}`;
  }

  return (
    <main className="shell purposeCalendarShell">
      <section className="hero purposeCalendarHero">
        <p className="eyebrow">Kyusei Direction Calendar</p>
        <h1>九星方位カレンダー</h1>
        <p>
          年盤・月盤・日盤・時盤を重ね、方位と暦から日々の整え方を読む月間カレンダーです。
          近場から宿泊、特別時刻まで、目的に合わせて見る盤を切り替えます。
        </p>
        <SiteSectionNav active="purpose-calendar" />
      </section>

      <section className="panel purposeCalendarControlPanel">
        <details className="purposeCalendarSettings" open>
          <summary>
            <span>条件を変更する</span>
            <small>生年月日・年月・目的を設定</small>
          </summary>
          <form className="purposeCalendarSearchForm" action="/purpose-calendar">
            <input type="hidden" name="purpose" value={calendarComputationPurpose} />
            <input
              type="hidden"
              name="candidateCondition"
              value={candidateCondition.id}
            />
            <div className="purposeCalendarBirthRow">
              <div className="purposeCalendarBirthControls">
                <label>
                  生年月日
                  <input
                    name="birthDate"
                    type="date"
                    defaultValue={birthDate}
                    min={`${startYear}-01-01`}
                    max={`${endYear}-12-31`}
                  />
                </label>
                <fieldset className="purposeCalendarGenderRadios">
                  <legend>性別</legend>
                  <label>
                    <input
                      type="radio"
                      name="birthGender"
                      value="male"
                      defaultChecked={birthGender === "male"}
                    />
                    <span>男</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="birthGender"
                      value="female"
                      defaultChecked={birthGender === "female"}
                    />
                    <span>女</span>
                  </label>
                </fieldset>
                <label className="purposeCalendarChildSatsuToggle">
                  <input
                    type="checkbox"
                    name="showChildSatsu"
                    defaultChecked={showChildSatsu}
                  />
                  <span>小児殺を表示</span>
                </label>
              </div>
              <fieldset className="purposeCalendarFamilyChecks">
                <legend>同行者チェック</legend>
                <label className="purposeCalendarCompanionMode">
                  <span>判定</span>
                  <select
                    name="companionJudgementMode"
                    defaultValue={companionJudgementMode}
                  >
                    {companionJudgementModeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {companionStarOptions.map((member) => (
                  <label key={member.id}>
                    <input
                      type="checkbox"
                      name="familyStars"
                      value={member.id}
                      defaultChecked={familyStars.includes(member.id)}
                    />
                    <span>
                      {member.id === "self"
                        ? `本人 / ${
                            formatCompanionStarDisplay(
                              selfContext?.honmeiStarDisplay,
                            ) ?? "生年月日から判定"
                          }`
                      : member.display}
                    </span>
                  </label>
                ))}
              </fieldset>
              <p>
                本人は生年月日から判定します。同行者の星を複数選び、厳格・標準・ゆるめで候補の絞り方を切り替えます。
              </p>
              {selfContext ? (
                <div className="purposeCalendarPersonalProfile">
                  <div className="purposeCalendarPersonalProfileHeader">
                    <span>個人プロフィール</span>
                    <small>
                      {selfContext.profile.sourceStatus === "sample_verified"
                        ? "サンプル確認済み"
                        : selfContext.profile.sourceStatus === "keisha_rule_v0"
                          ? "傾斜法 v0"
                        : "仮採用"}
                    </small>
                  </div>
                  <dl>
                    <div>
                      <dt>本命星</dt>
                      <dd>{formatCompanionStarDisplay(selfContext.honmeiStarDisplay)}</dd>
                    </div>
                    <div>
                      <dt>傾斜</dt>
                      <dd>{selfContext.profile.keisha ?? "検証待ち"}</dd>
                    </div>
                    <div>
                      <dt>傾斜星</dt>
                      <dd>{selfContext.profile.keishaStar ?? "-"}</dd>
                    </div>
                    <div>
                      <dt>傾斜方位神</dt>
                      <dd>
                        {formatPersonalProfileList(
                          selfContext.profile.keishaDirectionGods,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>最大吉方</dt>
                      <dd>
                        {formatPersonalProfileList(selfContext.profile.maxGoodStars)}
                      </dd>
                    </div>
                    <div>
                      <dt>吉方</dt>
                      <dd>{formatPersonalProfileList(selfContext.profile.goodStars)}</dd>
                    </div>
                  </dl>
                  {selfContext.profile.keishaGood ||
                  selfContext.profile.keishaCaution ? (
                    <div className="purposeCalendarKeishaTraits">
                      {selfContext.profile.keishaGood ? (
                        <p>
                          <span>良い面</span>
                          {selfContext.profile.keishaGood}
                        </p>
                      ) : null}
                      {selfContext.profile.keishaCaution ? (
                        <p>
                          <span>注意面</span>
                          {selfContext.profile.keishaCaution}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <p>{selfContext.profile.note}</p>
                </div>
              ) : null}
            </div>
            <div className="purposeCalendarSearchPrimary">
              <label>
                年
                <select name="year" defaultValue={year}>
                  {yearOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === current.year ? `${option}（今年）` : option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                月
                <select name="month" defaultValue={month}>
                  {monthOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}月
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="purposeCalendarCompassOrientationRadios">
                <legend>方位盤</legend>
                <label>
                  <input
                    type="radio"
                    name="compassOrientation"
                    value="north-top"
                    defaultChecked={compassOrientation === "north-top"}
                  />
                  <span>北を上</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="compassOrientation"
                    value="south-top"
                    defaultChecked={compassOrientation === "south-top"}
                  />
                  <span>南を上</span>
                </label>
              </fieldset>
              <label className="purposeCalendarAuspiciousFilter">
                <span>吉日</span>
                <span>
                  <input
                    type="checkbox"
                    name="auspiciousOnly"
                    defaultChecked={auspiciousOnly}
                  />
                  重ねる
                </span>
              </label>
              <label>
                キーワード
                <input
                  name="keyword"
                  type="search"
                  defaultValue={keyword}
                  placeholder="天赦日 / 一粒万倍日 / 温泉"
                />
              </label>
              <button className="purposeCalendarSearchSubmit" type="submit">
                表示
              </button>
            </div>
            <fieldset className="purposeCalendarActionScaleChecks">
              <legend>目的</legend>
              {actionScaleOptions.map((option) => (
                <div className="purposeCalendarActionScaleOption" key={option.id}>
                  <label>
                    <input
                      type="radio"
                      name="actionScale"
                      value={option.id}
                      defaultChecked={actionScale === option.id}
                    />
                    <span>{option.label}</span>
                    <small>{option.summary}</small>
                    <small>距離目安: {option.distanceLabel}</small>
                  </label>
                </div>
              ))}
              <details className="purposeCalendarActionScaleRequirement">
                <summary>5分類の摘要をまとめて見る</summary>
                <div className="purposeCalendarActionScaleRequirementGrid">
                  {actionScaleOptions.map((option) => (
                    <section key={`requirement-${option.id}`}>
                      <h3>{option.label}</h3>
                      <p>
                        <span>体験</span>
                        <strong>{option.experience}</strong>
                      </p>
                      <p>
                        <span>最低条件</span>
                        <strong>{option.minimumCondition}</strong>
                      </p>
                      <p>
                        <span>強調条件</span>
                        <strong>{option.highlightCondition}</strong>
                      </p>
                      <p>
                        <span>暦注・雑節</span>
                        <strong>{option.calendarNoteBoosts.join(" / ")}</strong>
                      </p>
                      <p>
                        <span>凶殺方針</span>
                        <strong>{option.warningPolicy}</strong>
                      </p>
                      <p>
                        <span>読み方</span>
                        <strong>{option.guide}</strong>
                      </p>
                      <p>
                        <span>行動例</span>
                        <strong>{option.actionExamples}</strong>
                      </p>
                      <p className="purposeCalendarActionTopics">
                        <span>この目的に含まれる行動</span>
                        <strong>
                          {option.actionTopics.map((topic) => (
                            <em key={`${option.id}-${topic}`}>{topic}</em>
                          ))}
                        </strong>
                      </p>
                      {(() => {
                        const virtue = getActionScaleVirtue(option.id);

                        if (!virtue) {
                          return null;
                        }

                        const stars = virtue.starNumbers
                          .map((number) => getFengShuiVirtueByStar(number))
                          .filter(
                            (
                              entry,
                            ): entry is Exclude<
                              ReturnType<typeof getFengShuiVirtueByStar>,
                              null
                            > => entry !== null,
                          );

                        return (
                          <p className="purposeCalendarVirtueTags">
                            <span>得られやすい方徳</span>
                            <strong>
                              {virtue.virtueTags.map((tag) => (
                                <em key={`${option.id}-virtue-${tag}`}>{tag}</em>
                              ))}
                            </strong>
                            <small>
                              相性のよい象意:{" "}
                              {stars
                                .map(
                                  (entry) =>
                                    `${entry.starName.replace("星", "")}(${entry.direction})`,
                                )
                                .join(" / ")}
                            </small>
                            <small>天道・三合補助: {virtue.trineBoosts.join(" / ")}</small>
                          </p>
                        );
                      })()}
                    </section>
                  ))}
                </div>
              </details>
              <p className="purposeCalendarPurposeHint">
                <span>現在の優先表示</span>
                <strong>{selectedActionScaleOption.label}</strong>
                <em>{candidateCondition.label}</em>
                <small>{selectedActionScaleOption.guide}</small>
              </p>
            </fieldset>
          </form>
        </details>
        <details className="purposeCalendarConditionSummary">
          <summary>
            <span>現在の条件を見る</span>
            <small>
              {selectedActionScaleOption.label} /{" "}
              {selectedCompanionStars.length.toLocaleString()}星
            </small>
          </summary>
          <div className="purposeCalendarSummary">
            <div>
              <span>目的</span>
              <strong>{selectedActionScaleOption.label}</strong>
            </div>
            <div>
              <span>距離目安</span>
              <strong>{selectedActionScaleOption.distanceLabel}</strong>
            </div>
            <div>
              <span>対象星</span>
              <strong>
                {selectedCompanionStars.length > 0
                  ? selectedCompanionStars
                      .map((member) => `${member.label} ${member.display}`)
                      .join(" / ")
                  : "未設定"}
              </strong>
            </div>
            <div>
              <span>候補日</span>
              <strong>{matchedDates.size.toLocaleString()}日</strong>
            </div>
            <div>
              <span>吉日</span>
              <strong>{auspiciousOnly ? "重ねる" : "指定なし"}</strong>
            </div>
            <div>
              <span>小児殺</span>
              <strong>{showChildSatsu ? "表示" : "非表示"}</strong>
            </div>
            <div>
              <span>方位盤</span>
              <strong>
                {compassOrientation === "north-top" ? "北上" : "南上"}
              </strong>
            </div>
            <div>
              <span>キーワード</span>
              <strong>{keyword || "指定なし"}</strong>
            </div>
          </div>
          <div className="purposeCalendarActionScaleGuide">
            <div>
              <span>{selectedActionScaleOption.label}</span>
              <strong>{selectedActionScaleOption.summary}</strong>
              <p>{selectedActionScaleOption.guide}</p>
              <small>
                距離目安: {selectedActionScaleOption.distanceLabel}
              </small>
              <small>
                行動例: {selectedActionScaleOption.actionExamples}
              </small>
              {selectedActionScaleVirtue ? (
                <small>
                  方徳: {selectedActionScaleVirtue.virtueTags.join(" / ")}
                </small>
              ) : null}
            </div>
          </div>
        </details>
      </section>

      <section className="panel purposeCalendarPanel">
        <div className="purposeCalendarHeader">
          <div>
            <p className="eyebrow">Monthly View</p>
            <h2>
              {year}年{month}月の九星方位
            </h2>
            <div className="purposeCalendarMonthlyPremise">
              <div className="purposeCalendarMonthlyPremiseHeader">
                <span>{premiseTodayTitle}</span>
                {premiseDetailChips.length > 0 ? (
                  <div className="purposeCalendarPremiseDetailChips">
                    {premiseDetailChips.map((chip) =>
                      chip.href ? (
                        <a
                          className={`purposeCalendarPremiseDetailChip purposeCalendarPremiseDetailChip-${chip.tone}`}
                          href={chip.href}
                          key={`${chip.title}-${chip.label}`}
                          rel="noreferrer"
                          target="_blank"
                          title={`${chip.title}の説明を開く`}
                        >
                          {chip.label}
                        </a>
                      ) : (
                        <span
                          className={`purposeCalendarPremiseDetailChip purposeCalendarPremiseDetailChip-${chip.tone}`}
                          key={`${chip.title}-${chip.label}`}
                          title={chip.title}
                        >
                          {chip.label}
                        </span>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
              <div className="purposeCalendarPremiseDateSwitch">
                {previousSelectedDateHref ? (
                  <Link href={previousSelectedDateHref}>前日</Link>
                ) : (
                  <span>前日</span>
                )}
                <form action="/purpose-calendar">
                  <input
                    type="hidden"
                    name="purpose"
                    value={calendarComputationPurpose}
                  />
                  <input
                    type="hidden"
                    name="candidateCondition"
                    value={candidateCondition.id}
                  />
                  <input type="hidden" name="birthDate" value={birthDate} />
                  <input type="hidden" name="birthGender" value={birthGender} />
                  {familyStars.map((star) => (
                    <input
                      key={`selected-date-family-${star}`}
                      type="hidden"
                      name="familyStars"
                      value={star}
                    />
                  ))}
                  <input type="hidden" name="year" value={year} />
                  <input type="hidden" name="month" value={month} />
                  <input
                    type="hidden"
                    name="compassOrientation"
                    value={compassOrientation}
                  />
                  <input type="hidden" name="keyword" value={keyword} />
                  <input type="hidden" name="actionScale" value={actionScale} />
                  <input
                    type="hidden"
                    name="companionJudgementMode"
                    value={companionJudgementMode}
                  />
                  {auspiciousOnly ? (
                    <input type="hidden" name="auspiciousOnly" value="on" />
                  ) : null}
                  {showChildSatsu ? (
                    <input type="hidden" name="showChildSatsu" value="on" />
                  ) : null}
                  <label>
                    表示日
                    <input
                      max={range.end}
                      min={range.start}
                      name="selectedDate"
                      type="date"
                      defaultValue={selectedDate}
                    />
                  </label>
                  <button type="submit">切替</button>
                </form>
                {nextSelectedDateHref ? (
                  <Link href={nextSelectedDateHref}>翌日</Link>
                ) : (
                  <span>翌日</span>
                )}
              </div>
              <input
                className="purposeCalendarMountainGuideToggle"
                id="purpose-calendar-mountain-guide-toggle"
                type="checkbox"
              />
              <div className="purposeCalendarBoardCompasses">
                <div className="purposeCalendarBoardCard">
                  <span className="purposeCalendarCompassHeader">
                    年盤 <em>{yearBoardHeaderLabel}</em>
                  </span>
                  <div className="purposeCalendarBoardMeta">
                    <strong>
                      {renderKyuseiTermLink(yearBoard?.kyusei)}
                    </strong>
                    <small>
                      {yearKanshi.id !== "-" ? `${yearKanshi.id} ` : ""}
                      {yearKanshi.kanshi}
                      {yearKanshi.nacchin !== "-"
                        ? (
                            <>
                              {" / "}
                              {renderDictionaryLink(
                                yearKanshi.nacchin,
                                getNacchinTermHref(yearKanshi.nacchin),
                                `納音 ${yearKanshi.nacchin}の説明を開く`,
                              )}
                            </>
                          )
                        : ""}
                    </small>
                    <small className="purposeCalendarKuubou">
                      空亡{" "}
                      {renderDictionaryLink(
                        yearKanshi.kuubou,
                        getKuubouTermHref(yearKanshi.kuubou),
                        `空亡 ${yearKanshi.kuubou}の説明を開く`,
                      )}
                    </small>
                    <small className="purposeCalendarDeityScopeNote">
                      {directionMountainScopeCopy.year.note}
                    </small>
                  </div>
                  <DirectionCompass
                    centerLabel="年盤"
                    centerValue={yearBoardNumber}
                    getPointHref={getDirectionBlendHref}
                    openLinksInNewTab
                    orientation={compassOrientation}
                    states={yearCompassStates}
                    title={`${year}年 年盤方位`}
                  />
                  <DirectionMountainRing
                    centerLabel="年神"
                    entries={yearDirectionDeityEntries}
                    focusMountains={yearKanshiFocus}
                    natalMountains={natalYearMountainMarkers}
                    orientation={compassOrientation}
                    title={`${year}年 年盤方位神盤`}
                    voidMountains={yearKuubouVoid}
                  />
                  <div className="purposeCalendarMountainGuide">
                    {yearMountainGuideItems.map((item) => (
                      <p
                        className={
                          item.tone
                            ? `purposeCalendarMountainGuide-${item.tone}`
                            : undefined
                        }
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        {item.text}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="purposeCalendarBoardCard">
                  <span className="purposeCalendarCompassHeader">
                    月盤 <em>{monthBoardHeaderLabel}</em>
                    <small>{monthBoardSourceLabel}</small>
                  </span>
                  <div className="purposeCalendarBoardMeta">
                    <strong>
                      {renderKyuseiTermLink(monthBoard?.kyusei)}
                    </strong>
                    <small>
                      {monthKanshi.id !== "-" ? `${monthKanshi.id} ` : ""}
                      {monthKanshi.kanshi}
                      {monthKanshi.nacchin !== "-"
                        ? (
                            <>
                              {" / "}
                              {renderDictionaryLink(
                                monthKanshi.nacchin,
                                getNacchinTermHref(monthKanshi.nacchin),
                                `納音 ${monthKanshi.nacchin}の説明を開く`,
                              )}
                            </>
                          )
                        : ""}
                    </small>
                    <small className="purposeCalendarKuubou">
                      空亡{" "}
                      {renderDictionaryLink(
                        monthKanshi.kuubou,
                        getKuubouTermHref(monthKanshi.kuubou),
                        `空亡 ${monthKanshi.kuubou}の説明を開く`,
                      )}
                    </small>
                    <small className="purposeCalendarDeityScopeNote">
                      {directionMountainScopeCopy.month.note}
                    </small>
                  </div>
                  <MonthlyPlateSourceCoverage coverage={monthlySourceCoverage} />
                  <DirectionCompass
                    centerLabel="月盤"
                    centerValue={monthBoardNumber}
                    getPointHref={getDirectionBlendHref}
                    openLinksInNewTab
                    orientation={compassOrientation}
                    states={monthCompassStates}
                    title={`${monthBoardHeaderLabel} 月盤方位`}
                  />
                  <DirectionMountainRing
                    centerLabel="月神"
                    entries={monthDirectionDeityEntries}
                    focusMountains={monthKanshiFocus}
                    natalMountains={natalMonthMountainMarkers}
                    orientation={compassOrientation}
                    tendoTriangles={monthTendoTriangles}
                    title={`${monthBoardHeaderLabel} 月盤方位神盤`}
                    voidMountains={monthKuubouVoid}
                  />
                  <div className="purposeCalendarMountainGuide">
                    {monthMountainGuideItems.map((item) => (
                      <p
                        className={
                          item.tone
                            ? `purposeCalendarMountainGuide-${item.tone}`
                            : undefined
                        }
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        {item.text}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="purposeCalendarBoardCard">
                  <span className="purposeCalendarCompassHeader">
                    日盤 <em>{premiseDayHeaderLabel}</em>
                  </span>
                  <div className="purposeCalendarBoardMeta">
                    <strong>
                      {renderKyuseiTermLink(premiseDayBoard?.kyusei)}
                    </strong>
                    <small>
                      {premiseDayKanshi.id !== "-"
                        ? `${premiseDayKanshi.id} `
                        : ""}
                      {premiseDayKanshi.kanshi !== "-"
                        ? premiseDayKanshi.kanshi
                        : ""}
                      {premiseDayKanshi.nacchin !== "-"
                        ? (
                            <>
                              {" / "}
                              {renderDictionaryLink(
                                premiseDayKanshi.nacchin,
                                getNacchinTermHref(premiseDayKanshi.nacchin),
                                `納音 ${premiseDayKanshi.nacchin}の説明を開く`,
                              )}
                            </>
                          )
                        : ""}
                    </small>
                    <small className="purposeCalendarKuubou">
                      空亡{" "}
                      {renderDictionaryLink(
                        premiseDayKanshi.kuubou,
                        getKuubouTermHref(premiseDayKanshi.kuubou),
                        `空亡 ${premiseDayKanshi.kuubou}の説明を開く`,
                      )}
                    </small>
                    <small className="purposeCalendarDeityScopeNote">
                      {directionMountainScopeCopy.day.note}
                    </small>
                  </div>
                  <DirectionCompass
                    centerLabel="日盤"
                    centerValue={premiseDayBoardNumber}
                    getPointHref={getDirectionBlendHref}
                    openLinksInNewTab
                    orientation={compassOrientation}
                    states={premiseDayCompassStates}
                    title={`${premiseDayDate} 日盤方位`}
                  />
                  <DirectionMountainRing
                    centerLabel="日神"
                    entries={premiseDayDirectionDeityEntries}
                    focusMountains={premiseDayKanshiFocus}
                    natalMountains={natalDayMountainMarkers}
                    orientation={compassOrientation}
                    tendoTriangles={premiseDayTendoTriangles}
                    title={`${premiseDayDate} 日盤方位神盤`}
                    voidMountains={premiseDayKuubouVoid}
                  />
                  <div className="purposeCalendarMountainGuide">
                    {premiseDayMountainGuideItems.map((item) => (
                      <p
                        className={
                          item.tone
                            ? `purposeCalendarMountainGuide-${item.tone}`
                            : undefined
                        }
                        key={item.label}
                      >
                        <span>{item.label}</span>
                        {item.text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <label
                className="purposeCalendarMountainGuideToggleLabel"
                htmlFor="purpose-calendar-mountain-guide-toggle"
              >
                方位神盤の説明を開く / 閉じる
              </label>
              <div className="purposeCalendarMonthlyNotes">
                <p className="purposeCalendarSolarTermNote">
                  節入り <strong>{solarTermEntryLabel}</strong>
                </p>
                <p className="purposeCalendarTonNote">
                  <strong>{monthlyTonLabel}</strong>
                </p>
                {birthDate ? (
                  <p className="purposeCalendarNatalKanshiNote">
                    <span>命式</span>
                    <strong>{birthDate}</strong>
                    <em>
                      年柱 {natalKanshiSummary.year.kanshi}
                      {natalKanshiSummary.year.nacchin !== "-"
                        ? ` / ${natalKanshiSummary.year.nacchin}`
                        : ""}
                    </em>
                    <em>
                      月柱 {natalKanshiSummary.month.kanshi}
                      {natalKanshiSummary.month.nacchin !== "-"
                        ? ` / ${natalKanshiSummary.month.nacchin}`
                        : ""}
                    </em>
                    <em>
                      日柱 {natalKanshiSummary.day.kanshi}
                      {natalKanshiSummary.day.nacchin !== "-"
                        ? ` / ${natalKanshiSummary.day.nacchin}`
                        : ""}
                    </em>
                  </p>
                ) : null}
              </div>
              <div
                className={`purposeCalendarFourBoardSummary${
                  todayFourBoardCandidates.length === 0
                    ? " purposeCalendarFourBoardSummary-empty"
                    : ""
                }`}
              >
                <span>今日の四盤候補</span>
                {todayFourBoardCandidates.length > 0 ? (
                  <div>
                    {todayFourBoardCandidates.map((candidate) => (
                      <strong
                        key={`four-board-${candidate.direction}`}
                        title={`年盤・月盤・日盤・時盤が重なる方位 / ${candidate.branch}刻`}
                      >
                        {candidate.startTime}-{candidate.endTime}{" "}
                        {candidate.direction}[{candidate.star}]
                      </strong>
                    ))}
                  </div>
                ) : (
                  <small>現在刻での四盤一致はありません</small>
                )}
              </div>
            </div>
          </div>
        </div>
        <aside className="purposeCalendarBestCandidates">
          <div className="purposeCalendarBestCandidatesHeader">
            <span>今月の注目候補</span>
            <p>先に候補を見て、四盤一致がある日は時刻も確認します。</p>
          </div>
          {monthlyBestCandidates.length > 0 ? (
            <div>
              {monthlyBestCandidates.slice(0, 5).map((candidate) => {
                const fourBoardCandidates = candidate.direction
                  ? (fourBoardCandidatesByDate.get(candidate.date) ?? []).filter(
                      (entry) => entry.direction === candidate.direction,
                    )
                  : [];
                const firstFourBoardCandidate = fourBoardCandidates[0] ?? null;

                return (
                  <Link
                    className={`purposeCalendarBestCandidate purposeCalendarBestCandidate-${candidate.tone}${
                      firstFourBoardCandidate
                        ? " purposeCalendarBestCandidate-hasFourBoard"
                        : ""
                    }`}
                    data-reason={formatMonthlyBestCandidateReasonWithFourBoard(
                      candidate,
                      fourBoardCandidates,
                    )}
                    href={`/?date=${candidate.date}&view=dev`}
                    key={`${candidate.date}-${candidate.direction ?? "almanac"}`}
                  >
                    <b>{candidate.day}日</b>
                    {candidate.direction
                      ? formatPurposeBlendLabel(
                          candidate.direction,
                          candidate.starNumber,
                        )
                      : "天赦日"}
                    {firstFourBoardCandidate ? (
                      <span className="purposeCalendarBestCandidateSpecial">
                        特別時刻 {firstFourBoardCandidate.startTime}-
                        {firstFourBoardCandidate.endTime}
                      </span>
                    ) : null}
                    <small>
                      {candidate.benefitLabel ||
                        candidate.protectiveLabel ||
                        "整え"}
                      {" / "}
                      {candidate.actionLabel}
                      {" / "}
                      {candidate.label}
                      {candidate.noteSummary
                        ? ` / ${candidate.noteSummary}`
                        : ""}
                    </small>
                  </Link>
                );
              })}
            </div>
          ) : (
            <em>候補なし</em>
          )}
        </aside>
        <div className="purposeCalendarGrid" aria-label="九星方位月間カレンダー">
          {weekdayLabels.map((label) => (
            <div className="purposeCalendarWeekday" key={label}>
              {label}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return (
                <div
                  className="purposeCalendarDay purposeCalendarDayBlank"
                  key={`blank-${index}`}
                />
              );
            }

            const date = formatDate(year, month, day);
            const row = rowByDate.get(date);
            const calendarDay = row ? getCalendarDay(date) : null;
            const hourBoards = calendarDay
              ? getHourBoardRowsForCalendarDay(calendarDay)
              : [];
            const currentHourBranch = date === current.date
              ? getHourBranchByHour(current.hour)
              : null;
            const currentHourBoard = currentHourBranch
              ? hourBoards.find((hourBoard) => hourBoard.branch === currentHourBranch) ??
                null
              : null;
            const currentHourGoodDirectionItems = currentHourBoard
              ? getHourBoardGoodDirectionItems(
                  currentHourBoard.directions,
                  selectedCompanionStars,
                  companionJudgementMode,
                )
              : [];
            const tags = commonTagsByDate.get(date) ?? [];
            const yearCellBoard = row?.kyuseiBoardRows.find(
              (board) => board.board === "year",
            );
            const monthCellBoard = row?.kyuseiBoardRows.find(
              (board) => board.board === "month",
            );
            const dayBoard = row?.kyuseiBoardRows.find(
              (board) => board.board === "day",
            );
            const solarTermEntry = row?.values["節入り時刻"] ?? "-";
            const solarTermEntryInCell = formatSolarTermEntry(row);
            const selectedDays = row?.values["主要選日"] ?? "-";
            const selectedDayChips = getSelectedDayChips(selectedDays);
            const monthlyBestCandidate = monthlyBestCandidateByDate.get(date);
            const baseMovementWarningChips = getMovementWarningChips(
              row?.values["方位殺"],
              ["日"],
              row?.values["土用"],
              row?.directionBoardValues,
            );
            const movementWarningChips = mergeMovementWarningChips(
              date,
              baseMovementWarningChips,
              familyMemberRows,
            );
            const childSatsuWarningChip = showChildSatsu
              ? getChildSatsuWarningChip(row?.values["小児殺"])
              : null;
            const tendoChip = getTendoDisplayChip(date, row, familyMemberRows);
            const compassTendoChip =
              tendoChip && tendoChip.activeDirections.length > 0
                ? { directions: tendoChip.activeDirections }
                : null;
            const compassStates = getDirectionCompassStates(
              row,
              tags,
              movementWarningChips,
              compassTendoChip,
              childSatsuWarningChip,
            );
            const doyoPeriodChip = getDoyoPeriodChip(row?.values["土用"]);
            const holidayName = row?.values["祝日"] ?? "-";
            const dayKanshi = getKanshiParts(row).day;
            const dayKanshiInfo = formatKanshiWithNacchin(dayKanshi);
            const isHighlightedKanshiDay = highlightedDayKanshi.has(dayKanshi);
            const junichoku = row?.values["十二直"] ?? "-";
            const nijuhachishuku = row?.values["二十八宿"] ?? "-";
            const junichokuTone = getCalendarNoteTone("junichoku", junichoku);
            const nijuhachishukuTone = getCalendarNoteTone(
              "nijuhachishuku",
              nijuhachishuku,
            );
            const isMatched = matchedDates.has(date);
            const isToday = date === current.date;
            const isFilteredOut =
              candidate === "has_candidate" ||
              goodDirectionMatch !== "all" ||
              keyword !== "" ||
              kyuseiMatch !== "all";
            const hasVisibleCandidate =
              tags.length > 0 && (!isFilteredOut || isMatched);
            const hasVisibleCandidateForTone = hasVisibleCandidate;
            const boardOverlapStatus = hasVisibleCandidate
              ? getBoardOverlapStatus(tags)
              : null;
            const cellTone = row ? `purposeCalendarDay-${row.dayType}` : "";

            return (
              <article
                className={`purposeCalendarDay ${cellTone} ${
                  isFilteredOut && !isMatched
                    ? "purposeCalendarDayMuted"
                    : ""
                } ${
                  hasVisibleCandidateForTone
                    ? "purposeCalendarDay-candidate"
                    : ""
                } ${
                  monthlyBestCandidate ? "purposeCalendarDay-bestCandidate" : ""
                } ${isToday ? "purposeCalendarDayToday" : ""}`}
                key={date}
              >
                <div className="purposeCalendarAlmanacArea">
                  <div className="purposeCalendarCellHeader">
                    <div className="purposeCalendarDateLine">
                      <Link href={`/?date=${date}&view=dev`}>
                        {day}
                        {isToday ? <span>今日</span> : null}
                      </Link>
                      {monthlyBestCandidate ? (
                        <span
                          className={`purposeCalendarBestDateMark purposeCalendarBestDateMark-${monthlyBestCandidate.tone}`}
                          title={formatMonthlyBestCandidateReason(
                            monthlyBestCandidate,
                          )}
                        >
                          {monthlyBestCandidate.label}
                        </span>
                      ) : null}
                      {row?.values["六曜"] && row.values["六曜"] !== "-" ? (
                        <a
                          className="purposeCalendarRokuyoLink"
                          href={getCalendarNoteTermHref(
                            "rokuyo",
                            row.values["六曜"],
                          )}
                          rel="noreferrer"
                          target="_blank"
                          title={`六曜 ${row.values["六曜"]}の説明を開く`}
                        >
                          {row.values["六曜"]}
                        </a>
                      ) : (
                        <span>{row?.values["六曜"] ?? "-"}</span>
                      )}
                    </div>
                    <p
                      className={`purposeCalendarSetsuiri${
                        solarTermEntry === "-"
                          ? " purposeCalendarSetsuiri-empty"
                          : ""
                      }`}
                      aria-hidden={solarTermEntry === "-"}
                    >
                      {solarTermEntry !== "-" ? (
                        <>
                          <span>節入り</span>
                          {solarTermEntryInCell}
                        </>
                      ) : (
                        <>&nbsp;</>
                      )}
                    </p>
                    {holidayName !== "-" ? (
                      <p className="purposeCalendarHoliday">{holidayName}</p>
                    ) : null}
                    <p className="purposeCalendarMeta">
                      {row?.values["旧暦"] ?? "-"}
                    </p>
                    {dayKanshiInfo.kanshi !== "-" ? (
                      <p
                        className={`purposeCalendarKanshi ${
                          isHighlightedKanshiDay
                            ? "purposeCalendarKanshi-highlight"
                            : ""
                        }`}
                        data-nacchin-tooltip={dayKanshiInfo.title || undefined}
                        tabIndex={0}
                      >
                        {dayKanshiInfo.id !== "-" ? `${dayKanshiInfo.id} ` : ""}
                        {dayKanshiInfo.kanshi}
                        {dayKanshiInfo.nacchin !== "-"
                          ? (
                              <>
                                {" / "}
                                {renderDictionaryLink(
                                  dayKanshiInfo.nacchin,
                                  getNacchinTermHref(dayKanshiInfo.nacchin),
                                  `納音 ${dayKanshiInfo.nacchin}の説明を開く`,
                                )}
                              </>
                            )
                          : ""}
                        {dayKanshiInfo.kuubou !== "-"
                          ? (
                              <>
                                {" / 空亡 "}
                                {renderDictionaryLink(
                                  dayKanshiInfo.kuubou,
                                  getKuubouTermHref(dayKanshiInfo.kuubou),
                                  `空亡 ${dayKanshiInfo.kuubou}の説明を開く`,
                                )}
                              </>
                            )
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="purposeCalendarCellBoard">
                    {yearCellBoard || monthCellBoard || dayBoard ? (
                      <p className="purposeCalendarDayBoard">
                        <span>
                          <small>年</small>
                          {renderKyuseiShortTermLink(yearCellBoard?.kyusei)}
                        </span>
                        <span>
                          <small>月</small>
                          {renderKyuseiShortTermLink(monthCellBoard?.kyusei)}
                        </span>
                        <span>
                          <small>日</small>
                          {renderKyuseiShortTermLink(dayBoard?.kyusei)}
                        </span>
                      </p>
                    ) : null}
                    {boardOverlapStatus ? (
                      <p
                        className={`purposeCalendarBoardOverlap purposeCalendarBoardOverlap-${boardOverlapStatus.tone}`}
                        title={boardOverlapStatus.detail}
                      >
                        <span>{boardOverlapStatus.label}</span>
                        {boardOverlapStatus.detail}
                      </p>
                    ) : null}
                    {row ? (
                      <DirectionCompass
                        centerLabel="日盤"
                        centerValue={getKyuseiDisplayNumber(dayBoard?.kyusei)}
                        getPointHref={getDirectionBlendHref}
                        openLinksInNewTab
                        orientation={compassOrientation}
                        states={compassStates}
                        title={`${date} 日盤方位`}
                      />
                    ) : null}
                    {tendoChip ? (
                      <p
                        className={`purposeCalendarTendoChip ${
                          tendoChip.blocked
                            ? "purposeCalendarTendoChip-muted"
                            : ""
                        }`}
                        title={tendoChip.title}
                      >
                        <span>天道</span>
                        <strong>{tendoChip.directions.join("・")}</strong>
                        {tendoChip.effectLabel ? (
                          <small>{tendoChip.effectLabel}</small>
                        ) : null}
                        {tendoChip.blockedDirections.length > 0 ? (
                          <small>
                            注意: {tendoChip.blockedDirections.join("・")}
                          </small>
                        ) : null}
                      </p>
                    ) : null}
                    {currentHourBoard ? (
                      <div className="purposeCalendarCurrentHourBoard">
                        <div>
                          <span>現在刻</span>
                          <strong>{currentHourBoard.branch}刻</strong>
                        </div>
                        <div>
                          <span>時間</span>
                          <strong>
                            {getHourBoardTimeParts(currentHourBoard).startTime}
                            <small>
                              {getHourBoardTimeParts(currentHourBoard).endTime}
                            </small>
                          </strong>
                        </div>
                        <div>
                          <span>中宮</span>
                          <strong>{currentHourBoard.centerStar}</strong>
                        </div>
                        <div className="purposeCalendarCurrentHourGood">
                          <span>吉方位</span>
                          {currentHourGoodDirectionItems.length > 0 ? (
                            <span className="purposeCalendarHourGoodList">
                              {currentHourGoodDirectionItems.map((item) => (
                                <span
                                  className={`purposeCalendarHourGoodChip purposeCalendarHourGoodChip-${getHourBoardGoodDirectionTone(
                                    item,
                                    tags,
                                  )}`}
                                  key={`current-${date}-${item.direction}`}
                                >
                                  {item.label}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <strong>-</strong>
                          )}
                        </div>
                      </div>
                    ) : null}
                    {hourBoards.length > 0 ? (
                      <details className="purposeCalendarHourBoard">
                        <summary>
                          <span>全12刻を見る</span>
                          {currentHourBranch ? (
                            <small>現在 {currentHourBranch}刻</small>
                          ) : (
                            <small>12刻</small>
                          )}
                        </summary>
                        <div className="purposeCalendarHourBoardTableWrap">
                          <table className="purposeCalendarHourBoardTable">
                            <thead>
                              <tr>
                                <th>刻</th>
                                <th>時間</th>
                                <th>中宮</th>
                                <th>吉方位</th>
                              </tr>
                            </thead>
                            <tbody>
                              {hourBoards.map((hourBoard) => {
                                const goodDirectionItems =
                                  getHourBoardGoodDirectionItems(
                                    hourBoard.directions,
                                    selectedCompanionStars,
                                    companionJudgementMode,
                                  );
                                const { startTime, endTime } =
                                  getHourBoardTimeParts(hourBoard);

                                return (
                                  <tr
                                    className={
                                      hourBoard.branch === currentHourBranch
                                        ? "purposeCalendarHourBoardCurrent"
                                        : ""
                                    }
                                    key={`${date}-${hourBoard.branch}`}
                                  >
                                    <td>{hourBoard.branch}</td>
                                    <td>
                                      <span className="purposeCalendarHourBoardTime">
                                        {startTime}
                                      </span>
                                      <span className="purposeCalendarHourBoardTime">
                                        {endTime}
                                      </span>
                                    </td>
                                    <td>{hourBoard.centerStar}</td>
                                    <td>
                                      {goodDirectionItems.length > 0 ? (
                                        <span className="purposeCalendarHourGoodList">
                                          {goodDirectionItems.map((item) => (
                                            <span
                                              className={`purposeCalendarHourGoodChip purposeCalendarHourGoodChip-${getHourBoardGoodDirectionTone(
                                                item,
                                                tags,
                                              )}`}
                                              key={`${hourBoard.branch}-${item.direction}`}
                                            >
                                              {item.label}
                                            </span>
                                          ))}
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    ) : null}
                  </div>
                  <div className="purposeCalendarCellNotes">
                    {junichoku !== "-" || nijuhachishuku !== "-" ? (
                      <div className="purposeCalendarNoteChips">
                        {junichoku !== "-" ? (
                          <a
                            className={`purposeCalendarNoteChip purposeCalendarNoteChip-${junichokuTone}`}
                            href={getCalendarNoteTermHref(
                              "junichoku",
                              junichoku,
                            )}
                            rel="noreferrer"
                            target="_blank"
                            title={`十二直 ${junichoku}の説明を開く`}
                          >
                            {junichoku}
                          </a>
                        ) : null}
                        {junichoku !== "-" && nijuhachishuku !== "-" ? (
                          <span className="purposeCalendarNoteSeparator">|</span>
                        ) : null}
                        {nijuhachishuku !== "-" ? (
                          <a
                            className={`purposeCalendarNoteChip purposeCalendarNoteChip-${nijuhachishukuTone}`}
                            href={getCalendarNoteTermHref(
                              "nijuhachishuku",
                              nijuhachishuku,
                            )}
                            rel="noreferrer"
                            target="_blank"
                            title={`二十八宿 ${nijuhachishuku}の説明を開く`}
                          >
                            {nijuhachishuku}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    {selectedDayChips.length > 0 ? (
                      <div className="purposeCalendarSelectedDays">
                        {selectedDayChips.map((chip) => (
                          <a
                            className={`purposeCalendarSelectedDayChip purposeCalendarSelectedDayChip-${chip.tone}${
                              chip.premium
                                ? " purposeCalendarSelectedDayChip-premium"
                                : ""
                            }`}
                            href={getCalendarNoteTermHref(
                              "selected-days",
                              chip.label,
                            )}
                            key={`${date}-${chip.label}`}
                            rel="noreferrer"
                            target="_blank"
                            title={`${chip.label}の説明を開く`}
                          >
                            {chip.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                {doyoPeriodChip ? (
                  <p
                    className={`purposeCalendarDoyoBar ${
                      doyoPeriodChip.isManichi
                        ? "purposeCalendarDoyoBar-manichi"
                        : ""
                    }`}
                    title={doyoPeriodChip.title}
                  >
                    <span>土用</span>
                    {doyoPeriodChip.label}
                    {doyoPeriodChip.isManichi ? " / 間日" : ""}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
        <details className="purposeCalendarLegend">
          <summary>カレンダーの読み方・暦注メモ</summary>
          <div className="purposeCalendarLegendGrid">
            <section>
              <h3>方位盤</h3>
              <p>
                日盤の方位盤を中心に見ます。丸の重なりは候補条件の強さを示します。
              </p>
              <ul>
                <li>二重丸: 月盤・日盤一致</li>
                <li>三重丸: 年盤・月盤・日盤一致</li>
                <li>暗/五/破: 暗剣殺・五黄殺・破</li>
                <li>本/的: 本命殺・本命的殺</li>
                <li>土/小: 土用殺・小児殺</li>
                <li>天道: 吉方位補助。注意重なりは候補外の参考表示</li>
                <li>
                  恵方・太歳・歳破・大将など: 方位神盤（24山をもとに表示）
                </li>
                <li>
                  命式レイヤー: 生年月日の年柱・月柱・日柱を外周の年/月/日で表示
                </li>
              </ul>
            </section>
            <section>
              <h3>時盤</h3>
              <p>
                今日だけ現在刻を先に表示します。全12刻を開くと、刻ごとの中宮と吉方位を確認できます。
              </p>
              <ul>
                <li>現在刻: 今の2時間帯</li>
                <li>吉方位: 同行者チェック後に残る時盤候補</li>
                <li>今日の四盤候補: 年・月・日・時が重なる方位</li>
              </ul>
            </section>
            <section>
              <h3>目的</h3>
              <p>
                今日の行動に合わせて、方位の使い方と見る盤の重なりを切り替えます。
              </p>
              <ul>
                <li>近場: 日盤中心。散歩・カフェ・近所の神社</li>
                <li>日帰り: 月盤・日盤一致。温泉・参拝・商談</li>
                <li>宿泊: 年盤・月盤・日盤一致。遠出・宿泊旅行</li>
                <li>大きな予定: 年盤・月盤一致。引っ越し・開業・拠点下見</li>
                <li>特別時刻: 年月日候補に時盤を重ね、四盤一致を探す</li>
              </ul>
            </section>
            <section>
              <h3>日付・基礎暦</h3>
              <p>
                日付セルには、旧暦、六曜、干支、納音、空亡をまとめています。
              </p>
              <ul>
                <li>旧暦: 月日と六曜の確認用</li>
                <li>干支/納音: 60干支の番号と性質</li>
                <li>空亡: 日干支から見る空亡</li>
                <li>祝日: 国民の祝日</li>
              </ul>
            </section>
            <section>
              <h3>節入り・雑節</h3>
              <p>
                節入りは月盤が切り替わる基準です。土用は期間バーで表示し、間日は併記します。
              </p>
              <ul>
                <li>節入り: 二十四節気の開始時刻</li>
                <li>土用: 土用期間。間日は土用殺を弱める日</li>
                <li>雑節: 彼岸・八十八夜・入梅などの季節目印</li>
              </ul>
            </section>
            <section>
              <h3>十二直・二十八宿</h3>
              <p>
                日取りの性質を短い札で表示します。色は吉凶よりも、扱いやすさの目安です。
              </p>
              <ul>
                <li>十二直: 建・除・満などの日の働き</li>
                <li>二十八宿: 角・亢・氐など宿曜系の日取り</li>
                <li>黄色: 吉寄り / 朱: 注意寄り / 生成り: 中立・混合</li>
              </ul>
            </section>
            <section>
              <h3>主要選日</h3>
              <p>
                一粒万倍日、天赦日、不成就日、八専、十方暮など、日取りの注目点を表示します。
              </p>
              <ul>
                <li>淡い金: 天赦日など別格候補</li>
                <li>若草: 使いやすい吉日候補</li>
                <li>朱: 注意して扱う暦注</li>
              </ul>
            </section>
          </div>
        </details>
        <div className="purposeCalendarActionScaleReference">
          <span>目的と距離の目安</span>
          <div>
            {actionScaleOptions.map((option) => (
              <section key={`action-scale-reference-${option.id}`}>
                <h3>{option.label}</h3>
                <p>{option.guide}</p>
                <small>
                  {option.distanceLabel} / {option.actionExamples}
                </small>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
