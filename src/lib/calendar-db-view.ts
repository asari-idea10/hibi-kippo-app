import {
  getActionPurpose,
  type ActionPurposeEntry,
  type ActionPurposeId,
} from "@/lib/action-purpose-master";
import { getCalendarDays, type CalendarDay } from "@/lib/calendar-day";
import { getCalendarNoteVerificationReference } from "@/lib/calendar-note-verification-references";
import { getChildSatsu } from "@/lib/child-satsu";
import { getDirectionMeaningSummary } from "@/lib/direction-meaning-master";
import { getDoyoComparison } from "@/lib/doyo";
import { getGoodFortuneDirections } from "@/lib/good-fortune-directions";
import { getJapaneseEraDateContext } from "@/lib/japanese-era";
import { getKanshiByName } from "@/lib/kanshi-master";
import {
  getKeishaProfile,
  normalizeBirthGender,
  type BirthGender,
} from "@/lib/keisha-master";
import {
  favorablePersonalDirectionLabels,
  getPersonalDirectionCompatibilityLabel,
  personalDirectionCompatibilityLabels,
  type PersonalDirectionLabel,
} from "@/lib/personal-star-compatibility-master";
import { getSanGenNineUnContext } from "@/lib/san-gen-nine-un";
import { getTodayAnniversaryDisplay } from "@/lib/today-anniversaries";
import { getTraditionalMonthName } from "@/lib/month-names";
import { getZassetsuByDate } from "@/lib/zassetsu";

export type CalendarDbQuery = {
  year?: string | null;
  start?: string | null;
  end?: string | null;
  birthDate?: string | null;
  birthGender?: string | null;
  honmeiStar?: string | null;
  keyword?: string | null;
  limit?: string | number | null;
  view?: string | null;
  dayType?: string | null;
  kyuseiMatch?: string | null;
  purpose?: string | null;
  candidate?: string | null;
  goodDirectionMatch?: string | null;
};

export type CalendarDbRow = {
  date: string;
  dayType: CalendarDbDayType;
  values: Record<string, string>;
  purposeTags: string[];
  kyuseiBoardRows: CalendarDbKyuseiBoardRow[];
  directionBoardValues: Record<
    CalendarDbDirection,
    Record<CalendarDbKyuseiBoard, string>
  >;
};

export type CalendarDbDayType =
  | "weekday"
  | "saturday"
  | "sunday"
  | "holiday";

export type CalendarDbDayTypeFilter =
  | "all"
  | "weekend_or_holiday"
  | "weekday"
  | "saturday"
  | "sunday"
  | "holiday";

export type CalendarDbKyuseiMatchFilter =
  | "all"
  | "year_month_day"
  | "month_day"
  | "year_month";

export type CalendarDbCandidateFilter = "all" | "has_candidate";

export type CalendarDbGoodDirectionMatchFilter =
  | "all"
  | "year_month_day"
  | "month_day"
  | "year_month";

const directionDisplayOrder = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
  "中央",
] as const;

export const calendarDbDirectionColumns = [...directionDisplayOrder];

export type CalendarDbDirection = (typeof directionDisplayOrder)[number];
export type CalendarDbKyuseiBoard = "year" | "month" | "day";
export type CalendarDbKyuseiBoardRow = {
  board: CalendarDbKyuseiBoard;
  label: string;
  pillar: string;
  kyusei: string;
};

export type CalendarDbPersonalContext = {
  birthDate: string;
  honmeiStar: string;
  honmeiStarDisplay: string;
  profile: {
    keisha: string | null;
    keishaStar: string | null;
    keishaGood: string | null;
    keishaCaution: string | null;
    keishaDirectionGods: string[];
    maxGoodStars: string[];
    goodStars: string[];
    sourceStatus:
      | "sample_verified"
      | "keisha_rule_v0"
      | "compatibility_rule_v0"
      | "not_available";
    note: string;
  };
  sourceStatus: "calendar_year_kyusei";
  note: string;
};

export type CalendarDbPurposeContext = ActionPurposeEntry;

const kyuseiStarNames: Record<string, string> = {
  "1": "一白水星",
  "2": "二黒土星",
  "3": "三碧木星",
  "4": "四緑木星",
  "5": "五黄土星",
  "6": "六白金星",
  "7": "七赤金星",
  "8": "八白土星",
  "9": "九紫火星",
};

const kyuseiBasePositionStars: Record<CalendarDbDirection, number> = {
  北: 1,
  北東: 8,
  東: 3,
  南東: 4,
  南: 9,
  南西: 2,
  西: 7,
  北西: 6,
  中央: 5,
};

const oppositeDirections: Partial<Record<CalendarDbDirection, CalendarDbDirection>> = {
  北: "南",
  北東: "南西",
  東: "西",
  南東: "北西",
  南: "北",
  南西: "北東",
  西: "東",
  北西: "南東",
};

const blockingDirectionLabels = new Set([
  "暗剣殺",
  "五黄殺",
  "破",
  "本命殺",
  "的殺",
  "土用殺",
]);

const favorableDirectionLabels = favorablePersonalDirectionLabels;

export const calendarDbColumns = [
  "西暦",
  "月名",
  "元号",
  "西暦年→元号年",
  "祝日",
  "当日節気",
  "現在の節気",
  "節入り時刻",
  "直近節入り",
  "節入り日数",
  "旧暦",
  "六曜",
  "年/月/日干支",
  "日納音",
  "年/月/日九星",
  "方位別",
  "方位意味",
  ...directionDisplayOrder,
  "方位殺",
  "吉神方位",
  "天道",
  "小児殺",
  "三元九運",
  "空亡",
  "十二直",
  "二十八宿",
  "二十七宿",
  "雑節",
  "今日は何の日",
  "主要選日",
  "下段暦注",
  "土用",
  "旧暦ソース",
  "暦注ソース",
] as const;

export type CalendarDbColumn = (typeof calendarDbColumns)[number];

export type CalendarDbView =
  | "summary"
  | "all"
  | "selected_days"
  | "kyusei"
  | "doyo";

export const calendarDbViewOptions: Array<{
  id: CalendarDbView;
  label: string;
  description: string;
}> = [
  {
    id: "kyusei",
    label: "九星",
    description: "干支・九星・方位を重点確認",
  },
  {
    id: "summary",
    label: "要約版",
    description: "主要項目だけを絞って表示",
  },
  {
    id: "selected_days",
    label: "選日",
    description: "十二直・宿・主要選日を重点確認",
  },
  {
    id: "doyo",
    label: "土用",
    description: "土用・雑節・節入りを重点確認",
  },
  {
    id: "all",
    label: "全項目",
    description: "万年暦照合サマリーをすべて表示",
  },
];

export const calendarDbDayTypeOptions: Array<{
  id: CalendarDbDayTypeFilter;
  label: string;
  description: string;
}> = [
  {
    id: "all",
    label: "すべて",
    description: "平日・土日祝をすべて表示",
  },
  {
    id: "weekend_or_holiday",
    label: "土日祝",
    description: "旅行や日取り検討向け",
  },
  {
    id: "weekday",
    label: "平日",
    description: "土日祝以外",
  },
  {
    id: "saturday",
    label: "土曜",
    description: "土曜のみ",
  },
  {
    id: "sunday",
    label: "日曜",
    description: "日曜のみ",
  },
  {
    id: "holiday",
    label: "祝日",
    description: "国民の祝日・休日のみ",
  },
];

export const calendarDbKyuseiMatchOptions: Array<{
  id: CalendarDbKyuseiMatchFilter;
  label: string;
  description: string;
}> = [
  {
    id: "all",
    label: "指定なし",
    description: "九星の一致条件なし",
  },
  {
    id: "year_month_day",
    label: "年・月・日",
    description: "年盤・月盤・日盤の九星がすべて一致",
  },
  {
    id: "month_day",
    label: "月・日",
    description: "月盤・日盤の九星が一致",
  },
  {
    id: "year_month",
    label: "年・月",
    description: "年盤・月盤の九星が一致",
  },
];

export const calendarDbCandidateOptions: Array<{
  id: CalendarDbCandidateFilter;
  label: string;
  description: string;
}> = [
  {
    id: "all",
    label: "すべて",
    description: "吉方候補の有無で絞り込まない",
  },
  {
    id: "has_candidate",
    label: "候補あり",
    description: "目的に合う吉方候補がある日だけ表示",
  },
];

export const calendarDbGoodDirectionMatchOptions: Array<{
  id: CalendarDbGoodDirectionMatchFilter;
  label: string;
  description: string;
}> = [
  {
    id: "all",
    label: "指定なし",
    description: "同一方位で吉が並ぶ条件なし",
  },
  {
    id: "year_month_day",
    label: "年・月・日",
    description: "同じ方位で年盤・月盤・日盤すべてが吉方候補",
  },
  {
    id: "month_day",
    label: "月・日",
    description: "同じ方位で月盤・日盤が吉方候補",
  },
  {
    id: "year_month",
    label: "年・月",
    description: "同じ方位で年盤・月盤が吉方候補",
  },
];

const calendarDbViewColumns: Record<CalendarDbView, CalendarDbColumn[]> = {
  summary: [
    "西暦",
    "祝日",
    "旧暦",
    "六曜",
    "年/月/日干支",
    "年/月/日九星",
    "方位意味",
    "空亡",
    "十二直",
    "二十八宿",
    "二十七宿",
    "雑節",
    "主要選日",
    "下段暦注",
    "土用",
  ],
  all: [...calendarDbColumns],
  selected_days: [
    "西暦",
    "旧暦",
    "十二直",
    "二十八宿",
    "二十七宿",
    "主要選日",
    "下段暦注",
    "暦注ソース",
  ],
  kyusei: [
    "西暦",
    "旧暦",
    "年/月/日干支",
    "年/月/日九星",
    "方位意味",
    ...directionDisplayOrder,
    "方位殺",
    "吉神方位",
    "天道",
    "小児殺",
    "土用",
  ],
  doyo: [
    "西暦",
    "現在の節気",
    "直近節入り",
    "節入り日数",
    "旧暦",
    "六曜",
    "年/月/日干支",
    "年/月/日九星",
    "雑節",
    "土用",
  ],
};

const lowerCalendarNoteCodes = new Set<string>([
  "tensha_bi",
  "tenten_satsu",
  "jiten_satsu",
  "shihai_nichi",
]);

const directionDisplayAliases: Record<string, string> = {
  東北: "北東",
  北北東: "北東",
  東北東: "北東",
  西北: "北西",
  西北西: "北西",
  北北西: "北西",
  東南: "南東",
  東南東: "南東",
  南南東: "南東",
  西南: "南西",
  南南西: "南西",
  西南西: "南西",
};

function getTodayJstDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function clampLimit(value: CalendarDbQuery["limit"]) {
  const limit = Number(value ?? 365);

  if (!Number.isFinite(limit)) {
    return 100;
  }

  return Math.min(Math.max(Math.floor(limit), 1), 1_000);
}

function normalizeView(value: CalendarDbQuery["view"]): CalendarDbView {
  return calendarDbViewOptions.some((option) => option.id === value)
    ? (value as CalendarDbView)
    : "kyusei";
}

function normalizeDayType(
  value: CalendarDbQuery["dayType"],
): CalendarDbDayTypeFilter {
  return calendarDbDayTypeOptions.some((option) => option.id === value)
    ? (value as CalendarDbDayTypeFilter)
    : "all";
}

function normalizeKyuseiMatch(
  value: CalendarDbQuery["kyuseiMatch"],
): CalendarDbKyuseiMatchFilter {
  return calendarDbKyuseiMatchOptions.some((option) => option.id === value)
    ? (value as CalendarDbKyuseiMatchFilter)
    : "all";
}

function normalizeCandidate(
  value: CalendarDbQuery["candidate"],
): CalendarDbCandidateFilter {
  return calendarDbCandidateOptions.some((option) => option.id === value)
    ? (value as CalendarDbCandidateFilter)
    : "all";
}

function normalizeGoodDirectionMatch(
  value: CalendarDbQuery["goodDirectionMatch"],
): CalendarDbGoodDirectionMatchFilter {
  return calendarDbGoodDirectionMatchOptions.some(
    (option) => option.id === value,
  )
    ? (value as CalendarDbGoodDirectionMatchFilter)
    : "all";
}

function normalizePurpose(value: CalendarDbQuery["purpose"]): ActionPurposeId {
  return getActionPurpose(value).id;
}

function normalizeDateInput(value: string | null | undefined) {
  const date = value?.trim();

  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function normalizeHonmeiStar(value: string | null | undefined) {
  const star = value?.trim();

  return star && /^[1-9]$/.test(star) ? star : "";
}

function getPersonalContextFromHonmeiStar(
  honmeiStar: string,
): CalendarDbPersonalContext | null {
  if (!honmeiStar) {
    return null;
  }

  return {
    birthDate: "",
    honmeiStar,
    honmeiStarDisplay: getKyuseiStarDisplay(honmeiStar),
    profile: buildPersonalProfile("", honmeiStar, "", "male"),
    sourceStatus: "calendar_year_kyusei",
    note: "本命星を直接指定した家族・複数人チェック用の仮採用コンテキスト。",
  };
}

function getPersonalContext(
  birthDate: string,
  birthGender: BirthGender,
): CalendarDbPersonalContext | null {
  if (!birthDate) {
    return null;
  }

  const birthDay = getCalendarDays({ start: birthDate, end: birthDate })[0];

  if (!birthDay) {
    return null;
  }

  return {
    birthDate,
    honmeiStar: birthDay.kyusei.year,
    honmeiStarDisplay: getKyuseiStarDisplay(birthDay.kyusei.year),
    profile: buildPersonalProfile(
      birthDate,
      birthDay.kyusei.year,
      birthDay.kyusei.month,
      birthGender,
    ),
    sourceStatus: "calendar_year_kyusei",
    note: "共通暦DBの年九星を本命星として仮採用。出生時刻・真太陽時補正は後続で精密化する。",
  };
}

function getCalendarDbDayType(day: CalendarDay): CalendarDbDayType {
  if (day.calendarBase.nationalHoliday.isHoliday) {
    return "holiday";
  }

  if (day.calendarBase.weekday.index === 6) {
    return "saturday";
  }

  if (day.calendarBase.weekday.index === 0) {
    return "sunday";
  }

  return "weekday";
}

function matchesDayTypeFilter(
  dayType: CalendarDbDayType,
  filter: CalendarDbDayTypeFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "weekend_or_holiday") {
    return dayType === "saturday" || dayType === "sunday" || dayType === "holiday";
  }

  return dayType === filter;
}

function matchesKyuseiMatchFilter(
  day: CalendarDay,
  filter: CalendarDbKyuseiMatchFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "year_month_day") {
    return (
      day.kyusei.year === day.kyusei.month &&
      day.kyusei.month === day.kyusei.day
    );
  }

  if (filter === "month_day") {
    return day.kyusei.month === day.kyusei.day;
  }

  return day.kyusei.year === day.kyusei.month;
}

function getKeywordParts(keyword: string) {
  return keyword
    .split(/[\s/／]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function countOccurrences(source: string, target: string) {
  if (!target) {
    return 0;
  }

  let count = 0;
  let index = 0;

  while (index <= source.length) {
    const foundIndex = source.indexOf(target, index);

    if (foundIndex === -1) {
      break;
    }

    count += 1;
    index = foundIndex + target.length;
  }

  return count;
}

function matchesKeyword(row: CalendarDbRow, columns: CalendarDbColumn[], keyword: string) {
  if (!keyword) {
    return true;
  }

  const matchedColumn = columns.find((column) => column.includes(keyword));

  if (matchedColumn) {
    const value = row.values[matchedColumn];

    return Boolean(value && value !== "-");
  }

  const searchableText = columns.map((column) => row.values[column]).join(" ");

  if (searchableText.includes(keyword)) {
    return true;
  }

  const parts = getKeywordParts(keyword);

  if (parts.length <= 1) {
    return false;
  }

  const requiredCounts = new Map<string, number>();

  parts.forEach((part) => {
    requiredCounts.set(part, (requiredCounts.get(part) ?? 0) + 1);
  });

  return Array.from(requiredCounts.entries()).every(
    ([part, count]) => countOccurrences(searchableText, part) >= count,
  );
}

function getLatestSetsuiriDisplay(day: CalendarDay) {
  const latestSetsuiri = day.solarTerm.latestSetsuiri;

  if (!latestSetsuiri) {
    return null;
  }

  return `${latestSetsuiri.name} ${latestSetsuiri.date} ${latestSetsuiri.timeJst}`;
}

function getSetsuiriDisplay(day: CalendarDay) {
  const term = day.solarTerm.official;

  if (!term?.isSetsuiriForKyusei) {
    return null;
  }

  return `${term.name} ${term.timeJst}`;
}

function getDoyoSummary(day: CalendarDay) {
  const comparison = getDoyoComparison(day);
  const seasonalDoyoDayLabel = comparison.calculated.isSeasonalDoyoDay
    ? `土用の${comparison.calculated.dayBranch}の日`
    : null;

  return comparison.calculated.period
    ? `${comparison.calculated.period.label} ${comparison.calculated.dayIndexInDoyo}日目${
        seasonalDoyoDayLabel ? ` / ${seasonalDoyoDayLabel}` : ""
      }${comparison.calculated.isManichi ? " / 間日" : ""} / 土用殺 ${
        comparison.calculated.doyoSatsuDirection ?? "-"
      }`
    : "-";
}

function normalizeDirectionDisplay(direction: string | null | undefined) {
  if (!direction) {
    return null;
  }

  return directionDisplayAliases[direction] ?? direction;
}

function addDirectionMatrixEntry(
  matrix: Map<
    string,
    { year: string[]; month: string[]; day: string[]; doyo: string[] }
  >,
  direction: string | null | undefined,
  board: "year" | "month" | "day" | "doyo",
  label: string,
) {
  const normalizedDirection = normalizeDirectionDisplay(direction);

  if (!normalizedDirection) {
    return;
  }
  const displayLabel =
    direction && direction !== normalizedDirection
      ? `${label}(${direction})`
      : label;

  const entry =
    matrix.get(normalizedDirection) ??
    {
      year: [],
      month: [],
      day: [],
      doyo: [],
    };

  entry[board].push(displayLabel);
  matrix.set(normalizedDirection, entry);
}

function getDirectionMatrix(day: CalendarDay) {
  const matrix = new Map<
    string,
    { year: string[]; month: string[]; day: string[]; doyo: string[] }
  >();
  const warnings = [
    ["year", day.directionWarnings.year],
    ["month", day.directionWarnings.month],
    ["day", day.directionWarnings.day],
  ] as const;

  warnings.forEach(([board, value]) => {
    addDirectionMatrixEntry(matrix, value.ankensatsu, board, "暗剣殺");
    addDirectionMatrixEntry(matrix, value.gohosatsu, board, "五黄殺");
    addDirectionMatrixEntry(matrix, value.saiha, board, "破");
  });

  getGoodFortuneDirections(day).entries.forEach((entry) => {
    addDirectionMatrixEntry(
      matrix,
      entry.direction,
      entry.board,
      entry.name,
    );
  });

  const childSatsu = getChildSatsu(day);

  if (childSatsu.status === "active") {
    addDirectionMatrixEntry(matrix, childSatsu.direction, "month", "小児殺");
  } else if (childSatsu.status === "center_no_direction") {
    addDirectionMatrixEntry(matrix, "中央", "month", "小児殺");
  }

  const doyoComparison = getDoyoComparison(day);

  if (doyoComparison.calculated.isDoyo) {
    addDirectionMatrixEntry(
      matrix,
      doyoComparison.calculated.doyoSatsuDirection,
      "doyo",
      "土用殺",
    );
  }

  return matrix;
}

function getDirectionMatrixCellDisplay(
  matrix: Map<
    string,
    { year: string[]; month: string[]; day: string[]; doyo: string[] }
  >,
  direction: string,
) {
  const entry = matrix.get(direction);

  if (!entry) {
    return "-";
  }

  const parts = [
    entry.year.length > 0 ? `年 ${entry.year.join("・")}` : null,
    entry.month.length > 0 ? `月 ${entry.month.join("・")}` : null,
    entry.day.length > 0 ? `日 ${entry.day.join("・")}` : null,
    entry.doyo.length > 0 ? `土用 ${entry.doyo.join("・")}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "-";
}

function getDirectionMatrixBoardValues(
  matrix: Map<
    string,
    { year: string[]; month: string[]; day: string[]; doyo: string[] }
  >,
) {
  return Object.fromEntries(
    directionDisplayOrder.map((direction) => {
      const entry = matrix.get(direction);
      const dayValues = [...(entry?.day ?? []), ...(entry?.doyo ?? [])];

      return [
        direction,
        {
          year: entry?.year.length ? entry.year.join("・") : "-",
          month: entry?.month.length ? entry.month.join("・") : "-",
          day: dayValues.length ? dayValues.join("・") : "-",
        },
      ];
    }),
  ) as Record<CalendarDbDirection, Record<CalendarDbKyuseiBoard, string>>;
}

function getKyuseiStarDisplay(value: string) {
  const starName = kyuseiStarNames[value];

  return starName ? `${starName}(${value})` : value;
}

function getKyuseiStarName(value: string) {
  return kyuseiStarNames[value] ?? value;
}

function buildPersonalProfile(
  birthDate: string,
  honmeiStar: string,
  getsumeiStar: string,
  birthGender: BirthGender,
): CalendarDbPersonalContext["profile"] {
  const compatibility = personalDirectionCompatibilityLabels[honmeiStar] ?? {};
  const maxGoodStars = Object.entries(compatibility)
    .filter(([, label]) => label === "最大吉方候補")
    .map(([star]) => getKyuseiStarName(star));
  const goodStars = Object.entries(compatibility)
    .filter(([, label]) => label === "吉方候補" || label === "比和")
    .map(([star]) => getKyuseiStarName(star));
  const keisha = getKeishaProfile(honmeiStar, getsumeiStar, birthGender);

  if (keisha) {
    return {
      keisha: keisha.label,
      keishaStar: keisha.star,
      keishaGood: keisha.good,
      keishaCaution: keisha.caution,
      keishaDirectionGods:
        birthDate === "1976-03-19" && honmeiStar === "6"
          ? ["月破", "月空"]
          : [],
      maxGoodStars,
      goodStars,
      sourceStatus:
        birthDate === "1976-03-19" && honmeiStar === "6"
          ? "sample_verified"
          : "keisha_rule_v0",
      note:
        birthDate === "1976-03-19" && honmeiStar === "6"
          ? "傾斜は風水計算シート A1175:E1257 と八雲院の会員表示で一致確認。傾斜方位神は目視サンプル。"
          : "傾斜は風水計算シート A1175:E1257 をもとに本命星×月命星×性別で算出。傾斜方位神は後続で正式接続する。",
    };
  }

  return {
    keisha: null,
    keishaStar: null,
    keishaGood: null,
    keishaCaution: null,
    keishaDirectionGods: [],
    maxGoodStars,
    goodStars,
    sourceStatus: "compatibility_rule_v0",
    note: "最大吉方・吉方は本命星相性表から仮表示。傾斜・傾斜方位神は計算式検証後に接続する。",
  };
}

function getKyuseiDirectionStar(
  centerStar: string,
  direction: CalendarDbDirection,
) {
  const center = Number(centerStar);
  const base = kyuseiBasePositionStars[direction];

  if (!Number.isInteger(center) || center < 1 || center > 9) {
    return "-";
  }

  return String(((base - 5 + center + 8) % 9) + 1);
}

function formatDirectionBoardCell(star: string, values: string[]) {
  const label = `[${star}]`;

  return values.length > 0 ? `${label} ${values.join("・")}` : `${label} -`;
}

function getPersonalCompatibilityLabel(
  personal: CalendarDbPersonalContext | null,
  star: string,
  direction: CalendarDbDirection,
) {
  if (!personal || direction === "中央") {
    return null;
  }

  return getPersonalDirectionCompatibilityLabel(personal.honmeiStar, star);
}

function withPersonalDirectionPriority(
  values: string[],
  compatibilityLabel: PersonalDirectionLabel | null,
) {
  if (!compatibilityLabel) {
    return values;
  }

  const hasBlockingLabel = values.some((value) =>
    blockingDirectionLabels.has(value),
  );

  if (
    hasBlockingLabel &&
    favorableDirectionLabels.has(compatibilityLabel)
  ) {
    return [...values, "凶方位優先"];
  }

  if (hasBlockingLabel) {
    return values;
  }

  return [...values, compatibilityLabel];
}

function getPersonalizedDirectionValues(
  baseValue: string,
  personal: CalendarDbPersonalContext | null,
  star: string,
  direction: CalendarDbDirection,
  honmeiDirection: CalendarDbDirection | null,
) {
  const values = [
    ...(baseValue === "-" ? [] : baseValue.split("・")),
    ...getPersonalDirectionLabels(
      personal,
      star,
      direction,
      honmeiDirection,
    ),
  ];

  return withPersonalDirectionPriority(
    values,
    getPersonalCompatibilityLabel(personal, star, direction),
  );
}

function getPersonalDirectionLabels(
  personal: CalendarDbPersonalContext | null,
  star: string,
  direction: CalendarDbDirection,
  honmeiDirection: CalendarDbDirection | null,
) {
  if (!personal || direction === "中央") {
    return [];
  }

  if (star === personal.honmeiStar) {
    return ["本命殺"];
  }

  return honmeiDirection && oppositeDirections[honmeiDirection] === direction
    ? ["的殺"]
    : [];
}

function getHonmeiDirection(
  centerStar: string,
  personal: CalendarDbPersonalContext | null,
) {
  if (!personal) {
    return null;
  }

  return (
    directionDisplayOrder.find(
      (direction) =>
        direction !== "中央" &&
        getKyuseiDirectionStar(centerStar, direction) === personal.honmeiStar,
    ) ?? null
  );
}

function getDirectionMatrixDisplay(day: CalendarDay) {
  const matrix = getDirectionMatrix(day);
  const orderedDirections = [
    ...directionDisplayOrder.filter((direction) => matrix.has(direction)),
    ...Array.from(matrix.keys()).filter(
      (direction) =>
        !directionDisplayOrder.includes(
          direction as (typeof directionDisplayOrder)[number],
        ),
    ),
  ];

  return orderedDirections.length > 0
    ? orderedDirections
        .map((direction) => {
          const display = getDirectionMatrixCellDisplay(matrix, direction);

          return display === "-" ? null : `${direction}: ${display}`;
        })
        .filter(Boolean)
        .join(" ｜ ")
    : "-";
}

function getDirectionBoardSummaryDisplay(
  boardValues: Record<CalendarDbKyuseiBoard, string>,
) {
  return [
    ["年", boardValues.year],
    ["月", boardValues.month],
    ["日", boardValues.day],
  ]
    .map(([label, value]) => `${label} ${value}`)
    .join(" / ");
}

function isPurposeDirectionCandidate(value: string) {
  if (value.startsWith("[5]")) {
    return false;
  }

  const hasFavorable = [...favorableDirectionLabels].some((label) =>
    value.includes(label),
  );
  const hasBlocking = [...blockingDirectionLabels].some((label) =>
    value.includes(label),
  );

  return hasFavorable && !hasBlocking && !value.includes("凶方位優先");
}

function getPurposeDirectionTags(
  directionBoardValues: Record<
    CalendarDbDirection,
    Record<CalendarDbKyuseiBoard, string>
  >,
  purpose: CalendarDbPurposeContext,
) {
  if (purpose.id === "none" || purpose.emphasizedBoards.length === 0) {
    return [];
  }

  const boardLabels: Record<CalendarDbKyuseiBoard, string> = {
    year: "年",
    month: "月",
    day: "日",
  };

  return directionDisplayOrder.flatMap((direction) => {
    if (direction === "中央") {
      return [];
    }

    if (
      purpose.emphasizedBoards.includes("day") &&
      !isPurposeDirectionCandidate(directionBoardValues[direction].day)
    ) {
      return [];
    }

    return purpose.emphasizedBoards
      .filter((board) =>
        isPurposeDirectionCandidate(directionBoardValues[direction][board]),
      )
      .map((board) => `${boardLabels[board]} ${direction}`);
  });
}

function matchesCandidateFilter(
  row: CalendarDbRow,
  filter: CalendarDbCandidateFilter,
) {
  return filter === "all" || row.purposeTags.length > 0;
}

function getGoodDirectionMatchBoards(
  filter: CalendarDbGoodDirectionMatchFilter,
): CalendarDbKyuseiBoard[] {
  if (filter === "year_month_day") {
    return ["year", "month", "day"];
  }

  if (filter === "month_day") {
    return ["month", "day"];
  }

  if (filter === "year_month") {
    return ["year", "month"];
  }

  return [];
}

function matchesGoodDirectionMatchFilter(
  row: CalendarDbRow,
  filter: CalendarDbGoodDirectionMatchFilter,
) {
  const boards = getGoodDirectionMatchBoards(filter);

  if (boards.length === 0) {
    return true;
  }

  return directionDisplayOrder.some((direction) => {
    if (direction === "中央") {
      return false;
    }

    return boards.every((board) =>
      isPurposeDirectionCandidate(row.directionBoardValues[direction][board]),
    );
  });
}

function getDirectionWarningSummary(day: CalendarDay) {
  return [
    [
      "年",
      day.directionWarnings.year.ankensatsu,
      day.directionWarnings.year.gohosatsu,
      day.directionWarnings.year.saiha,
    ],
    [
      "月",
      day.directionWarnings.month.ankensatsu,
      day.directionWarnings.month.gohosatsu,
      day.directionWarnings.month.saiha,
    ],
    [
      "日",
      day.directionWarnings.day.ankensatsu,
      day.directionWarnings.day.gohosatsu,
      day.directionWarnings.day.saiha,
    ],
  ]
    .map(([label, ankensatsu, gohosatsu, ha]) => {
      const values = [
        ankensatsu ? `暗剣 ${ankensatsu}` : null,
        gohosatsu ? `五黄 ${gohosatsu}` : null,
        ha ? `破 ${ha}` : null,
      ].filter(Boolean);

      return `${label}: ${values.length > 0 ? values.join("・") : "-"}`;
    })
    .join(" / ");
}

function getGoodFortuneDirectionDisplay(day: CalendarDay) {
  const result = getGoodFortuneDirections(day);

  return result.entries.length > 0
    ? result.entries
        .map((entry) => `${entry.name} ${entry.direction}（${entry.board === "year" ? "年" : "月"}）`)
        .join(" / ")
    : "-";
}

function getTendoDirectionDisplay(day: CalendarDay) {
  const tendo = getGoodFortuneDirections(day).entries.find(
    (entry) => entry.code === "tendo",
  );

  return tendo
    ? `${tendo.direction}（${tendo.directionDetail}） / ${tendo.basis}`
    : "-";
}

function getChildSatsuDisplay(day: CalendarDay) {
  const childSatsu = getChildSatsu(day);

  if (childSatsu.status === "active") {
    return `${childSatsu.direction} / ${childSatsu.targetStarName} / ${childSatsu.targetCondition.primary}`;
  }

  if (childSatsu.status === "center_no_direction") {
    return `方位なし / ${childSatsu.targetStarName}中宮`;
  }

  return "-";
}

function buildCalendarDbRow(
  day: CalendarDay,
  personal: CalendarDbPersonalContext | null = null,
  purpose: CalendarDbPurposeContext = getActionPurpose("none"),
): CalendarDbRow {
  const japaneseEra = getJapaneseEraDateContext(day.date);
  const traditionalMonthName =
    getTraditionalMonthName(day.calendarBase.month) ?? "-";
  const dayKanshi = getKanshiByName(day.pillars.day);
  const sanGenNineUn = getSanGenNineUnContext(day.calendarBase.year);
  const zassetsuEntries = getZassetsuByDate(day.date);
  const todayAnniversaryDisplay = getTodayAnniversaryDisplay(day.date);
  const calendarNoteReference = getCalendarNoteVerificationReference(day.date);
  const selectedSetsuiri = getSetsuiriDisplay(day);
  const latestSetsuiriDisplay = getLatestSetsuiriDisplay(day);
  const directionMatrix = getDirectionMatrix(day);
  const rawDirectionValues = Object.fromEntries(
    directionDisplayOrder.map((direction) => [
      direction,
      getDirectionMatrixCellDisplay(directionMatrix, direction),
    ]),
  );
  const directionBoardValues = getDirectionMatrixBoardValues(directionMatrix);
  const yearHonmeiDirection = getHonmeiDirection(day.kyusei.year, personal);
  const monthHonmeiDirection = getHonmeiDirection(day.kyusei.month, personal);
  const dayHonmeiDirection = getHonmeiDirection(day.kyusei.day, personal);

  directionDisplayOrder.forEach((direction) => {
    const yearStar = getKyuseiDirectionStar(day.kyusei.year, direction);
    const monthStar = getKyuseiDirectionStar(day.kyusei.month, direction);
    const dayStar = getKyuseiDirectionStar(day.kyusei.day, direction);

    directionBoardValues[direction].year = formatDirectionBoardCell(
      yearStar,
      getPersonalizedDirectionValues(
        directionBoardValues[direction].year,
        personal,
        yearStar,
        direction,
        yearHonmeiDirection,
      ),
    );
    directionBoardValues[direction].month = formatDirectionBoardCell(
      monthStar,
      getPersonalizedDirectionValues(
        directionBoardValues[direction].month,
        personal,
        monthStar,
        direction,
        monthHonmeiDirection,
      ),
    );
    directionBoardValues[direction].day = formatDirectionBoardCell(
      dayStar,
      getPersonalizedDirectionValues(
        directionBoardValues[direction].day,
        personal,
        dayStar,
        direction,
        dayHonmeiDirection,
      ),
    );
  });

  const directionValues = personal
    ? Object.fromEntries(
        directionDisplayOrder.map((direction) => [
          direction,
          getDirectionBoardSummaryDisplay(directionBoardValues[direction]),
        ]),
      )
    : rawDirectionValues;

  const values: Record<string, string> = {
    西暦: `${day.date}（${day.calendarBase.weekday.ja}）`,
    月名: `${day.calendarBase.month}月 / ${traditionalMonthName}`,
    元号: `${japaneseEra.era.display}（${japaneseEra.era.alphabet}${japaneseEra.era.year}）`,
    "西暦年→元号年": japaneseEra.candidatesForWesternYear
      .map((candidate) => candidate.display)
      .join(" / "),
    祝日: day.calendarBase.nationalHoliday.name ?? "-",
    当日節気: day.solarTerm.name || "-",
    現在の節気: day.solarTerm.latestSetsuiri?.name ?? "-",
    節入り時刻:
      selectedSetsuiri ?? day.solarTerm.official?.timeJst ?? "-",
    直近節入り: latestSetsuiriDisplay ?? "-",
    節入り日数: day.solarTerm.officialDaysFromSetsuiri
      ? `${day.solarTerm.officialDaysFromSetsuiri}日目`
      : day.solarTerm.daysFromSetsuiri
        ? `${day.solarTerm.daysFromSetsuiri}日目`
        : "-",
    旧暦: day.lunarCalendar.display ?? "-",
    六曜: day.lunarCalendar.rokuyo ?? "-",
    "年/月/日干支": `${day.pillars.year} / ${day.pillars.month} / ${day.pillars.day}`,
    日納音: dayKanshi?.nacchin ?? "-",
    "年/月/日九星": `${day.kyusei.year} / ${day.kyusei.month} / ${day.kyusei.day}`,
    方位別: getDirectionMatrixDisplay(day),
    方位意味: getDirectionMeaningSummary(),
    ...directionValues,
    方位殺: getDirectionWarningSummary(day),
    吉神方位: getGoodFortuneDirectionDisplay(day),
    天道: getTendoDirectionDisplay(day),
    小児殺: getChildSatsuDisplay(day),
    三元九運: `${sanGenNineUn.cycle}・第${sanGenNineUn.period}運 / ${sanGenNineUn.starName} / ${sanGenNineUn.startYear}〜${sanGenNineUn.endYear}年`,
    空亡: day.void.kuubou,
    十二直: day.calendarNotes.junichoku?.name ?? "-",
    二十八宿: day.calendarNotes.nijuhachishuku?.name ?? "-",
    二十七宿: day.calendarNotes.nanajushichishuku ?? "-",
    雑節:
      zassetsuEntries.length > 0
        ? zassetsuEntries.map((entry) => entry.label).join(" / ")
        : "-",
    "今日は何の日": todayAnniversaryDisplay,
    主要選日: calendarNoteReference
      ? calendarNoteReference.summary
      : day.calendarNotes.activeDefinitions.length > 0
        ? day.calendarNotes.activeDefinitions
            .map((definition) => definition.name)
            .join(" / ")
        : "-",
    下段暦注:
      day.calendarNotes.activeDefinitions
        .filter((definition) => lowerCalendarNoteCodes.has(definition.code))
        .map((definition) => definition.name)
        .join(" / ") || "-",
    土用: getDoyoSummary(day),
    旧暦ソース: day.lunarCalendar.sourceStatus,
    暦注ソース: day.calendarNotes.sourceStatus,
  };

  return {
    date: day.date,
    dayType: getCalendarDbDayType(day),
    values,
    purposeTags: getPurposeDirectionTags(directionBoardValues, purpose),
    kyuseiBoardRows: [
      {
        board: "year",
        label: "年",
        pillar: day.pillars.year,
        kyusei: getKyuseiStarDisplay(day.kyusei.year),
      },
      {
        board: "month",
        label: "月",
        pillar: day.pillars.month,
        kyusei: getKyuseiStarDisplay(day.kyusei.month),
      },
      {
        board: "day",
        label: "日",
        pillar: day.pillars.day,
        kyusei: getKyuseiStarDisplay(day.kyusei.day),
      },
    ],
    directionBoardValues,
  };
}

export function getCalendarDbDefaultQuery() {
  const today = getTodayJstDate();
  const year = today.slice(0, 4);

  return {
    year,
    start: `${year}-01-01`,
    end: `${year}-12-31`,
    birthDate: "",
    honmeiStar: "",
    keyword: "",
    limit: 365,
    view: "kyusei" satisfies CalendarDbView,
    dayType: "all" satisfies CalendarDbDayTypeFilter,
    kyuseiMatch: "all" satisfies CalendarDbKyuseiMatchFilter,
    purpose: "none" satisfies ActionPurposeId,
    candidate: "all" satisfies CalendarDbCandidateFilter,
    goodDirectionMatch: "all" satisfies CalendarDbGoodDirectionMatchFilter,
  };
}

export function searchCalendarDb(query: CalendarDbQuery = {}) {
  const defaults = getCalendarDbDefaultQuery();
  const year = query.year?.trim() || defaults.year;
  const start = query.start?.trim() || `${year}-01-01`;
  const end = query.end?.trim() || `${year}-12-31`;
  const birthDate = normalizeDateInput(query.birthDate);
  const birthGender = normalizeBirthGender(query.birthGender);
  const honmeiStar = normalizeHonmeiStar(query.honmeiStar);
  const keyword = query.keyword?.trim() ?? "";
  const limit = clampLimit(query.limit);
  const view = normalizeView(query.view);
  const dayType = normalizeDayType(query.dayType);
  const kyuseiMatch = normalizeKyuseiMatch(query.kyuseiMatch);
  const purpose = getActionPurpose(normalizePurpose(query.purpose));
  const candidate = normalizeCandidate(query.candidate);
  const goodDirectionMatch = normalizeGoodDirectionMatch(
    query.goodDirectionMatch,
  );
  const columns = calendarDbViewColumns[view];
  const personal =
    getPersonalContextFromHonmeiStar(honmeiStar) ??
    getPersonalContext(birthDate, birthGender);

  const baseDays = getCalendarDays({ start, end });
  const days = baseDays.filter(
    (day) =>
      matchesDayTypeFilter(getCalendarDbDayType(day), dayType) &&
      matchesKyuseiMatchFilter(day, kyuseiMatch),
  );

  const matchedRows: CalendarDbRow[] = [];
  let totalMatched = 0;

  for (const day of days) {
    const row = buildCalendarDbRow(day, personal, purpose);
    const isKeywordMatched = matchesKeyword(row, [...calendarDbColumns], keyword);
    const isMatched =
      isKeywordMatched &&
      matchesCandidateFilter(row, candidate) &&
      matchesGoodDirectionMatchFilter(row, goodDirectionMatch);

    if (isMatched) {
      totalMatched += 1;

      if (matchedRows.length < limit) {
        matchedRows.push(row);
      }
    }
  }

  return {
    query: {
      year,
      start,
      end,
      birthDate,
      honmeiStar,
      keyword,
      limit,
      view,
      dayType,
      kyuseiMatch,
      purpose: purpose.id,
      candidate,
      goodDirectionMatch,
    },
    totalBeforeFilter: baseDays.length,
    totalMatched,
    totalReturned: matchedRows.length,
    rows: matchedRows,
    columns,
    personal,
    purpose,
  };
}
