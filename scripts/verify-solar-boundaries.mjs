import { readFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const solarTermsPath =
  readOption("--solar-terms") ?? "src/data/solar-terms-2026.json";
const checkpointsPath =
  readOption("--checkpoints") ?? "src/data/solar-boundary-checkpoints.json";
const maxDiffMinutes = Number(readOption("--max-diff-minutes") ?? "0");
const strict = args.includes("--strict");

function toEpochMillis(datetimeJst) {
  return new Date(datetimeJst).getTime();
}

function diffMinutes(expectedDatetimeJst, actualDatetimeJst) {
  return Math.round(
    (toEpochMillis(actualDatetimeJst) - toEpochMillis(expectedDatetimeJst)) /
      60000,
  );
}

function findTerm(terms, checkpoint) {
  return terms.find(
    (term) =>
      term.name === checkpoint.name &&
      term.solarLongitude === checkpoint.solarLongitude &&
      term.date === checkpoint.date,
  );
}

const terms = JSON.parse(await readFile(solarTermsPath, "utf8"));
const checkpoints = JSON.parse(await readFile(checkpointsPath, "utf8"));

const checks = checkpoints.map((checkpoint) => {
  const actual = findTerm(terms, checkpoint);

  if (!actual) {
    return {
      id: checkpoint.id,
      status: "missing",
      expected: checkpoint,
      actual: null,
      diffMinutes: null,
      note: "検証対象の二十四節気マスターに該当データがありません。",
    };
  }

  const minutes = diffMinutes(
    checkpoint.expectedDatetimeJst,
    actual.exactDatetimeJst ?? actual.datetimeJst,
  );
  const matched =
    Math.abs(minutes) <= maxDiffMinutes &&
    actual.affectsYearBoundary === checkpoint.affectsYearBoundary &&
    actual.affectsMonthBoundary === checkpoint.affectsMonthBoundary;

  return {
    id: checkpoint.id,
    status: matched ? "matched" : "mismatched",
    expected: checkpoint,
    actual,
    diffMinutes: minutes,
    note: matched
      ? "境界時刻と境界フラグが一致しました。"
      : "境界時刻または境界フラグに差分があります。",
  };
});

const summary = {
  solarTermsPath,
  checkpointsPath,
  maxDiffMinutes,
  total: checks.length,
  matched: checks.filter((check) => check.status === "matched").length,
  missing: checks.filter((check) => check.status === "missing").length,
  mismatched: checks.filter((check) => check.status === "mismatched").length,
};

const result = {
  status:
    summary.mismatched === 0 && (strict ? summary.missing === 0 : true)
      ? "passed"
      : "failed",
  summary,
  checks,
};

console.log(JSON.stringify(result, null, 2));

if (result.status === "failed") {
  process.exit(1);
}
