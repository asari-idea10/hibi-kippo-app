import {
  getCalendarDay,
  getCalendarDayImportSummary,
  getCalendarDayRange,
  listCalendarDaysAround,
} from "@/lib/calendar-day";
import { getZokanComparison } from "@/lib/zokan-master";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "2026-05-18";
  const calendarDay = getCalendarDay(date);

  if (!calendarDay) {
    return Response.json(
      {
        error: "calendar_day_not_found",
        message: "指定日の暦JSONはまだサンプル登録されていません。",
        date,
        range: getCalendarDayRange(),
        availableDatesAroundRequest: listCalendarDaysAround(date),
        importSummary: getCalendarDayImportSummary(),
      },
      { status: 404 },
    );
  }

  return Response.json({
    ...calendarDay,
    zokanAnalysis: getZokanComparison(calendarDay),
  });
}
