import solarTermsData from "@/data/solar-terms-1900-2050.verified.json";

export type SolarTermSource =
  | "国立天文台"
  | "swiss_ephemeris"
  | "manual_almanac"
  | "verified_master";
export type SolarTermPrecision = "minute" | "second";
export type SolarTermBoundaryMethod = "solar_longitude_crossing";

export type SolarTermCalculationEngine = {
  name: string;
  library: string;
  version: string;
  flags: string;
  ephePath: string | null;
};

export type SolarTermMasterEntry = {
  date: string;
  name: string;
  kind: "二十四節気";
  timeJst: string;
  datetimeJst: string;
  datetimeJstPrecision: SolarTermPrecision;
  exactDatetimeJst: string | null;
  boundaryMethod: SolarTermBoundaryMethod;
  solarLongitude: number;
  isSetsuiriForKyusei: boolean;
  affectsYearBoundary: boolean;
  affectsMonthBoundary: boolean;
  source: SolarTermSource;
  sourceUrl: string;
  sourceNote: string;
  calculationEngine?: SolarTermCalculationEngine;
};

const solarTermsMaster = solarTermsData as SolarTermMasterEntry[];
const solarTerms = [...solarTermsMaster].sort((a, b) =>
  a.date.localeCompare(b.date),
);

export function getSolarTerms(query: { year?: string | null } = {}) {
  return solarTerms.filter((term) => {
    if (!query.year) {
      return true;
    }

    return term.date.startsWith(`${query.year}-`);
  });
}

export function getSolarTermByDate(date: string) {
  return solarTerms.find((term) => term.date === date) ?? null;
}

function getDateIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function getSetsuiriContextByDate(date: string) {
  const latestSetsuiri = [...solarTerms]
    .reverse()
    .find((term) => term.isSetsuiriForKyusei && term.date <= date);

  if (!latestSetsuiri) {
    return null;
  }

  return {
    latestSetsuiri: {
      date: latestSetsuiri.date,
      name: latestSetsuiri.name,
      timeJst: latestSetsuiri.timeJst,
      datetimeJst: latestSetsuiri.datetimeJst,
    },
    daysFromSetsuiri:
      getDateIndex(date) - getDateIndex(latestSetsuiri.date) + 1,
  };
}

export function getSolarTermMasterSummary() {
  const years = Array.from(
    new Set(solarTerms.map((term) => term.date.slice(0, 4))),
  ).sort();
  const setsuiriCount = solarTerms.filter(
    (term) => term.isSetsuiriForKyusei,
  ).length;

  return {
    source: {
      name: "verified_master",
      url: "src/data/solar-terms-1900-2050.verified.json",
      timezone: "中央標準時",
    },
    dataFile: "src/data/solar-terms-1900-2050.verified.json",
    total: solarTerms.length,
    years,
    setsuiriCount,
    chukiCount: solarTerms.length - setsuiriCount,
    status: "verified_1900_2050",
  } as const;
}
