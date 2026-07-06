import { readFile } from "node:fs/promises";

const samplesPath =
  process.env.HIBI_KIPPO_REGRESSION_SAMPLES ??
  "src/data/regression/calendar-regression-samples.v0.json";

const baseUrl = process.env.HIBI_KIPPO_BASE_URL ?? "http://127.0.0.1:3000";

const kyuseiNameByNumber = {
  1: "一白水星",
  2: "二黒土星",
  3: "三碧木星",
  4: "四緑木星",
  5: "五黄土星",
  6: "六白金星",
  7: "七赤金星",
  8: "八白土星",
  9: "九紫火星",
};

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchJson(path) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json();
}

function namesFromDefinitions(definitions) {
  return (definitions ?? []).map((definition) => definition?.name).filter(Boolean);
}

function normalizeKyusei(value) {
  const key = String(value ?? "").trim();

  return kyuseiNameByNumber[key] ?? key;
}

function includesAnyText(values, expected) {
  return values.some((value) => String(value).includes(expected));
}

function assertEqual(checks, label, actual, expected) {
  if (expected === undefined) {
    return;
  }

  checks.push({
    label,
    actual,
    expected,
    passed: actual === expected,
  });
}

function assertIncludesAll(checks, label, actualValues, expectedValues = []) {
  for (const expected of expectedValues) {
    checks.push({
      label,
      actual: actualValues.join(" / ") || "-",
      expected,
      passed: includesAnyText(actualValues, expected),
    });
  }
}

function assertNumber(checks, label, actual, expected) {
  if (expected === undefined) {
    return;
  }

  checks.push({
    label,
    actual,
    expected,
    passed: actual === expected,
  });
}

async function verifySample(sample) {
  const [
    calendarDay,
    goodFortuneDirections,
    hourBoard,
    directionDeities,
    doyoChecks,
  ] =
    await Promise.all([
      fetchJson(`/api/calendar-day?date=${sample.date}`),
      fetchJson(`/api/good-fortune-directions?date=${sample.date}`),
      fetchJson(`/api/hour-board?date=${sample.date}`),
      fetchJson(`/api/direction-deities?date=${sample.date}`),
      fetchJson(`/api/doyo-checks?start=${sample.date}&end=${sample.date}`),
    ]);
  const expect = sample.expect ?? {};
  const checks = [];
  const doyoComparison = doyoChecks.rows?.[0]?.comparison ?? null;
  const selectedDayNames = namesFromDefinitions(
    calendarDay.calendarNotes?.activeDefinitions,
  );
  const selectedDayTexts = [
    ...selectedDayNames,
    ...(calendarDay.calendarNotes?.notes ?? []),
    calendarDay.calendarNotes?.summary ?? "",
  ].filter(Boolean);
  const goodFortuneNames = (goodFortuneDirections.result?.entries ?? []).map(
    (entry) => entry.name,
  );
  const directionDeityNames = (directionDeities.result?.entries ?? []).map(
    (entry) => entry.name,
  );
  const doyoTexts = [
    calendarDay.doyo?.label ?? "",
    doyoComparison?.calculated?.period?.label ?? "",
    doyoComparison?.calculated?.isManichi ? "間日" : "",
    doyoComparison?.calculated?.isSeasonalDoyoDay ? "土用の丑の日" : "",
    ...(doyoComparison?.calculated?.period?.seasonalDoyoDays ?? [])
      .filter((entry) => entry.date === sample.date)
      .map((entry) => entry.label),
    doyoComparison?.calculated?.doyoSatsuDirection
      ? `土用殺 ${doyoComparison.calculated.doyoSatsuDirection}`
      : "",
  ].filter(Boolean);

  assertEqual(checks, "六曜", calendarDay.lunarCalendar?.rokuyo, expect.rokuyo);
  assertEqual(
    checks,
    "十二直",
    calendarDay.calendarNotes?.junichoku?.name ?? null,
    expect.junichoku,
  );
  assertEqual(
    checks,
    "二十八宿",
    calendarDay.calendarNotes?.nijuhachishuku?.name ?? null,
    expect.nijuhachishuku,
  );
  assertEqual(
    checks,
    "日九星",
    normalizeKyusei(calendarDay.kyusei?.day),
    expect.dayKyusei,
  );
  assertEqual(checks, "日干支", calendarDay.pillars?.day, expect.dayPillar);
  assertEqual(checks, "空亡", calendarDay.void?.kuubou, expect.kuubou);
  assertEqual(checks, "節気", calendarDay.solarTerm?.name, expect.solarTerm);
  assertEqual(
    checks,
    "節入り",
    calendarDay.solarTerm?.isSetsuiri,
    expect.isSetsuiri,
  );
  assertEqual(
    checks,
    "祝日",
    calendarDay.calendarBase?.nationalHoliday?.name ?? null,
    expect.nationalHoliday,
  );
  assertEqual(checks, "土用", calendarDay.doyo?.isDoyo, expect.doyo);
  assertIncludesAll(
    checks,
    "土用ラベル",
    doyoTexts,
    expect.doyoLabelIncludes,
  );
  assertIncludesAll(
    checks,
    "選日",
    selectedDayTexts,
    expect.selectedDayNamesInclude,
  );
  assertIncludesAll(
    checks,
    "吉神方位",
    goodFortuneNames,
    expect.goodFortuneNamesInclude,
  );
  assertNumber(
    checks,
    "時盤12刻",
    hourBoard.hourBoards?.length ?? 0,
    expect.hourBoardCount,
  );

  checks.push({
    label: "方位神API",
    actual: directionDeityNames.join(" / ") || "-",
    expected: "API応答",
    passed: Array.isArray(directionDeities.result?.entries),
  });

  return {
    sample,
    checks,
    passed: checks.every((check) => check.passed),
  };
}

function printResult(result) {
  const status = result.passed ? "OK" : "NG";

  console.log(`## ${status} ${result.sample.date} ${result.sample.label}`);
  console.log(`目的: ${result.sample.purpose}`);
  console.log(`タグ: ${result.sample.tags.join(" / ")}`);

  for (const check of result.checks) {
    if (check.passed) {
      console.log(`  ✓ ${check.label}: ${check.actual}`);
    } else {
      console.log(
        `  ✗ ${check.label}: actual=${check.actual} / expected=${check.expected}`,
      );
    }
  }

  console.log("");
}

async function main() {
  const master = await readJson(samplesPath);
  const samples = master.samples ?? [];

  console.log(`九星方位カレンダー 回帰サンプル検証: ${new Date().toISOString()}`);
  console.log(`API: ${baseUrl}`);
  console.log(`samples: ${samplesPath} / ${samples.length}件`);
  console.log("");

  const results = [];

  for (const sample of samples) {
    results.push(await verifySample(sample));
  }

  for (const result of results) {
    printResult(result);
  }

  const failed = results.filter((result) => !result.passed);

  console.log(
    `Summary: ${results.length - failed.length}/${results.length} samples passed`,
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
