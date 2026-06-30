import {
  getCalendarDayImportSummary,
  getCalendarDayRange,
  getCalendarDays,
  listAvailableCalendarDays,
} from "@/lib/calendar-day";
import { getZokanComparison, zokanMethods } from "@/lib/zokan-master";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const days = getCalendarDays({ start, end });
  const rows = days.map((day) => ({
    date: day.date,
    monthBranch: day.branches.month,
    daysFromSetsuiri:
      day.solarTerm.officialDaysFromSetsuiri ?? day.solarTerm.daysFromSetsuiri,
    comparison: getZokanComparison(day),
  }));
  const mismatched = rows.filter(
    (row) => row.comparison.diffs.length > 0,
  ).length;

  return Response.json({
    query: {
      start,
      end,
    },
    range: getCalendarDayRange(),
    count: rows.length,
    availableDates: listAvailableCalendarDays(),
    importSummary: getCalendarDayImportSummary(),
    methods: zokanMethods,
    summary: {
      matched: rows.length - mismatched,
      mismatched,
      status: mismatched === 0 ? "matched" : "has_diffs",
    },
    rows,
  });
}
