import { getBestDayScores } from "@/lib/best-day-score";
import { getCalendarDayRange } from "@/lib/calendar-day";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const scores = getBestDayScores({ start, end });

  return Response.json({
    query: {
      start,
      end,
      personalConditions: "not_applied",
    },
    range: getCalendarDayRange(),
    scoringVersion: "best-day-v0",
    scoringPolicy: {
      baseScore: 70,
      directionWarnings: "日盤の暗剣殺・五黄殺・破を減点",
      calendarNotes:
        "主要選日はcalendar-note-definitions v0のweightを仮採点に利用。旧データは検算用に保持",
      kyusei: "本人固有条件なしでは観測値として保持し、現時点では点数化しない",
      kuubou: "本人命式との照合前なので観測値として保持し、現時点では点数化しない",
    },
    count: scores.length,
    scores,
  });
}
