export type JapaneseEraCode =
  | "meiji"
  | "taisho"
  | "showa"
  | "heisei"
  | "reiwa";

export type JapaneseEraDefinition = {
  code: JapaneseEraCode;
  name: string;
  alphabet: string;
  startDate: string;
  startYear: number;
};

export type JapaneseEraDateContext = {
  date: string;
  westernYear: number;
  era: {
    code: JapaneseEraCode;
    name: string;
    alphabet: string;
    year: number;
    yearLabel: string;
    display: string;
  };
  candidatesForWesternYear: JapaneseEraYearCandidate[];
  sourceStatus: "verified";
  verificationStatus: "manual_boundary_checked";
  sourceUrl: string;
  sourceNote: string;
};

export type JapaneseEraVerificationSample = {
  date: string;
  expectedDisplay: string;
  expectedAlphabet: string;
  kind: "boundary_before" | "boundary_start" | "normal";
  sourceName: string;
  sourceNote: string;
};

export type JapaneseEraYearCandidateVerificationSample = {
  westernYear: number;
  expectedDisplays: string[];
  sourceName: string;
  sourceNote: string;
};

export type JapaneseEraYearCandidate = {
  code: JapaneseEraCode;
  name: string;
  alphabet: string;
  year: number;
  yearLabel: string;
  display: string;
  startDate: string;
};

const eraDefinitions: JapaneseEraDefinition[] = [
  {
    code: "meiji",
    name: "明治",
    alphabet: "M",
    startDate: "1868-10-23",
    startYear: 1868,
  },
  {
    code: "taisho",
    name: "大正",
    alphabet: "T",
    startDate: "1912-07-30",
    startYear: 1912,
  },
  {
    code: "showa",
    name: "昭和",
    alphabet: "S",
    startDate: "1926-12-25",
    startYear: 1926,
  },
  {
    code: "heisei",
    name: "平成",
    alphabet: "H",
    startDate: "1989-01-08",
    startYear: 1989,
  },
  {
    code: "reiwa",
    name: "令和",
    alphabet: "R",
    startDate: "2019-05-01",
    startYear: 2019,
  },
];

const eraDateVerificationSamples: JapaneseEraVerificationSample[] = [
  {
    date: "1912-07-29",
    expectedDisplay: "明治45年",
    expectedAlphabet: "M45",
    kind: "boundary_before",
    sourceName: "近現代改元日ルール",
    sourceNote: "大正改元前日。日付境界の検証サンプル。",
  },
  {
    date: "1912-07-30",
    expectedDisplay: "大正元年",
    expectedAlphabet: "T1",
    kind: "boundary_start",
    sourceName: "近現代改元日ルール",
    sourceNote: "大正改元日。日付境界の検証サンプル。",
  },
  {
    date: "1926-12-24",
    expectedDisplay: "大正15年",
    expectedAlphabet: "T15",
    kind: "boundary_before",
    sourceName: "近現代改元日ルール",
    sourceNote: "昭和改元前日。日付境界の検証サンプル。",
  },
  {
    date: "1926-12-25",
    expectedDisplay: "昭和元年",
    expectedAlphabet: "S1",
    kind: "boundary_start",
    sourceName: "近現代改元日ルール",
    sourceNote: "昭和改元日。日付境界の検証サンプル。",
  },
  {
    date: "1989-01-07",
    expectedDisplay: "昭和64年",
    expectedAlphabet: "S64",
    kind: "boundary_before",
    sourceName: "近現代改元日ルール",
    sourceNote: "平成改元前日。日付境界の検証サンプル。",
  },
  {
    date: "1989-01-08",
    expectedDisplay: "平成元年",
    expectedAlphabet: "H1",
    kind: "boundary_start",
    sourceName: "近現代改元日ルール",
    sourceNote: "平成改元日。日付境界の検証サンプル。",
  },
  {
    date: "2019-04-30",
    expectedDisplay: "平成31年",
    expectedAlphabet: "H31",
    kind: "boundary_before",
    sourceName: "近現代改元日ルール",
    sourceNote: "令和改元前日。日付境界の検証サンプル。",
  },
  {
    date: "2019-05-01",
    expectedDisplay: "令和元年",
    expectedAlphabet: "R1",
    kind: "boundary_start",
    sourceName: "近現代改元日ルール",
    sourceNote: "令和改元日。日付境界の検証サンプル。",
  },
];

const eraYearCandidateVerificationSamples: JapaneseEraYearCandidateVerificationSample[] = [
  {
    westernYear: 1912,
    expectedDisplays: ["明治45年", "大正元年"],
    sourceName: "こよみのページ 元号年・西暦年変換",
    sourceNote:
      "こよみのページの西暦→元号変換は年単位で改元年の複数候補を扱う。",
  },
  {
    westernYear: 1926,
    expectedDisplays: ["大正15年", "昭和元年"],
    sourceName: "こよみのページ 元号年・西暦年変換",
    sourceNote:
      "こよみのページの西暦→元号変換は年単位で改元年の複数候補を扱う。",
  },
  {
    westernYear: 1989,
    expectedDisplays: ["昭和64年", "平成元年"],
    sourceName: "こよみのページ 元号年・西暦年変換",
    sourceNote:
      "こよみのページの西暦→元号変換は年単位で改元年の複数候補を扱う。",
  },
  {
    westernYear: 2019,
    expectedDisplays: ["平成31年", "令和元年"],
    sourceName: "こよみのページ 元号年・西暦年変換",
    sourceNote:
      "こよみのページの西暦→元号変換は年単位で改元年の複数候補を扱う。",
  },
];

function toEraYearLabel(eraYear: number) {
  return eraYear === 1 ? "元" : String(eraYear);
}

function toEraCandidate(
  definition: JapaneseEraDefinition,
  westernYear: number,
): JapaneseEraYearCandidate {
  const year = westernYear - definition.startYear + 1;
  const yearLabel = toEraYearLabel(year);

  return {
    code: definition.code,
    name: definition.name,
    alphabet: definition.alphabet,
    year,
    yearLabel,
    display: `${definition.name}${yearLabel}年`,
    startDate: definition.startDate,
  };
}

function getWesternYear(date: string) {
  return Number.parseInt(date.slice(0, 4), 10);
}

export function getJapaneseEraDateContext(
  date: string,
): JapaneseEraDateContext {
  const westernYear = getWesternYear(date);
  const definition =
    [...eraDefinitions]
      .reverse()
      .find((candidate) => date >= candidate.startDate) ?? eraDefinitions[0];
  const era = toEraCandidate(definition, westernYear);

  return {
    date,
    westernYear,
    era,
    candidatesForWesternYear: getJapaneseEraYearCandidates(westernYear),
    sourceStatus: "verified",
    verificationStatus: "manual_boundary_checked",
    sourceUrl: "https://koyomi8.com/sub/tool/gengoucalc.html",
    sourceNote:
      "近現代の元号開始日をもとに日付から元号年を算出する。西暦年だけで見る場合、改元年は複数元号候補を表示する。改元境界は手元確認済み。",
  };
}

export function getJapaneseEraYearCandidates(
  westernYear: number,
): JapaneseEraYearCandidate[] {
  return eraDefinitions
    .filter((definition, index) => {
      const nextDefinition = eraDefinitions[index + 1];
      const eraStartYear = definition.startYear;
      const eraEndYear = nextDefinition
        ? nextDefinition.startYear
        : Number.POSITIVE_INFINITY;

      return westernYear >= eraStartYear && westernYear <= eraEndYear;
    })
    .map((definition) => toEraCandidate(definition, westernYear));
}

export function getJapaneseEraDefinitions() {
  return eraDefinitions;
}

export function getJapaneseEraVerificationSummary() {
  const dateSamples = eraDateVerificationSamples.map((sample) => {
    const actual = getJapaneseEraDateContext(sample.date);
    const actualAlphabet = `${actual.era.alphabet}${actual.era.year}`;
    const diffs = [
      actual.era.display !== sample.expectedDisplay
        ? `display: actual=${actual.era.display} / expected=${sample.expectedDisplay}`
        : null,
      actualAlphabet !== sample.expectedAlphabet
        ? `alphabet: actual=${actualAlphabet} / expected=${sample.expectedAlphabet}`
        : null,
    ].filter((diff): diff is string => Boolean(diff));

    return {
      ...sample,
      actualDisplay: actual.era.display,
      actualAlphabet,
      status: diffs.length === 0 ? "matched" : "mismatched",
      diffs,
    };
  });

  const yearCandidateSamples = eraYearCandidateVerificationSamples.map(
    (sample) => {
      const actualDisplays = getJapaneseEraYearCandidates(
        sample.westernYear,
      ).map((candidate) => candidate.display);
      const diffs = [
        actualDisplays.join(" / ") !== sample.expectedDisplays.join(" / ")
          ? `candidates: actual=${actualDisplays.join(" / ")} / expected=${sample.expectedDisplays.join(" / ")}`
          : null,
      ].filter((diff): diff is string => Boolean(diff));

      return {
        ...sample,
        actualDisplays,
        status: diffs.length === 0 ? "matched" : "mismatched",
        diffs,
      };
    },
  );

  return {
    sourceStatus: "verified",
    verificationStatus:
      dateSamples.every((sample) => sample.status === "matched") &&
      yearCandidateSamples.every((sample) => sample.status === "matched")
        ? "manual_boundary_checked"
        : "needs_koyomi_page_check",
    sourceUrl: "https://koyomi8.com/sub/tool/gengoucalc.html",
    note:
      "西暦年候補はこよみのページ式の年単位候補に合わせ、日付判定は近現代の改元開始日を境界にする。",
    dateSamples,
    yearCandidateSamples,
  };
}
