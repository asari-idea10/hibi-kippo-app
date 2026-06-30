import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

const ZASSETSU_BY_LONGITUDE = new Map([
  [80, { code: "nyubai", name: "入梅" }],
  [100, { code: "hangesho", name: "半夏生" }],
]);

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const year = Number(readOption("--year") ?? args[0]);
const startYear = Number(readOption("--start-year") ?? year);
const endYear = Number(readOption("--end-year") ?? year);
const outputPath = readOption("--output") ?? args[1];
const swephModulePath = readOption("--sweph-module");
const ephePath = readOption("--ephe-path");

if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || !outputPath) {
  console.error(
    "Usage: npm run data:zassetsu-solar-longitudes:sweph -- --year <yyyy> --output <output.json> --sweph-module <path>",
  );
  console.error(
    "   or: npm run data:zassetsu-solar-longitudes:sweph -- --start-year <yyyy> --end-year <yyyy> --output <output.json> --sweph-module <path>",
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

function sunLongitude(jdUt) {
  const result = swe.calc_ut(jdUt, constants.SE_SUN, calcFlags);

  if (!result.data || result.data.length === 0) {
    throw new Error(result.error || "Swiss Ephemeris calculation failed.");
  }

  return ((result.data[0] % 360) + 360) % 360;
}

function signedDifference(longitude, target) {
  return ((((longitude - target) % 360) + 540) % 360) - 180;
}

function findBoundary(yearValue, targetLongitude) {
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
      let low = previousJd;
      let high = currentJd;

      for (let iteration = 0; iteration < 48; iteration += 1) {
        const midpoint = (low + high) / 2;
        const midpointDiff = signedDifference(
          sunLongitude(midpoint),
          targetLongitude,
        );

        if (midpointDiff < 0) {
          low = midpoint;
        } else {
          high = midpoint;
        }
      }

      return high;
    }

    previousJd = currentJd;
    previousDiff = currentDiff;
  }

  throw new Error(`Boundary not found: ${yearValue} ${targetLongitude}`);
}

function roundDateToMinute(date) {
  const rounded = new Date(Math.round(date.getTime() / 60000) * 60000);
  return toIsoJst(rounded);
}

const rows = [];

for (let targetYear = startYear; targetYear <= endYear; targetYear += 1) {
  const yearRows = [];

  for (const [solarLongitude, definition] of ZASSETSU_BY_LONGITUDE) {
    const jdUt = findBoundary(targetYear, solarLongitude);
    const date = jdUtToDate(jdUt);
    const exactDatetimeJst = toIsoJst(date);
    const datetimeJst = roundDateToMinute(date);

    yearRows.push({
      date: datetimeJst.slice(0, 10),
      code: definition.code,
      name: definition.name,
      kind: "雑節",
      timeJst: datetimeJst.slice(11, 16),
      datetimeJst,
      datetimeJstPrecision: "minute",
      exactDatetimeJst,
      boundaryMethod: "solar_longitude_crossing",
      solarLongitude,
      source: "swiss_ephemeris",
      sourceUrl: "https://www.astro.com/swisseph/",
      sourceNote: ephePath
        ? "Swiss Ephemeris SWIEPHで秒単位計算。keisan.site/万年暦で検算して正式採用する。"
        : "Swiss Ephemeris Moshierで秒単位計算。高精度エフェメリスファイル導入後に再検算する。",
      licenseNote:
        "Swiss Ephemeris/swephは本体アプリへ組み込まず、開発時の生成・検証用途に限定する。",
      calculationEngine: {
        name: "Swiss Ephemeris",
        library: "sweph",
        version: swe.version(),
        flags: ephePath ? "SEFLG_SWIEPH|SEFLG_SPEED" : "SEFLG_MOSEPH|SEFLG_SPEED",
        ephePath: ephePath ?? null,
      },
    });
  }

  rows.push(...yearRows.sort((a, b) => a.date.localeCompare(b.date)));
}

await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(
  `Calculated ${rows.length} zassetsu solar-longitude boundaries: ${startYear}-${endYear} -> ${outputPath}`,
);
