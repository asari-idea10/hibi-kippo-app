import { getSolarTerms } from "@/lib/solar-terms";
import {
  getZassetsuSolarLongitudeBoundary,
  getZassetsuSolarLongitudeSummary,
} from "@/lib/zassetsu-solar-longitudes";
import {
  compareZassetsuSolarLongitudeReference,
  getZassetsuSolarLongitudeReferenceSamples,
} from "@/lib/zassetsu-verification-references";

export type ZassetsuCode =
  | "setsubun"
  | "spring_higan"
  | "autumn_higan"
  | "nyubai"
  | "hangesho"
  | "hachijuhachiya"
  | "nihyakutoka"
  | "nihyakuhatsuka";

export type ZassetsuEntry = {
  date: string;
  code: ZassetsuCode;
  name: string;
  label: string;
  phase: "single_day" | "start" | "middle" | "end" | "period";
  anchor: {
    solarTerm: "立春" | "春分" | "秋分" | "芒種" | "夏至" | "小暑";
    date: string;
    offsetDays?: number;
    solarLongitude?: number;
    datetimeJst?: string;
    interpolationFrom?: {
      name: "芒種" | "夏至";
      solarLongitude: number;
      datetimeJst: string;
    };
    interpolationTo?: {
      name: "夏至" | "小暑";
      solarLongitude: number;
      datetimeJst: string;
    };
  };
  method:
    | "day_before_risshun"
    | "higan_around_equinox"
    | "days_from_risshun"
    | "solar_longitude_crossing"
    | "solar_longitude_interpolation";
  sourceStatus:
    | "calculated_v0"
    | "verified"
    | "date_verified"
    | "ephemeris_candidate_v0"
    | "interpolated_v0";
  verificationStatus:
    | "verified_external_reference"
    | "verified_external_date_reference"
    | "needs_manual_almanac_check"
    | "needs_external_source_check"
    | "needs_exact_ephemeris_check";
  note: string;
};

export type ZassetsuVerificationSummary = {
  year: string;
  total: number;
  calculated: number;
  verified: number;
  dateVerified: number;
  ephemerisCandidate: number;
  interpolated: number;
  verifiedExternalReference: number;
  verifiedExternalDateReference: number;
  needsManualAlmanacCheck: number;
  needsExternalSourceCheck: number;
  needsExactEphemerisCheck: number;
  referenceSamples: ReturnType<typeof getZassetsuSolarLongitudeReferenceSamples>;
  referenceComparisons: Array<{
    code: Extract<ZassetsuCode, "nyubai" | "hangesho">;
    name: "入梅" | "半夏生";
    generated: {
      date: string;
      timeJst: string | null;
      solarLongitude: 80 | 100;
    };
    reference: {
      date: string;
      timeJst: string | null;
      sourceName: string;
      verificationPrecision: "date" | "minute";
    } | null;
    status: "matched" | "mismatched" | "not_sampled";
    matchedPrecision: "date" | "minute" | null;
    diffs: string[];
  }>;
  manualSamplingTargets: Array<{
    date: string;
    name: string;
    method: ZassetsuEntry["method"];
    anchor: string;
    reason: string;
  }>;
  adoptionStatus: "v0_mixed";
  validationSources: Array<{
    name: string;
    url: string;
    role: string;
    note: string;
  }>;
  exactEphemerisTargets: Array<{
    code: Extract<ZassetsuCode, "nyubai" | "hangesho">;
    name: "入梅" | "半夏生";
    targetSolarLongitude: 80 | 100;
    currentMethod: "solar_longitude_interpolation";
    activeMethod: "solar_longitude_interpolation" | "solar_longitude_crossing";
    nextMethod: "solar_longitude_crossing";
  }>;
};

function dateToIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index: number) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function addDays(date: string, offsetDays: number) {
  return indexToDate(dateToIndex(date) + offsetDays);
}

function getSolarTermDate(year: string, name: "立春" | "春分" | "秋分") {
  return getSolarTerms({ year }).find((term) => term.name === name)?.date ?? null;
}

function getSolarTerm(
  year: string,
  name: "芒種" | "夏至" | "小暑",
) {
  return getSolarTerms({ year }).find((term) => term.name === name) ?? null;
}

function roundToMinute(date: Date) {
  return new Date(Math.round(date.getTime() / 60_000) * 60_000);
}

function formatFixedJst(date: Date) {
  const fixedJst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    fixedJst.getUTCFullYear(),
    "-",
    pad(fixedJst.getUTCMonth() + 1),
    "-",
    pad(fixedJst.getUTCDate()),
    "T",
    pad(fixedJst.getUTCHours()),
    ":",
    pad(fixedJst.getUTCMinutes()),
    ":00+09:00",
  ].join("");
}

function interpolateSolarLongitudeBoundary(
  year: string,
  previousName: "芒種" | "夏至",
  nextName: "夏至" | "小暑",
  targetLongitude: number,
) {
  const previous = getSolarTerm(year, previousName);
  const next = getSolarTerm(year, nextName);

  if (!previous || !next) {
    return null;
  }

  const longitudeSpan = next.solarLongitude - previous.solarLongitude;
  const ratio = (targetLongitude - previous.solarLongitude) / longitudeSpan;
  const previousTime = new Date(previous.datetimeJst).getTime();
  const nextTime = new Date(next.datetimeJst).getTime();
  const datetimeJst = formatFixedJst(
    roundToMinute(new Date(previousTime + (nextTime - previousTime) * ratio)),
  );

  return {
    date: datetimeJst.slice(0, 10),
    timeJst: datetimeJst.slice(11, 16),
    datetimeJst,
    previous,
    next,
  };
}

function buildHigan(
  year: string,
  solarTerm: "春分" | "秋分",
  code: "spring_higan" | "autumn_higan",
  name: "春彼岸" | "秋彼岸",
) {
  const anchorDate = getSolarTermDate(year, solarTerm);

  if (!anchorDate) {
    return [];
  }

  return Array.from({ length: 7 }, (_, index) => {
    const offsetDays = index - 3;
    const phase =
      offsetDays === -3
        ? "start"
        : offsetDays === 0
          ? "middle"
          : offsetDays === 3
            ? "end"
            : "period";
    const phaseLabel =
      phase === "start"
        ? "入り"
        : phase === "middle"
          ? "中日"
          : phase === "end"
            ? "明け"
            : `${Math.abs(offsetDays)}日${offsetDays < 0 ? "前" : "後"}`;

    return {
      date: addDays(anchorDate, offsetDays),
      code,
      name,
      label: `${name}${phaseLabel}`,
      phase,
      anchor: {
        solarTerm,
        date: anchorDate,
        offsetDays,
      },
      method: "higan_around_equinox",
      sourceStatus: "calculated_v0",
      verificationStatus: "needs_manual_almanac_check",
      note:
        "春分・秋分を中日として前後3日を彼岸期間とするv0。手元万年暦で追加検証する。",
    } satisfies ZassetsuEntry;
  });
}

function buildRisshunBasedEntry(
  year: string,
  code: "hachijuhachiya" | "nihyakutoka" | "nihyakuhatsuka",
  name: string,
  offsetDays: number,
) {
  const risshunDate = getSolarTermDate(year, "立春");

  if (!risshunDate) {
    return null;
  }

  return {
    date: addDays(risshunDate, offsetDays),
    code,
    name,
    label: name,
    phase: "single_day",
    anchor: {
      solarTerm: "立春",
      date: risshunDate,
      offsetDays,
    },
    method: "days_from_risshun",
    sourceStatus: "calculated_v0",
    verificationStatus: "needs_manual_almanac_check",
    note:
      "立春を起点に日数で算出するv0。数え方は万年暦と照合して確定する。",
  } satisfies ZassetsuEntry;
}

function buildSolarLongitudeEntry(
  year: string,
  code: "nyubai" | "hangesho",
  name: "入梅" | "半夏生",
  targetLongitude: 80 | 100,
  previousName: "芒種" | "夏至",
  nextName: "夏至" | "小暑",
) {
  const exactBoundary = getZassetsuSolarLongitudeBoundary(year, code);

  if (exactBoundary) {
    const previous = getSolarTerm(year, previousName);
    const referenceComparison =
      compareZassetsuSolarLongitudeReference(exactBoundary);
    const isReferenceMatched = referenceComparison.status === "matched";
    const isMinuteMatched =
      isReferenceMatched && referenceComparison.matchedPrecision === "minute";
    const isDateMatched =
      isReferenceMatched && referenceComparison.matchedPrecision === "date";

    return {
      date: exactBoundary.date,
      code,
      name,
      label: `${name} ${exactBoundary.timeJst}`,
      phase: "single_day",
      anchor: {
        solarTerm: previousName,
        date: previous?.date ?? exactBoundary.date,
        solarLongitude: targetLongitude,
        datetimeJst: exactBoundary.datetimeJst,
      },
      method: "solar_longitude_crossing",
      sourceStatus: isMinuteMatched
        ? "verified"
        : isDateMatched
          ? "date_verified"
          : "ephemeris_candidate_v0",
      verificationStatus: isMinuteMatched
        ? "verified_external_reference"
        : isDateMatched
          ? "verified_external_date_reference"
          : "needs_external_source_check",
      note:
        isMinuteMatched
          ? `${referenceComparison.reference.sourceName}の正本サンプルと日付・時刻が一致したため検証済み扱い。`
          : isDateMatched
            ? `${referenceComparison.reference.sourceName}の正本サンプルと日付が一致。時刻はSwiss Ephemeris生成値として別途検証対象。`
            : referenceComparison.status === "mismatched"
              ? `${referenceComparison.reference.sourceName}の正本サンプルと差分あり。${referenceComparison.diffs.join(" / ")}。計算エンジン・丸め・ΔT差を確認する。`
          : "太陽黄経の指定度数をSwiss Ephemerisで直接計算した正式化候補。keisan.siteまたは手元万年暦で照合後に検証済みマスターへ昇格する。",
    } satisfies ZassetsuEntry;
  }

  const boundary = interpolateSolarLongitudeBoundary(
    year,
    previousName,
    nextName,
    targetLongitude,
  );

  if (!boundary) {
    return null;
  }

  return {
    date: boundary.date,
    code,
    name,
    label: `${name} ${boundary.timeJst}`,
    phase: "single_day",
    anchor: {
      solarTerm: previousName,
      date: boundary.previous.date,
      solarLongitude: targetLongitude,
      datetimeJst: boundary.datetimeJst,
      interpolationFrom: {
        name: previousName,
        solarLongitude: boundary.previous.solarLongitude,
        datetimeJst: boundary.previous.datetimeJst,
      },
      interpolationTo: {
        name: nextName,
        solarLongitude: boundary.next.solarLongitude,
        datetimeJst: boundary.next.datetimeJst,
      },
    },
    method: "solar_longitude_interpolation",
    sourceStatus: "interpolated_v0",
    verificationStatus: "needs_exact_ephemeris_check",
    note:
      "太陽黄経の指定度数を、前後の検証済み二十四節気時刻から線形補間するv0。正式化時はSwiss Ephemeris生成値または万年暦で検算する。",
  } satisfies ZassetsuEntry;
}

export function getZassetsuEntries(year: string) {
  const risshunDate = getSolarTermDate(year, "立春");
  const entries: ZassetsuEntry[] = [];

  if (risshunDate) {
    entries.push({
      date: addDays(risshunDate, -1),
      code: "setsubun",
      name: "節分",
      label: "節分",
      phase: "single_day",
      anchor: {
        solarTerm: "立春",
        date: risshunDate,
        offsetDays: -1,
      },
      method: "day_before_risshun",
      sourceStatus: "calculated_v0",
      verificationStatus: "needs_manual_almanac_check",
      note:
        "立春の前日を節分とするv0。年により立春日が動くため二十四節気マスターを参照する。",
    });
  }

  entries.push(
    ...buildHigan(year, "春分", "spring_higan", "春彼岸"),
    ...buildHigan(year, "秋分", "autumn_higan", "秋彼岸"),
  );

  for (const entry of [
    buildSolarLongitudeEntry(year, "nyubai", "入梅", 80, "芒種", "夏至"),
    buildSolarLongitudeEntry(year, "hangesho", "半夏生", 100, "夏至", "小暑"),
    buildRisshunBasedEntry(year, "hachijuhachiya", "八十八夜", 87),
    buildRisshunBasedEntry(year, "nihyakutoka", "二百十日", 209),
    buildRisshunBasedEntry(year, "nihyakuhatsuka", "二百二十日", 219),
  ]) {
    if (entry) {
      entries.push(entry);
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function getZassetsuByDate(date: string) {
  return getZassetsuEntries(date.slice(0, 4)).filter(
    (entry) => entry.date === date,
  );
}

export function getZassetsuSummary(year: string) {
  const entries = getZassetsuEntries(year);
  const exactSummary = getZassetsuSolarLongitudeSummary(year);
  const referenceSamples = getZassetsuSolarLongitudeReferenceSamples(year);
  const exactEntries = entries.filter(
    (entry) => entry.method === "solar_longitude_crossing",
  );
  const exactEntriesAllMinuteVerified =
    exactEntries.length > 0 &&
    exactEntries.every((entry) => entry.sourceStatus === "verified");
  const exactEntriesAllDateChecked =
    exactEntries.length > 0 &&
    exactEntries.every(
      (entry) =>
        entry.sourceStatus === "verified" ||
        entry.sourceStatus === "date_verified",
    );

  return {
    year,
    total: entries.length,
    codes: [...new Set(entries.map((entry) => entry.code))],
    sourceStatus:
      referenceSamples.length > 0 && exactEntriesAllMinuteVerified
        ? "verified"
        : referenceSamples.length > 0 && exactEntriesAllDateChecked
          ? "date_verified"
          : exactSummary.total > 0
            ? "ephemeris_candidate_v0"
            : "calculated_v0",
    verificationStatus:
      referenceSamples.length > 0 && exactEntriesAllMinuteVerified
        ? "verified_external_reference"
        : referenceSamples.length > 0 && exactEntriesAllDateChecked
          ? "verified_external_date_reference"
          : exactSummary.total > 0
            ? "needs_external_source_check"
            : "needs_manual_almanac_check",
    note:
      exactSummary.total > 0
        ? "節分・彼岸・八十八夜・二百十日・二百二十日を二十四節気マスターから算出し、入梅・半夏生は太陽黄経80度/100度の直接計算値を正式化候補として採用する。"
        : "節分・彼岸・八十八夜・二百十日・二百二十日を二十四節気マスターから算出し、入梅・半夏生は前後の二十四節気時刻から太陽黄経80度/100度を補間するv0。",
  } as const;
}

export function getZassetsuVerificationSummary(
  year: string,
): ZassetsuVerificationSummary {
  const entries = getZassetsuEntries(year);
  const referenceSamples = getZassetsuSolarLongitudeReferenceSamples(year);
  const referenceComparisons = entries
    .filter(
      (
        entry,
      ): entry is ZassetsuEntry & {
        code: Extract<ZassetsuCode, "nyubai" | "hangesho">;
        name: "入梅" | "半夏生";
        anchor: ZassetsuEntry["anchor"] & { solarLongitude: 80 | 100 };
      } =>
        (entry.code === "nyubai" || entry.code === "hangesho") &&
        entry.method === "solar_longitude_crossing" &&
        entry.anchor.solarLongitude !== undefined,
    )
    .map((entry) => {
      const exactBoundary = getZassetsuSolarLongitudeBoundary(year, entry.code);
      const comparison = exactBoundary
        ? compareZassetsuSolarLongitudeReference(exactBoundary)
        : null;

      return {
        code: entry.code,
        name: entry.name,
        generated: {
          date: entry.date,
          timeJst: exactBoundary?.timeJst ?? null,
          solarLongitude: entry.anchor.solarLongitude,
        },
        reference: comparison?.reference
          ? {
              date: comparison.reference.date,
              timeJst: comparison.reference.timeJst,
              sourceName: comparison.reference.sourceName,
              verificationPrecision: comparison.reference.verificationPrecision,
            }
          : null,
        status: comparison?.status ?? "not_sampled",
        matchedPrecision: comparison?.matchedPrecision ?? null,
        diffs: [...(comparison?.diffs ?? [])],
      };
    });
  const manualSamplingTargets = entries
    .filter(
      (entry) =>
        entry.verificationStatus === "needs_manual_almanac_check" &&
        (entry.phase === "single_day" ||
          entry.phase === "start" ||
          entry.phase === "middle" ||
          entry.phase === "end"),
    )
    .map((entry) => ({
      date: entry.date,
      name: entry.label,
      method: entry.method,
      anchor:
        entry.anchor.offsetDays !== undefined
          ? `${entry.anchor.solarTerm} ${entry.anchor.date} ${entry.anchor.offsetDays}日`
          : `${entry.anchor.solarTerm} ${entry.anchor.date}`,
      reason:
        entry.method === "higan_around_equinox"
          ? "彼岸の入り・中日・明けが万年暦と一致するか確認する。"
          : "立春起算の日数系雑節が万年暦と一致するか確認する。",
    }));
  const hasExactNyubai = entries.some(
    (entry) =>
      entry.code === "nyubai" && entry.method === "solar_longitude_crossing",
  );
  const hasExactHangesho = entries.some(
    (entry) =>
      entry.code === "hangesho" && entry.method === "solar_longitude_crossing",
  );

  return {
    year,
    total: entries.length,
    referenceSamples,
    referenceComparisons,
    manualSamplingTargets,
    calculated: entries.filter((entry) => entry.sourceStatus === "calculated_v0")
      .length,
    verified: entries.filter((entry) => entry.sourceStatus === "verified").length,
    dateVerified: entries.filter((entry) => entry.sourceStatus === "date_verified")
      .length,
    ephemerisCandidate: entries.filter(
      (entry) => entry.sourceStatus === "ephemeris_candidate_v0",
    ).length,
    interpolated: entries.filter(
      (entry) => entry.sourceStatus === "interpolated_v0",
    ).length,
    needsManualAlmanacCheck: entries.filter(
      (entry) => entry.verificationStatus === "needs_manual_almanac_check",
    ).length,
    verifiedExternalReference: entries.filter(
      (entry) => entry.verificationStatus === "verified_external_reference",
    ).length,
    verifiedExternalDateReference: entries.filter(
      (entry) =>
        entry.verificationStatus === "verified_external_date_reference",
    ).length,
    needsExternalSourceCheck: entries.filter(
      (entry) => entry.verificationStatus === "needs_external_source_check",
    ).length,
    needsExactEphemerisCheck: entries.filter(
      (entry) => entry.verificationStatus === "needs_exact_ephemeris_check",
    ).length,
    adoptionStatus: "v0_mixed",
    validationSources: [
      {
        name: "高精度計算サイト 雑節",
        url: "https://keisan.site/exec/system/1186128796",
        role: "external_validation_candidate",
        note:
          "一年間の雑節を計算する参照候補。1950〜2050年は新こよみ便利帳との一致確認があるため、この範囲の検証に優先利用する。",
      },
      {
        name: "手元万年暦",
        url: "manual_almanac",
        role: "manual_visual_check",
        note:
          "明治期を含む古い年や、時刻の載る年の目視検証に使う。",
      },
    ],
    exactEphemerisTargets: [
      {
        code: "nyubai",
        name: "入梅",
        targetSolarLongitude: 80,
        currentMethod: "solar_longitude_interpolation",
        activeMethod: hasExactNyubai
          ? "solar_longitude_crossing"
          : "solar_longitude_interpolation",
        nextMethod: "solar_longitude_crossing",
      },
      {
        code: "hangesho",
        name: "半夏生",
        targetSolarLongitude: 100,
        currentMethod: "solar_longitude_interpolation",
        activeMethod: hasExactHangesho
          ? "solar_longitude_crossing"
          : "solar_longitude_interpolation",
        nextMethod: "solar_longitude_crossing",
      },
    ],
  };
}
