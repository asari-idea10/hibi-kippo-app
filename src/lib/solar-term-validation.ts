import { getCalendarDays } from "@/lib/calendar-day";
import { getSolarTermMasterSummary, getSolarTerms } from "@/lib/solar-terms";

type SolarTermKind = "二十四節気" | "雑節";

type NaojSeasonalEvent = {
  date: string;
  timeJst: string;
  name: string;
  kind: SolarTermKind;
  solarLongitude: string;
  expectedSetsuiri: boolean;
  appScope: "solarTerm" | "futureSeasonalEvent";
};

const naojSources = [
  {
    label: "国立天文台 暦計算室 令和8年(2026)暦要項",
    url: "https://eco.mtk.nao.ac.jp/koyomi/yoko/2026/rekiyou262.html",
  },
  {
    label: "国立天文台 暦計算室 二十四節気・雑節",
    url: "https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_s.cgi",
  },
];

const naojSolarTerms2026: NaojSeasonalEvent[] = getSolarTerms({
  year: "2026",
}).map((term) => ({
  date: term.date,
  timeJst: term.timeJst,
  name: term.name,
  kind: term.kind,
  solarLongitude: `${term.solarLongitude}度`,
  expectedSetsuiri: term.isSetsuiriForKyusei,
  appScope: "solarTerm",
}));

const naojSeasonalEvents2026: NaojSeasonalEvent[] = [
  ...naojSolarTerms2026,
  {
    date: "2026-06-11",
    timeJst: "06:14",
    name: "入梅",
    kind: "雑節",
    solarLongitude: "80度",
    expectedSetsuiri: false,
    appScope: "futureSeasonalEvent",
  },
];

function toValidationStatus(passed: number, total: number) {
  return passed === total ? "passed" : "failed";
}

export function getSolarTermValidation() {
  const days = getCalendarDays();
  const start = days[0]?.date;
  const end = days.at(-1)?.date;
  const masterSummary = getSolarTermMasterSummary();
  const eventsInRange = naojSeasonalEvents2026.filter(
    (event) => (!start || event.date >= start) && (!end || event.date <= end),
  );
  const solarTermChecks = eventsInRange
    .filter((event) => event.appScope === "solarTerm")
    .map((event) => {
      const day = days.find((value) => value.date === event.date);
      const actual = day?.solarTerm ?? {
        name: "",
        isSetsuiri: false,
        daysFromSetsuiri: null,
        official: null,
        crossCheck: {
          status: "not_applicable" as const,
          diffs: [],
        },
      };
      const nameMatched = actual.name === event.name;
      const setsuiriMatched = actual.isSetsuiri === event.expectedSetsuiri;

      return {
        date: event.date,
        expected: event,
        actual,
        matches: {
          name: nameMatched,
          setsuiri: setsuiriMatched,
        },
        passed: Boolean(day) && nameMatched && setsuiriMatched,
      };
    });
  const outOfScopeEvents = eventsInRange.filter(
    (event) => event.appScope === "futureSeasonalEvent",
  );
  const passed = solarTermChecks.filter((check) => check.passed).length;

  return {
    status: toValidationStatus(passed, solarTermChecks.length),
    source: {
      preferred: "国立天文台",
      sources: naojSources,
      timezone: "中央標準時",
    },
    master: masterSummary,
    policy: {
      solarTermName:
        "二十四節気の日付と名称は国立天文台の暦要項・二十四節気/雑節データで検算する。",
      setsuiri:
        "節入りは日々吉方エンジン上の月盤切替フラグとして扱う。二十四節気すべてではなく、節の側のみ true とする。",
      noAutoOverwrite:
        "差分が出ても自動上書きせず、diffsとして記録してマスターと照合する。",
      outOfScope:
        "雑節は現時点ではsolarTermではなく、将来のseasonalEventsまたは暦注マスターで扱う。",
    },
    summary: {
      checkedRows: days.length,
      checkedEvents: solarTermChecks.length,
      passed,
      failed: solarTermChecks.length - passed,
      outOfScopeEvents: outOfScopeEvents.length,
      dateRange: {
        start: start ?? null,
        end: end ?? null,
      },
    },
    checks: solarTermChecks,
    outOfScopeEvents,
  };
}
