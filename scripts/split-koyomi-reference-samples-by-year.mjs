import {
  defaultKoyomiReferenceSamplesDir,
  defaultKoyomiReferenceSamplesFile,
  readKoyomiReferenceSamples,
  writeKoyomiReferenceYear,
} from "./lib/koyomi-reference-samples.mjs";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const inputPath = readOption("--input", defaultKoyomiReferenceSamplesFile);
const outputDir = readOption("--output-dir", defaultKoyomiReferenceSamplesDir);

const master = await readKoyomiReferenceSamples(inputPath);
const groups = new Map();

for (const sample of master.samples ?? []) {
  const year = sample.date.slice(0, 4);
  const group = groups.get(year) ?? [];
  group.push(sample);
  groups.set(year, group);
}

for (const [year, samples] of [...groups.entries()].sort()) {
  await writeKoyomiReferenceYear(
    year,
    {
      ...master,
      samples,
    },
    outputDir,
  );
}

console.log(
  JSON.stringify(
    {
      input: inputPath,
      outputDir,
      years: groups.size,
      samples: master.samples?.length ?? 0,
      status: "split",
    },
    null,
    2,
  ),
);

