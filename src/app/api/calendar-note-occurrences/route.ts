import { NextResponse } from "next/server";

import {
  enrichCalendarNoteOccurrence,
  getCalendarNoteOccurrenceDays,
  getCalendarNoteOccurrenceSummary,
} from "@/lib/calendar-note-occurrences";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const days = getCalendarNoteOccurrenceDays({ start, end }).map((day) =>
    enrichCalendarNoteOccurrence(day),
  );

  return NextResponse.json({
    summary: getCalendarNoteOccurrenceSummary(),
    query: {
      start,
      end,
    },
    count: days.length,
    days,
  });
}
