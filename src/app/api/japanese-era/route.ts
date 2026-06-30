import {
  getJapaneseEraDateContext,
  getJapaneseEraDefinitions,
  getJapaneseEraVerificationSummary,
  getJapaneseEraYearCandidates,
} from "@/lib/japanese-era";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? Number.parseInt(yearParam, 10) : null;

  if (date) {
    return Response.json({
      query: {
        date,
      },
      result: getJapaneseEraDateContext(date),
      verification: getJapaneseEraVerificationSummary(),
      definitions: getJapaneseEraDefinitions(),
    });
  }

  if (year !== null) {
    if (!Number.isInteger(year)) {
      return Response.json(
        {
          error: "invalid_year",
          year: yearParam,
        },
        { status: 400 },
      );
    }

    return Response.json({
      query: {
        year,
      },
      candidates: getJapaneseEraYearCandidates(year),
      verification: getJapaneseEraVerificationSummary(),
      definitions: getJapaneseEraDefinitions(),
    });
  }

  return Response.json({
    query: {},
    verification: getJapaneseEraVerificationSummary(),
    definitions: getJapaneseEraDefinitions(),
  });
}
