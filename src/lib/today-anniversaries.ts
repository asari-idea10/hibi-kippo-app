import anniversaryData from "@/data/today-anniversaries.v0.json";

export type TodayAnniversaryEntry = {
  name: string;
  category: string;
  priority: "primary" | "secondary" | "monthly";
};

export type TodayAnniversaryEvent = {
  year: number;
  label: string;
};

export type TodayAnniversaryDay = {
  monthDay: string;
  sourceStatus: "external_culture_reference_v0";
  sourceName: string;
  sourceUrl: string;
  sourceNote: string;
  entries: TodayAnniversaryEntry[];
  events: TodayAnniversaryEvent[];
};

const days = anniversaryData as TodayAnniversaryDay[];

function getMonthDay(date: string) {
  return date.slice(5, 10);
}

export function getTodayAnniversaries(date: string) {
  return days.find((day) => day.monthDay === getMonthDay(date)) ?? null;
}

export function getTodayAnniversaryDisplay(date: string, limit = 3) {
  const day = getTodayAnniversaries(date);

  if (!day) {
    return "-";
  }

  return getTodayAnniversaryHighlights(date, limit)
    .map((entry) => entry.name)
    .join(" / ");
}

export function getTodayAnniversaryHighlights(date: string, limit = 3) {
  const day = getTodayAnniversaries(date);

  if (!day) {
    return [];
  }

  const priorityOrder: Record<TodayAnniversaryEntry["priority"], number> = {
    primary: 0,
    secondary: 1,
    monthly: 2,
  };

  return [...day.entries]
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        a.name.localeCompare(b.name, "ja"),
    )
    .slice(0, limit);
}

export function getTodayAnniversarySummary(date: string) {
  const day = getTodayAnniversaries(date);

  if (!day) {
    return null;
  }

  const categories = day.entries.reduce<Record<string, number>>(
    (accumulator, entry) => {
      accumulator[entry.category] = (accumulator[entry.category] ?? 0) + 1;

      return accumulator;
    },
    {},
  );

  return {
    totalEntries: day.entries.length,
    totalEvents: day.events.length,
    categories,
    display: getTodayAnniversaryDisplay(date),
    sourceStatus: day.sourceStatus,
    sourceName: day.sourceName,
    sourceUrl: day.sourceUrl,
  };
}
