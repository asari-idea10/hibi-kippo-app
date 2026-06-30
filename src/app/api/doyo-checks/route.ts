import {
  getCalendarDayImportSummary,
  getCalendarDayRange,
  getCalendarDays,
  listAvailableCalendarDays,
} from "@/lib/calendar-day";
import {
  getDoyoComparison,
  getDoyoManualCheckTargets,
  getDoyoPeriods,
} from "@/lib/doyo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const year = url.searchParams.get("year") ?? "2026";
  const days = getCalendarDays({ start, end });
  const rows = days.map((day) => ({
    date: day.date,
    comparison: getDoyoComparison(day),
  }));
  const mismatched = rows.filter(
    (row) => row.comparison.diffs.length > 0,
  ).length;

  return Response.json({
    query: {
      start,
      end,
      year,
    },
    range: getCalendarDayRange(),
    count: rows.length,
    availableDates: listAvailableCalendarDays(),
    importSummary: getCalendarDayImportSummary(),
    periods: getDoyoPeriods(year),
    manualCheckTargets: getDoyoManualCheckTargets(year),
    summary: {
      matched: rows.length - mismatched,
      mismatched,
      status: mismatched === 0 ? "matched" : "has_diffs",
    },
    rows,
  });
}
