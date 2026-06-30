import { readdir } from "node:fs/promises";
import { extname } from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const planPath = readOption(
  "--plan",
  "src/data/import/calendar-master-extraction-plan.1900-2050.json",
);
const chunksDir = readOption("--chunks-dir", "src/data/import/chunks");

const plan = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(planPath, "utf8")));

let files = [];

try {
  files = await readdir(chunksDir);
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

const usableFiles = files.filter((file) => [".csv", ".json"].includes(extname(file).toLowerCase()));
const fileSet = new Set(usableFiles);
const expected = plan.chunks.map((chunk) => chunk.suggestedFile);
const missing = expected.filter((file) => !fileSet.has(file));
const unexpected = usableFiles.filter((file) => !expected.includes(file));
const present = expected.filter((file) => fileSet.has(file));

const presentChunks = plan.chunks.filter((chunk) => fileSet.has(chunk.suggestedFile));
const presentRows = presentChunks.reduce((sum, chunk) => sum + chunk.rowCount, 0);
const presentRanges = presentChunks.map((chunk) => chunk.id);

const result = {
  ok: missing.length === 0 && unexpected.length === 0,
  chunksDir,
  expectedFiles: expected.length,
  presentFiles: present.length,
  missingFiles: missing.length,
  unexpectedFiles: unexpected.length,
  expectedRows: plan.range.expectedRows,
  presentRows,
  firstPresent: presentRanges[0] ?? null,
  lastPresent: presentRanges.at(-1) ?? null,
  missing: missing.slice(0, 20),
  unexpected: unexpected.slice(0, 20),
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}
