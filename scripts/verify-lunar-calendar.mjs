import { readFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const generatedDaysPath =
  readOption("--generated-days") ??
  "src/data/lunar-calendar-1900-2050.generated.json";
const generatedMonthsPath =
  readOption("--generated-months") ??
  "src/data/lunar-months-1900-2050.generated.json";
const samplePath =
  readOption("--sample") ?? "src/data/lunar-calendar-2026.sample.json";

const generatedDays = JSON.parse(await readFile(generatedDaysPath, "utf8"));
const generatedMonths = JSON.parse(await readFile(generatedMonthsPath, "utf8"));
const sample = JSON.parse(await readFile(samplePath, "utf8"));

const diffs = [];

function dateToTime(date) {
  return Date.parse(`${date}T00:00:00+09:00`);
}

function expectedRokuyo(lunarMonth, lunarDay) {
  return ["大安", "赤口", "先勝", "友引", "先負", "仏滅"][
    (lunarMonth + lunarDay) % 6
  ];
}

for (const sampleDay of sample) {
  const generated = generatedDays.find((day) => day.date === sampleDay.date);

  if (!generated) {
    diffs.push(`${sampleDay.date}: generated row missing`);
    continue;
  }

  const expectedDisplay = `旧暦${sampleDay.isLeapMonth ? "閏" : ""}${sampleDay.lunarMonth}月${sampleDay.lunarDay}日`;

  if (generated.lunar.display !== expectedDisplay) {
    diffs.push(
      `${sampleDay.date}: lunar display sample=${expectedDisplay} generated=${generated.lunar.display}`,
    );
  }

  if (generated.rokuyo.name !== sampleDay.rokuyo) {
    diffs.push(
      `${sampleDay.date}: rokuyo sample=${sampleDay.rokuyo} generated=${generated.rokuyo.name}`,
    );
  }
}

const firstDay = generatedDays[0]?.date ?? null;
const lastDay = generatedDays.at(-1)?.date ?? null;

if (firstDay !== "1900-01-01") {
  diffs.push(`first day expected 1900-01-01 actual ${firstDay}`);
}

if (lastDay !== "2050-12-31") {
  diffs.push(`last day expected 2050-12-31 actual ${lastDay}`);
}

for (let index = 1; index < generatedDays.length; index += 1) {
  const previous = generatedDays[index - 1];
  const current = generatedDays[index];
  const expectedTime = dateToTime(previous.date) + 86400000;

  if (dateToTime(current.date) !== expectedTime) {
    diffs.push(`date continuity broken: ${previous.date} -> ${current.date}`);
    break;
  }
}

const rokuyoDiffs = generatedDays.filter((day) => {
  const expected = expectedRokuyo(day.lunar.month, day.lunar.day);
  return day.rokuyo.name !== expected;
});

if (rokuyoDiffs.length > 0) {
  diffs.push(`${rokuyoDiffs.length} generated rows have rokuyo formula diffs`);
}

const monthByKey = new Map(generatedMonths.map((month) => [month.monthKey, month]));
const missingMonths = [
  ...new Set(generatedDays.map((day) => day.lunar.monthKey)),
].filter((monthKey) => !monthByKey.has(monthKey));

if (missingMonths.length > 0) {
  diffs.push(`missing month master rows: ${missingMonths.join(", ")}`);
}

const status = diffs.length === 0 ? "passed" : "failed";

console.log(
  JSON.stringify(
    {
      status,
      generatedDays: generatedDays.length,
      generatedMonths: generatedMonths.length,
      range: {
        start: firstDay,
        end: lastDay,
      },
      sampleChecks: sample.length,
      diffs,
    },
    null,
    2,
  ),
);

if (diffs.length > 0) {
  process.exit(1);
}
