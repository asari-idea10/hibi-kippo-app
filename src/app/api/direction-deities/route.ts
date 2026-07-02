import { getCalendarDay } from "@/lib/calendar-day";
import { getDirectionDeities } from "@/lib/direction-deities";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "2026-06-27";
  const day = getCalendarDay(date);

  if (!day) {
    return Response.json(
      {
        error: "calendar_day_not_found",
        date,
      },
      { status: 404 },
    );
  }

  return Response.json({
    query: {
      date,
    },
    result: getDirectionDeities(day),
  });
}
