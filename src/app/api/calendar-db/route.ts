import { searchCalendarDb } from "@/lib/calendar-db-view";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return Response.json(
    searchCalendarDb({
      year: url.searchParams.get("year"),
      start: url.searchParams.get("start"),
      end: url.searchParams.get("end"),
      birthDate: url.searchParams.get("birthDate"),
      birthGender: url.searchParams.get("birthGender"),
      keyword: url.searchParams.get("keyword"),
      limit: url.searchParams.get("limit"),
      view: url.searchParams.get("view"),
      dayType: url.searchParams.get("dayType"),
      kyuseiMatch: url.searchParams.get("kyuseiMatch"),
      purpose: url.searchParams.get("purpose"),
      candidate: url.searchParams.get("candidate"),
      goodDirectionMatch: url.searchParams.get("goodDirectionMatch"),
      honmeiStar: url.searchParams.get("honmeiStar"),
    }),
  );
}
