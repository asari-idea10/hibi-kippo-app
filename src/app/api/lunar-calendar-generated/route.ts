import {
  compareGeneratedWithSample,
  getGeneratedLunarCalendarConnectionSummary,
  getGeneratedLunarCalendarDay,
  getGeneratedLunarCalendarDays,
  getGeneratedLunarMonths,
} from "@/lib/lunar-calendar-generated";
import { getLunarCalendars } from "@/lib/lunar-calendar";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const year = url.searchParams.get("year");
  const includeMonths = url.searchParams.get("includeMonths") === "1";
  const compareSample = url.searchParams.get("compareSample") === "1";

  if (date) {
    const day = getGeneratedLunarCalendarDay(date);

    if (!day) {
      return Response.json(
        {
          error: "generated_lunar_calendar_day_not_found",
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

  if (!year) {
    return Response.json(
      {
        error: "year_or_date_required",
        message: "year=YYYY または date=YYYY-MM-DD を指定してください。",
        source: getGeneratedLunarCalendarConnectionSummary(),
      },
      { status: 400 },
    );
  }

  const days = getGeneratedLunarCalendarDays(year);

  return Response.json({
    source: getGeneratedLunarCalendarConnectionSummary(),
    count: days.length,
    days,
    lunarMonths: includeMonths ? getGeneratedLunarMonths(year) : undefined,
    sampleComparison:
      compareSample && year === "2026"
        ? compareGeneratedWithSample(getLunarCalendars({ year: "2026" }))
        : undefined,
  });
}
