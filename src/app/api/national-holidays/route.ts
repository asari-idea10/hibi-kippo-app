import {
  getNationalHolidays,
  getNationalHolidaySummary,
} from "@/lib/national-holidays";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = url.searchParams.get("year");

  return Response.json({
    source: getNationalHolidaySummary(),
    holidays: getNationalHolidays({ year }),
  });
}
