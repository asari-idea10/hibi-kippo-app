import regressionSamplesData from "@/data/regression/calendar-regression-samples.v0.json";

export type CalendarRegressionExpectation = {
  doyo?: boolean;
  doyoLabelIncludes?: string[];
  goodFortuneNamesInclude?: string[];
  hourBoardCount?: number;
  isSetsuiri?: boolean;
  junichoku?: string;
  kuubou?: string;
  nationalHoliday?: string;
  nijuhachishuku?: string;
  rokuyo?: string;
  selectedDayNamesInclude?: string[];
  solarTerm?: string;
  dayKyusei?: string;
  dayPillar?: string;
};

export type CalendarRegressionSample = {
  id: string;
  date: string;
  label: string;
  purpose: string;
  tags: string[];
  expect: CalendarRegressionExpectation;
};

export type CalendarRegressionSampleMaster = {
  schemaVersion: string;
  updatedAt: string;
  defaultBaseUrl: string;
  notes: string[];
  samples: CalendarRegressionSample[];
};

const regressionSampleMaster =
  regressionSamplesData as CalendarRegressionSampleMaster;

export function getCalendarRegressionSampleMaster() {
  return regressionSampleMaster;
}

export function getCalendarRegressionSamples() {
  return regressionSampleMaster.samples;
}

export function getCalendarRegressionSampleSummary() {
  const samples = getCalendarRegressionSamples();
  const tagCounts = samples.reduce<Record<string, number>>((acc, sample) => {
    for (const tag of sample.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }

    return acc;
  }, {});

  return {
    total: samples.length,
    updatedAt: regressionSampleMaster.updatedAt,
    schemaVersion: regressionSampleMaster.schemaVersion,
    tagCounts,
    importantTags: Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count })),
  };
}
