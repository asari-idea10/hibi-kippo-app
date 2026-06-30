import {
  getZassetsuByDate,
  getZassetsuEntries,
  getZassetsuSummary,
  getZassetsuVerificationSummary,
} from "@/lib/zassetsu";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const year = url.searchParams.get("year") ?? date?.slice(0, 4) ?? "2026";

  return Response.json({
    query: {
      date,
      year,
    },
    summary: getZassetsuSummary(year),
    verification: getZassetsuVerificationSummary(year),
    entries: date ? getZassetsuByDate(date) : getZassetsuEntries(year),
  });
}
