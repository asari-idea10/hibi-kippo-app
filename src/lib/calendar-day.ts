import {
  enrichCalendarNoteOccurrence,
  getCalendarNoteOccurrenceDay,
} from "@/lib/calendar-note-occurrences";
import {
  getCalendarMasterDataSource,
  getCalendarMasterDatesAround,
  getCalendarMasterDefaultQuery,
  getCalendarMasterRange,
  getCalendarMasterRow,
  getCalendarMasterRows,
  listCalendarMasterDates,
  type CalendarMasterRangeQuery,
  type CalendarMasterRow,
} from "@/lib/calendar-master-rows";
import {
  calendarNoteDefinitions,
  getCalendarNoteEntry,
  type CalendarNoteDefinition,
  type CalendarNoteMasterEntry,
} from "@/lib/calendar-notes";
import {
  getNationalHoliday,
  type NationalHolidayEntry,
} from "@/lib/national-holidays";
import {
  getLunarCalendar,
  type LunarCalendarEntry,
  type SourceStatus,
} from "@/lib/lunar-calendar";
import { getGeneratedLunarCalendarDay } from "@/lib/lunar-calendar-generated";
import {
  getSetsuiriContextByDate,
  getSolarTermByDate,
  type SolarTermMasterEntry,
} from "@/lib/solar-terms";
import {
  calculateSelectedDayCandidates,
  compareSelectedDayCandidates,
  type SelectedDayCandidate,
} from "@/lib/selected-day-candidates";

export type DirectionWarnings = {
  ankensatsu: string;
  gohosatsu: string;
  saiha: string;
};

export type CalendarDay = {
  date: string;
  row: number;
  calendarBase: {
    year: number;
    month: number;
    day: number;
    weekday: {
      index: number;
      ja: string;
      en: string;
    };
    isWeekend: boolean;
    nationalHoliday: {
      isHoliday: boolean;
      name: string | null;
      type: NationalHolidayEntry["type"] | null;
      sourceStatus: NationalHolidayEntry["sourceStatus"] | "not_applicable";
    };
  };
  source: {
    workbook: string;
    sheet: string;
    sourceOfTruth: "asarisan_master";
    status: "sample" | "full_range_v0";
  };
  numbers: {
    year: number;
    month: number;
    day: number;
    sexagenary: number;
    cycle: number;
  };
  pillars: {
    year: string;
    month: string;
    day: string;
  };
  stems: {
    year: string;
    month: string;
    day: string;
  };
  branches: {
    year: string;
    month: string;
    day: string;
  };
  zokan: {
    year: {
      main: string;
      middle: string;
      extra: string;
    };
    month: {
      main: string;
      middle: string;
      extra: string;
    };
    day: {
      main: string;
      middle: string;
      extra: string;
    };
  };
  void: {
    kuubou: string;
  };
  lunarCalendar: {
    lunarYear: number | null;
    lunarMonth: number | null;
    lunarDay: number | null;
    isLeapMonth: boolean | null;
    monthSize: LunarCalendarEntry["monthSize"] | null;
    rokuyo: LunarCalendarEntry["rokuyo"] | null;
    display: string | null;
    sourceStatus: SourceStatus | "not_connected";
    sourceNote: string | null;
  };
  solarTerm: {
    name: string;
    isSetsuiri: boolean;
    daysFromSetsuiri: number | null;
    officialDaysFromSetsuiri: number | null;
    latestSetsuiri: {
      date: string;
      name: string;
      timeJst: string;
      datetimeJst: string;
    } | null;
    official: SolarTermMasterEntry | null;
    crossCheck: {
      status: "not_applicable" | "matched" | "mismatched";
      diffs: string[];
    };
  };
  kyusei: {
    year: string;
    month: string;
    day: string;
    ton: string;
  };
  doyo: {
    isDoyo: boolean;
    label: string;
  };
  directionWarnings: {
    year: DirectionWarnings;
    month: DirectionWarnings;
    day: DirectionWarnings;
  };
  calendarNotes: {
    status: "occurrence_master_v0" | "legacy_promoted_v0";
    sourceStatus: "sample" | "legacy_spreadsheet" | "hybrid_v0" | "fallback_legacy";
    verificationStatus:
      | "legacy_spreadsheet"
      | "rule_checked_v0"
      | "external_reference_checked"
      | "fallback_legacy";
    junichoku: CalendarNoteMasterEntry | null;
    nijuhachishuku: CalendarNoteMasterEntry | null;
    nanajushichishuku: string | null;
    activeDefinitions: CalendarNoteDefinition[];
    summary: string | null;
    notes: string[];
    selectedDayCandidateCheck: {
      status: "matched" | "mismatched";
      candidates: SelectedDayCandidate[];
      candidateCodes: string[];
      adoptedScopedCodes: string[];
      candidateOnly: string[];
      adoptedOnly: string[];
    };
    legacyRaw: {
      junichoku: string;
      nijuhachishuku: string;
      summary: string;
      sanrinbou: boolean;
      ichiryumanbaibi: boolean;
      fujoju: boolean;
      hassen: boolean;
      jippoGure: boolean;
      tenichiTenjo: boolean;
      roujitsu: boolean;
      kasshi: boolean;
      koushin: boolean;
      shinnyu: boolean;
      tsuchinotoMi: boolean;
      tenshaBi: boolean;
    };
  };
  raw: {
    calculationHelpers: {
      ymLabel: string;
      year: string;
      month: string;
      day: string;
      duplicateYear: string;
      duplicateMonth: string;
      duplicateDay: string;
      kasshiHelper: string;
      switchFlag: string;
      seasonalBoundaryFlag: string;
    };
    legacyCalendarNotesTrusted: false;
  };
  crossCheck: {
    status: "not_checked";
    preferredSource: "国立天文台";
    diffs: string[];
  };
};

function toNumber(value: string) {
  return Number.parseInt(value, 10);
}

function toBoolean(value: string) {
  return value === "1";
}

const weekdayNamesJa = ["日", "月", "火", "水", "木", "金", "土"] as const;
const weekdayNamesEn = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function getCalendarBase(date: string): CalendarDay["calendarBase"] {
  const [year, month, day] = date.split("-").map((value) => toNumber(value));
  const weekdayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const nationalHoliday = getNationalHoliday(date);

  return {
    year,
    month,
    day,
    weekday: {
      index: weekdayIndex,
      ja: weekdayNamesJa[weekdayIndex],
      en: weekdayNamesEn[weekdayIndex],
    },
    isWeekend: weekdayIndex === 0 || weekdayIndex === 6,
    nationalHoliday: {
      isHoliday: Boolean(nationalHoliday),
      name: nationalHoliday?.name ?? null,
      type: nationalHoliday?.type ?? null,
      sourceStatus: nationalHoliday ? "verified" : "not_applicable",
    },
  };
}

function getCalendarLunar(date: string): CalendarDay["lunarCalendar"] {
  const generatedLunar = getGeneratedLunarCalendarDay(date);

  if (generatedLunar) {
    return {
      lunarYear: generatedLunar.lunar.year,
      lunarMonth: generatedLunar.lunar.month,
      lunarDay: generatedLunar.lunar.day,
      isLeapMonth: generatedLunar.lunar.isLeapMonth,
      monthSize: generatedLunar.lunar.monthSize,
      rokuyo: generatedLunar.rokuyo.name,
      display: generatedLunar.lunar.display,
      sourceStatus: "verified",
      sourceNote: `generated:${generatedLunar.generator.method}:manual_almanac_checked`,
    };
  }

  const lunar = getLunarCalendar(date);

  if (!lunar) {
    return {
      lunarYear: null,
      lunarMonth: null,
      lunarDay: null,
      isLeapMonth: null,
      monthSize: null,
      rokuyo: null,
      display: null,
      sourceStatus: "not_connected",
      sourceNote: null,
    };
  }

  return {
    lunarYear: lunar.lunarYear,
    lunarMonth: lunar.lunarMonth,
    lunarDay: lunar.lunarDay,
    isLeapMonth: lunar.isLeapMonth,
    monthSize: lunar.monthSize,
    rokuyo: lunar.rokuyo,
    display: `旧暦${lunar.isLeapMonth ? "閏" : ""}${lunar.lunarMonth}月${lunar.lunarDay}日`,
    sourceStatus: lunar.sourceStatus,
    sourceNote: lunar.sourceNote,
  };
}

function getCalendarDaySourceStatus(): CalendarDay["source"]["status"] {
  return getCalendarMasterDataSource().strategy === "yearly_server_side_json"
    ? "full_range_v0"
    : "sample";
}

function toCalendarDay(row: CalendarMasterRow): CalendarDay {
  const officialSolarTerm = getSolarTermByDate(row.date);
  const officialSetsuiriContext = getSetsuiriContextByDate(row.date);
  const lunarCalendar = getCalendarLunar(row.date);
  const occurrence = getCalendarNoteOccurrenceDay(row.date);
  const enrichedOccurrence = occurrence
    ? enrichCalendarNoteOccurrence(occurrence)
    : null;
  const junichokuDefinition =
    enrichedOccurrence?.junichokuDefinition ??
    getCalendarNoteEntry("junichoku", row.legacyJunichoku);
  const nijuhachishukuDefinition =
    enrichedOccurrence?.nijuhachishukuDefinition ??
    getCalendarNoteEntry("nijuhachishuku", row.legacyNijuhachishuku);
  const isSetsuiri = row.setsuiri !== "";
  const masterDaysFromSetsuiri = row.daysFromSetsuiri
    ? toNumber(row.daysFromSetsuiri)
    : null;
  const solarTermDiffs = [
    officialSolarTerm && row.solarTerm !== officialSolarTerm.name
      ? `二十四節気名: マスター=${row.solarTerm || "-"} / 国立天文台=${officialSolarTerm.name}`
      : null,
    officialSolarTerm &&
    isSetsuiri !== officialSolarTerm.isSetsuiriForKyusei
      ? `節入り: マスター=${isSetsuiri} / 日々吉方節入り定義=${officialSolarTerm.isSetsuiriForKyusei}`
      : null,
    officialSetsuiriContext &&
    masterDaysFromSetsuiri !== officialSetsuiriContext.daysFromSetsuiri
      ? `節入日数: マスター=${masterDaysFromSetsuiri ?? "-"} / 二十四節気マスター=${officialSetsuiriContext.daysFromSetsuiri}`
      : null,
  ].filter((diff): diff is string => Boolean(diff));
  const selectedDayCandidates = calculateSelectedDayCandidates({
    calendarMonth: getCalendarBase(row.date).month,
    dayPillar: row.dayPillar,
    solarMonthBranch: row.duplicateMonth,
    dayBranch: row.duplicateDay,
    lunarMonth: lunarCalendar.lunarMonth,
    lunarDay: lunarCalendar.lunarDay,
    isLeapMonth: lunarCalendar.isLeapMonth,
  });
  const selectedDayCodes = Array.from(
    new Set([
      ...(enrichedOccurrence?.notes.selectedDayCodes ?? []),
      ...selectedDayCandidates
        .filter((candidate) => candidate.isActive)
        .map((candidate) => candidate.code),
    ]),
  );
  const selectedDayDefinitions = selectedDayCodes.map(
    (code) => calendarNoteDefinitions[code],
  );
  const selectedDayCandidateCheck = compareSelectedDayCandidates(
    selectedDayCandidates,
    selectedDayCodes,
  );

  return {
    date: row.date,
    row: row.row,
    calendarBase: getCalendarBase(row.date),
    source: {
      workbook: "★フォーチューンマイレージマスタ",
      sheet: "年月日",
      sourceOfTruth: "asarisan_master",
      status: getCalendarDaySourceStatus(),
    },
    numbers: {
      year: toNumber(row.yearNumber),
      month: toNumber(row.monthNumber),
      day: toNumber(row.dayNumber),
      sexagenary: toNumber(row.sexagenaryNumber),
      cycle: toNumber(row.cycle),
    },
    pillars: {
      year: row.yearPillar,
      month: row.monthPillar,
      day: row.dayPillar,
    },
    stems: {
      year: row.yearStem,
      month: row.monthStem,
      day: row.dayStem,
    },
    branches: {
      year: row.duplicateYear,
      month: row.duplicateMonth,
      day: row.duplicateDay,
    },
    zokan: {
      year: {
        main: row.yearZokanMain,
        middle: row.yearZokanMiddle,
        extra: row.yearZokanExtra,
      },
      month: {
        main: row.monthZokanMain,
        middle: row.monthZokanMiddle,
        extra: row.monthZokanExtra,
      },
      day: {
        main: row.dayZokanMain,
        middle: row.dayZokanMiddle,
        extra: row.dayZokanExtra,
      },
    },
    void: {
      kuubou: row.kuubou,
    },
    lunarCalendar,
    solarTerm: {
      name: row.solarTerm,
      isSetsuiri,
      daysFromSetsuiri: masterDaysFromSetsuiri,
      officialDaysFromSetsuiri:
        officialSetsuiriContext?.daysFromSetsuiri ?? null,
      latestSetsuiri: officialSetsuiriContext?.latestSetsuiri ?? null,
      official: officialSolarTerm,
      crossCheck: {
        status: officialSolarTerm
          ? solarTermDiffs.length === 0
            ? "matched"
            : "mismatched"
          : "not_applicable",
        diffs: solarTermDiffs,
      },
    },
    kyusei: {
      year: row.yearKyusei,
      month: row.monthKyusei,
      day: row.dayKyusei,
      ton: row.ton,
    },
    doyo: {
      isDoyo: row.doyoFlag !== "",
      label: row.doyoLabel,
    },
    directionWarnings: {
      year: {
        ankensatsu: row.yearAnkensatsu,
        gohosatsu: row.yearGohosatsu,
        saiha: row.yearSaiha,
      },
      month: {
        ankensatsu: row.monthAnkensatsu,
        gohosatsu: row.monthGohosatsu,
        saiha: row.monthSaiha,
      },
      day: {
        ankensatsu: row.dayAnkensatsu,
        gohosatsu: row.dayGohosatsu,
        saiha: row.daySaiha,
      },
    },
    calendarNotes: {
      status: enrichedOccurrence
        ? "occurrence_master_v0"
        : "legacy_promoted_v0",
      sourceStatus:
        enrichedOccurrence?.source.sourceStatus ?? "fallback_legacy",
      verificationStatus:
        enrichedOccurrence?.source.verificationStatus ?? "fallback_legacy",
      junichoku: junichokuDefinition,
      nijuhachishuku: nijuhachishukuDefinition,
      nanajushichishuku:
        enrichedOccurrence?.notes.nanajushichishuku ?? null,
      activeDefinitions: selectedDayDefinitions,
      summary:
        selectedDayDefinitions.length > 0
          ? selectedDayDefinitions.map((definition) => definition.name).join("/")
          : enrichedOccurrence?.notes.legacySummary ?? row.legacySummary ?? null,
      notes: [
        enrichedOccurrence?.notes.junichoku
          ? `十二直: ${enrichedOccurrence.notes.junichoku}`
          : row.legacyJunichoku
            ? `十二直: ${row.legacyJunichoku}`
            : "",
        nijuhachishukuDefinition
          ? `二十八宿: ${nijuhachishukuDefinition.name}`
          : row.legacyNijuhachishuku
            ? `二十八宿: ${row.legacyNijuhachishuku}`
            : "",
        enrichedOccurrence?.notes.nanajushichishuku
          ? `二十七宿: ${enrichedOccurrence.notes.nanajushichishuku}`
          : "",
        selectedDayCodes.length
          ? `主要選日: ${selectedDayCodes.join("・")}`
          : "",
        enrichedOccurrence?.notes.legacySummary ?? row.legacySummary,
      ].filter(Boolean),
      selectedDayCandidateCheck: {
        ...selectedDayCandidateCheck,
        candidates: selectedDayCandidates,
      },
      legacyRaw: {
        junichoku: row.legacyJunichoku,
        nijuhachishuku: row.legacyNijuhachishuku,
        summary: row.legacySummary,
        sanrinbou: toBoolean(row.legacySanrinbou),
        ichiryumanbaibi: toBoolean(row.legacyIchiryumanbaibi),
        fujoju: toBoolean(row.legacyFujoju),
        hassen: toBoolean(row.legacyHassen),
        jippoGure: toBoolean(row.legacyJippoGure),
        tenichiTenjo: toBoolean(row.legacyTenichiTenjo),
        roujitsu: toBoolean(row.legacyRoujitsu),
        kasshi: toBoolean(row.legacyKasshi),
        koushin: toBoolean(row.legacyKoushin),
        shinnyu: toBoolean(row.legacyShinnyu),
        tsuchinotoMi: toBoolean(row.legacyTsuchinotoMi),
        tenshaBi: toBoolean(row.legacyTenshaBi),
      },
    },
    raw: {
      calculationHelpers: {
        ymLabel: row.ymLabel,
        year: row.year,
        month: row.month,
        day: row.day,
        duplicateYear: row.duplicateYear,
        duplicateMonth: row.duplicateMonth,
        duplicateDay: row.duplicateDay,
        kasshiHelper: row.kasshiHelper,
        switchFlag: row.switchFlag,
        seasonalBoundaryFlag: row.seasonalBoundaryFlag,
      },
      legacyCalendarNotesTrusted: false,
    },
    crossCheck: {
      status: "not_checked",
      preferredSource: "国立天文台",
      diffs: [],
    },
  };
}

export type CalendarDayRangeQuery = CalendarMasterRangeQuery;

export function getCalendarDay(date: string) {
  const row = getCalendarMasterRow(date);

  return row ? toCalendarDay(row) : null;
}

export function listAvailableCalendarDays(query: CalendarDayRangeQuery = {}) {
  return listCalendarMasterDates(query);
}

export function listCalendarDaysAround(date: string, days = 15) {
  return getCalendarMasterDatesAround(date, days);
}

export function getCalendarDays(query: CalendarDayRangeQuery = {}) {
  return getCalendarMasterRows(query).map(toCalendarDay);
}

export function getCalendarDayImportSummary() {
  const days = getCalendarDays();
  const range = getCalendarDayRange();
  const defaultRange = getCalendarDayDefaultRange();
  const daysWithLegacyNotes = days.filter(
    (day) => day.calendarNotes.legacyRaw.summary !== "",
  ).length;
  const daysWithAnyDirectionWarning = days.filter((day) =>
    [
      day.directionWarnings.year,
      day.directionWarnings.month,
      day.directionWarnings.day,
    ].some((warning) =>
      Object.values(warning).some((direction) => direction !== ""),
    ),
  ).length;

  return {
    source: {
      workbook: "★フォーチューンマイレージマスタ",
      sheet: "年月日",
      ...getCalendarMasterDataSource(),
    },
    total: range.count,
    loadedDefaultTotal: days.length,
    defaultRange,
    daysWithLegacyNotes,
    daysWithAnyDirectionWarning,
    calendarNotesStatus: "occurrence_master_v0" as const,
    crossCheckStatus: "not_checked" as const,
    preferredCrossCheckSource: "国立天文台" as const,
  };
}

export function getCalendarDayRange() {
  return getCalendarMasterRange();
}

export function getCalendarDayDefaultRange() {
  return getCalendarMasterDefaultQuery();
}
