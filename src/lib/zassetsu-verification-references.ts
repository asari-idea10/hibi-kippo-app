import referenceSamples from "@/data/zassetsu-solar-longitude-reference-samples.v0.json";
import type {
  ZassetsuSolarLongitudeCode,
  ZassetsuSolarLongitudeEntry,
} from "@/lib/zassetsu-solar-longitudes";

export type ZassetsuSolarLongitudeReferenceSample = {
  date: string;
  code: ZassetsuSolarLongitudeCode;
  name: "入梅" | "半夏生";
  timeJst: string | null;
  solarLongitude: 80 | 100;
  sourceName: string;
  sourceUrl: string;
  sourceNote: string;
  verificationPrecision: "date" | "minute";
};

const samples = referenceSamples as ZassetsuSolarLongitudeReferenceSample[];

export function getZassetsuSolarLongitudeReferenceSample(
  year: string,
  code: ZassetsuSolarLongitudeCode,
) {
  return (
    samples.find(
      (sample) => sample.date.startsWith(`${year}-`) && sample.code === code,
    ) ?? null
  );
}

export function compareZassetsuSolarLongitudeReference(
  entry: ZassetsuSolarLongitudeEntry,
) {
  const reference = getZassetsuSolarLongitudeReferenceSample(
    entry.date.slice(0, 4),
    entry.code,
  );

  if (!reference) {
    return {
      status: "not_sampled",
      reference,
      diffs: [],
    } as const;
  }

  const diffs = [
    entry.date !== reference.date
      ? `date: generated=${entry.date} / reference=${reference.date}`
      : null,
    reference.timeJst && entry.timeJst !== reference.timeJst
      ? `timeJst: generated=${entry.timeJst} / reference=${reference.timeJst}`
      : null,
    entry.solarLongitude !== reference.solarLongitude
      ? `solarLongitude: generated=${entry.solarLongitude} / reference=${reference.solarLongitude}`
      : null,
  ].filter((diff): diff is string => Boolean(diff));

  return {
    status: diffs.length === 0 ? "matched" : "mismatched",
    reference,
    matchedPrecision: diffs.length === 0 ? reference.verificationPrecision : null,
    diffs,
  } as const;
}

export function getZassetsuSolarLongitudeReferenceSamples(year?: string) {
  return year
    ? samples.filter((sample) => sample.date.startsWith(`${year}-`))
    : samples;
}
