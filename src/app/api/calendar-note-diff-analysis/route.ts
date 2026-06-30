import { NextResponse } from "next/server";

import { getCalendarNoteDiffAnalysis } from "@/lib/calendar-note-diff-analysis";

export function GET() {
  return NextResponse.json(getCalendarNoteDiffAnalysis());
}
