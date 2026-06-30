import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);

  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const stdJsPath = readOption("--koyomi-std");
const yearsArg = readOption("--years") ?? "1900,1950,1976,2000,2021,2026,2050";
const startYearArg = readOption("--start-year");
const endYearArg = readOption("--end-year");
const outputPath =
  readOption("--output") ??
  "data-workbench/doyo/verification-reports/doyo-koyomi-sample-alignment.json";
const periodsOutputPath = readOption("--periods-output");
const appPeriodsPath = readOption("--app-periods");
const solarTermsPath =
  readOption("--solar-terms") ?? "src/data/solar-terms-1900-2050.verified.json";

if (!stdJsPath) {
  console.error(
    "Usage: node scripts/compare-doyo-koyomi.mjs --koyomi-std /path/to/std.js --years 1900,1950,2026",
  );
  process.exit(1);
}

const doyoDefinitions = [
  {
    id: "winter",
    label: "冬土用",
    startSolarLongitude: 297,
    endSolarLongitude: 315,
    boundaryTerm: "立春",
    previousTerm: "小寒",
    nextTerm: "大寒",
    manichiIndexes: [2, 3, 5],
    manichiBranches: ["寅", "卯", "巳"],
    doyoSatsuDirection: "北東",
  },
  {
    id: "spring",
    label: "春土用",
    startSolarLongitude: 27,
    endSolarLongitude: 45,
    boundaryTerm: "立夏",
    previousTerm: "清明",
    nextTerm: "穀雨",
    manichiIndexes: [5, 6, 9],
    manichiBranches: ["巳", "午", "酉"],
    doyoSatsuDirection: "南東",
  },
  {
    id: "summer",
    label: "夏土用",
    startSolarLongitude: 117,
    endSolarLongitude: 135,
    boundaryTerm: "立秋",
    previousTerm: "小暑",
    nextTerm: "大暑",
    manichiIndexes: [3, 4, 8],
    manichiBranches: ["卯", "辰", "申"],
    doyoSatsuDirection: "南西",
  },
  {
    id: "autumn",
    label: "秋土用",
    startSolarLongitude: 207,
    endSolarLongitude: 225,
    boundaryTerm: "立冬",
    previousTerm: "寒露",
    nextTerm: "霜降",
    manichiIndexes: [7, 9, 11],
    manichiBranches: ["未", "酉", "亥"],
    doyoSatsuDirection: "北西",
  },
];

function dateToIndex(date) {
  const [year, month, day] = date.split("-").map((value) => Number(value));

  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function indexToDate(index) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

function timestampToFixedJstDate(timestamp) {
  return new Date(timestamp + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function yearDayToDate(year, dayOfYear) {
  const date = new Date(Date.UTC(year, 0, dayOfYear));

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
}

function getTermsByYear(terms) {
  return terms.reduce((accumulator, term) => {
    const year = term.date.slice(0, 4);
    accumulator[year] ??= [];
    accumulator[year].push(term);

    return accumulator;
  }, {});
}

function getHibiKippoPeriods(year, termsByYear) {
  const terms = termsByYear[String(year)] ?? [];

  return doyoDefinitions.flatMap((definition) => {
    const previous = terms.find((term) => term.name === definition.previousTerm);
    const next = terms.find((term) => term.name === definition.nextTerm);
    const boundary = terms.find((term) => term.name === definition.boundaryTerm);

    if (!previous || !next || !boundary) {
      return [];
    }

    const longitudeSpan = next.solarLongitude - previous.solarLongitude;
    const ratio =
      (definition.startSolarLongitude - previous.solarLongitude) / longitudeSpan;
    const crossingTime =
      new Date(previous.datetimeJst).getTime() +
      (new Date(next.datetimeJst).getTime() -
        new Date(previous.datetimeJst).getTime()) *
        ratio;

    return [
      {
        id: definition.id,
        label: definition.label,
        startDate: timestampToFixedJstDate(crossingTime),
        endDate: indexToDate(dateToIndex(boundary.date) - 1),
        startSolarLongitude: definition.startSolarLongitude,
        endSolarLongitude: definition.endSolarLongitude,
        manichiBranches: definition.manichiBranches,
        doyoSatsuDirection: definition.doyoSatsuDirection,
        method: "hibi_kippo_interpolation_v0",
      },
    ];
  });
}

function getAppStaticPeriods(year, appPeriodRows) {
  return appPeriodRows
    .filter((period) => period.year === String(year))
    .map((period) => ({
      ...period,
      id: period.season,
      method: period.method ?? "app_static_master",
    }));
}

function buildKoyomiContext(stdJsSource) {
  const context = {
    console,
    navigator: {
      appVersion: "5.0",
      userAgent: "Node.js",
    },
    document: {
      cookie: "",
      write() {},
      writeln() {},
    },
    top: {},
    Math,
    Date,
    Array,
    Number,
    String,
    parseFloat,
    parseInt,
    isNaN,
  };

  vm.createContext(context);
  vm.runInContext(stdJsSource, context);

  return context;
}

function getKoyomiPeriods(year, context) {
  const dofs = 9.0 / 24.0 - context.deltaT(year) / 86400.0;
  const yyday0 = context.Ymd2Jd(year, 1, 0);

  return doyoDefinitions.map((definition) => {
    const startDay = Math.floor(
      context.Sunlongdays(year, definition.startSolarLongitude) + dofs,
    );
    let endDay =
      context.Sunlongdays(year, definition.endSolarLongitude) + dofs - 1.0;

    if (year === 2021 && definition.endSolarLongitude === 315) {
      endDay -= 2.0 / 1440.0;
    }

    const flooredEndDay = Math.floor(endDay);
    const manichi = [];

    for (let day = startDay; day <= flooredEndDay; day += 1) {
      const branchIndex = (yyday0 + day + context.KSDofs) % 12;

      if (definition.manichiIndexes.includes(branchIndex)) {
        manichi.push({
          date: yearDayToDate(year, day),
          branch: context.Shi[branchIndex],
        });
      }
    }

    return {
      id: definition.id,
      label: definition.label,
      startDate: yearDayToDate(year, startDay),
      endDate: yearDayToDate(year, flooredEndDay),
      startSolarLongitude: definition.startSolarLongitude,
      endSolarLongitude: definition.endSolarLongitude,
      manichi,
      method: "koyomi8_public_js",
    };
  });
}

function buildKoyomiPeriodData(year, koyomiPeriods, termsByYear) {
  const terms = termsByYear[String(year)] ?? [];

  return koyomiPeriods.flatMap((period) => {
    const definition = doyoDefinitions.find((entry) => entry.id === period.id);

    if (!definition) {
      return [];
    }

    const boundary = terms.find(
      (term) => term.name === definition.boundaryTerm,
    );

    if (!boundary) {
      return [];
    }

    return [
      {
        id: `${year}-${definition.id}-doyo`,
        year: String(year),
        season: definition.id,
        label: definition.label,
        startDate: period.startDate,
        endDate: period.endDate,
        startSolarLongitude: definition.startSolarLongitude,
        endSolarLongitude: definition.endSolarLongitude,
        boundaryTerm: {
          name: definition.boundaryTerm,
          date: boundary.date,
          timeJst: boundary.timeJst,
        },
        doyoSatsuDirection: definition.doyoSatsuDirection,
        manichiBranches: definition.manichiBranches,
        manichi: period.manichi,
        method: "koyomi8_public_js_generated_v0",
        sourceStatus: "koyomi_reference_priority_v0",
        sourceUrl: "https://koyomi8.com/sub/doyou.html",
        note:
          "こよみのページ公開JS計算を検証用に実行して生成した土用マスター。本体には外部JSを組み込まず、この静的JSONを参照する。",
      },
    ];
  });
}

function comparePeriods(year, hibiKippoPeriods, koyomiPeriods) {
  return doyoDefinitions.map((definition) => {
    const hibiKippo = hibiKippoPeriods.find(
      (period) => period.id === definition.id,
    );
    const koyomi = koyomiPeriods.find((period) => period.id === definition.id);
    const diffs = [];

    if (!hibiKippo || !koyomi) {
      diffs.push("period_missing");
    } else {
      if (hibiKippo.startDate !== koyomi.startDate) {
        diffs.push(`startDate ${hibiKippo.startDate} != ${koyomi.startDate}`);
      }

      if (hibiKippo.endDate !== koyomi.endDate) {
        diffs.push(`endDate ${hibiKippo.endDate} != ${koyomi.endDate}`);
      }
    }

    return {
      year,
      season: definition.id,
      label: definition.label,
      status: diffs.length === 0 ? "matched" : "mismatched",
      hibiKippo,
      koyomi,
      diffs,
    };
  });
}

const [stdJsSource, solarTermsRaw, appPeriodsRaw] = await Promise.all([
  readFile(stdJsPath, "utf8"),
  readFile(solarTermsPath, "utf8"),
  appPeriodsPath ? readFile(appPeriodsPath, "utf8") : Promise.resolve("[]"),
]);
const context = buildKoyomiContext(stdJsSource);
const termsByYear = getTermsByYear(JSON.parse(solarTermsRaw));
const appPeriodRows = JSON.parse(appPeriodsRaw);
const startYear = startYearArg ? Number(startYearArg) : null;
const endYear = endYearArg ? Number(endYearArg) : null;
const years =
  Number.isInteger(startYear) && Number.isInteger(endYear)
    ? Array.from(
        { length: Math.max(0, endYear - startYear + 1) },
        (_, index) => startYear + index,
      )
    : yearsArg
        .split(",")
        .map((year) => Number(year.trim()))
        .filter((year) => Number.isInteger(year));
const koyomiPeriodsByYear = new Map(
  years.map((year) => [year, getKoyomiPeriods(year, context)]),
);
const rows = years.flatMap((year) =>
  comparePeriods(
    year,
    appPeriodsPath
      ? getAppStaticPeriods(year, appPeriodRows)
      : getHibiKippoPeriods(year, termsByYear),
    koyomiPeriodsByYear.get(year) ?? [],
  ),
);
const mismatched = rows.filter((row) => row.status === "mismatched");
const report = {
  schemaVersion: "doyo_koyomi_alignment_report.v0",
  generatedAt: new Date().toISOString(),
  years,
  summary: {
    total: rows.length,
    matched: rows.length - mismatched.length,
    mismatched: mismatched.length,
    status: mismatched.length === 0 ? "matched" : "has_diffs",
  },
  sourcePolicy: {
    preferredReference: "こよみのページ 土用と間日",
    preferredReferenceUrl: "https://koyomi8.com/sub/doyou.html",
    appMethod: appPeriodsPath
      ? "app_static_doyo_period_master"
      : "hibi_kippo_interpolation_v0",
    note:
      "本体には外部JSやSwiss Ephemerisを組み込まず、検証スクリプトでこよみのページ公開JS計算と突き合わせる。",
  },
  rows,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

if (periodsOutputPath) {
  const periodData = years.flatMap((year) =>
    buildKoyomiPeriodData(
      year,
      koyomiPeriodsByYear.get(year) ?? [],
      termsByYear,
    ),
  );
  await mkdir(path.dirname(periodsOutputPath), { recursive: true });
  await writeFile(periodsOutputPath, `${JSON.stringify(periodData, null, 2)}\n`);
  console.log(
    `Wrote ${periodData.length} koyomi doyo periods -> ${periodsOutputPath}`,
  );
}

console.log(
  `Doyo koyomi alignment: ${report.summary.matched}/${report.summary.total} matched -> ${outputPath}`,
);

if (mismatched.length > 0) {
  console.log(
    mismatched
      .map((row) => `${row.year} ${row.label}: ${row.diffs.join(" / ")}`)
      .join("\n"),
  );
}
