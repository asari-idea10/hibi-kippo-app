import {
  getCalendarDayImportSummary,
  getCalendarDayRange,
  getCalendarDays,
} from "@/lib/calendar-day";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const days = getCalendarDays({ start, end });

  return Response.json({
    query: {
      start,
      end,
    },
    range: getCalendarDayRange(),
    count: days.length,
    importSummary: getCalendarDayImportSummary(),
    days,
  });
}
