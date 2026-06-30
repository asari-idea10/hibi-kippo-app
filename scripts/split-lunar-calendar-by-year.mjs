import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const daysInput = readOption(
  "--days-input",
  "src/data/lunar-calendar-1900-2050.generated.json",
);
const monthsInput = readOption(
  "--months-input",
  "src/data/lunar-months-1900-2050.generated.json",
);
const daysOutputDir = readOption(
  "--days-output-dir",
  "src/data/lunar-calendar/by-year",
);
const monthsOutputDir = readOption(
  "--months-output-dir",
  "src/data/lunar-months/by-year",
);

const days = JSON.parse(await readFile(daysInput, "utf8"));
const months = JSON.parse(await readFile(monthsInput, "utf8"));

await mkdir(daysOutputDir, { recursive: true });
await mkdir(monthsOutputDir, { recursive: true });

function groupBy(items, getKey) {
  const groups = new Map();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

const daysByYear = groupBy(days, (day) => day.date.slice(0, 4));
const monthsByYear = groupBy(months, (month) =>
  (month.newMoonDate ?? month.monthKey).slice(0, 4),
);

for (const [year, rows] of daysByYear) {
  await writeFile(
    path.join(daysOutputDir, `${year}.json`),
    `${JSON.stringify(rows)}\n`,
  );
}

for (const [year, rows] of monthsByYear) {
  await writeFile(
    path.join(monthsOutputDir, `${year}.json`),
    `${JSON.stringify(rows)}\n`,
  );
}

console.log(
  `Split lunar calendar: ${days.length} days -> ${daysByYear.size} yearly files`,
);
console.log(
  `Split lunar months: ${months.length} months -> ${monthsByYear.size} yearly files`,
);
