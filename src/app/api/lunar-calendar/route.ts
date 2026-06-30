import {
  compareGeneratedWithSample,
  getGeneratedLunarCalendarConnectionSummary,
  getGeneratedLunarCalendarDay,
  getGeneratedLunarCalendarDays,
  getGeneratedLunarMonths,
} from "@/lib/lunar-calendar-generated";
import {
  getLunarCalendars,
  getLunarCalendarSummary,
  getLunarCalendarValidation,
  getLunarMonths,
} from "@/lib/lunar-calendar";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const year = url.searchParams.get("year");
  const includeMonths = url.searchParams.get("includeMonths") === "1";
  const useSample = url.searchParams.get("source") === "sample";

  if (date && !useSample) {
    const day = getGeneratedLunarCalendarDay(date);

    if (!day) {
      return Response.json(
        {
          error: "lunar_calendar_day_not_found",
          date,
          source: getGeneratedLunarCalendarConnectionSummary(),
        },
        { status: 404 },
      );
    }

    return Response.json({
      source: getGeneratedLunarCalendarConnectionSummary(),
      day,
    });
  }

  if (year && !useSample) {
    const days = getGeneratedLunarCalendarDays(year);

    return Response.json({
      source: getGeneratedLunarCalendarConnectionSummary(),
      count: days.length,
      days,
      lunarMonths: includeMonths ? getGeneratedLunarMonths(year) : undefined,
      sampleComparison:
        year === "2026"
          ? compareGeneratedWithSample(getLunarCalendars({ year: "2026" }))
          : undefined,
    });
  }

  return Response.json({
    source: getLunarCalendarSummary(),
    validation: getLunarCalendarValidation(),
    lunarMonths: getLunarMonths({ year }),
    lunarCalendar: getLunarCalendars({ year }),
  });
}
