import zassetsuSolarLongitudeData from "@/data/zassetsu-solar-longitudes-1900-2050.verified.json";

export type ZassetsuSolarLongitudeCode = "nyubai" | "hangesho";

export type ZassetsuSolarLongitudeEntry = {
  date: string;
  code: ZassetsuSolarLongitudeCode;
  name: "入梅" | "半夏生";
  kind: "雑節";
  timeJst: string;
  datetimeJst: string;
  datetimeJstPrecision: "minute";
  exactDatetimeJst?: string;
  boundaryMethod: "solar_longitude_crossing";
  solarLongitude: 80 | 100;
  source: "swiss_ephemeris";
  sourceUrl: string;
  sourceNote: string;
  licenseNote: string;
};

const entries = zassetsuSolarLongitudeData as ZassetsuSolarLongitudeEntry[];

export function getZassetsuSolarLongitudeBoundary(
  year: string,
  code: ZassetsuSolarLongitudeCode,
) {
  return (
    entries.find(
      (entry) => entry.date.startsWith(`${year}-`) && entry.code === code,
    ) ?? null
  );
}

export function getZassetsuSolarLongitudeSummary(year?: string) {
  const targetEntries = year
    ? entries.filter((entry) => entry.date.startsWith(`${year}-`))
    : entries;

  return {
    total: targetEntries.length,
    years: [...new Set(targetEntries.map((entry) => entry.date.slice(0, 4)))],
    nyubai: targetEntries.filter((entry) => entry.code === "nyubai").length,
    hangesho: targetEntries.filter((entry) => entry.code === "hangesho").length,
    sourceStatus: targetEntries.length > 0 ? "ephemeris_candidate_v0" : "not_connected",
    note:
      "入梅・半夏生を太陽黄経80度/100度の通過時刻として直接生成したマスター。空の場合は補間v0へフォールバックする。",
  } as const;
}
