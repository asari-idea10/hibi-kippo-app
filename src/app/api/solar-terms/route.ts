import {
  getSolarTermMasterSummary,
  getSolarTerms,
} from "@/lib/solar-terms";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const terms = getSolarTerms({ year });

  return Response.json({
    query: {
      year,
    },
    summary: getSolarTermMasterSummary(),
    count: terms.length,
    terms,
  });
}
