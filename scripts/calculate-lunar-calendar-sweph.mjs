import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const MID_TERM_LONGITUDES = new Set([
  0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
]);

const TERM_NAMES = new Map([
  [0, "春分"],
  [30, "穀雨"],
  [60, "小満"],
  [90, "夏至"],
  [120, "大暑"],
  [150, "処暑"],
  [180, "秋分"],
  [210, "霜降"],
  [240, "小雪"],
  [270, "冬至"],
  [300, "大寒"],
  [330, "雨水"],
]);

const ROKUYO_BY_REMAINDER = ["大安", "赤口", "先勝", "友引", "先負", "仏滅"];

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const startYear = Number(readOption("--start-year") ?? 1900);
const endYear = Number(readOption("--end-year") ?? 2050);
const daysOutputPath =
  readOption("--days-output") ??
  "src/data/lunar-calendar-1900-2050.generated.json";
const monthsOutputPath =
  readOption("--months-output") ??
  "src/data/lunar-months-1900-2050.generated.json";
const swephModulePath = readOption("--sweph-module");
const ephePath = readOption("--ephe-path");

if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) {
  console.error(
    "Usage: npm run data:lunar-calendar:sweph -- --start-year <yyyy> --end-year <yyyy> --days-output <path> --months-output <path> --sweph-module <path>",
  );
  process.exit(1);
}

const requireFromCwd = createRequire(`${process.cwd()}/`);
const swe = swephModulePath
  ? requireFromCwd(swephModulePath)
  : requireFromCwd("sweph");
const constants = swephModulePath
  ? requireFromCwd(`${swephModulePath}/constants`)
  : requireFromCwd("sweph/constants");

if (ephePath) {
  swe.set_ephe_path(ephePath);
}

const calcFlags =
  (ephePath ? constants.SEFLG_SWIEPH : constants.SEFLG_MOSEPH) |
  constants.SEFLG_SPEED;

function pad(value) {
  return String(value).padStart(2, "0");
}

function toIsoJst(date) {
  const fixedJst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
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
    ":",
    pad(fixedJst.getUTCSeconds()),
    "+09:00",
  ].join("");
}

function dateOnlyJst(date) {
  return toIsoJst(date).slice(0, 10);
}

function jdUtToDate(jdUt) {
  return new Date((jdUt - 2440587.5) * 86400000);
}

function utcToJdUt(date) {
  const jd = swe.utc_to_jd(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds() + date.getUTCMilliseconds() / 1000,
    constants.SE_GREG_CAL,
  );

  if (jd.flag !== constants.OK) {
    throw new Error(jd.error);
  }

  return jd.data[1];
}

function calcLongitude(jdUt, body) {
  const result = swe.calc_ut(jdUt, body, calcFlags);

  if (!result.data || result.data.length === 0) {
    throw new Error(result.error || "Swiss Ephemeris calculation failed.");
  }

  return ((result.data[0] % 360) + 360) % 360;
}

function sunLongitude(jdUt) {
  return calcLongitude(jdUt, constants.SE_SUN);
}

function moonLongitude(jdUt) {
  return calcLongitude(jdUt, constants.SE_MOON);
}

function signedDifference(longitude, target) {
  return ((((longitude - target) % 360) + 540) % 360) - 180;
}

function elongation(jdUt) {
  return signedDifference(moonLongitude(jdUt), sunLongitude(jdUt));
}

function findSunBoundary(yearValue, targetLongitude) {
  const scanStepDays = 0.25;
  const start = Date.UTC(yearValue, 0, 1, 0, 0, 0);
  const end = Date.UTC(yearValue + 1, 0, 1, 0, 0, 0);
  let previousJd = utcToJdUt(new Date(start));
  let previousDiff = signedDifference(sunLongitude(previousJd), targetLongitude);

  for (
    let timestamp = start + scanStepDays * 86400000;
    timestamp <= end + 3 * 86400000;
    timestamp += scanStepDays * 86400000
  ) {
    const currentJd = utcToJdUt(new Date(timestamp));
    const currentDiff = signedDifference(sunLongitude(currentJd), targetLongitude);

    if (previousDiff < 0 && currentDiff >= 0) {
      return bisectBoundary(previousJd, currentJd, (jd) =>
        signedDifference(sunLongitude(jd), targetLongitude),
      );
    }

    previousJd = currentJd;
    previousDiff = currentDiff;
  }

  throw new Error(`Sun boundary not found: ${yearValue} ${targetLongitude}`);
}

function findNewMoons(startDateUtc, endDateUtc) {
  const scanStepDays = 0.25;
  const newMoons = [];
  let previousJd = utcToJdUt(startDateUtc);
  let previousDiff = elongation(previousJd);

  for (
    let timestamp = startDateUtc.getTime() + scanStepDays * 86400000;
    timestamp <= endDateUtc.getTime();
    timestamp += scanStepDays * 86400000
  ) {
    const currentJd = utcToJdUt(new Date(timestamp));
    const currentDiff = elongation(currentJd);

    if (previousDiff < 0 && currentDiff >= 0) {
      const jd = bisectBoundary(previousJd, currentJd, elongation);
      newMoons.push(jd);
    }

    previousJd = currentJd;
    previousDiff = currentDiff;
  }

  return newMoons;
}

function bisectBoundary(low, high, diffFn) {
  let left = low;
  let right = high;

  for (let iteration = 0; iteration < 48; iteration += 1) {
    const midpoint = (left + right) / 2;
    const midpointDiff = diffFn(midpoint);

    if (midpointDiff < 0) {
      left = midpoint;
    } else {
      right = midpoint;
    }
  }

  return right;
}

function makeDateRange(startDate, endDate) {
  const dates = [];
  const [startYearValue, startMonthValue, startDayValue] = startDate
    .split("-")
    .map((value) => Number(value));
  const [endYearValue, endMonthValue, endDayValue] = endDate
    .split("-")
    .map((value) => Number(value));

  for (
    let timestamp = Date.UTC(startYearValue, startMonthValue - 1, startDayValue);
    timestamp <= Date.UTC(endYearValue, endMonthValue - 1, endDayValue);
    timestamp += 86400000
  ) {
    dates.push(new Date(timestamp).toISOString().slice(0, 10));
  }
  return dates;
}

function roundDateToMinute(date) {
  const rounded = new Date(Math.round(date.getTime() / 60000) * 60000);
  return toIsoJst(rounded);
}

function getMidTerms(startYearValue, endYearValue) {
  const rows = [];

  for (let year = startYearValue; year <= endYearValue; year += 1) {
    for (const longitude of MID_TERM_LONGITUDES) {
      const jd = findSunBoundary(year, longitude);
      const date = jdUtToDate(jd);
      rows.push({
        jd,
        date: dateOnlyJst(date),
        datetimeJst: roundDateToMinute(date),
        name: TERM_NAMES.get(longitude),
        solarLongitude: longitude,
      });
    }
  }

  return rows.sort((a, b) => a.jd - b.jd);
}

function assignLunarMonths(newMoonJds, midTerms, generationStartYear, generationEndYear) {
  const winterSolstices = new Map();

  for (let year = generationStartYear - 1; year <= generationEndYear + 1; year += 1) {
    winterSolstices.set(year, findSunBoundary(year, 270));
  }

  const months = [];

  for (let year = generationStartYear - 1; year <= generationEndYear + 1; year += 1) {
    const winterSolstice = winterSolstices.get(year);
    const nextWinterSolstice = winterSolstices.get(year + 1);
    const periodNewMoons = newMoonJds.filter(
      (jd) => jd <= nextWinterSolstice && jd > winterSolstice - 40,
    );
    const month11Index = periodNewMoons.findLastIndex((jd) => jd <= winterSolstice);
    const nextMonth11Index = periodNewMoons.findLastIndex(
      (jd) => jd <= nextWinterSolstice,
    );

    if (month11Index === -1 || nextMonth11Index === -1) {
      continue;
    }

    const periodMonths = [];

    for (let index = month11Index; index < nextMonth11Index; index += 1) {
      const startJd = periodNewMoons[index];
      const endJd = periodNewMoons[index + 1];
      const chuki = midTerms.find(
        (term) => term.jd >= startJd && term.jd < endJd,
      );

      periodMonths.push({
        startJd,
        endJd,
        containsChuki: Boolean(chuki),
        chuki,
      });
    }

    const hasLeapMonth = periodMonths.length === 13;
    let lunarMonth = 11;
    let usedLeap = false;

    for (let index = 0; index < periodMonths.length; index += 1) {
      const periodMonth = periodMonths[index];
      const isLeapMonth =
        hasLeapMonth && !usedLeap && index > 0 && !periodMonth.containsChuki;

      if (isLeapMonth) {
        usedLeap = true;
      } else if (index > 0) {
        lunarMonth = lunarMonth === 12 ? 1 : lunarMonth + 1;
      }

      const lunarYear = lunarMonth >= 11 ? year : year + 1;

      months.push({
        ...periodMonth,
        lunarYear,
        lunarMonth,
        isLeapMonth,
      });
    }
  }

  const unique = new Map();
  for (const month of months) {
    unique.set(`${month.startJd.toFixed(8)}`, month);
  }

  return [...unique.values()].sort((a, b) => a.startJd - b.startJd);
}

const generationStartYear = startYear - 1;
const generationEndYear = endYear + 1;
const scanStart = new Date(Date.UTC(startYear - 2, 10, 1, 0, 0, 0));
const scanEnd = new Date(Date.UTC(endYear + 2, 1, 1, 0, 0, 0));

const newMoonJds = findNewMoons(scanStart, scanEnd);
const midTerms = getMidTerms(generationStartYear, generationEndYear);
const lunarMonths = assignLunarMonths(
  newMoonJds,
  midTerms,
  generationStartYear,
  generationEndYear,
);

const startDate = `${startYear}-01-01`;
const endDate = `${endYear}-12-31`;
const targetDates = makeDateRange(startDate, endDate);
const dayRows = [];

for (const date of targetDates) {
  const month = lunarMonths.find(
    (candidate) =>
      dateOnlyJst(jdUtToDate(candidate.startJd)) <= date &&
      date < dateOnlyJst(jdUtToDate(candidate.endJd)),
  );

  if (!month) {
    throw new Error(`Lunar month not found for ${date}`);
  }

  const newMoonDate = dateOnlyJst(jdUtToDate(month.startJd));
  const nextNewMoonDate = dateOnlyJst(jdUtToDate(month.endJd));
  const lunarDay =
    Math.floor(
      (Date.parse(`${date}T00:00:00+09:00`) -
        Date.parse(`${newMoonDate}T00:00:00+09:00`)) /
        86400000,
    ) + 1;
  const monthDayCount = Math.round(month.endJd - month.startJd);
  const rokuyoValue = (month.lunarMonth + lunarDay) % 6;
  const rokuyo = ROKUYO_BY_REMAINDER[rokuyoValue];

  dayRows.push({
    date,
    lunar: {
      year: month.lunarYear,
      month: month.lunarMonth,
      day: lunarDay,
      isLeapMonth: month.isLeapMonth,
      monthIndexInYear: month.lunarMonth,
      monthKey: `${month.lunarYear}-${month.isLeapMonth ? "leap-" : ""}${pad(month.lunarMonth)}`,
      monthSize: monthDayCount === 30 ? "large" : "small",
      monthDayCount,
      newMoonDate,
      nextNewMoonDate,
      display: `旧暦${month.isLeapMonth ? "閏" : ""}${month.lunarMonth}月${lunarDay}日`,
    },
    rokuyo: {
      name: rokuyo,
      index: rokuyoValue,
      calculation: {
        method: "lunar_month_plus_lunar_day_mod_6",
        formula: "(lunarMonth + lunarDay) % 6",
        value: rokuyoValue,
      },
      displayText: rokuyo,
    },
    sourceStatus: "calculated",
    verification: {
      status: "pending",
      checkedFields: [],
      sources: [],
      diffs: [],
    },
    generator: {
      method: "swiss_ephemeris_new_moon_and_mid_term",
      version: "v1",
      generatedAt: toIsoJst(new Date()),
    },
  });
}

const monthRows = lunarMonths
  .filter((month) => {
    const startDateOnly = dateOnlyJst(jdUtToDate(month.startJd));
    const endDateOnly = dateOnlyJst(jdUtToDate(month.endJd));
    return endDateOnly >= startDate && startDateOnly <= endDate;
  })
  .map((month) => {
    const dayCount = Math.round(month.endJd - month.startJd);
    return {
      monthKey: `${month.lunarYear}-${month.isLeapMonth ? "leap-" : ""}${pad(month.lunarMonth)}`,
      lunarYear: month.lunarYear,
      lunarMonth: month.lunarMonth,
      isLeapMonth: month.isLeapMonth,
      monthIndexInYear: month.lunarMonth,
      monthSize: dayCount === 30 ? "large" : "small",
      dayCount,
      newMoonDate: dateOnlyJst(jdUtToDate(month.startJd)),
      newMoonDatetimeJst: roundDateToMinute(jdUtToDate(month.startJd)),
      nextNewMoonDate: dateOnlyJst(jdUtToDate(month.endJd)),
      nextNewMoonDatetimeJst: roundDateToMinute(jdUtToDate(month.endJd)),
      containsChuki: month.containsChuki,
      chukiName: month.chuki?.name ?? null,
      chukiDate: month.chuki?.date ?? null,
      sourceStatus: "calculated",
      verification: {
        status: "pending",
        sources: [],
        diffs: [],
      },
      sourceNote:
        "Swiss Ephemerisで朔と中気を計算して生成。万年暦/第三者旧暦表で検算後にverifiedへ昇格する。",
    };
  });

await writeFile(daysOutputPath, `${JSON.stringify(dayRows, null, 2)}\n`);
await writeFile(monthsOutputPath, `${JSON.stringify(monthRows, null, 2)}\n`);

console.log(
  `Calculated lunar calendar ${dayRows.length} days and ${monthRows.length} months: ${startYear}-${endYear}`,
);
console.log(`days: ${daysOutputPath}`);
console.log(`months: ${monthsOutputPath}`);
