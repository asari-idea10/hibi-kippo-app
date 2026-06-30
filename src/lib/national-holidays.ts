import holidayData from "@/data/national-holidays-1955-2027.verified.json";

export type NationalHolidayEntry = {
  date: string;
  name: string;
  type: "national_holiday" | "substitute_holiday" | "citizens_holiday_or_substitute";
  isNationalHoliday: true;
  sourceStatus: "verified";
  source: {
    organization: "内閣府";
    dataset: "国民の祝日・休日月日";
    url: string;
  };
};

const holidays = holidayData as NationalHolidayEntry[];
const holidaysByDate = new Map(holidays.map((holiday) => [holiday.date, holiday]));

export function getNationalHoliday(date: string) {
  return holidaysByDate.get(date) ?? null;
}

export function getNationalHolidays(query: { year?: string | null } = {}) {
  return holidays.filter((holiday) => {
    if (query.year && !holiday.date.startsWith(`${query.year}-`)) {
      return false;
    }

    return true;
  });
}

export function getNationalHolidaySummary() {
  const years = [...new Set(holidays.map((holiday) => holiday.date.slice(0, 4)))];

  return {
    total: holidays.length,
    startYear: years[0] ?? null,
    endYear: years.at(-1) ?? null,
    source: {
      organization: "内閣府",
      dataset: "国民の祝日・休日月日",
      url: holidays[0]?.source.url ?? null,
    },
    sourceStatus: "verified" as const,
    futurePolicy:
      "内閣府CSVに未収録の将来年は未確定扱い。推定計算ではなく公式更新で反映する。",
  };
}
