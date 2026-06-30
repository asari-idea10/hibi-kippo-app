import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

const [, , expectedPath, actualPath] = process.argv;

if (!expectedPath || !actualPath) {
  console.error("Usage: node scripts/compare-json.mjs <expected.json> <actual.json>");
  process.exit(1);
}

const expected = JSON.parse(await readFile(expectedPath, "utf8"));
const actual = JSON.parse(await readFile(actualPath, "utf8"));
const same = isDeepStrictEqual(expected, actual);

console.log(
  JSON.stringify(
    {
      same,
      expectedPath,
      actualPath,
      expectedRows: Array.isArray(expected) ? expected.length : null,
      actualRows: Array.isArray(actual) ? actual.length : null,
    },
    null,
    2,
  ),
);

if (!same) {
  process.exit(1);
}
