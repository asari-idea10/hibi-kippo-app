import Link from "next/link";
import type { CSSProperties } from "react";

import { getBestDayScores } from "@/lib/best-day-score";
import {
  getAdoptionSourceCatalog,
  getAdoptionStatusInfo,
} from "@/lib/adoption-status";
import {
  getCommonCalendarCompletionItems,
  getCommonCalendarCompletionSummary,
} from "@/lib/common-calendar-completion";
import {
  enrichCalendarNoteOccurrence,
  getCalendarNoteOccurrenceDay,
  getCalendarNoteOccurrenceDays,
  getCalendarNoteOccurrenceSummary,
} from "@/lib/calendar-note-occurrences";
import { getCalendarNoteDiffAnalysis } from "@/lib/calendar-note-diff-analysis";
import { getCalendarNoteMasterSummary } from "@/lib/calendar-notes";
import type { CalendarNoteMasterEntry } from "@/lib/calendar-notes";
import { junichokuRuleSpec } from "@/lib/calendar-note-rule-spec";
import { getCalendarNoteVerificationReference } from "@/lib/calendar-note-verification-references";
import { calendarSystemSpecs } from "@/lib/calendar-system-spec";
import { getChildSatsu } from "@/lib/child-satsu";
import { getDirectionWarningValidation } from "@/lib/direction-warning-validation";
import {
  getDoyoComparison,
  getDoyoManualCheckTargets,
  getDoyoPeriods,
} from "@/lib/doyo";
import { judgeGoodFortuneDirectionConflicts } from "@/lib/good-fortune-direction-policy";
import { getGoodFortuneDirections } from "@/lib/good-fortune-directions";
import {
  getInzenCellContext,
  inzenChartDefinition,
  inzenColumnKeys,
  type InzenColumnKey,
  type InzenRowKey,
} from "@/lib/inzen-chart-definition";
import {
  getLunarCalendarSummary,
  getLunarCalendarValidation,
  getLunarCalendars,
  getLunarMonths,
} from "@/lib/lunar-calendar";
import {
  getJapaneseEraDateContext,
  getJapaneseEraVerificationSummary,
} from "@/lib/japanese-era";
import { getKanshiByName } from "@/lib/kanshi-master";
import {
  compareGeneratedWithSample,
  getGeneratedLunarCalendarDay,
  getGeneratedLunarCalendarConnectionSummary,
} from "@/lib/lunar-calendar-generated";
import {
  getNationalHolidaySummary,
  getNationalHolidays,
} from "@/lib/national-holidays";
import { getSolarTermValidation } from "@/lib/solar-term-validation";
import {
  getSolarTermMasterSummary,
  getSolarTerms,
} from "@/lib/solar-terms";
import { getSanGenNineUnContext } from "@/lib/san-gen-nine-un";
import {
  getSelectedDayAdoptionSummary,
  getSelectedDayCandidateRows,
  getSelectedDayImplementedRows,
} from "@/lib/selected-day-adoption";
import { getTraditionalMonthName } from "@/lib/month-names";
import {
  getZassetsuByDate,
  getZassetsuEntries,
  getZassetsuSummary,
  getZassetsuVerificationSummary,
} from "@/lib/zassetsu";
import { getZokanComparison, zokanMethods } from "@/lib/zokan-master";
import {
  getCalendarDay,
  getCalendarDayDefaultRange,
  getCalendarDayImportSummary,
  getCalendarDays,
  getCalendarDayRange,
  listCalendarDaysAround,
} from "@/lib/calendar-day";
import type { CalendarDay } from "@/lib/calendar-day";
import {
  getTodayAnniversaries,
  getTodayAnniversaryDisplay,
  getTodayAnniversarySummary,
} from "@/lib/today-anniversaries";

const fallbackDate = "2026-05-18";
const weekdayNamesJa = ["日", "月", "火", "水", "木", "金", "土"] as const;
const lowerCalendarNoteCodes = new Set([
  "tensha_bi",
  "tenten_satsu",
  "jiten_satsu",
  "shihai_nichi",
]);
const portalSeasonTerms = {
  spring: new Set(["立春", "雨水", "啓蟄", "春分", "清明", "穀雨"]),
  summer: new Set(["立夏", "小満", "芒種", "夏至", "小暑", "大暑"]),
  autumn: new Set(["立秋", "処暑", "白露", "秋分", "寒露", "霜降"]),
  winter: new Set(["立冬", "小雪", "大雪", "冬至", "小寒", "大寒"]),
} as const;

type PortalSeasonKind = "spring" | "summer" | "autumn" | "winter" | "doyo";

function getPortalSeasonEffect(
  month: number,
  solarTermName: string,
  zassetsuEntries: ReturnType<typeof getZassetsuByDate>,
): { kind: PortalSeasonKind; label: string } {
  if (zassetsuEntries.some((entry) => entry.label.includes("土用"))) {
    return { kind: "doyo", label: "土用の気配" };
  }

  if (portalSeasonTerms.spring.has(solarTermName)) {
    return { kind: "spring", label: "春の気配" };
  }
  if (portalSeasonTerms.summer.has(solarTermName)) {
    return { kind: "summer", label: "夏の気配" };
  }
  if (portalSeasonTerms.autumn.has(solarTermName)) {
    return { kind: "autumn", label: "秋の気配" };
  }
  if (portalSeasonTerms.winter.has(solarTermName)) {
    return { kind: "winter", label: "冬の気配" };
  }

  if (month >= 3 && month <= 5) return { kind: "spring", label: "春の気配" };
  if (month >= 6 && month <= 8) return { kind: "summer", label: "夏の気配" };
  if (month >= 9 && month <= 11) return { kind: "autumn", label: "秋の気配" };
  return { kind: "winter", label: "冬の気配" };
}

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

function getWeekdayJa(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return weekdayNamesJa[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

function getSetsuiriDisplay(day: CalendarDay) {
  const term = day.solarTerm.official;

  if (!term?.isSetsuiriForKyusei) {
    return null;
  }

  return `${term.name} ${term.timeJst}`;
}

function getLatestSetsuiriDisplay(day: CalendarDay) {
  const latestSetsuiri = day.solarTerm.latestSetsuiri;

  if (!latestSetsuiri) {
    return null;
  }

  return `${latestSetsuiri.name} ${latestSetsuiri.date} ${latestSetsuiri.timeJst}`;
}

function buildPortalTuningMessage(
  day: CalendarDay,
  zassetsuEntries: ReturnType<typeof getZassetsuByDate>,
) {
  const selectedDays = day.calendarNotes.activeDefinitions;
  const selectedDayNames = selectedDays.map((definition) => definition.name);
  const hasTensha = selectedDayNames.includes("天赦日");
  const strongGoodDay = selectedDays.find(
    (definition) => definition.fortune === "good" && definition.weight >= 10,
  );
  const cautionDay = selectedDays.find(
    (definition) => definition.fortune === "bad",
  );
  const zassetsuNames = zassetsuEntries.map((entry) => entry.name);
  const setsuiri = day.solarTerm.official?.isSetsuiriForKyusei
    ? day.solarTerm.official
    : null;

  if (setsuiri) {
    return `${setsuiri.name}の節入り。月の気が切り替わる日です。予定を詰め込みすぎず、身の回りを整え、新しい流れに合わせる準備をするとよい日です。`;
  }

  if (hasTensha) {
    return "天赦日の気配があります。大きく煽る日ではなく、願いを整え、始めたいことを静かに一歩進める日。参拝や申し込み、学びの開始と相性がよい日です。";
  }

  if (day.doyo.isDoyo) {
    return `${day.doyo.label || "土用"}の期間です。大きく掘り返すより、身体と暮らしの土台を整える日。胃腸を休め、掃除や片付けで気の通り道を軽くしておくと安心です。`;
  }

  if (cautionDay) {
    return `${cautionDay.name}が入るため、勢いだけで決めるより確認を重ねたい日です。契約や移動は余白を持ち、掃除、見直し、準備に寄せると気が整います。`;
  }

  if (strongGoodDay) {
    return `${strongGoodDay.name}の後押しがあります。小さく始めたことが育ちやすい日です。学び、発信、参拝、積み立てのように、未来へ残る行動を選ぶとよい流れになります。`;
  }

  if (zassetsuNames.length > 0) {
    return `${zassetsuNames.join("・")}にあたります。季節の節目を意識して、無理に前へ出るより、暮らしのリズムを整える行動が合います。`;
  }

  return "今日は、暦を眺めて呼吸を整える日。無理に答えを急がず、参拝、掃除、休息、少し足を伸ばす行動の中から、今の自分に合う整え方を選びます。";
}

function dateToUtcIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function utcIndexToDate(index: number) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function shiftDateWithinRange(date: string, offset: number, range: {
  start: string;
  end: string;
}) {
  const shifted = utcIndexToDate(dateToUtcIndex(date) + offset);

  if (shifted < range.start || shifted > range.end) {
    return null;
  }

  return shifted;
}

function getMatchStatusLabel(hasReference: boolean, isMatched: boolean) {
  if (!hasReference) {
    return "正本なし";
  }

  return isMatched ? "正本一致" : "差分あり";
}

const missingValueNeedsVerification = new Set([
  "十二直",
  "二十八宿",
  "主要選日",
]);

function needsMissingValueVerification(label: string, value: string) {
  return missingValueNeedsVerification.has(label) && value === "-";
}

function getDevCheckPoint(label: string, value: string) {
  if (needsMissingValueVerification(label, value)) {
    return "空欄のため要検証";
  }

  if (label === "祝日" && value === "-") {
    return "祝日該当なしなら空欄でOK";
  }

  if (label === "節入り時刻" && value === "-") {
    return "節入り日以外なら空欄でOK";
  }

  if (label === "当日節気" && value === "-") {
    return "節気当日でなければ空欄でOK。現在の節気は別行で確認";
  }

  if (label === "現在の節気") {
    return "直近節入りから現在効いている節気として照合";
  }

  if (label === "直近節入り") {
    return "節入り日数の起点。万年暦の節入り時刻と照合";
  }

  if (label === "土用" && value === "-") {
    return "土用期間外なら空欄でOK";
  }

  if (label === "節入り時刻") {
    return "万年暦の節入り時刻、二十四節気欄と照合";
  }

  if (label === "旧暦" || label === "六曜") {
    return "万年暦の旧暦・六曜欄と照合";
  }

  if (label.includes("干支") || label.includes("九星")) {
    return "年月日それぞれの暦欄と照合";
  }

  if (label === "主要選日") {
    return "暦注欄の選日表示・外部参照メモと照合";
  }

  return "日付欄・表示欄と照合";
}

function getFortuneEmptyDisplay(label: string, value: string) {
  if (value !== "-") {
    return value;
  }

  if (label === "祝日") {
    return "平日";
  }

  if (label === "当日節気") {
    return "節気当日ではありません";
  }

  if (label === "現在の節気") {
    return "節気未接続";
  }

  if (label === "節入り時刻") {
    return "節入り日ではありません";
  }

  if (label === "直近節入り") {
    return "直近節入り未接続";
  }

  if (label === "節入り日数") {
    return "節入り起点なし";
  }

  if (label === "十二直" || label === "二十八宿" || label === "二十七宿") {
    return "未接続";
  }

  if (label === "雑節") {
    return "雑節なし";
  }

  if (label === "主要選日") {
    return "主要選日なし";
  }

  if (label === "土用") {
    return "土用期間外";
  }

  return "該当なし";
}

function getZassetsuVerificationLabel(status: string) {
  if (status === "verified_external_reference") {
    return "外部正本一致";
  }

  if (status === "verified_external_date_reference") {
    return "外部正本日付一致";
  }

  if (status === "needs_external_source_check") {
    return "外部正本で照合待ち";
  }

  if (status === "needs_exact_ephemeris_check") {
    return "天文計算で正式化待ち";
  }

  if (status === "needs_manual_almanac_check") {
    return "万年暦で目視確認";
  }

  return status;
}

function getZassetsuMethodLabel(method: string) {
  if (method === "solar_longitude_crossing") {
    return "太陽黄経直接計算";
  }

  if (method === "solar_longitude_interpolation") {
    return "太陽黄経補間";
  }

  if (method === "days_from_risshun") {
    return "立春起算";
  }

  if (method === "higan_around_equinox") {
    return "春分/秋分起算";
  }

  if (method === "day_before_risshun") {
    return "立春前日";
  }

  return method;
}

function getBooleanMark(value: boolean) {
  return value ? "該当" : "-";
}

type HomeProps = {
  searchParams: Promise<{
    date?: string;
    view?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { date, view } = await searchParams;
  const todayDate = getTodayJstDate();
  const selectedDate = date?.trim() ? date : todayDate;
  const activeView = view === "dev" ? "dev" : "user";
  const selectedCalendarDay = getCalendarDay(selectedDate);
  const todayCalendarDay = getCalendarDay(todayDate);
  const calendarDay =
    selectedCalendarDay ?? todayCalendarDay ?? getCalendarDay(fallbackDate);
  const requestedDateMissing = Boolean(date && !selectedCalendarDay);
  const range = getCalendarDayRange();
  const defaultRange = getCalendarDayDefaultRange();
  const importedDays = getCalendarDays();
  const visibleDates = listCalendarDaysAround(calendarDay?.date ?? selectedDate);
  const importedRange = {
    start: importedDays[0]?.date ?? defaultRange.start,
    end: importedDays.at(-1)?.date ?? defaultRange.end,
    count: importedDays.length,
  };
  const importSummary = getCalendarDayImportSummary();
  const calendarNoteOccurrenceSummary = getCalendarNoteOccurrenceSummary();
  const calendarNoteOccurrences = getCalendarNoteOccurrenceDays({
    start: importedRange.start,
    end: importedRange.end,
  });
  const calendarNoteSummary = getCalendarNoteMasterSummary();
  const calendarNoteDiffAnalysis = getCalendarNoteDiffAnalysis();
  const bestDayScores =
    activeView === "user" ? getBestDayScores() : [];
  const directionValidation = getDirectionWarningValidation();
  const lunarCalendarSummary = getLunarCalendarSummary();
  const lunarCalendarValidation = getLunarCalendarValidation();
  const lunarCalendars2026 =
    activeView === "user" ? getLunarCalendars({ year: "2026" }) : [];
  const lunarMonths2026 =
    activeView === "user" ? getLunarMonths({ year: "2026" }) : [];
  const generatedLunarSummary = getGeneratedLunarCalendarConnectionSummary();
  const generatedLunarComparison =
    compareGeneratedWithSample(lunarCalendars2026);
  const nationalHolidaySummary = getNationalHolidaySummary();
  const nationalHolidays2026 =
    activeView === "user" ? getNationalHolidays({ year: "2026" }) : [];
  const solarTermValidation = getSolarTermValidation();
  const solarTermSummary = getSolarTermMasterSummary();
  const solarTerms2026 =
    activeView === "user" ? getSolarTerms({ year: "2026" }) : [];
  const selectedDayAdoptionSummary = getSelectedDayAdoptionSummary();
  const selectedDayImplementedRows = getSelectedDayImplementedRows();
  const selectedDayCandidateRows = getSelectedDayCandidateRows();

  if (!calendarDay) {
    return null;
  }

  const selectedGeneratedLunar = getGeneratedLunarCalendarDay(calendarDay.date);
  const selectedJapaneseEra = getJapaneseEraDateContext(calendarDay.date);
  const selectedTraditionalMonthName =
    getTraditionalMonthName(calendarDay.calendarBase.month) ?? "-";
  const japaneseEraVerification = getJapaneseEraVerificationSummary();
  const selectedZokanComparison = getZokanComparison(calendarDay);
  const selectedDoyoComparison = getDoyoComparison(calendarDay);
  const selectedTodayAnniversaries = getTodayAnniversaries(calendarDay.date);
  const selectedTodayAnniversarySummary = getTodayAnniversarySummary(
    calendarDay.date,
  );
  const selectedTodayAnniversaryDisplay = getTodayAnniversaryDisplay(
    calendarDay.date,
  );
  const selectedYear = calendarDay.date.slice(0, 4);
  const selectedYearDays =
    activeView === "user"
      ? getCalendarDays({
          start: `${selectedYear}-01-01`,
          end: `${selectedYear}-12-31`,
        })
      : [];
  const selectedZassetsuEntries = getZassetsuByDate(calendarDay.date);
  const selectedYearZassetsuEntries =
    activeView === "user" ? getZassetsuEntries(selectedYear) : [];
  const selectedYearZassetsuSummary = getZassetsuSummary(selectedYear);
  const selectedYearZassetsuVerification =
    getZassetsuVerificationSummary(selectedYear);
  const selectedGoodFortuneDirections = getGoodFortuneDirections(calendarDay);
  const selectedGoodFortunePolicy =
    judgeGoodFortuneDirectionConflicts(calendarDay);
  const selectedChildSatsu = getChildSatsu(calendarDay);
  const selectedSanGenNineUn = getSanGenNineUnContext(
    calendarDay.calendarBase.year,
  );
  const selectedYearDoyoPeriods =
    activeView === "user" ? getDoyoPeriods(selectedYear) : [];
  const selectedYearDoyoManualCheckTargets =
    activeView === "user" ? getDoyoManualCheckTargets(selectedYear) : [];
  const doyoComparisons = selectedYearDays.map((day) => ({
    day,
    comparison: getDoyoComparison(day),
  }));
  const doyoFocusComparisons = doyoComparisons.filter(
    ({ comparison }) =>
      comparison.spreadsheet.isDoyo ||
      comparison.calculated.isDoyo ||
      comparison.diffs.length > 0,
  );
  const doyoComparisonSummary = {
    total: doyoComparisons.length,
    mismatched: doyoComparisons.filter(
      ({ comparison }) => comparison.diffs.length > 0,
    ).length,
  };
  const zokanComparisons = importedDays.map((day) => ({
    day,
    comparison: getZokanComparison(day),
  }));
  const zokanComparisonSummary = {
    total: zokanComparisons.length,
    mismatched: zokanComparisons.filter(
      ({ comparison }) => comparison.diffs.length > 0,
    ).length,
  };
  const selectedBestDayScore = bestDayScores.find(
    (score) => score.date === calendarDay.date,
  );
  const selectedCalendarNoteOccurrence = getCalendarNoteOccurrenceDay(
    calendarDay.date,
  );
  const calendarNoteReference = getCalendarNoteVerificationReference(
    calendarDay.date,
  );
  const selectedEnrichedCalendarNoteOccurrence = selectedCalendarNoteOccurrence
    ? enrichCalendarNoteOccurrence(selectedCalendarNoteOccurrence)
    : null;
  const selectedSetsuiri = getSetsuiriDisplay(calendarDay);
  const latestSetsuiriDisplay = getLatestSetsuiriDisplay(calendarDay);
  const selectedCalendarNoteRows: Array<
    [string, CalendarNoteMasterEntry | null]
  > = [
    ["十二直", calendarDay.calendarNotes.junichoku],
    ["二十八宿", calendarDay.calendarNotes.nijuhachishuku],
  ];
  const selectedYearKanshi = getKanshiByName(calendarDay.pillars.year);
  const selectedMonthKanshi = getKanshiByName(calendarDay.pillars.month);
  const selectedDayKanshi = getKanshiByName(calendarDay.pillars.day);
  const selectedNacchinSummary = [
    `年 ${selectedYearKanshi?.nacchin ?? "-"}`,
    `月 ${selectedMonthKanshi?.nacchin ?? "-"}`,
    `日 ${selectedDayKanshi?.nacchin ?? "-"}`,
  ].join(" / ");
  const selectedDayKanshiDetailRows = selectedDayKanshi
    ? [
        ["日干支", selectedDayKanshi.kanshi],
        ["納音", selectedDayKanshi.nacchin],
        ["空亡", selectedDayKanshi.kuubou],
        ["意味・性質", selectedDayKanshi.meaning],
        ["補足情報", selectedDayKanshi.note],
        ["魁罡", getBooleanMark(selectedDayKanshi.is_kaigou)],
        ["準魁罡", getBooleanMark(selectedDayKanshi.is_jun_kaigou)],
        ["異常干支", selectedDayKanshi.ijou_type ?? "-"],
      ]
    : [];
  const inzenColumnDefinitions = inzenColumnKeys.map((key) => ({
    key,
    ...inzenChartDefinition.chart_definition.columns[key],
  }));
  const inzenValueByColumn = {
    year: {
      heavenly_stem: calendarDay.stems.year,
      earthly_branch: calendarDay.branches.year,
      hidden_stems_main: calendarDay.zokan.year.main,
      hidden_stems_middle: calendarDay.zokan.year.middle,
      hidden_stems_extra: calendarDay.zokan.year.extra,
      nine_stars: calendarDay.kyusei.year,
      story: "",
    },
    month: {
      heavenly_stem: calendarDay.stems.month,
      earthly_branch: calendarDay.branches.month,
      hidden_stems_main: calendarDay.zokan.month.main,
      hidden_stems_middle: calendarDay.zokan.month.middle,
      hidden_stems_extra: calendarDay.zokan.month.extra,
      nine_stars: calendarDay.kyusei.month,
      story: "",
    },
    day: {
      heavenly_stem: calendarDay.stems.day,
      earthly_branch: calendarDay.branches.day,
      hidden_stems_main: calendarDay.zokan.day.main,
      hidden_stems_middle: calendarDay.zokan.day.middle,
      hidden_stems_extra: calendarDay.zokan.day.extra,
      nine_stars: calendarDay.kyusei.day,
      story: "",
    },
    time: {
      heavenly_stem: "",
      earthly_branch: "",
      hidden_stems_main: "",
      hidden_stems_middle: "",
      hidden_stems_extra: "",
      nine_stars: "",
      story: "",
    },
  } satisfies Record<
    InzenColumnKey,
    Record<
      | "heavenly_stem"
      | "earthly_branch"
      | "hidden_stems_main"
      | "hidden_stems_middle"
      | "hidden_stems_extra"
      | "nine_stars"
      | "story",
      string
    >
  >;
  const inzenTableRows: Array<{
    label: string;
    rowKey: InzenRowKey;
    valueKey:
      | "heavenly_stem"
      | "earthly_branch"
      | "hidden_stems_main"
      | "hidden_stems_middle"
      | "hidden_stems_extra"
      | "nine_stars"
      | "story";
    isStory?: boolean;
  }> = [
    {
      label: "天干",
      rowKey: "heavenly_stem",
      valueKey: "heavenly_stem",
    },
    {
      label: "地支",
      rowKey: "earthly_branch",
      valueKey: "earthly_branch",
    },
    {
      label: "蔵干 主",
      rowKey: "hidden_stems_main",
      valueKey: "hidden_stems_main",
    },
    {
      label: "蔵干 中",
      rowKey: "hidden_stems_middle",
      valueKey: "hidden_stems_middle",
    },
    {
      label: "蔵干 余",
      rowKey: "hidden_stems_extra",
      valueKey: "hidden_stems_extra",
    },
    {
      label: "九星",
      rowKey: "nine_stars",
      valueKey: "nine_stars",
    },
    {
      label: "ストーリー",
      rowKey: "story",
      valueKey: "story",
      isStory: true,
    },
  ];
  const directionRows = [
    ["年盤", calendarDay.directionWarnings.year],
    ["月盤", calendarDay.directionWarnings.month],
    ["日盤", calendarDay.directionWarnings.day],
  ] as const;
  const previousDate = shiftDateWithinRange(calendarDay.date, -1, range);
  const nextDate = shiftDateWithinRange(calendarDay.date, 1, range);
  const previousWeekDate = shiftDateWithinRange(calendarDay.date, -7, range);
  const nextWeekDate = shiftDateWithinRange(calendarDay.date, 7, range);
  const monthStartDate = `${calendarDay.date.slice(0, 7)}-01`;
  const yearStartDate = `${calendarDay.date.slice(0, 4)}-01-01`;
  const quickJumpLinks = [
    todayDate >= range.start && todayDate <= range.end && todayDate !== calendarDay.date
      ? ["今日", todayDate]
      : null,
    previousWeekDate ? ["7日前", previousWeekDate] : null,
    previousDate ? ["前日", previousDate] : null,
    ["当日", calendarDay.date],
    nextDate ? ["翌日", nextDate] : null,
    nextWeekDate ? ["7日後", nextWeekDate] : null,
    [calendarDay.date.slice(0, 7), monthStartDate < range.start ? range.start : monthStartDate],
    [calendarDay.date.slice(0, 4), yearStartDate < range.start ? range.start : yearStartDate],
  ].filter((link): link is [string, string] => Boolean(link));
  const selectedSeasonalDoyoDayLabel =
    selectedDoyoComparison.calculated.isSeasonalDoyoDay
      ? `土用の${selectedDoyoComparison.calculated.dayBranch}の日`
      : null;
  const selectedDoyoSummary = selectedDoyoComparison.calculated.period
    ? `${selectedDoyoComparison.calculated.period.label} ${selectedDoyoComparison.calculated.dayIndexInDoyo}日目${
        selectedSeasonalDoyoDayLabel ? ` / ${selectedSeasonalDoyoDayLabel}` : ""
      }${
        selectedDoyoComparison.calculated.isManichi ? " / 間日" : ""
      } / 土用殺 ${selectedDoyoComparison.calculated.doyoSatsuDirection ?? "-"}`
    : "-";
  const devVerificationRows = [
    ["西暦", `${calendarDay.date}（${calendarDay.calendarBase.weekday.ja}）`],
    [
      "月名",
      `${calendarDay.calendarBase.month}月 / ${selectedTraditionalMonthName}`,
    ],
    [
      "元号",
      `${selectedJapaneseEra.era.display}（${selectedJapaneseEra.era.alphabet}${selectedJapaneseEra.era.year}）`,
    ],
    [
      "西暦年→元号年",
      selectedJapaneseEra.candidatesForWesternYear
        .map((candidate) => candidate.display)
        .join(" / "),
    ],
    ["祝日", calendarDay.calendarBase.nationalHoliday.name ?? "-"],
    ["当日節気", calendarDay.solarTerm.name || "-"],
    ["現在の節気", calendarDay.solarTerm.latestSetsuiri?.name ?? "-"],
    ["節入り時刻", selectedSetsuiri ?? calendarDay.solarTerm.official?.timeJst ?? "-"],
    ["直近節入り", latestSetsuiriDisplay ?? "-"],
    [
      "節入り日数",
      calendarDay.solarTerm.officialDaysFromSetsuiri
        ? `${calendarDay.solarTerm.officialDaysFromSetsuiri}日目`
        : calendarDay.solarTerm.daysFromSetsuiri
          ? `${calendarDay.solarTerm.daysFromSetsuiri}日目`
          : "-",
    ],
    ["旧暦", calendarDay.lunarCalendar.display ?? "-"],
    ["六曜", calendarDay.lunarCalendar.rokuyo ?? "-"],
    ["年/月/日干支", `${calendarDay.pillars.year} / ${calendarDay.pillars.month} / ${calendarDay.pillars.day}`],
    ["日納音", selectedDayKanshi?.nacchin ?? "-"],
    ["年/月/日九星", `${calendarDay.kyusei.year} / ${calendarDay.kyusei.month} / ${calendarDay.kyusei.day}`],
    [
      "三元九運",
      `${selectedSanGenNineUn.cycle}・第${selectedSanGenNineUn.period}運 / ${selectedSanGenNineUn.starName} / ${selectedSanGenNineUn.startYear}〜${selectedSanGenNineUn.endYear}年`,
    ],
    ["空亡", calendarDay.void.kuubou],
    ["十二直", calendarDay.calendarNotes.junichoku?.name ?? "-"],
    ["二十八宿", calendarDay.calendarNotes.nijuhachishuku?.name ?? "-"],
    ["二十七宿", calendarDay.calendarNotes.nanajushichishuku ?? "-"],
    [
      "雑節",
      selectedZassetsuEntries.length > 0
        ? selectedZassetsuEntries.map((entry) => entry.label).join(" / ")
        : "-",
    ],
    ["今日は何の日", selectedTodayAnniversaryDisplay],
    [
      "主要選日",
      calendarNoteReference
        ? calendarNoteReference.summary
        : calendarDay.calendarNotes.activeDefinitions.length > 0
        ? calendarDay.calendarNotes.activeDefinitions
            .map((definition) => definition.name)
            .join(" / ")
        : "-",
    ],
    [
      "下段暦注",
      calendarDay.calendarNotes.activeDefinitions
        .filter((definition) => lowerCalendarNoteCodes.has(definition.code))
        .map((definition) => definition.name)
        .join(" / ") || "-",
    ],
    [
      "土用",
      selectedDoyoSummary,
    ],
    ["旧暦ソース", calendarDay.lunarCalendar.sourceStatus],
    ["暦注ソース", calendarDay.calendarNotes.sourceStatus],
  ] as const;
  const referenceComparisonRows = calendarNoteReference
    ? [
        calendarNoteReference.junichoku
          ? [
              "十二直",
              calendarDay.calendarNotes.junichoku?.name ?? "-",
              calendarNoteReference.junichoku,
            ]
          : null,
        calendarNoteReference.nijuhachishuku
          ? [
              "二十八宿",
              calendarDay.calendarNotes.nijuhachishuku?.name ?? "-",
              calendarNoteReference.nijuhachishuku,
            ]
          : null,
        calendarNoteReference.nanajushichishuku
          ? [
              "二十七宿",
              calendarDay.calendarNotes.nanajushichishuku ?? "-",
              calendarNoteReference.nanajushichishuku,
            ]
          : null,
        [
          "主要選日",
          calendarDay.calendarNotes.summary,
          calendarNoteReference.summary,
        ],
        [
          "主要選日コード",
          calendarDay.calendarNotes.activeDefinitions
            .map((definition) => definition.code)
            .join(" / ") || "-",
          calendarNoteReference.selectedDayCodes.join(" / "),
        ],
      ].filter(
        (row): row is [string, string, string] => Boolean(row),
      )
    : [];
  const referenceMatched =
    referenceComparisonRows.length > 0 &&
    referenceComparisonRows.every(([, appValue, referenceValue]) => appValue === referenceValue);
  const selectedCandidateCheck =
    calendarDay.calendarNotes.selectedDayCandidateCheck;
  const selectedLowerCalendarNotes =
    calendarDay.calendarNotes.activeDefinitions.filter((definition) =>
      lowerCalendarNoteCodes.has(definition.code),
    );
  const lowerCalendarNoteCandidates =
    selectedCandidateCheck.candidates.filter((candidate) =>
      lowerCalendarNoteCodes.has(candidate.code),
    );
  const adoptionStatusRows = [
    {
      item: "年月日マスター",
      status: calendarDay.source.status,
      detail: "年/月/日干支・九星・方位殺などの基礎行",
    },
    {
      item: "元号年・西暦年変換",
      status: selectedJapaneseEra.sourceStatus,
      detail: `${selectedJapaneseEra.era.display} / ${selectedJapaneseEra.westernYear}年`,
    },
    {
      item: "祝日",
      status: calendarDay.calendarBase.nationalHoliday.sourceStatus,
      detail: calendarDay.calendarBase.nationalHoliday.name ?? "該当なし",
    },
    {
      item: "二十四節気",
      status: calendarDay.solarTerm.official ? "verified_master" : "not_applicable",
      detail: calendarDay.solarTerm.official
        ? `${calendarDay.solarTerm.official.name} ${calendarDay.solarTerm.official.timeJst}`
        : latestSetsuiriDisplay ?? "当日節気なし",
    },
    {
      item: "旧暦・六曜",
      status: calendarDay.lunarCalendar.sourceStatus,
      detail: `${calendarDay.lunarCalendar.display ?? "-"} / ${
        calendarDay.lunarCalendar.rokuyo ?? "-"
      }`,
    },
    {
      item: "納音",
      status: selectedDayKanshi ? "verified" : "not_connected",
      detail: selectedDayKanshi
        ? `${selectedDayKanshi.kanshi} / ${selectedDayKanshi.nacchin}`
        : "干支マスター未接続",
    },
    {
      item: "暦注",
      status: calendarDay.calendarNotes.verificationStatus,
      detail: `${calendarDay.calendarNotes.sourceStatus} / ${
        calendarDay.calendarNotes.summary ?? "-"
      }`,
    },
    {
      item: "外部暦注参照",
      status: calendarNoteReference?.sourceStatus ?? "not_connected",
      detail: calendarNoteReference?.sourceName ?? "正本サンプルなし",
    },
    {
      item: "土用",
      status: selectedDoyoComparison.calculated.sourceStatus,
      detail: selectedDoyoComparison.calculated.period?.label ?? "土用期間外",
    },
    {
      item: "今日は何の日",
      status:
        selectedTodayAnniversaries?.sourceStatus ?? "not_connected",
      detail:
        selectedTodayAnniversarySummary
          ? `${selectedTodayAnniversarySummary.totalEntries}件 / ${selectedTodayAnniversaryDisplay}`
          : selectedTodayAnniversaryDisplay === "-"
          ? "未接続"
          : selectedTodayAnniversaryDisplay,
    },
    {
      item: "雑節",
      status:
        selectedZassetsuEntries.find(
          (entry) => entry.sourceStatus === "interpolated_v0",
        )?.sourceStatus ??
        selectedZassetsuEntries[0]?.sourceStatus ??
        selectedYearZassetsuVerification.adoptionStatus,
      detail:
        selectedZassetsuEntries.map((entry) => entry.label).join(" / ") ||
        `年内 ${selectedYearZassetsuVerification.total}件`,
    },
  ].map((row) => ({
    ...row,
    info: getAdoptionStatusInfo(row.status),
  }));
  const adoptionSourceCatalog = getAdoptionSourceCatalog();
  const commonCalendarCompletionItems = getCommonCalendarCompletionItems();
  const commonCalendarCompletionSummary = getCommonCalendarCompletionSummary();
  const devStatusCards = [
    {
      label: "正本照合",
      value: getMatchStatusLabel(Boolean(calendarNoteReference), referenceMatched),
      detail: calendarNoteReference
        ? calendarNoteReference.sourceName
        : "年別正本サンプル未接続",
      tone:
        calendarNoteReference && referenceMatched
          ? "ok"
          : calendarNoteReference
            ? "warn"
            : "muted",
    },
    {
      label: "暦注採用",
      value: calendarDay.calendarNotes.verificationStatus,
      detail: calendarDay.calendarNotes.sourceStatus,
      tone:
        calendarDay.calendarNotes.verificationStatus ===
        "external_reference_checked"
          ? "ok"
          : "muted",
    },
    {
      label: "候補計算",
      value:
        selectedCandidateCheck.status === "matched" ? "一致" : "差分あり",
      detail: `候補 ${selectedCandidateCheck.candidateCodes.join(" / ") || "-"} / 採用 ${
        selectedCandidateCheck.adoptedScopedCodes.join(" / ") || "-"
      }`,
      tone: selectedCandidateCheck.status === "matched" ? "ok" : "warn",
    },
    {
      label: "収録範囲",
      value: `${range.count.toLocaleString()}日`,
      detail: `${range.start} 〜 ${range.end}`,
      tone: "muted",
    },
  ];

  const viewHref = (targetView: "user" | "dev") =>
    `/?date=${calendarDay.date}&view=${targetView}`;
  const legacyActiveView: "user" | "dev" = activeView;

  if (activeView === "user") {
    const portalSelectedDays =
      calendarDay.calendarNotes.activeDefinitions
        .map((definition) => definition.name)
        .join(" / ") || "主要選日なし";
    const portalZassetsu =
      selectedZassetsuEntries.map((entry) => entry.label).join(" / ") ||
      "雑節なし";
    const portalCurrentTerm =
      calendarDay.solarTerm.latestSetsuiri?.name ||
      calendarDay.solarTerm.name ||
      "-";
    const portalTuningMessage = buildPortalTuningMessage(
      calendarDay,
      selectedZassetsuEntries,
    );
    const portalSeasonEffect = getPortalSeasonEffect(
      calendarDay.calendarBase.month,
      portalCurrentTerm,
      selectedZassetsuEntries,
    );
    const portalSeasonParticles = Array.from({ length: 16 }, (_, index) => index);
    const portalAirItems = [
      ["西暦", `${calendarDay.date}（${calendarDay.calendarBase.weekday.ja}）`],
      ["元号", selectedJapaneseEra.era.display],
      ["節気", portalCurrentTerm],
      ["旧暦", calendarDay.lunarCalendar.display ?? "-"],
      ["六曜", calendarDay.lunarCalendar.rokuyo ?? "-"],
      ["選日", portalSelectedDays],
      [
        "干支",
        `${calendarDay.pillars.year} / ${calendarDay.pillars.month} / ${calendarDay.pillars.day}`,
      ],
      [
        "九星",
        `${calendarDay.kyusei.year} / ${calendarDay.kyusei.month} / ${calendarDay.kyusei.day}`,
      ],
    ] as const;

    return (
      <main className="shell homePortalShell">
        <div className="homePortalTexture" aria-hidden="true" />
        <div
          className={`homePortalSeasonLayer homePortalSeasonLayer-${portalSeasonEffect.kind}`}
          aria-hidden="true"
        >
          {portalSeasonParticles.map((index) => (
            <span
              className="homePortalSeasonParticle"
              key={index}
              style={
                {
                  "--season-index": index,
                  "--season-left": `${(index * 7.3 + 4) % 100}%`,
                  "--season-fall-duration": `${18 + (index % 6) * 2.5}s`,
                  "--season-slow-duration": `${26 + (index % 5) * 2}s`,
                  "--season-drift-duration": `${7 + (index % 5) * 1.1}s`,
                  "--season-delay": `${index * -1.8}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <svg
          aria-hidden="true"
          className="homePortalCompassWatermark"
          viewBox="0 0 420 420"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="210" cy="210" r="162" />
            <circle cx="210" cy="210" r="104" />
            <path d="M210 48v324M48 210h324M95.45 95.45l229.1 229.1M324.55 95.45l-229.1 229.1" />
            <path d="M210 48 324.55 95.45 372 210 324.55 324.55 210 372 95.45 324.55 48 210 95.45 95.45Z" />
          </g>
          <g fill="currentColor" fontSize="22" fontWeight="700">
            <text x="210" y="34" textAnchor="middle">
              北
            </text>
            <text x="390" y="218" textAnchor="middle">
              東
            </text>
            <text x="210" y="405" textAnchor="middle">
              南
            </text>
            <text x="30" y="218" textAnchor="middle">
              西
            </text>
          </g>
          <g fill="currentColor" fontSize="15" fontWeight="700">
            <text x="315" y="76" textAnchor="middle">
              北東
            </text>
            <text x="330" y="344" textAnchor="middle">
              南東
            </text>
            <text x="90" y="344" textAnchor="middle">
              南西
            </text>
            <text x="105" y="76" textAnchor="middle">
              北西
            </text>
          </g>
        </svg>
        <section className="homePortalHero">
          <p className="eyebrow">Hibi Kippo</p>
          <h1>星回りを知り、方位を選び、気を整える。</h1>
          <p>
            日々吉方は、暦と方位を日々の行動へ翻訳する現代のお守りです。
            神社参拝、温泉、カフェ、散歩、吉方旅へ、小さな整えを積み重ねていきます。
          </p>
          <nav className="homePortalActions" aria-label="トップページ導線">
            <Link className="homePortalPrimaryAction" href="/purpose-calendar">
              九星方位カレンダーを見る
            </Link>
            <Link href="/calendar-db">暦DBを確認する</Link>
            <Link href="/direction-palace-blends">方位ブレンドを見る</Link>
          </nav>
        </section>

        <section className="homePortalToday">
          <div className="homePortalSectionHeader">
            <p className="eyebrow">Today&apos;s Air</p>
            <h2>今日の空気</h2>
          </div>
          <div className="homePortalAirGrid">
            {portalAirItems.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="homePortalFootnote">
            {selectedSetsuiri
              ? `本日は節入り: ${selectedSetsuiri}`
              : latestSetsuiriDisplay
                ? `直近節入り: ${latestSetsuiriDisplay}`
                : "節入り情報は暦DBで確認できます。"}
          </p>
        </section>

        <section className="homePortalMessage">
          <p className="eyebrow">Today&apos;s Tuning</p>
          <blockquote>{portalTuningMessage}</blockquote>
          <div className="homePortalSmallFacts">
            <span>{portalZassetsu}</span>
            <span>{selectedTodayAnniversaryDisplay}</span>
            <span>{portalSeasonEffect.label}</span>
            <span>暦DBから自動更新</span>
          </div>
        </section>

        <section className="homePortalPath">
          <div>
            <p className="eyebrow">Your Kippo</p>
            <h2>あなたの吉方へ</h2>
            <p>
              生年月日を入れると、本命星をもとに九星方位カレンダーへ進めます。
              まずは月間カレンダーで、使える方位と整える行動を見てみましょう。
            </p>
          </div>
          <form className="homePortalBirthForm" action="/purpose-calendar">
            <label htmlFor="birthDate">生年月日</label>
            <input id="birthDate" name="birthDate" type="date" />
            <button type="submit">自分の吉方を見る</button>
          </form>
        </section>

        <section className="homePortalConcept">
          <p className="eyebrow">Concept</p>
          <h2>日々吉方の考え方</h2>
          <p>
            日々吉方は、吉凶に縛られるためのものではありません。
            今の星回りを知り、方位を選び、神社への参拝や少し足を伸ばした旅、
            日々の小さな行動を通して、心と身体を整えるための道具です。
          </p>
          <div className="homePortalConceptLinks">
            <Link href="/?view=dev">開発者向け暦チェック</Link>
            <Link href="/calendar-db">共通暦データベース</Link>
            <Link href="/purpose-calendar">九星方位カレンダー</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Hibi Kippo Engine v0</p>
        <h1>星回りを知り、方位を選び、気を整える。</h1>
        <p>
          `★フォーチューンマイレージマスタ &gt; 年月日` から、
          吉方旅と日々の行動判断につながる暦JSONを組み立てています。
        </p>
        <div className="viewSwitch" aria-label="表示モード">
          <a
            className={legacyActiveView === "user" ? "active" : undefined}
            href={viewHref("user")}
          >
            ユーザー向け
          </a>
          <a
            className={legacyActiveView === "dev" ? "active" : undefined}
            href={viewHref("dev")}
          >
            開発者向け
          </a>
          <a href="/calendar-db">暦DB参照</a>
          <a href="/purpose-calendar">九星方位カレンダー</a>
        </div>
        <form className="dateSearch" action="/" method="get">
          <label htmlFor="date">年月日で検証</label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={selectedDate}
            min={range.start ?? undefined}
            max={range.end ?? undefined}
          />
          <input type="hidden" name="view" value={legacyActiveView} />
          <button type="submit">この日を見る</button>
        </form>
        <p className="rangeNote">
          全期間データ: {range.start} 〜 {range.end} / {range.count}日分
          （日付未指定時: {todayDate}）
        </p>
        {requestedDateMissing ? (
          <p className="alertNote">
            {selectedDate} はまだ取り込み済み範囲にありません。現在は基準日{" "}
            {calendarDay.date} を表示しています。
          </p>
        ) : null}
      </section>

      <section className="dateNav" aria-label="取り込み済み日付">
        {visibleDates.map((date) => (
          <a
            key={date}
            className={date === calendarDay.date ? "active" : undefined}
            href={`/?date=${date}&view=${legacyActiveView}`}
          >
            {date}
          </a>
        ))}
      </section>

      {legacyActiveView === "dev" ? (
        <section className="panel devConsole">
          <div className="devConsoleHeader">
            <div>
              <p className="eyebrow">Calendar Verification Console</p>
              <h2>指定日の暦チェック</h2>
              <p>
                1900〜2050年の年月日マスターから、万年暦と照合する主要項目を一画面に集約します。
              </p>
            </div>
            <form className="dateSearch devDateSearch" action="/" method="get">
              <label htmlFor="dev-date">検証する年月日</label>
              <input
                id="dev-date"
                name="date"
                type="date"
                defaultValue={calendarDay.date}
                min={range.start}
                max={range.end}
              />
              <input type="hidden" name="view" value="dev" />
              <button type="submit">検証</button>
            </form>
          </div>

          <div className="quickJump" aria-label="日付移動">
            {quickJumpLinks.map(([label, linkDate]) => (
              <a
                key={`${label}-${linkDate}`}
                className={linkDate === calendarDay.date ? "active" : undefined}
                href={`/?date=${linkDate}&view=dev`}
              >
                <span>{label}</span>
                <strong>{linkDate}</strong>
              </a>
            ))}
          </div>

          <div className="devTopSummary">
            <div className="devSummaryCard devSummaryCardWide">
              <span>暦サマリー</span>
              <strong>
                {calendarDay.date}（{calendarDay.calendarBase.weekday.ja}）
              </strong>
              <p>
                {selectedJapaneseEra.era.display} / 旧暦{" "}
                {calendarDay.lunarCalendar.display ?? "-"} / 六曜{" "}
                {calendarDay.lunarCalendar.rokuyo ?? "-"} /{" "}
                {selectedTraditionalMonthName} /{" "}
                {calendarDay.solarTerm.name ||
                  selectedSetsuiri ||
                  calendarDay.solarTerm.latestSetsuiri?.name ||
                  "節気なし"}
              </p>
              <small>
                干支 {calendarDay.pillars.year}・{calendarDay.pillars.month}・
                {calendarDay.pillars.day} / 空亡 {calendarDay.void.kuubou}
              </small>
              <small>納音 {selectedNacchinSummary}</small>
              <small>
                直近節入り {latestSetsuiriDisplay ?? "-"}
              </small>
              {selectedDoyoComparison.calculated.period ? (
                <small>土用 {selectedDoyoSummary}</small>
              ) : null}
              {selectedTodayAnniversaryDisplay !== "-" ? (
                <small>今日は何の日 {selectedTodayAnniversaryDisplay}</small>
              ) : null}
            </div>
            <div className="devSummaryCard kyuseiSummary">
              <span>九星</span>
              <div className="kyuseiDigits">
                <b>
                  <em>年</em>
                  {calendarDay.kyusei.year}
                </b>
                <b>
                  <em>月</em>
                  {calendarDay.kyusei.month}
                </b>
                <b>
                  <em>日</em>
                  {calendarDay.kyusei.day}
                </b>
              </div>
              <p>{calendarDay.kyusei.ton}</p>
            </div>
          </div>

          <div className="devAlmanacWorkbench">
            <section className="devWorkbenchPanel devWorkbenchPanelWide">
              <span>万年暦照合サマリー</span>
              <strong>目視チェック用の主要項目</strong>
              <p>
                手元の万年暦と並べて確認するため、日付・節入り・旧暦・暦注・雑節・土用を上部に集約します。
              </p>
              <div className="almanacSummaryGrid">
                {devVerificationRows.map(([label, value]) => (
                  <div className="almanacSummaryItem" key={label}>
                    <span>{label}</span>
                    <strong>{value || "-"}</strong>
                  </div>
                ))}
              </div>
              {selectedDayKanshi ? (
                <div className="kanshiDetailPanel">
                  <span>日柱 納音・特殊星</span>
                  <strong>
                    {selectedDayKanshi.kanshi} / {selectedDayKanshi.nacchin}
                  </strong>
                  <dl>
                    {selectedDayKanshiDetailRows.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
              {selectedTodayAnniversaries ? (
                <div className="todayAnniversaryDetail">
                  <div>
                    <span>今日は何の日 v0.1</span>
                    <strong>
                      {selectedTodayAnniversarySummary?.totalEntries ?? 0}件 / 出来事{" "}
                      {selectedTodayAnniversarySummary?.totalEvents ?? 0}件
                    </strong>
                    <p>
                      文化・雑学レイヤーです。占術正本ではなく、日次コンテンツの補助情報として扱います。
                    </p>
                    <a
                      href={selectedTodayAnniversaries.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedTodayAnniversaries.sourceName}
                    </a>
                  </div>
                  <ul>
                    {selectedTodayAnniversaries.entries.map((entry) => (
                      <li key={`${entry.category}-${entry.name}`}>
                        <span>{entry.category}</span>
                        {entry.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <section className="devWorkbenchPanel">
              <span>参照ソース早見</span>
              <strong>検証時に見る順番</strong>
              <p>
                迷ったときは、万年暦・こよみのページ・国立天文台を優先して照合します。
              </p>
              <div className="sourceMiniList">
                {adoptionSourceCatalog.map((source) => (
                  <div className="sourceMiniItem" key={source.id}>
                    <span>{source.priority}</span>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.name}
                      </a>
                    ) : (
                      <strong>{source.name}</strong>
                    )}
                    <p>{source.role}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="inzenPreviewPanel">
            <div className="inzenPreviewHeader">
              <div>
                <p className="eyebrow">Insen Preview</p>
                <h2>陰占プレビュー</h2>
                <p>
                  共有スプレッドシート「陰占」の形をもとに、選択日を仮の生年月日として年・月・日の命式を表示します。
                  時間列は時柱・真太陽時の工程で後から接続します。
                </p>
              </div>
              <div className="inzenPreviewMeta">
                <span>仮入力</span>
                <strong>{calendarDay.date}</strong>
                <p>出生日として軽く鑑定するための開発用表示</p>
              </div>
            </div>
            <div className="inzenPreviewGrid">
              <div className="inzenChartWrap">
                <table className="inzenChartTable">
                  <thead>
                    <tr>
                      <th>陰占</th>
                      {inzenColumnDefinitions.map((column) => (
                        <th
                          key={column.key}
                          title={`${column.period}\n${column.theme}`}
                        >
                          <span>{column.label}</span>
                          <small>{column.period}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inzenTableRows.map((row) => (
                      <tr key={row.label}>
                        <th
                          title={
                            inzenChartDefinition.chart_definition.rows[
                              row.rowKey
                            ].description
                          }
                        >
                          {row.label}
                        </th>
                        {inzenColumnDefinitions.map((column) => {
                          const value =
                            inzenValueByColumn[column.key][row.valueKey];
                          const context = getInzenCellContext(
                            column.key,
                            row.rowKey,
                          );

                          return (
                            <td
                              key={`${row.label}-${column.key}`}
                              className={row.isStory ? "storyCell" : undefined}
                            >
                              <strong>
                                {value ||
                                  (row.isStory
                                    ? "（ここに物語が生成されます）"
                                    : "-")}
                              </strong>
                              <span className="inzenCellTooltip">
                                意味: {context.meaning}
                                <br />
                                課題: {context.challenge}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="verificationStrip" aria-label="検証ステータス">
            {devStatusCards.map((item) => (
              <div className={`verificationCard ${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="referencePanel">
            <span>元号年・西暦年変換 v0</span>
            <strong>
              {selectedJapaneseEra.era.display} /{" "}
              {selectedJapaneseEra.westernYear}年
            </strong>
            <p>
              日付では改元開始日を境界に判定し、西暦年だけで見る場合は改元年の複数候補を表示します。
              こよみのページは年単位候補の照合ソースとして扱います。
            </p>
            <div className="sourceGrid">
              <div>
                <span>選択日</span>
                <strong>{selectedJapaneseEra.era.display}</strong>
                <p>
                  {selectedJapaneseEra.era.alphabet}
                  {selectedJapaneseEra.era.year} /{" "}
                  {selectedJapaneseEra.verificationStatus}
                </p>
              </div>
              <div>
                <span>西暦年候補</span>
                <strong>
                  {selectedJapaneseEra.candidatesForWesternYear
                    .map((candidate) => candidate.display)
                    .join(" / ")}
                </strong>
                <p>改元年は複数候補を表示</p>
              </div>
              <div>
                <span>検証</span>
                <strong>{japaneseEraVerification.verificationStatus}</strong>
                <p>
                  境界日 {japaneseEraVerification.dateSamples.length}件 / 年候補{" "}
                  {japaneseEraVerification.yearCandidateSamples.length}件
                </p>
              </div>
              <div>
                <span>API</span>
                <a href={`/api/japanese-era?date=${calendarDay.date}`}>
                  japanese-era
                </a>
                <a href={`/api/japanese-era?year=${selectedJapaneseEra.westernYear}`}>
                  japanese-era-year
                </a>
              </div>
            </div>
            <div className="tableWrap">
              <table className="referenceCompareTable">
                <thead>
                  <tr>
                    <th>境界日</th>
                    <th>期待値</th>
                    <th>出力値</th>
                    <th>判定</th>
                    <th>メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {japaneseEraVerification.dateSamples.map((sample) => (
                    <tr key={sample.date}>
                      <td>
                        <a href={`/?date=${sample.date}&view=dev`}>
                          {sample.date}
                        </a>
                      </td>
                      <td>
                        {sample.expectedDisplay}
                        <small className="stackedValue">
                          {sample.expectedAlphabet}
                        </small>
                      </td>
                      <td>
                        {sample.actualDisplay}
                        <small className="stackedValue">
                          {sample.actualAlphabet}
                        </small>
                      </td>
                      <td>
                        <span
                          className={
                            sample.status === "matched"
                              ? "matchBadge"
                              : "verifyBadge"
                          }
                        >
                          {sample.status === "matched" ? "一致" : "差分"}
                        </span>
                      </td>
                      <td>
                        {sample.sourceNote}
                        {sample.diffs.length > 0 ? (
                          <small className="stackedValue">
                            {sample.diffs.join(" / ")}
                          </small>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table className="referenceCompareTable">
                <thead>
                  <tr>
                    <th>西暦年</th>
                    <th>期待候補</th>
                    <th>出力候補</th>
                    <th>判定</th>
                    <th>ソース</th>
                  </tr>
                </thead>
                <tbody>
                  {japaneseEraVerification.yearCandidateSamples.map((sample) => (
                    <tr key={sample.westernYear}>
                      <td>{sample.westernYear}</td>
                      <td>{sample.expectedDisplays.join(" / ")}</td>
                      <td>{sample.actualDisplays.join(" / ")}</td>
                      <td>
                        <span
                          className={
                            sample.status === "matched"
                              ? "matchBadge"
                              : "verifyBadge"
                          }
                        >
                          {sample.status === "matched" ? "一致" : "差分"}
                        </span>
                      </td>
                      <td>
                        <a href={japaneseEraVerification.sourceUrl}>
                          {sample.sourceName}
                        </a>
                        <small className="stackedValue">{sample.sourceNote}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">{japaneseEraVerification.note}</p>
          </div>

          <div className="referencePanel">
            <span>三元九運 v0</span>
            <strong>
              {selectedSanGenNineUn.cycle}・第
              {selectedSanGenNineUn.period}運 /{" "}
              {selectedSanGenNineUn.starName}
            </strong>
            <p>
              {selectedSanGenNineUn.startYear}〜
              {selectedSanGenNineUn.endYear}年のマクロ時代運です。
              個人命式や年運に重ねる前の、社会全体の環境エネルギーとして扱います。
            </p>
            <div className="sourceGrid">
              <div>
                <span>五行</span>
                <strong>{selectedSanGenNineUn.element}</strong>
                <p>卦: {selectedSanGenNineUn.trigram}</p>
              </div>
              <div>
                <span>期間</span>
                <strong>
                  {selectedSanGenNineUn.startYear}〜
                  {selectedSanGenNineUn.endYear}
                </strong>
                <p>20年単位 / 180年周期</p>
              </div>
              <div>
                <span>状態</span>
                <strong>{selectedSanGenNineUn.sourceStatus}</strong>
                <p>{selectedSanGenNineUn.verificationStatus}</p>
              </div>
              <div>
                <span>API</span>
                <a
                  href={`/api/san-gen-nine-un?year=${calendarDay.calendarBase.year}`}
                >
                  san-gen-nine-un
                </a>
              </div>
            </div>
            <div className="tableWrap">
              <table className="referenceCompareTable">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>出力</th>
                    <th>LLM連携メモ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>時代キーワード</td>
                    <td>{selectedSanGenNineUn.themeKeywords.join(" / ")}</td>
                    <td>
                      命式JSONに入れて、個人の五行や年運と掛け合わせる
                    </td>
                  </tr>
                  <tr>
                    <td>時代解釈</td>
                    <td>{selectedSanGenNineUn.interpretation}</td>
                    <td>鑑定文の冒頭・時代背景・社会運に使う</td>
                  </tr>
                  <tr>
                    <td>プロンプト補助</td>
                    <td>{selectedSanGenNineUn.llmPromptHint}</td>
                    <td>Deep Research / NotebookLM / 外部LLMへの文脈材料</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="note">{selectedSanGenNineUn.sourceNote}</p>
          </div>

          <div className="referencePanel">
            <span>吉神方位 v0</span>
            <strong>吉神と方位殺・土用殺の競合判定</strong>
            <p>
              歳徳・太歳は年、天徳・天道は節月から算出します。
              吉神があっても、強い方位殺・土用殺が重なる場合は避ける判定を優先します。
            </p>
            <div className="sourceGrid">
              <div>
                <span>件数</span>
                <strong>{selectedGoodFortuneDirections.entries.length}件</strong>
                <p>
                  年{" "}
                  {selectedGoodFortuneDirections.entries.filter(
                    (entry) => entry.board === "year",
                  ).length}
                  件 / 月{" "}
                  {selectedGoodFortuneDirections.entries.filter(
                    (entry) => entry.board === "month",
                  ).length}
                  件
                </p>
              </div>
              <div>
                <span>判定</span>
                <strong>{selectedGoodFortunePolicy.sourceStatus}</strong>
                <p>
                  推奨 {selectedGoodFortunePolicy.summary.recommended} / 注意{" "}
                  {selectedGoodFortunePolicy.summary.cautionGood} / 非推奨{" "}
                  {selectedGoodFortunePolicy.summary.notRecommended} / 不可{" "}
                  {selectedGoodFortunePolicy.summary.blocked}
                </p>
              </div>
              <div>
                <span>節月</span>
                <strong>{selectedGoodFortuneDirections.solarMonth ?? "-"}月</strong>
                <p>月支 {calendarDay.branches.month}</p>
              </div>
              <div>
                <span>土用</span>
                <strong>
                  {selectedGoodFortunePolicy.doyo.isDoyo
                    ? selectedGoodFortunePolicy.doyo.label
                    : "期間外"}
                </strong>
                <p>
                  土用殺{" "}
                  {selectedGoodFortunePolicy.doyo.doyoSatsuDirection ?? "-"}
                </p>
              </div>
              <div>
                <span>API</span>
                <a href={`/api/good-fortune-directions?date=${calendarDay.date}`}>
                  good-fortune-directions
                </a>
              </div>
            </div>
            <table className="referenceCompareTable">
              <thead>
                <tr>
                  <th>吉神</th>
                  <th>方位</th>
                  <th>判定</th>
                  <th>重なり</th>
                  <th>表示文</th>
                </tr>
              </thead>
              <tbody>
                {selectedGoodFortunePolicy.judgments.map((judgment) => (
                  <tr key={judgment.entry.code}>
                    <td>
                      {judgment.entry.name}
                      <small className="stackedValue">
                        {judgment.entry.board === "year" ? "年" : "月"} /{" "}
                        {judgment.entry.basis}
                      </small>
                    </td>
                    <td>
                      {judgment.entry.direction}
                      <small className="stackedValue">
                        {judgment.entry.directionDetail} / 判定用{" "}
                        {judgment.normalizedDirection}
                      </small>
                    </td>
                    <td>
                      <span
                        className={
                          judgment.recommendation === "recommended"
                            ? "matchBadge"
                            : judgment.recommendation === "blocked"
                              ? "verifyBadge"
                              : "pointNeutral"
                        }
                      >
                        {judgment.recommendationLabel}
                      </span>
                      <small className="stackedValue">
                        {judgment.policyNote}
                      </small>
                    </td>
                    <td>
                      {judgment.conflicts.length > 0
                        ? judgment.conflicts.map((conflict) => (
                            <span
                              className="stackedValue"
                              key={`${judgment.entry.code}-${conflict.board}-${conflict.kind}`}
                            >
                              {conflict.board === "year"
                                ? "年"
                                : conflict.board === "month"
                                  ? "月"
                                  : conflict.board === "day"
                                    ? "日"
                                    : "土用"}{" "}
                              {conflict.name} {conflict.direction}
                            </span>
                          ))
                        : "-"}
                    </td>
                    <td>{judgment.displayText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">{selectedGoodFortunePolicy.policy}</p>
          </div>

          <div className="referencePanel">
            <span>小児殺 v0</span>
            <strong>子どもに作用する月盤の注意方位</strong>
            <p>
              小児殺は月盤のみで扱い、v0では12歳以下を主対象とします。
              対象条件が絡むため、通常の全員共通凶方位とは分けて表示します。
            </p>
            <div className="sourceGrid">
              <div>
                <span>判定</span>
                <strong>
                  {selectedChildSatsu.status === "active"
                    ? "注意方位あり"
                    : selectedChildSatsu.status === "center_no_direction"
                      ? "方位なし"
                      : "要確認"}
                </strong>
                <p>{selectedChildSatsu.verificationStatus}</p>
              </div>
              <div>
                <span>方位</span>
                <strong>{selectedChildSatsu.direction ?? "-"}</strong>
                <p>{selectedChildSatsu.directionDetail ?? "中宮または不明"}</p>
              </div>
              <div>
                <span>根拠</span>
                <strong>{selectedChildSatsu.targetStarName ?? "-"}</strong>
                <p>
                  年支 {selectedChildSatsu.yearBranch} / 月盤中宮{" "}
                  {selectedChildSatsu.monthKyuseiCenter ?? "-"}
                </p>
              </div>
              <div>
                <span>対象</span>
                <strong>{selectedChildSatsu.targetCondition.primary}</strong>
                <p>{selectedChildSatsu.targetCondition.caution}</p>
              </div>
              <div>
                <span>API</span>
                <a href={`/api/child-satsu?date=${calendarDay.date}`}>
                  child-satsu
                </a>
              </div>
            </div>
            <table className="referenceCompareTable">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>出力</th>
                  <th>照合ポイント</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>年支グループ</td>
                  <td>{selectedChildSatsu.yearBranch}</td>
                  <td>年支から小児殺の対象九星を決める</td>
                </tr>
                <tr>
                  <td>対象九星</td>
                  <td>
                    {selectedChildSatsu.targetStarName ?? "-"}
                    <small className="stackedValue">
                      {selectedChildSatsu.targetStar
                        ? `${selectedChildSatsu.targetStar}番`
                        : "-"}
                    </small>
                  </td>
                  <td>対象九星が月盤で廻座する方位を見る</td>
                </tr>
                <tr>
                  <td>小児殺方位</td>
                  <td>{selectedChildSatsu.direction ?? "-"}</td>
                  <td>
                    中宮に入る場合は、v0では小児殺方位なしとして扱う
                  </td>
                </tr>
                <tr>
                  <td>表示文</td>
                  <td>{selectedChildSatsu.displayText}</td>
                  <td>子ども連れ旅行・引越し・通院先選びの注意に使う</td>
                </tr>
              </tbody>
            </table>
            <p className="note">{selectedChildSatsu.sourceNote}</p>
          </div>

          <div className="referencePanel">
            <span>採用ステータス整理</span>
            <strong>共通暦データの完成度チェック</strong>
            <p>
              いま入っている要素を、実装済み / v0検証中 / 未実装 /
              後回しに分けて管理します。八雲院を精度・導線の外部ベンチマークとして参照しつつ、
              共通暦、個人命式、AI向けプロンプト提供へ広げます。
            </p>
            <div className="sourceGrid">
              <div>
                <span>総項目</span>
                <strong>{commonCalendarCompletionSummary.total}件</strong>
                <p>共通暦・個人命式入口・上級候補を含む</p>
              </div>
              <div>
                <span>実装済み</span>
                <strong>{commonCalendarCompletionSummary.implemented}件</strong>
                <p>本体表示またはAPIに接続済み</p>
              </div>
              <div>
                <span>v0検証中</span>
                <strong>{commonCalendarCompletionSummary.v0Verifying}件</strong>
                <p>計算・流派差・外部検証を継続</p>
              </div>
              <div>
                <span>未実装</span>
                <strong>{commonCalendarCompletionSummary.notImplemented}件</strong>
                <p>個人命式フェーズ以降</p>
              </div>
              <div>
                <span>後回し</span>
                <strong>{commonCalendarCompletionSummary.later}件</strong>
                <p>上級・高コスト候補</p>
              </div>
            </div>
            <div className="tableWrap completionStatusWrap">
              <table className="referenceCompareTable completionStatusTable">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>完成度</th>
                    <th>採用状態</th>
                    <th>範囲</th>
                    <th>ソース</th>
                  </tr>
                </thead>
                <tbody>
                  {commonCalendarCompletionItems.map((item) => {
                    const info = getAdoptionStatusInfo(item.adoptionStatus);

                    return (
                      <tr key={item.id}>
                        <td>
                          {item.name}
                          <small className="stackedValue">
                            {item.categoryLabel} / {item.note}
                          </small>
                        </td>
                        <td>
                          <span
                            className={
                              item.status === "implemented"
                                ? "matchBadge"
                                : item.status === "v0_verifying"
                                  ? "verifyBadge"
                                  : "pointNeutral"
                            }
                          >
                            {item.statusLabel}
                          </span>
                          <small className="stackedValue">{item.status}</small>
                        </td>
                        <td>
                          {info.label}
                          <small className="stackedValue">
                            {item.adoptionStatus} / {info.reliability}
                          </small>
                        </td>
                        <td>{item.scope}</td>
                        <td>
                          {item.source}
                          <small className="stackedValue">{info.sourceName}</small>
                          <small className="stackedValue">次: {item.nextAction}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="referencePanel">
            <span>日付別 採用ステータス</span>
            <strong>選択日の出力値とソース状態</strong>
            <p>
              こちらは現在選択している日付に対して、各表示値の由来と検証状態を確認する表です。
            </p>
            <table className="referenceCompareTable">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>採用状態</th>
                  <th>信頼段階</th>
                  <th>主なソース</th>
                  <th>次の確認</th>
                </tr>
              </thead>
              <tbody>
                {adoptionStatusRows.map((row) => (
                  <tr key={row.item}>
                    <td>
                      {row.item}
                      <small className="stackedValue">{row.detail}</small>
                    </td>
                    <td>
                      <span
                        className={
                          row.info.tone === "ok"
                            ? "matchBadge"
                            : row.info.tone === "warn"
                              ? "verifyBadge"
                              : "pointNeutral"
                        }
                      >
                        {row.info.label}
                      </span>
                      <small className="stackedValue">{row.status}</small>
                    </td>
                    <td>{row.info.reliability}</td>
                    <td>
                      {row.info.sourceName}
                      <small className="stackedValue">{row.info.note}</small>
                    </td>
                    <td>{row.info.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="referencePanel">
            <span>参照ソース一覧</span>
            <strong>このプロジェクトで使う主な検証元</strong>
            <table className="referenceCompareTable">
              <thead>
                <tr>
                  <th>ソース</th>
                  <th>役割</th>
                  <th>優先度</th>
                  <th>メモ</th>
                </tr>
              </thead>
              <tbody>
                {adoptionSourceCatalog.map((source) => (
                  <tr key={source.id}>
                    <td>
                      {source.url ? (
                        <a href={source.url}>{source.name}</a>
                      ) : (
                        source.name
                      )}
                    </td>
                    <td>{source.role}</td>
                    <td>{source.priority}</td>
                    <td>{source.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="devCheckLayout">
            <div className="tableWrap">
              <table className="compactTable">
                <thead>
                  <tr>
                    <th>検証項目</th>
                    <th>出力値</th>
                    <th>照合ポイント</th>
                  </tr>
                </thead>
                <tbody>
                  {devVerificationRows.map(([label, value]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>
                        <span>{getFortuneEmptyDisplay(label, value)}</span>
                        {needsMissingValueVerification(label, value) ? (
                          <span className="verifyBadge">要検証</span>
                        ) : null}
                      </td>
                      <td>
                        {getDevCheckPoint(label, value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="devSideSummary">
              <div>
                <span>選択日</span>
                <strong>{calendarDay.date}</strong>
                <p>{calendarDay.calendarBase.weekday.ja}曜日</p>
              </div>
              <div>
                <span>旧暦</span>
                <strong>{calendarDay.lunarCalendar.display ?? "-"}</strong>
                <p>{calendarDay.lunarCalendar.rokuyo ?? "-"}</p>
              </div>
              <div>
                <span>節入り</span>
                <strong>{selectedSetsuiri ?? latestSetsuiriDisplay ?? "-"}</strong>
                <p>
                  {calendarDay.solarTerm.officialDaysFromSetsuiri
                    ? `${calendarDay.solarTerm.officialDaysFromSetsuiri}日目`
                    : "-"}
                </p>
              </div>
              <div>
                <span>API</span>
                <a href={`/api/calendar-day?date=${calendarDay.date}`}>
                  calendar-day
                </a>
                <a href={`/api/lunar-calendar?date=${calendarDay.date}`}>
                  lunar-calendar
                </a>
                <a href={`/api/japanese-era?date=${calendarDay.date}`}>
                  japanese-era
                </a>
              </div>
            </div>
          </div>

          <div className="referencePanel">
            <span>暦注下段 v0</span>
            <strong>
              {selectedLowerCalendarNotes.length > 0
                ? selectedLowerCalendarNotes
                    .map((definition) => definition.name)
                    .join(" / ")
                : "該当なし"}
            </strong>
            <p>
              手元万年暦の季節別日干支表をもとに、天赦日・天轉殺・地轉殺・四癈日を主要選日へ統合します。
              天赦日は既存の天赦日表示と重複しないようにまとめます。
            </p>
            <table className="referenceCompareTable">
              <thead>
                <tr>
                  <th>下段暦注</th>
                  <th>判定</th>
                  <th>採用表示</th>
                  <th>根拠</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                {lowerCalendarNoteCandidates.map((candidate) => {
                  const adopted = selectedCandidateCheck.adoptedScopedCodes.includes(
                    candidate.code,
                  );
                  const definition = calendarDay.calendarNotes.activeDefinitions.find(
                    (activeDefinition) => activeDefinition.code === candidate.code,
                  );

                  return (
                    <tr key={candidate.code}>
                      <td>{candidate.name}</td>
                      <td>
                        {candidate.isActive ? (
                          <span className="matchBadge">該当</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {adopted ? (
                          <span className="matchBadge">主要選日に表示</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {candidate.basis}
                        <br />
                        <small>{candidate.ruleLabel}</small>
                      </td>
                      <td>{definition?.displayText ?? "該当時に意味文を表示"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="referencePanel">
            <span>主要選日 計算候補 v0</span>
            <strong>
              {selectedCandidateCheck.status === "matched"
                ? "候補計算と採用値は一致"
                : "候補計算と採用値に差分あり"}
            </strong>
            <p>
              一粒万倍日・三隣亡・不成就日に加え、下段暦注の天赦日・天轉殺・地轉殺・四癈日を候補計算しています。
              正本化前の検証用なので、差分が出た日はこよみページ・手元万年暦で照合します。
            </p>
            <table className="referenceCompareTable">
              <thead>
                <tr>
                  <th>選日</th>
                  <th>候補計算</th>
                  <th>採用表示</th>
                  <th>根拠</th>
                </tr>
              </thead>
              <tbody>
                {calendarDay.calendarNotes.selectedDayCandidateCheck.candidates.map(
                  (candidate) => {
                    const adopted =
                      selectedCandidateCheck.adoptedScopedCodes.includes(
                        candidate.code,
                      );

                    return (
                      <tr key={candidate.code}>
                        <td>{candidate.name}</td>
                        <td>
                          {candidate.isActive ? (
                            <span className="matchBadge">該当</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {adopted ? (
                            <span className="matchBadge">表示中</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {candidate.basis}
                          <br />
                          <small>{candidate.ruleLabel}</small>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          <div className="referencePanel">
            <span>主要選日 採用管理</span>
            <strong>正式リストと未実装候補</strong>
            <p>
              現在の主要選日は正式リストとして管理し、未実装候補は追加順・検証元・次アクションを分けて追跡します。
            </p>
            <div className="sourceGrid selectedDaySummaryGrid">
              <div>
                <span>総項目</span>
                <strong>{selectedDayAdoptionSummary.total}件</strong>
                <p>正式リストと候補の合計</p>
              </div>
              <div>
                <span>正式リスト</span>
                <strong>{selectedDayAdoptionSummary.implemented}件</strong>
                <p>calendar-note-definitions に接続済み</p>
              </div>
              <div>
                <span>未実装候補</span>
                <strong>{selectedDayAdoptionSummary.candidates}件</strong>
                <p>追加・検証待ち</p>
              </div>
              <div>
                <span>分類</span>
                <strong>{selectedDayAdoptionSummary.categories}系統</strong>
                <p>大吉日、神事、金運、土地、注意など</p>
              </div>
            </div>

            <h3 className="subsectionTitle">現在入っている正式リスト</h3>
            <div className="tableWrap">
              <table className="referenceCompareTable selectedDayAdoptionTable">
                <thead>
                  <tr>
                    <th>選日</th>
                    <th>分類</th>
                    <th>吉凶</th>
                    <th>重み</th>
                    <th>表示文</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayImplementedRows.map((row) => (
                    <tr key={row.code}>
                      <td>
                        {row.name}
                        <small className="stackedValue">{row.code}</small>
                      </td>
                      <td>{row.categoryLabel}</td>
                      <td>{row.fortune}</td>
                      <td>{row.weight ?? "-"}</td>
                      <td>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="subsectionTitle">未実装だが採用候補</h3>
            <div className="tableWrap">
              <table className="referenceCompareTable selectedDayAdoptionTable">
                <thead>
                  <tr>
                    <th>候補</th>
                    <th>分類</th>
                    <th>参照元</th>
                    <th>次アクション</th>
                    <th>メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayCandidateRows.map((row) => (
                    <tr key={row.code}>
                      <td>
                        {row.name}
                        <small className="stackedValue">{row.code}</small>
                      </td>
                      <td>{row.categoryLabel}</td>
                      <td>{row.source}</td>
                      <td>{row.nextAction}</td>
                      <td>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {calendarNoteReference ? (
            <div className="referencePanel">
              <span>外部暦注参照</span>
              <strong>{calendarNoteReference.summary}</strong>
              <p>
                {calendarNoteReference.sourceName}:{" "}
                <a href={calendarNoteReference.sourceUrl}>
                  {calendarNoteReference.sourceUrl}
                </a>
              </p>
              {(calendarNoteReference.junichoku ||
                calendarNoteReference.nijuhachishuku ||
                calendarNoteReference.nanajushichishuku) && (
                <p>
                  十二直 {calendarNoteReference.junichoku ?? "-"} / 二十八宿{" "}
                  {calendarNoteReference.nijuhachishuku ?? "-"} / 二十七宿{" "}
                  {calendarDay.calendarNotes.nanajushichishuku ??
                    calendarNoteReference.nanajushichishuku ??
                    "-"}
                </p>
              )}
              <table className="referenceCompareTable">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>アプリ出力</th>
                    <th>正本</th>
                    <th>判定</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceComparisonRows.map(([label, appValue, referenceValue]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{appValue}</td>
                      <td>{referenceValue}</td>
                      <td>
                        {appValue === referenceValue ? (
                          <span className="matchBadge">一致</span>
                        ) : (
                          <span className="verifyBadge">差分</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>{calendarNoteReference.roadmapNote}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {legacyActiveView === "user" ? (
        <>
          <section className="panel userSummary">
            <div>
              <p className="eyebrow">Today&apos;s Reading</p>
              <h2>
                {calendarDay.date}（{calendarDay.calendarBase.weekday.ja}）の見立て
              </h2>
              <p>{selectedBestDayScore?.summary}</p>
            </div>
            <div className="userScore">
              <span>仮スコア</span>
              <strong>{selectedBestDayScore?.score ?? "-"}</strong>
              <em>{selectedBestDayScore?.rankLabel}</em>
            </div>
          </section>

          <section className="grid">
            <article className="panel">
              <h2>今日の星回り</h2>
              <dl className="facts">
                <div>
                  <dt>曜日</dt>
                  <dd>{calendarDay.calendarBase.weekday.ja}曜日</dd>
                </div>
                <div>
                  <dt>祝日</dt>
                  <dd>{calendarDay.calendarBase.nationalHoliday.name ?? "-"}</dd>
                </div>
                <div>
                  <dt>旧暦</dt>
                  <dd>{calendarDay.lunarCalendar.display ?? "-"}</dd>
                </div>
                <div>
                  <dt>六曜</dt>
                  <dd>{calendarDay.lunarCalendar.rokuyo ?? "-"}</dd>
                </div>
                <div>
                  <dt>十二直</dt>
                  <dd>{calendarDay.calendarNotes.junichoku?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt>二十八宿</dt>
                  <dd>{calendarDay.calendarNotes.nijuhachishuku?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt>二十七宿</dt>
                  <dd>{calendarDay.calendarNotes.nanajushichishuku ?? "-"}</dd>
                </div>
                <div>
                  <dt>年干支</dt>
                  <dd>{calendarDay.pillars.year}</dd>
                </div>
                <div>
                  <dt>月干支</dt>
                  <dd>{calendarDay.pillars.month}</dd>
                </div>
                <div>
                  <dt>日干支</dt>
                  <dd>{calendarDay.pillars.day}</dd>
                </div>
                <div>
                  <dt>日九星</dt>
                  <dd>{calendarDay.kyusei.day}</dd>
                </div>
                <div>
                  <dt>空亡</dt>
                  <dd>{calendarDay.void.kuubou}</dd>
                </div>
                <div>
                  <dt>遁</dt>
                  <dd>{calendarDay.kyusei.ton}</dd>
                </div>
                <div>
                  <dt>二十四節気</dt>
                  <dd>{calendarDay.solarTerm.name || "-"}</dd>
                </div>
                <div>
                  <dt>公式時刻</dt>
                  <dd>{calendarDay.solarTerm.official?.timeJst ?? "-"}</dd>
                </div>
                <div>
                  <dt>節入り</dt>
                  <dd>{selectedSetsuiri ?? "-"}</dd>
                </div>
                <div>
                  <dt>節入りから</dt>
                  <dd>
                    {calendarDay.solarTerm.officialDaysFromSetsuiri
                      ? `${calendarDay.solarTerm.officialDaysFromSetsuiri}日目`
                      : "-"}
                  </dd>
                </div>
              </dl>
            </article>

            <article className="panel">
              <h2>注意方位</h2>
              <div className="warningList">
                <div>
                  <span>暗剣殺</span>
                  <strong>{calendarDay.directionWarnings.day.ankensatsu || "-"}</strong>
                </div>
                <div>
                  <span>五黄殺</span>
                  <strong>{calendarDay.directionWarnings.day.gohosatsu || "-"}</strong>
                </div>
                <div>
                  <span>破</span>
                  <strong>{calendarDay.directionWarnings.day.saiha || "-"}</strong>
                </div>
              </div>
              <p className="note">
                目的地の方位と重なるかは、今後の吉方旅検索で判定します。
              </p>
            </article>
          </section>

          <section className="panel">
            <h2>今週の候補日</h2>
            <div className="candidateList">
              {bestDayScores.map((score, index) => {
                const day = getCalendarDay(score.date);
                const setsuiri = day ? getSetsuiriDisplay(day) : null;

                return (
                  <a
                    className="candidateItem"
                    href={`/?date=${score.date}&view=user`}
                    key={score.date}
                  >
                    <span>{index + 1}</span>
                    <strong>{score.date}</strong>
                    <small>{day?.calendarBase.weekday.ja ?? "-"}曜日</small>
                    <em>{score.score}点</em>
                    <small>{score.rankLabel}</small>
                    {setsuiri ? (
                      <small className="setsuiriBadge">節入り {setsuiri}</small>
                    ) : null}
                  </a>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <h2>読み解きメモ</h2>
            <p className="note">
              ここは一般ユーザー向けの言葉を育てる場所です。現時点では本人固有条件を入れていないため、
              本命殺・的殺・空亡照合・目的地方位を加える前の入口として表示しています。
            </p>
          </section>
        </>
      ) : (
        <>
          <section className="panel">
            <h2>取り込み状態</h2>
            <div className="statusGrid">
              <div>
                <span>データファイル</span>
                <strong>{importSummary.source.dataFile}</strong>
              </div>
              <div>
                <span>取り込み件数</span>
                <strong>{importSummary.total}日分</strong>
              </div>
              <div>
                <span>初期読込</span>
                <strong>{importSummary.loadedDefaultTotal}日分</strong>
              </div>
              <div>
                <span>暦注</span>
                <strong>十二直・二十八宿・二十七宿 本採用</strong>
              </div>
              <div>
                <span>外部検算</span>
                <strong>国立天文台 / 未検算</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>API</h2>
            <a
              className="apiLink"
              href={`/api/calendar-day?date=${calendarDay.date}`}
            >
              /api/calendar-day?date={calendarDay.date}
            </a>
            <a
              className="apiLink"
              href={`/api/calendar-days?start=${importedRange.start}&end=${importedRange.end}`}
            >
              /api/calendar-days?start={importedRange.start}&amp;end={importedRange.end}
            </a>
            <a
              className="apiLink"
              href={`/api/best-days?start=${importedRange.start}&end=${importedRange.end}`}
            >
              /api/best-days?start={importedRange.start}&amp;end={importedRange.end}
            </a>
            <a className="apiLink" href="/api/direction-warning-checks">
              /api/direction-warning-checks
            </a>
            <a className="apiLink" href="/api/solar-term-checks">
              /api/solar-term-checks
            </a>
            <a className="apiLink" href="/api/solar-terms?year=2026">
              /api/solar-terms?year=2026
            </a>
            <a className="apiLink" href="/api/national-holidays?year=2026">
              /api/national-holidays?year=2026
            </a>
            <a
              className="apiLink"
              href={`/api/lunar-calendar?date=${calendarDay.date}`}
            >
              /api/lunar-calendar?date={calendarDay.date}
            </a>
            <a className="apiLink" href="/api/lunar-calendar?year=2026">
              /api/lunar-calendar?year=2026
            </a>
            <a className="apiLink" href="/api/lunar-calendar?year=2026&source=sample">
              /api/lunar-calendar?year=2026&amp;source=sample
            </a>
            <a
              className="apiLink"
              href={`/api/lunar-calendar-generated?date=${calendarDay.date}`}
            >
              /api/lunar-calendar-generated?date={calendarDay.date}
            </a>
            <a
              className="apiLink"
              href="/api/lunar-calendar-generated?year=2026&compareSample=1"
            >
              /api/lunar-calendar-generated?year=2026&amp;compareSample=1
            </a>
            <a
              className="apiLink"
              href={`/api/calendar-notes?start=${calendarDay.date}&end=${calendarDay.date}`}
            >
              /api/calendar-notes?start={calendarDay.date}&amp;end={calendarDay.date}
            </a>
            <a
              className="apiLink"
              href={`/api/calendar-note-occurrences?start=${calendarDay.date}&end=${calendarDay.date}`}
            >
              /api/calendar-note-occurrences?start={calendarDay.date}&amp;end=
              {calendarDay.date}
            </a>
            <a className="apiLink" href="/api/calendar-note-diff-analysis">
              /api/calendar-note-diff-analysis
            </a>
            <a
              className="apiLink"
              href={`/api/zokan-comparisons?start=${calendarDay.date}&end=${calendarDay.date}`}
            >
              /api/zokan-comparisons?start={calendarDay.date}&amp;end={calendarDay.date}
            </a>
            <a
              className="apiLink"
              href={`/api/doyo-checks?start=${calendarDay.date}&end=${calendarDay.date}&year=${calendarDay.calendarBase.year}`}
            >
              /api/doyo-checks?start={calendarDay.date}&amp;end={calendarDay.date}
              &amp;year={calendarDay.calendarBase.year}
            </a>
          </section>

          <section className="panel">
            <h2>選択日の生成旧暦</h2>
            <div className="sourceGrid">
              <div>
                <span>対象日</span>
                <strong>{calendarDay.date}</strong>
                <p>開発者画面の日付入力と連動します。</p>
              </div>
              <div>
                <span>旧暦</span>
                <strong>{selectedGeneratedLunar?.lunar.display ?? "-"}</strong>
                <p>生成データから取得した旧暦表示です。</p>
              </div>
              <div>
                <span>六曜</span>
                <strong>{selectedGeneratedLunar?.rokuyo.name ?? "-"}</strong>
                <p>{selectedGeneratedLunar?.rokuyo.calculation.formula ?? "-"}</p>
              </div>
              <div>
                <span>状態</span>
                <strong>{selectedGeneratedLunar?.sourceStatus ?? "missing"}</strong>
                <p>
                  {selectedGeneratedLunar
                    ? "本採用前の生成データです。"
                    : "生成旧暦が見つかりません。"}
                </p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>値</th>
                    <th>検証メモ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>旧暦年/月/日</td>
                    <td>
                      {selectedGeneratedLunar
                        ? `${selectedGeneratedLunar.lunar.year}年 ${
                            selectedGeneratedLunar.lunar.isLeapMonth ? "閏" : ""
                          }${selectedGeneratedLunar.lunar.month}月${selectedGeneratedLunar.lunar.day}日`
                        : "-"}
                    </td>
                    <td>万年暦の旧暦欄と照合します。</td>
                  </tr>
                  <tr>
                    <td>月大小</td>
                    <td>{selectedGeneratedLunar?.lunar.monthSize ?? "-"}</td>
                    <td>朔から次朔までの日数で検算します。</td>
                  </tr>
                  <tr>
                    <td>朔日</td>
                    <td>{selectedGeneratedLunar?.lunar.newMoonDate ?? "-"}</td>
                    <td>旧暦月の開始日です。</td>
                  </tr>
                  <tr>
                    <td>次朔</td>
                    <td>{selectedGeneratedLunar?.lunar.nextNewMoonDate ?? "-"}</td>
                    <td>次の旧暦月への切替日です。</td>
                  </tr>
                  <tr>
                    <td>検証状態</td>
                    <td>{selectedGeneratedLunar?.verification.status ?? "-"}</td>
                    <td>追加照合後に verified へ昇格します。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>方位殺取り込み検証</h2>
            <div className="sourceGrid">
              <div>
                <span>検証状態</span>
                <strong>{directionValidation.status}</strong>
                <p>
                  {directionValidation.summary.passed} /{" "}
                  {directionValidation.summary.spotChecks} 件のスポットチェックが通過。
                </p>
              </div>
              <div>
                <span>年盤</span>
                <strong>AN / AO / AP</strong>
                <p>暗剣殺 / 五黄殺 / 破</p>
              </div>
              <div>
                <span>月盤</span>
                <strong>AQ / AR / AS</strong>
                <p>暗剣殺 / 五黄殺 / 破</p>
              </div>
              <div>
                <span>日盤</span>
                <strong>AT / AU / AV</strong>
                <p>暗剣殺 / 五黄殺 / 破</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>盤</th>
                    <th>列</th>
                    <th>期待値</th>
                    <th>実値</th>
                    <th>結果</th>
                    <th>理由</th>
                  </tr>
                </thead>
                <tbody>
                  {directionValidation.checks.map((check) => (
                    <tr key={`${check.date}-${check.board}`}>
                      <td>{check.date}</td>
                      <td>{check.board}</td>
                      <td>
                        {check.sourceColumns.ankensatsu}/
                        {check.sourceColumns.gohosatsu}/{check.sourceColumns.saiha}
                      </td>
                      <td>
                        <span className="stackedValue">
                          暗 {check.expected.ankensatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          五 {check.expected.gohosatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          破 {check.expected.saiha || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="stackedValue">
                          暗 {check.actual.ankensatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          五 {check.actual.gohosatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          破 {check.actual.saiha || "-"}
                        </span>
                      </td>
                      <td>
                        <span className={check.passed ? "pointPlus" : "pointMinus"}>
                          {check.passed ? "OK" : "NG"}
                        </span>
                      </td>
                      <td>{check.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              これはマスター由来の取り込み列が、暦JSONの年盤/月盤/日盤へ正しく割り当たっているかを見る検証です。
            </p>
          </section>

          <section className="panel">
            <h2>暦計算の役割分担</h2>
            <p className="note">
              節入り日数と旧暦日付は別の時計です。太陽ベースは命式・蔵干へ、
              月ベースは旧暦・六曜へ使います。
            </p>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>系統</th>
                    <th>基準</th>
                    <th>主な項目</th>
                    <th>使う場所</th>
                    <th>使わない場所</th>
                    <th>検証方針</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarSystemSpecs.map((system) => (
                    <tr key={system.id}>
                      <td>
                        <span className="stackedValue">{system.label}</span>
                        <small className="stackedValue">
                          {system.sourceMaster}
                        </small>
                      </td>
                      <td>{system.basis}</td>
                      <td>
                        {system.coreFields.map((field) => (
                          <span className="stackedValue" key={field}>
                            {field}
                          </span>
                        ))}
                      </td>
                      <td>
                        {system.usedFor.map((usage) => (
                          <span className="stackedValue" key={usage}>
                            {usage}
                          </span>
                        ))}
                      </td>
                      <td>
                        {system.notUsedFor.map((usage) => (
                          <span className="stackedValue" key={usage}>
                            {usage}
                          </span>
                        ))}
                      </td>
                      <td>{system.verificationPolicy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>蔵干マスター v0</h2>
            <p className="note">
              現段階では本採用ではなく照合用です。月支は節入り日数で比較し、
              年支・日支に同じルールを使うかは保留します。
            </p>
            <div className="sourceGrid">
              <div>
                <span>仮採用方式</span>
                <strong>{selectedZokanComparison.adoptedMethod.id}</strong>
                <p>{selectedZokanComparison.adoptedMethod.reason}</p>
              </div>
              {zokanMethods.map((method) => (
                <div key={method.id}>
                  <span>{method.label}</span>
                  <strong>{method.status}</strong>
                  <p>{method.scope}</p>
                </div>
              ))}
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>対象</th>
                    <th>採用方式</th>
                    <th>支</th>
                    <th>節入日数</th>
                    <th>スプシ 余/中/本</th>
                    <th>v0 余/中/本</th>
                    <th>v0司令</th>
                    <th>差分</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>月支</td>
                    <td>
                      <span className="stackedValue">
                        {selectedZokanComparison.adoptedMethod.id}
                      </span>
                      <small className="stackedValue">
                        {selectedZokanComparison.adoptedMethod.confidence}
                      </small>
                    </td>
                    <td>{selectedZokanComparison.target.branch}</td>
                    <td>
                      {selectedZokanComparison.target.daysFromSetsuiri
                        ? `${selectedZokanComparison.target.daysFromSetsuiri}日目`
                        : "-"}
                    </td>
                    <td>
                      <span className="stackedValue">
                        余 {selectedZokanComparison.spreadsheet.month.extra || "-"}
                      </span>
                      <span className="stackedValue">
                        中 {selectedZokanComparison.spreadsheet.month.middle || "-"}
                      </span>
                      <span className="stackedValue">
                        本 {selectedZokanComparison.spreadsheet.month.main || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="stackedValue">
                        余 {selectedZokanComparison.references.monthLaw?.extra ?? "-"}
                      </span>
                      <span className="stackedValue">
                        中{" "}
                        {selectedZokanComparison.references.monthLaw?.middle ?? "-"}
                      </span>
                      <span className="stackedValue">
                        本 {selectedZokanComparison.references.monthLaw?.main ?? "-"}
                      </span>
                    </td>
                    <td>
                      {selectedZokanComparison.references.monthLaw ? (
                        <>
                          <span className="stackedValue">
                            {
                              selectedZokanComparison.references.monthLaw.active
                                .label
                            }{" "}
                            {
                              selectedZokanComparison.references.monthLaw.active
                                .stem
                            }
                          </span>
                          <small className="stackedValue">
                            単蔵干{" "}
                            {selectedZokanComparison.references.singleMain
                              ?.selected ?? "-"}
                          </small>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {selectedZokanComparison.diffs.length > 0 ? (
                        selectedZokanComparison.diffs.map((diff) => (
                          <span className="stackedValue" key={diff}>
                            {diff}
                          </span>
                        ))
                      ) : (
                        <span className="pointPlus">matched</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="note">
              {selectedZokanComparison.spreadsheet.caution}
            </p>
          </section>

          <section className="panel">
            <h2>蔵干差分 30日検証</h2>
            <div className="sourceGrid">
              <div>
                <span>対象</span>
                <strong>{zokanComparisonSummary.total}日分</strong>
                <p>取り込み済みサンプル全日を確認します。</p>
              </div>
              <div>
                <span>差分あり</span>
                <strong>{zokanComparisonSummary.mismatched}日</strong>
                <p>スプシ月蔵干と v0 月律分野の差分です。</p>
              </div>
              <div>
                <span>比較対象</span>
                <strong>月支 + 節入日数</strong>
                <p>年支・日支はこの段階では採用判定に含めません。</p>
              </div>
              <div>
                <span>判定</span>
                <strong>reference_v0</strong>
                <p>差分は流派・思想差として記録します。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>採用方式</th>
                    <th>月支</th>
                    <th>節入日数</th>
                    <th>スプシ 余/中/本</th>
                    <th>v0 余/中/本</th>
                    <th>v0司令</th>
                    <th>差分</th>
                  </tr>
                </thead>
                <tbody>
                  {zokanComparisons.map(({ day, comparison }) => (
                    <tr key={day.date}>
                      <td>
                        <a href={`/?date=${day.date}&view=dev`}>{day.date}</a>
                      </td>
                      <td>
                        <span className="stackedValue">
                          {comparison.adoptedMethod.id}
                        </span>
                        <small className="stackedValue">
                          {comparison.adoptedMethod.confidence}
                        </small>
                      </td>
                      <td>{comparison.target.branch}</td>
                      <td>
                        {comparison.target.daysFromSetsuiri
                          ? `${comparison.target.daysFromSetsuiri}日目`
                          : "-"}
                      </td>
                      <td>
                        <span className="stackedValue">
                          余 {comparison.spreadsheet.month.extra || "-"}
                        </span>
                        <span className="stackedValue">
                          中 {comparison.spreadsheet.month.middle || "-"}
                        </span>
                        <span className="stackedValue">
                          本 {comparison.spreadsheet.month.main || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="stackedValue">
                          余 {comparison.references.monthLaw?.extra ?? "-"}
                        </span>
                        <span className="stackedValue">
                          中 {comparison.references.monthLaw?.middle ?? "-"}
                        </span>
                        <span className="stackedValue">
                          本 {comparison.references.monthLaw?.main ?? "-"}
                        </span>
                      </td>
                      <td>
                        {comparison.references.monthLaw ? (
                          <span className="stackedValue">
                            {comparison.references.monthLaw.active.label}{" "}
                            {comparison.references.monthLaw.active.stem}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {comparison.diffs.length > 0 ? (
                          comparison.diffs.map((diff) => (
                            <span className="stackedValue" key={diff}>
                              {diff}
                            </span>
                          ))
                        ) : (
                          <span className="pointPlus">matched</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>二十四節気・節入り検算方針</h2>
            <div className="sourceGrid">
              <div>
                <span>検証状態</span>
                <strong>{solarTermValidation.status}</strong>
                <p>
                  {solarTermValidation.summary.passed} /{" "}
                  {solarTermValidation.summary.checkedEvents} 件の二十四節気チェックが通過。
                </p>
              </div>
              <div>
                <span>優先ソース</span>
                <strong>{solarTermValidation.source.preferred}</strong>
                <p>暦要項 / 二十四節気・雑節を公的検算ソースにします。</p>
              </div>
              <div>
                <span>時刻</span>
                <strong>{solarTermValidation.source.timezone}</strong>
                <p>日々吉方ではまず日付単位で照合し、時刻は参照値として保持します。</p>
              </div>
              <div>
                <span>公式マスター</span>
                <strong>{solarTermSummary.total}件 / 2026年</strong>
                <p>
                  節入り {solarTermSummary.setsuiriCount}件、中気{" "}
                  {solarTermSummary.chukiCount}件。
                </p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>国立天文台</th>
                    <th>マスター</th>
                    <th>節入り期待</th>
                    <th>結果</th>
                    <th>太陽黄経</th>
                  </tr>
                </thead>
                <tbody>
                  {solarTermValidation.checks.map((check) => (
                    <tr key={check.date}>
                      <td>{check.date}</td>
                      <td>
                        <span className="stackedValue">{check.expected.name}</span>
                        <span className="stackedValue">{check.expected.timeJst}</span>
                      </td>
                      <td>
                        <span className="stackedValue">
                          名 {check.actual.name || "-"}
                        </span>
                        <span className="stackedValue">
                          節 {check.actual.isSetsuiri ? "true" : "false"}
                        </span>
                        <span className="stackedValue">
                          時 {check.actual.official?.timeJst ?? "-"}
                        </span>
                      </td>
                      <td>{check.expected.expectedSetsuiri ? "true" : "false"}</td>
                      <td>
                        <span className={check.passed ? "pointPlus" : "pointMinus"}>
                          {check.passed ? "OK" : "NG"}
                        </span>
                      </td>
                      <td>{check.expected.solarLongitude}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              二十四節気の名称は国立天文台と照合します。節入りは月盤切替フラグなので、
              小満はfalse、芒種はtrueとして検証しています。
            </p>
          </section>

          <section className="panel">
            <h2>土用 v0</h2>
            <p className="note">
              こよみのページを優先し、土用入りを太陽黄経297/27/117/207度の通過日として扱います。
              本体では外部JSやSwiss Ephemerisを直接組み込まず、1900〜2050年は静的マスターを参照します。
              土用期間、間日、土用殺方位、スプシ差分を確認します。
            </p>
            <div className="sourceGrid">
              <div>
                <span>正本候補</span>
                <strong>こよみのページ</strong>
                <p>1900〜2050年は静的マスターを優先。補間v0はフォールバック。</p>
              </div>
              <div>
                <span>選択日</span>
                <strong>
                  {selectedDoyoComparison.calculated.isDoyo ? "土用" : "土用外"}
                </strong>
                <p>
                  {selectedDoyoComparison.calculated.period
                    ? `${selectedDoyoComparison.calculated.period.label} ${selectedDoyoComparison.calculated.dayIndexInDoyo}日目`
                    : "現在の選択日は土用期間外です。"}
                </p>
              </div>
              <div>
                <span>間日</span>
                <strong>
                  {selectedDoyoComparison.calculated.isManichi ? "間日" : "-"}
                </strong>
                <p>
                  日支 {selectedDoyoComparison.calculated.dayBranch}
                  {selectedDoyoComparison.calculated.period
                    ? ` / 対象支 ${selectedDoyoComparison.calculated.period.manichiBranches.join("・")}`
                    : ""}
                </p>
              </div>
              <div>
                <span>季節の土用日</span>
                <strong>
                  {selectedDoyoComparison.calculated.isSeasonalDoyoDay
                    ? `土用の${selectedDoyoComparison.calculated.dayBranch}の日`
                    : selectedDoyoComparison.calculated.period
                      ? `土用の${selectedDoyoComparison.calculated.period.seasonalDoyoDayBranch}の日`
                      : "-"}
                </strong>
                <p>
                  春戌・夏丑・秋辰・冬未。選択日は日支{" "}
                  {selectedDoyoComparison.calculated.dayBranch}。
                </p>
              </div>
              <div>
                <span>土用殺方位</span>
                <strong>
                  {selectedDoyoComparison.calculated.doyoSatsuDirection ?? "-"}
                </strong>
                <p>土用期間中の注意方位です。</p>
              </div>
              <div>
                <span>スプシ比較</span>
                <strong>{selectedDoyoComparison.status}</strong>
                <p>
                  {selectedDoyoComparison.diffs.length > 0
                    ? selectedDoyoComparison.diffs.join(" / ")
                    : "スプシ判定とv0判定が一致。"}
                </p>
              </div>
              <div>
                <span>{selectedYear}年検証</span>
                <strong>{doyoComparisonSummary.mismatched}件差分</strong>
                <p>{doyoComparisonSummary.total}日分を比較。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>土用</th>
                    <th>開始</th>
                    <th>黄経</th>
                    <th>終了</th>
                    <th>境界</th>
                    <th>間日支</th>
                    <th>土用日</th>
                    <th>該当日</th>
                    <th>土用殺</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearDoyoPeriods.map((period) => (
                    <tr key={period.id}>
                      <td>{period.label}</td>
                      <td>{period.startDate}</td>
                      <td>{period.startSolarLongitude}度</td>
                      <td>{period.endDate}</td>
                      <td>
                        {period.boundaryTerm.name} {period.boundaryTerm.date}{" "}
                        {period.boundaryTerm.timeJst}
                      </td>
                      <td>{period.manichiBranches.join("・")}</td>
                      <td>
                        {period.seasonalDoyoDayBranch
                          ? `土用の${period.seasonalDoyoDayBranch}の日`
                          : "-"}
                      </td>
                      <td>
                        {period.seasonalDoyoDays
                          ?.map((day) => day.date)
                          .join(" / ") || "-"}
                      </td>
                      <td>{period.doyoSatsuDirection}</td>
                      <td>{period.sourceStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>万年暦サンプリング候補</h3>
            <p className="note">
              年内4回の土用について、土用入り・最終日・四立当日・間日を優先して目視確認します。
              ここが合えば、期間判定・間日・土用殺方位の大枠を検証できます。
            </p>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>土用</th>
                    <th>確認項目</th>
                    <th>期待値</th>
                    <th>見る理由</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearDoyoManualCheckTargets.map((target) => (
                    <tr
                      key={`${target.periodLabel}-${target.checkItem}-${target.date}`}
                    >
                      <td>
                        <a href={`/?date=${target.date}&view=dev`}>
                          {target.date}
                        </a>
                      </td>
                      <td>{target.periodLabel}</td>
                      <td>{target.checkItem}</td>
                      <td>{target.expected}</td>
                      <td>{target.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>スプシ</th>
                    <th>v0</th>
                    <th>土用名</th>
                    <th>日支</th>
                    <th>間日</th>
                    <th>土用殺</th>
                    <th>結果</th>
                  </tr>
                </thead>
                <tbody>
                  {doyoFocusComparisons.map(({ day, comparison }) => (
                    <tr key={day.date}>
                      <td>
                        <a href={`/?date=${day.date}&view=dev`}>{day.date}</a>
                      </td>
                      <td>{comparison.spreadsheet.isDoyo ? "土用" : "-"}</td>
                      <td>{comparison.calculated.isDoyo ? "土用" : "-"}</td>
                      <td>
                        {comparison.calculated.period
                          ? `${comparison.calculated.period.label} ${comparison.calculated.dayIndexInDoyo}日目`
                          : "-"}
                      </td>
                      <td>{comparison.calculated.dayBranch}</td>
                      <td>{comparison.calculated.isManichi ? "間日" : "-"}</td>
                      <td>{comparison.calculated.doyoSatsuDirection ?? "-"}</td>
                      <td>
                        {comparison.diffs.length > 0 ? (
                          comparison.diffs.map((diff) => (
                            <span className="stackedValue" key={diff}>
                              {diff}
                            </span>
                          ))
                        ) : (
                          <span className="pointPlus">matched</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>二十四節気マスター 2026</h2>
            <p className="note">
              国立天文台の時刻を保持する独立マスターです。年月日マスター側の二十四節気名・節入りフラグと照合し、
              将来は1900〜2050年へ同じ型で拡張します。
            </p>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>名称</th>
                    <th>時刻</th>
                    <th>精度</th>
                    <th>太陽黄経</th>
                    <th>気学節入り</th>
                    <th>年境界</th>
                    <th>日時JST</th>
                  </tr>
                </thead>
                <tbody>
                  {solarTerms2026.map((term) => (
                    <tr key={term.date}>
                      <td>{term.date}</td>
                      <td>{term.name}</td>
                      <td>{term.timeJst}</td>
                      <td>{term.datetimeJstPrecision}</td>
                      <td>{term.solarLongitude}度</td>
                      <td>{term.isSetsuiriForKyusei ? "true" : "false"}</td>
                      <td>{term.affectsYearBoundary ? "true" : "false"}</td>
                      <td>{term.datetimeJst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>ベストデー仮スコア</h2>
            <p className="note">
              本人固有条件なしの雛形です。日盤の方位殺と旧暦注データだけを仮採点し、
              九星と空亡は後続の命式照合に回します。
            </p>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>順位</th>
                    <th>日付</th>
                    <th>曜日</th>
                    <th>スコア</th>
                    <th>判定</th>
                    <th>日干支</th>
                    <th>日九星</th>
                    <th>空亡</th>
                    <th>要約</th>
                  </tr>
                </thead>
                <tbody>
                  {bestDayScores.map((score, index) => (
                    <tr key={score.date}>
                      <td>{index + 1}</td>
                      <td>
                        <a href={`/?date=${score.date}&view=dev`}>{score.date}</a>
                      </td>
                      <td>{score.day.calendarBase.weekday.ja}</td>
                      <td>
                        <span className="scoreBadge">{score.score}</span>
                      </td>
                      <td>{score.rankLabel}</td>
                      <td>{score.observations.dayPillar}</td>
                      <td>{score.observations.dayKyusei}</td>
                      <td>{score.observations.kuubou}</td>
                      <td>{score.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>スコア参照元</h2>
            <div className="sourceGrid">
              <div>
                <span>基準点</span>
                <strong>70点</strong>
                <p>ここから吉凶要素を加点・減点します。</p>
              </div>
              <div>
                <span>日盤 方位殺</span>
                <strong>年月日マスター AN〜AV相当</strong>
                <p>現段階では日盤の暗剣殺・五黄殺・破を仮採点に使用。</p>
              </div>
              <div>
                <span>暦注</span>
                <strong>calendar-note-definitions v0</strong>
                <p>天赦日・一粒万倍日・不成就日などを定義マスターから仮採点。</p>
              </div>
              <div>
                <span>九星・空亡</span>
                <strong>観測値</strong>
                <p>本人固有条件なしでは点数化せず、命式照合の材料として保持。</p>
              </div>
            </div>
          </section>

          {selectedBestDayScore ? (
            <section className="panel">
              <h2>選択日のスコア理由</h2>
              <div className="scoreReasonHeader">
                <span>{selectedBestDayScore.date}</span>
                <strong>{selectedBestDayScore.score}点</strong>
                <em>{selectedBestDayScore.rankLabel}</em>
              </div>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>参照</th>
                      <th>項目</th>
                      <th>点数</th>
                      <th>理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBestDayScore.reasons.map((reason) => (
                      <tr key={`${reason.source}-${reason.label}`}>
                        <td>{reason.source}</td>
                        <td>{reason.label}</td>
                        <td>
                          <span
                            className={
                              reason.points > 0
                                ? "pointPlus"
                                : reason.points < 0
                                  ? "pointMinus"
                                  : "pointNeutral"
                            }
                          >
                            {reason.points > 0 ? "+" : ""}
                            {reason.points}
                          </span>
                        </td>
                        <td>{reason.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="note">
                `direction_warning` は方位殺、`calendar_note_definition` は暦注定義マスター、
                `observation` は今後の本人固有判定に回す観測値です。
              </p>
            </section>
          ) : null}

          <section className="grid">
            <article className="panel">
              <h2>暦サマリー</h2>
              <dl className="facts">
                <div>
                  <dt>日付</dt>
                  <dd>{calendarDay.date}</dd>
                </div>
                <div>
                  <dt>曜日</dt>
                  <dd>{calendarDay.calendarBase.weekday.ja}曜日</dd>
                </div>
                <div>
                  <dt>祝日</dt>
                  <dd>{calendarDay.calendarBase.nationalHoliday.name ?? "-"}</dd>
                </div>
                <div>
                  <dt>旧暦</dt>
                  <dd>{calendarDay.lunarCalendar.display ?? "-"}</dd>
                </div>
                <div>
                  <dt>六曜</dt>
                  <dd>{calendarDay.lunarCalendar.rokuyo ?? "-"}</dd>
                </div>
                <div>
                  <dt>年干支</dt>
                  <dd>{calendarDay.pillars.year}</dd>
                </div>
                <div>
                  <dt>月干支</dt>
                  <dd>{calendarDay.pillars.month}</dd>
                </div>
                <div>
                  <dt>日干支</dt>
                  <dd>{calendarDay.pillars.day}</dd>
                </div>
                <div>
                  <dt>日九星</dt>
                  <dd>{calendarDay.kyusei.day}</dd>
                </div>
                <div>
                  <dt>空亡</dt>
                  <dd>{calendarDay.void.kuubou}</dd>
                </div>
                <div>
                  <dt>遁</dt>
                  <dd>{calendarDay.kyusei.ton}</dd>
                </div>
                <div>
                  <dt>二十四節気</dt>
                  <dd>{calendarDay.solarTerm.name || "-"}</dd>
                </div>
                <div>
                  <dt>公式時刻</dt>
                  <dd>{calendarDay.solarTerm.official?.timeJst ?? "-"}</dd>
                </div>
                <div>
                  <dt>節入り</dt>
                  <dd>{selectedSetsuiri ?? "-"}</dd>
                </div>
                <div>
                  <dt>直近節入り</dt>
                  <dd>
                    {calendarDay.solarTerm.latestSetsuiri
                      ? `${calendarDay.solarTerm.latestSetsuiri.name} ${calendarDay.solarTerm.latestSetsuiri.date} ${calendarDay.solarTerm.latestSetsuiri.timeJst}`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>節入日数</dt>
                  <dd>
                    {calendarDay.solarTerm.officialDaysFromSetsuiri
                      ? `${calendarDay.solarTerm.officialDaysFromSetsuiri}日目`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>スプシV列</dt>
                  <dd>
                    {calendarDay.solarTerm.daysFromSetsuiri
                      ? `${calendarDay.solarTerm.daysFromSetsuiri}日目`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>時刻精度</dt>
                  <dd>
                    {calendarDay.solarTerm.official?.datetimeJstPrecision ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt>検算</dt>
                  <dd>{calendarDay.solarTerm.crossCheck.status}</dd>
                </div>
              </dl>
            </article>

            <article className="panel">
              <h2>九星</h2>
              <div className="starGrid">
                <div>
                  <span>年</span>
                  <strong>{calendarDay.kyusei.year}</strong>
                </div>
                <div>
                  <span>月</span>
                  <strong>{calendarDay.kyusei.month}</strong>
                </div>
                <div>
                  <span>日</span>
                  <strong>{calendarDay.kyusei.day}</strong>
                </div>
              </div>
              <p className="note">
                数字表記はマスター由来の正本値です。名称変換は次の九星マスターで扱います。
              </p>
            </article>
          </section>

          <section className="panel">
            <h2>暦注マスター</h2>
            <p className="note">
              十二直・二十八宿・二十七宿は正式採用。主要選日は定義マスターへ切り出し、
              引き続き外部正本と照合しながら磨きます。
            </p>
            <div className="sourceGrid">
              <div>
                <span>十二直</span>
                <strong>{calendarNoteSummary.junichokuCount}件</strong>
                <p>建・除・満・平・定・執・破・危・成・納・開・閉</p>
              </div>
              <div>
                <span>二十八宿</span>
                <strong>{calendarNoteSummary.nijuhachishukuCount}件</strong>
                <p>50件検証CSVで周期ロジックを確認済み。</p>
              </div>
              <div>
                <span>データ状態</span>
                <strong>{calendarNoteSummary.sourceStatus}</strong>
                <p>十二直・二十八宿・二十七宿は正式採用。</p>
              </div>
              <div>
                <span>主要選日</span>
                <strong>{calendarNoteSummary.selectedDayDefinitionCount}件</strong>
                <p>天赦日・一粒万倍日・不成就日など。</p>
              </div>
              <div>
                <span>検証状態</span>
                <strong>{calendarNoteSummary.verificationStatus}</strong>
                <p>手元万年暦で追加照合します。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>値</th>
                    <th>吉凶</th>
                    <th>意味</th>
                    <th>向くこと</th>
                    <th>注意</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCalendarNoteRows.map(([label, entry]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>
                        {entry
                          ? `${entry.name}（${entry.reading}）`
                          : "-"}
                      </td>
                      <td>{entry?.fortune ?? "-"}</td>
                      <td>{entry?.summary ?? "-"}</td>
                      <td>
                        {entry && entry.recommended.length > 0
                          ? entry.recommended.join("・")
                          : "-"}
                      </td>
                      <td>
                        {entry && entry.caution.length > 0
                          ? entry.caution.join("・")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              旧サマリー: {calendarDay.calendarNotes.summary ?? "-"}
            </p>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>選択日の主要選日</th>
                    <th>吉凶</th>
                    <th>点数</th>
                    <th>表示文</th>
                    <th>注意表現</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarDay.calendarNotes.activeDefinitions.length > 0 ? (
                    calendarDay.calendarNotes.activeDefinitions.map((definition) => (
                      <tr key={definition.code}>
                        <td>{definition.name}</td>
                        <td>{definition.fortune}</td>
                        <td>
                          <span
                            className={
                              definition.weight > 0
                                ? "pointPlus"
                                : definition.weight < 0
                                  ? "pointMinus"
                                  : "pointNeutral"
                            }
                          >
                            {definition.weight > 0 ? "+" : ""}
                            {definition.weight}
                          </span>
                        </td>
                        <td>{definition.displayText}</td>
                        <td>{definition.cautionText}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>この日の主要選日フラグはありません。</td>
                      <td>-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>日別暦注発生マスター v0</h2>
            <p className="note">
              日付ごとに、どの暦注コードが発生しているかだけを保持する軽量JSONです。
              意味文・吉凶・点数は暦注定義マスターから参照します。
            </p>
            <div className="sourceGrid">
              <div>
                <span>スキーマ</span>
                <strong>{calendarNoteOccurrenceSummary.schemaVersion}</strong>
                <p>年別JSONへ拡張するための器です。</p>
              </div>
              <div>
                <span>収録範囲</span>
                <strong>
                  {calendarNoteOccurrenceSummary.range.start}〜
                  {calendarNoteOccurrenceSummary.range.end}
                </strong>
                <p>{calendarNoteOccurrenceSummary.range.count}日分</p>
              </div>
              <div>
                <span>検証</span>
                <strong>{calendarNoteOccurrenceSummary.validationStatus}</strong>
                <p>差分 {calendarNoteOccurrenceSummary.diffCount} 件</p>
              </div>
              <div>
                <span>選択日</span>
                <strong>
                  {selectedEnrichedCalendarNoteOccurrence?.notes.selectedDayCodes
                    .length ?? 0}
                  件
                </strong>
                <p>
                  {selectedEnrichedCalendarNoteOccurrence?.definitions
                    .map((definition) => definition.name)
                    .join("・") || "主要選日なし"}
                </p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>十二直</th>
                    <th>二十八宿</th>
                    <th>主要選日コード</th>
                    <th>土用</th>
                    <th>旧サマリー</th>
                    <th>差分</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarNoteOccurrences.map((occurrence) => (
                    <tr key={occurrence.date}>
                      <td>
                        <a href={`/?date=${occurrence.date}&view=dev`}>
                          {occurrence.date}
                        </a>
                      </td>
                      <td>{occurrence.notes.junichoku ?? "-"}</td>
                      <td>{occurrence.notes.nijuhachishuku ?? "-"}</td>
                      <td>
                        {occurrence.notes.selectedDayCodes.length > 0
                          ? occurrence.notes.selectedDayCodes.join("・")
                          : "-"}
                      </td>
                      <td>{occurrence.notes.doyo.label ?? "-"}</td>
                      <td>{occurrence.notes.legacySummary ?? "-"}</td>
                      <td>
                        {occurrence.diffs.length > 0
                          ? occurrence.diffs.join(" / ")
                          : "matched"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>暦注差分の切り分け</h2>
            <p className="note">{calendarNoteDiffAnalysis.summary}</p>
            <div className="sourceGrid">
              <div>
                <span>残差分</span>
                <strong>{calendarNoteDiffAnalysis.range.count}件</strong>
                <p>1900〜2050年の暦注発生マスターを対象にしています。</p>
              </div>
              <div>
                <span>表記ゆれ</span>
                <strong>
                  {calendarNoteDiffAnalysis.byClassification.glyph_normalization}件
                </strong>
                <p>二十八宿の氏/氐など、正規化で吸収する差分です。</p>
              </div>
              <div>
                <span>採用済み境界</span>
                <strong>
                  {
                    calendarNoteDiffAnalysis.byClassification
                      .accepted_setsuiri_boundary
                  }
                  件
                </strong>
                <p>仕様として確認済み値を採用した境界差分です。</p>
              </div>
              <div>
                <span>手動確認</span>
                <strong>
                  {calendarNoteDiffAnalysis.byClassification.needs_manual_review}件
                </strong>
                <p>既知分類に入らないため、万年暦で確認します。</p>
              </div>
            </div>
            <div className="sourceGrid">
              <div>
                <span>採用仕様</span>
                <strong>{junichokuRuleSpec.id}</strong>
                <p>{junichokuRuleSpec.principle}</p>
              </div>
              <div>
                <span>境界サンプル</span>
                <strong>{junichokuRuleSpec.knownBoundaryCases[0].date}</strong>
                <p>
                  {junichokuRuleSpec.knownBoundaryCases[0].solarTerm}{" "}
                  {junichokuRuleSpec.knownBoundaryCases[0].setsuiriTimeJst}
                </p>
              </div>
              <div>
                <span>採用値</span>
                <strong>{junichokuRuleSpec.knownBoundaryCases[0].adopted}</strong>
                <p>
                  日付単位計算は{" "}
                  {junichokuRuleSpec.knownBoundaryCases[0].dateUnitCalculated}
                </p>
              </div>
              <div>
                <span>命式計算</span>
                <strong>時刻で別判定</strong>
                <p>出生時刻を扱う場合は節入り時刻で年/月を切り替えます。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>分類</th>
                    <th>差分</th>
                    <th>見立て</th>
                    <th>根拠</th>
                    <th>節入り</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarNoteDiffAnalysis.rows.slice(0, 20).map((row) => (
                    <tr key={`${row.date}-${row.diff}`}>
                      <td>
                        <a href={`/?date=${row.date}&view=dev`}>{row.date}</a>
                      </td>
                      <td>{row.classification}</td>
                      <td>{row.diff}</td>
                      <td>{row.likelyCorrect}</td>
                      <td>{row.reason}</td>
                      <td>
                        {row.context.solarTerm
                          ? `${row.context.solarTerm} ${row.context.setsuiriTime ?? ""}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>雑節 v0</h2>
            <p className="note">
              選択年の二十四節気マスターから、節分・彼岸・八十八夜・二百十日・二百二十日を算出します。
              入梅・半夏生は前後の検証済み二十四節気時刻から太陽黄経80度・100度を補間します。
            </p>
            <div className="sourceGrid">
              <div>
                <span>選択日</span>
                <strong>
                  {selectedZassetsuEntries.length > 0
                    ? selectedZassetsuEntries.map((entry) => entry.label).join(" / ")
                    : "該当なし"}
                </strong>
                <p>
                  {selectedZassetsuEntries.length > 0
                    ? selectedZassetsuEntries
                        .map(
                          (entry) =>
                            entry.anchor.offsetDays !== undefined
                              ? `${entry.anchor.solarTerm} ${entry.anchor.date} から ${entry.anchor.offsetDays}日`
                              : `太陽黄経${entry.anchor.solarLongitude}度 ${entry.anchor.datetimeJst ?? ""}`,
                        )
                        .join(" / ")
                    : "選択日はv0雑節に該当しません。"}
                </p>
              </div>
              <div>
                <span>{selectedYear}年件数</span>
                <strong>{selectedYearZassetsuSummary.total}件</strong>
                <p>{selectedYearZassetsuSummary.codes.join(" / ")}</p>
              </div>
              <div>
                <span>状態</span>
                <strong>{selectedYearZassetsuSummary.sourceStatus}</strong>
                <p>{selectedYearZassetsuSummary.verificationStatus}</p>
              </div>
              <div>
                <span>検証内訳</span>
                <strong>
                  検証済み {selectedYearZassetsuVerification.verified} / 日付検証済み{" "}
                  {selectedYearZassetsuVerification.dateVerified} / 算出{" "}
                  {selectedYearZassetsuVerification.calculated} / 天文計算候補{" "}
                  {selectedYearZassetsuVerification.ephemerisCandidate} / 補間{" "}
                  {selectedYearZassetsuVerification.interpolated}
                </strong>
                <p>
                  外部正本一致{" "}
                  {selectedYearZassetsuVerification.verifiedExternalReference} / 日付一致{" "}
                  {selectedYearZassetsuVerification.verifiedExternalDateReference} / 外部照合待ち{" "}
                  {selectedYearZassetsuVerification.needsExternalSourceCheck} / 天文計算待ち{" "}
                  {selectedYearZassetsuVerification.needsExactEphemerisCheck}件
                </p>
              </div>
              <div>
                <span>API</span>
                <a href={`/api/zassetsu?year=${selectedYear}`}>
                  /api/zassetsu?year={selectedYear}
                </a>
                <a href={`/api/zassetsu?date=${calendarDay.date}`}>
                  /api/zassetsu?date={calendarDay.date}
                </a>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>雑節</th>
                    <th>区分</th>
                    <th>起点</th>
                    <th>計算</th>
                    <th>正式化</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearZassetsuEntries.map((entry) => (
                    <tr key={`${entry.date}-${entry.code}-${entry.phase}`}>
                      <td>
                        <a href={`/?date=${entry.date}&view=dev`}>{entry.date}</a>
                      </td>
                      <td>{entry.label}</td>
                      <td>{entry.phase}</td>
                      <td>
                        {entry.anchor.solarTerm} {entry.anchor.date}
                      </td>
                      <td>
                        {getZassetsuMethodLabel(entry.method)}
                        {entry.anchor.offsetDays !== undefined ? (
                          <> / {entry.anchor.offsetDays}日</>
                        ) : null}
                        {entry.anchor.solarLongitude !== undefined ? (
                          <small className="stackedValue">
                            太陽黄経{entry.anchor.solarLongitude}度{" "}
                            {entry.anchor.datetimeJst?.slice(11, 16) ?? ""}
                          </small>
                        ) : null}
                      </td>
                      <td>
                        {entry.anchor.solarLongitude !== undefined
                          ? "Swiss Ephemeris生成値または万年暦時刻と照合"
                          : "手元万年暦の日付欄と照合"}
                      </td>
                      <td>
                        {getZassetsuVerificationLabel(entry.verificationStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>正本サンプル</th>
                    <th>日付</th>
                    <th>時刻</th>
                    <th>太陽黄経</th>
                    <th>ソース</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearZassetsuVerification.referenceSamples.length > 0 ? (
                    selectedYearZassetsuVerification.referenceSamples.map((sample) => (
                      <tr key={`${sample.date}-${sample.code}`}>
                        <td>{sample.name}</td>
                        <td>{sample.date}</td>
                        <td>{sample.timeJst ?? "日付のみ"}</td>
                        <td>{sample.solarLongitude}度</td>
                        <td>
                          <a href={sample.sourceUrl}>{sample.sourceName}</a>
                          <small className="stackedValue">{sample.sourceNote}</small>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>この年の正本サンプルは未登録です。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>照合対象</th>
                    <th>生成値</th>
                    <th>正本値</th>
                    <th>判定</th>
                    <th>差分</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearZassetsuVerification.referenceComparisons.length > 0 ? (
                    selectedYearZassetsuVerification.referenceComparisons.map(
                      (comparison) => (
                        <tr key={`${comparison.generated.date}-${comparison.code}`}>
                          <td>{comparison.name}</td>
                          <td>
                            {comparison.generated.date}{" "}
                            {comparison.generated.timeJst ?? "-"}
                            <small className="stackedValue">
                              太陽黄経{comparison.generated.solarLongitude}度
                            </small>
                          </td>
                          <td>
                            {comparison.reference
                              ? `${comparison.reference.date} ${comparison.reference.timeJst ?? "日付のみ"}`
                              : "未登録"}
                            {comparison.reference ? (
                              <small className="stackedValue">
                                {comparison.reference.sourceName} /{" "}
                                {comparison.reference.verificationPrecision}
                              </small>
                            ) : null}
                          </td>
                          <td>
                            {comparison.status === "matched"
                              ? comparison.matchedPrecision === "minute"
                                ? "時刻一致"
                                : "日付一致"
                              : comparison.status === "mismatched"
                                ? "差分あり"
                                : "未照合"}
                          </td>
                          <td>
                            {comparison.diffs.length > 0
                              ? comparison.diffs.join(" / ")
                              : "-"}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td colSpan={5}>この年の照合対象は未登録です。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>万年暦チェック候補</th>
                    <th>日付</th>
                    <th>方式</th>
                    <th>起点</th>
                    <th>確認理由</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearZassetsuVerification.manualSamplingTargets.length > 0 ? (
                    selectedYearZassetsuVerification.manualSamplingTargets.map(
                      (target) => (
                        <tr key={`${target.date}-${target.name}`}>
                          <td>{target.name}</td>
                          <td>
                            <a href={`/?date=${target.date}&view=dev`}>
                              {target.date}
                            </a>
                          </td>
                          <td>{getZassetsuMethodLabel(target.method)}</td>
                          <td>{target.anchor}</td>
                          <td>{target.reason}</td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td colSpan={5}>この年の万年暦チェック候補はありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>正式化対象</th>
                    <th>現在</th>
                    <th>次の方式</th>
                    <th>太陽黄経</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearZassetsuVerification.exactEphemerisTargets.map(
                    (target) => (
                      <tr key={target.code}>
                        <td>{target.name}</td>
                        <td>{getZassetsuMethodLabel(target.activeMethod)}</td>
                        <td>太陽黄経通過時刻を直接計算</td>
                        <td>{target.targetSolarLongitude}度</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>検証ソース</th>
                    <th>役割</th>
                    <th>メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYearZassetsuVerification.validationSources.map(
                    (source) => (
                      <tr key={source.name}>
                        <td>
                          {source.url.startsWith("http") ? (
                            <a href={source.url}>{source.name}</a>
                          ) : (
                            source.name
                          )}
                        </td>
                        <td>{source.role}</td>
                        <td>{source.note}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <p className="note">{selectedYearZassetsuSummary.note}</p>
          </section>

          <section className="panel">
            <h2>方位殺</h2>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>盤</th>
                    <th>暗剣殺</th>
                    <th>五黄殺</th>
                    <th>歳破</th>
                  </tr>
                </thead>
                <tbody>
                  {directionRows.map(([label, value]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{value.ankensatsu || "-"}</td>
                      <td>{value.gohosatsu || "-"}</td>
                      <td>{value.saiha || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>国民の祝日マスター</h2>
            <div className="sourceGrid">
              <div>
                <span>公式ソース</span>
                <strong>{nationalHolidaySummary.source.organization}</strong>
                <p>{nationalHolidaySummary.source.dataset}</p>
              </div>
              <div>
                <span>収録範囲</span>
                <strong>
                  {nationalHolidaySummary.startYear}〜{nationalHolidaySummary.endYear}
                </strong>
                <p>{nationalHolidaySummary.total}件の祝日・休日を保持。</p>
              </div>
              <div>
                <span>状態</span>
                <strong>{nationalHolidaySummary.sourceStatus}</strong>
                <p>内閣府CSVを正本として静的JSON化。</p>
              </div>
              <div>
                <span>将来年</span>
                <strong>公式更新で反映</strong>
                <p>2100年以降は推定値ではなく、方針を分けて扱います。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>曜日</th>
                    <th>名称</th>
                    <th>種別</th>
                  </tr>
                </thead>
                <tbody>
                  {nationalHolidays2026.map((holiday) => {
                    return (
                      <tr key={holiday.date}>
                        <td>{holiday.date}</td>
                        <td>{getWeekdayJa(holiday.date)}</td>
                        <td>{holiday.name}</td>
                        <td>{holiday.type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="note">
              祝日は法律改正や特例で変わるため、未収録の将来年を自動推定で確定扱いにはしません。
            </p>
          </section>

          <section className="panel">
            <h2>旧暦・六曜サンプル</h2>
            <div className="sourceGrid">
              <div>
                <span>収録状態</span>
                <strong>{lunarCalendarSummary.sourceStatus}</strong>
                <p>{lunarCalendarSummary.total}日分のサンプル。</p>
              </div>
              <div>
                <span>検証状態</span>
                <strong>{lunarCalendarValidation.status}</strong>
                <p>
                  {lunarCalendarValidation.summary.passed} /{" "}
                  {lunarCalendarValidation.summary.total} 件のチェックが通過。
                </p>
              </div>
              <div>
                <span>範囲</span>
                <strong>
                  {lunarCalendarSummary.range.start}〜
                  {lunarCalendarSummary.range.end}
                </strong>
                <p>30日サンプルと同じ範囲に接続。</p>
              </div>
              <div>
                <span>方針</span>
                <strong>旧暦を正本化</strong>
                <p>六曜は旧暦月日から算出し、後で検算します。</p>
              </div>
            </div>
            <div className="sourceGrid">
              <div>
                <span>日次正式型</span>
                <strong>{lunarCalendarSummary.formalSchema.dayMaster}</strong>
                <p>日々の暦JSONへ合流する旧暦・六曜データ。</p>
              </div>
              <div>
                <span>月正式型</span>
                <strong>{lunarCalendarSummary.formalSchema.monthMaster}</strong>
                <p>朔日、次朔、月大小、閏月、中気を検証。</p>
              </div>
              <div>
                <span>六曜算出</span>
                <strong>(旧暦月 + 旧暦日) % 6</strong>
                <p>旧暦が正しければ六曜を安定算出できます。</p>
              </div>
              <div>
                <span>状態管理</span>
                <strong>verified / calculated</strong>
                <p>検算済みと生成直後を分けて保持します。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>検証</th>
                    <th>結果</th>
                    <th>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {lunarCalendarValidation.checks.map((check) => (
                    <tr key={check.id}>
                      <td>{check.label}</td>
                      <td>
                        <span
                          className={
                            check.status === "passed" ? "pointPlus" : "pointMinus"
                          }
                        >
                          {check.status}
                        </span>
                      </td>
                      <td>{check.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>旧暦月マスター</h3>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>月キー</th>
                    <th>旧暦月</th>
                    <th>閏月</th>
                    <th>月大小</th>
                    <th>日数</th>
                    <th>朔日</th>
                    <th>次朔</th>
                    <th>中気</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {lunarMonths2026.map((month) => (
                    <tr key={month.monthKey}>
                      <td>{month.monthKey}</td>
                      <td>{month.lunarMonth}月</td>
                      <td>{month.isLeapMonth ? "true" : "false"}</td>
                      <td>{month.monthSize}</td>
                      <td>{month.dayCount ?? "-"}</td>
                      <td>{month.newMoonDate ?? "-"}</td>
                      <td>{month.nextNewMoonDate}</td>
                      <td>
                        {month.containsChuki === null
                          ? "-"
                          : month.containsChuki
                            ? `${month.chukiName ?? ""} ${month.chukiDate ?? ""}`
                            : "なし"}
                      </td>
                      <td>{month.sourceStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>旧暦</th>
                    <th>六曜</th>
                    <th>月大小</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {lunarCalendars2026.map((lunar) => (
                    <tr key={lunar.date}>
                      <td>{lunar.date}</td>
                      <td>
                        旧暦{lunar.isLeapMonth ? "閏" : ""}
                        {lunar.lunarMonth}月{lunar.lunarDay}日
                      </td>
                      <td>{lunar.rokuyo}</td>
                      <td>{lunar.monthSize}</td>
                      <td>{lunar.sourceStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>生成旧暦との比較</h3>
            <div className="sourceGrid">
              <div>
                <span>接続方式</span>
                <strong>{generatedLunarSummary.strategy}</strong>
                <p>必要な年だけサーバー側で読み込みます。</p>
              </div>
              <div>
                <span>生成データ状態</span>
                <strong>{generatedLunarSummary.sourceStatus}</strong>
                <p>本採用前の計算生成データです。</p>
              </div>
              <div>
                <span>比較状態</span>
                <strong>{generatedLunarComparison.status}</strong>
                <p>
                  {generatedLunarComparison.summary.matched} /{" "}
                  {generatedLunarComparison.summary.total} 件が一致。
                </p>
              </div>
              <div>
                <span>一括import</span>
                <strong>
                  {generatedLunarSummary.runtimeImport ? "true" : "false"}
                </strong>
                <p>50MB級JSONを画面へ直接読み込みません。</p>
              </div>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>サンプル旧暦</th>
                    <th>生成旧暦</th>
                    <th>サンプル六曜</th>
                    <th>生成六曜</th>
                    <th>朔日</th>
                    <th>次朔</th>
                    <th>結果</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedLunarComparison.rows.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.sample.display}</td>
                      <td>{row.generated?.display ?? "-"}</td>
                      <td>{row.sample.rokuyo}</td>
                      <td>{row.generated?.rokuyo ?? "-"}</td>
                      <td>{row.generated?.newMoonDate ?? "-"}</td>
                      <td>{row.generated?.nextNewMoonDate ?? "-"}</td>
                      <td>
                        <span
                          className={
                            row.status === "matched" ? "pointPlus" : "pointMinus"
                          }
                        >
                          {row.status}
                        </span>
                        {row.diffs.length > 0 ? (
                          <small className="stackedValue">
                            {row.diffs.join(" / ")}
                          </small>
                        ) : null}
                        {row.referenceDiffs.length > 0 ? (
                          <small className="stackedValue">
                            参考差分: {row.referenceDiffs.join(" / ")}
                          </small>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">{lunarCalendarSummary.nextVerification}</p>
          </section>

          <section className="panel">
            <h2>複数日データ</h2>
            <p className="note">
              年・月・日すべてを表示します。表が横に広がりすぎないよう、干支/九星/方位殺は
              それぞれ1列の中で年・月・日に分けています。
            </p>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>曜日</th>
                    <th>祝日</th>
                    <th>旧暦</th>
                    <th>六曜</th>
                    <th>干支</th>
                    <th>九星</th>
                    <th>空亡</th>
                    <th>節入り</th>
                    <th>暗剣殺</th>
                    <th>五黄殺</th>
                    <th>破</th>
                  </tr>
                </thead>
                <tbody>
                  {importedDays.map((day) => (
                    <tr key={day.date}>
                      <td>
                        <a href={`/?date=${day.date}&view=dev`}>{day.date}</a>
                      </td>
                      <td>
                        <span className="stackedValue">
                          {day.calendarBase.weekday.ja}曜日
                        </span>
                        <span className="stackedValue">
                          {day.calendarBase.isWeekend ? "土日" : "平日"}
                        </span>
                      </td>
                      <td>{day.calendarBase.nationalHoliday.name ?? "-"}</td>
                      <td>{day.lunarCalendar.display ?? "-"}</td>
                      <td>{day.lunarCalendar.rokuyo ?? "-"}</td>
                      <td>
                        <span className="stackedValue">年 {day.pillars.year}</span>
                        <span className="stackedValue">月 {day.pillars.month}</span>
                        <span className="stackedValue">日 {day.pillars.day}</span>
                      </td>
                      <td>
                        <span className="stackedValue">年 {day.kyusei.year}</span>
                        <span className="stackedValue">月 {day.kyusei.month}</span>
                        <span className="stackedValue">日 {day.kyusei.day}</span>
                      </td>
                      <td>{day.void.kuubou}</td>
                      <td>{getSetsuiriDisplay(day) ?? "-"}</td>
                      <td>
                        <span className="stackedValue">
                          年 {day.directionWarnings.year.ankensatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          月 {day.directionWarnings.month.ankensatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          日 {day.directionWarnings.day.ankensatsu || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="stackedValue">
                          年 {day.directionWarnings.year.gohosatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          月 {day.directionWarnings.month.gohosatsu || "-"}
                        </span>
                        <span className="stackedValue">
                          日 {day.directionWarnings.day.gohosatsu || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="stackedValue">
                          年 {day.directionWarnings.year.saiha || "-"}
                        </span>
                        <span className="stackedValue">
                          月 {day.directionWarnings.month.saiha || "-"}
                        </span>
                        <span className="stackedValue">
                          日 {day.directionWarnings.day.saiha || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>暦JSON</h2>
            <pre>
              {JSON.stringify(
                {
                  calendarDay,
                  bestDayScore: selectedBestDayScore,
                },
                null,
                2,
              )}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}
