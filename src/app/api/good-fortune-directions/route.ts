import { getCalendarDay } from "@/lib/calendar-day";
import {
  getGoodFortuneDirectionSummary,
  getGoodFortuneDirections,
} from "@/lib/good-fortune-directions";
import { judgeGoodFortuneDirectionConflicts } from "@/lib/good-fortune-direction-policy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "2026-05-18";
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
    summary: getGoodFortuneDirectionSummary(day),
    result: getGoodFortuneDirections(day),
    conflictPolicy: judgeGoodFortuneDirectionConflicts(day),
  });
}
