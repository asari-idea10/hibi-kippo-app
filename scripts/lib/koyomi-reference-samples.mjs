import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const defaultKoyomiReferenceSamplesFile =
  "src/data/calendar-notes/koyomi-reference-samples.v0.json";

export const defaultKoyomiReferenceSamplesDir =
  "src/data/calendar-notes/koyomi-reference-samples/by-year";

function createEmptyMaster() {
  return {
    schemaVersion: "koyomi_reference_samples.v0",
    source: {
      name: "こよみのページ 暦注計算",
      url: "https://koyomi8.com/sub/rekicyuu.html",
      status: "external_reference",
      methodNotes: [],
    },
    samples: [],
  };
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function isDirectory(targetPath) {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function sortSamples(samples) {
  return [...samples].sort((a, b) => a.date.localeCompare(b.date));
}

function filterSamples(samples, { month = null, year = null } = {}) {
  return samples.filter((sample) => {
    if (month && !sample.date.startsWith(month)) {
      return false;
    }

    if (year && !sample.date.startsWith(String(year))) {
      return false;
    }

    return true;
  });
}

async function readJsonIfExists(filePath, fallback) {
  if (!(await pathExists(filePath))) {
    return fallback;
  }

  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function readKoyomiReferenceSamples(
  targetPath = defaultKoyomiReferenceSamplesDir,
  options = {},
) {
  const targetIsDirectory = await isDirectory(targetPath);

  if (targetIsDirectory) {
    const files = (await readdir(targetPath))
      .filter((file) => /^\d{4}\.json$/.test(file))
      .sort();
    const masters = await Promise.all(
      files.map((file) => readJsonIfExists(path.join(targetPath, file), null)),
    );
    const samples = masters.flatMap((master) => master?.samples ?? []);
    const source =
      masters.find((master) => master?.source)?.source ??
      createEmptyMaster().source;

    return {
      schemaVersion: "koyomi_reference_samples.v0",
      source,
      samples: sortSamples(filterSamples(samples, options)),
    };
  }

  if (await pathExists(targetPath)) {
    const master = await readJsonIfExists(targetPath, createEmptyMaster());
    return {
      ...master,
      samples: sortSamples(filterSamples(master.samples ?? [], options)),
    };
  }

  if (targetPath !== defaultKoyomiReferenceSamplesFile) {
    return readKoyomiReferenceSamples(defaultKoyomiReferenceSamplesFile, options);
  }

  return createEmptyMaster();
}

export async function readKoyomiReferenceYear(
  year,
  dir = defaultKoyomiReferenceSamplesDir,
) {
  const filePath = path.join(dir, `${year}.json`);
  const master = await readJsonIfExists(filePath, null);

  if (master) {
    return master;
  }

  return {
    ...createEmptyMaster(),
    schemaVersion: "koyomi_reference_samples_by_year.v0",
    year: String(year),
    range: {
      start: null,
      end: null,
      count: 0,
    },
  };
}

export async function writeKoyomiReferenceYear(
  year,
  master,
  dir = defaultKoyomiReferenceSamplesDir,
) {
  const samples = sortSamples(
    (master.samples ?? []).filter((sample) => sample.date.startsWith(String(year))),
  );
  const output = {
    ...master,
    schemaVersion: "koyomi_reference_samples_by_year.v0",
    year: String(year),
    range: {
      start: samples[0]?.date ?? null,
      end: samples.at(-1)?.date ?? null,
      count: samples.length,
    },
    samples,
  };

  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, `${year}.json`),
    `${JSON.stringify(output, null, 2)}\n`,
  );

  return output;
}

