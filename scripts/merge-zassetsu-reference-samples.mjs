import { readFile, writeFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
}

const basePath = readOption("--base");
const incomingPath = readOption("--incoming");
const outputPath = readOption("--output") ?? basePath;

if (!basePath || !incomingPath || !outputPath) {
  console.error(
    "Usage: node scripts/merge-zassetsu-reference-samples.mjs --base <base.json> --incoming <incoming.json> [--output <output.json>]",
  );
  process.exit(1);
}

function keyOf(sample) {
  return `${sample.date.slice(0, 4)}:${sample.code}`;
}

function precisionRank(sample) {
  return sample.verificationPrecision === "minute" ? 2 : 1;
}

const base = JSON.parse(await readFile(basePath, "utf8"));
const incoming = JSON.parse(await readFile(incomingPath, "utf8"));
const mergedByKey = new Map();

for (const sample of [...base, ...incoming]) {
  const key = keyOf(sample);
  const existing = mergedByKey.get(key);

  if (!existing || precisionRank(sample) >= precisionRank(existing)) {
    mergedByKey.set(key, sample);
  }
}

const merged = [...mergedByKey.values()].sort(
  (a, b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code),
);

await writeFile(outputPath, `${JSON.stringify(merged, null, 2)}\n`);

const counts = merged.reduce(
  (acc, sample) => {
    acc.total += 1;
    if (sample.verificationPrecision === "minute") {
      acc.minute += 1;
    } else {
      acc.date += 1;
    }
    return acc;
  },
  { total: 0, minute: 0, date: 0 },
);

console.log(
  `Merged zassetsu references: base=${base.length}, incoming=${incoming.length}, total=${counts.total}, minute=${counts.minute}, date=${counts.date} -> ${outputPath}`,
);
