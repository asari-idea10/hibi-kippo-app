import { getSanGenNineUnContext } from "@/lib/san-gen-nine-un";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year") ?? "2026";
  const year = Number.parseInt(yearParam, 10);

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
    result: getSanGenNineUnContext(year),
  });
}
