import type {
  BoundaryComparisonTrace,
  CalculationTrace,
} from "@/lib/divination-provenance/types";
import {
  monthlyPlateLevel1Fixtures,
  palaceStarsByCenter,
} from "@/lib/divination-provenance/monthly-plate/fixtures";
import { monthlyPlateTechniques } from "@/lib/divination-provenance/monthly-plate/definitions";

const normalFixture = monthlyPlateLevel1Fixtures.find(
  ({ yearGroup, monthBranch }) => yearGroup === "A" && monthBranch === "未",
);

if (!normalFixture) {
  throw new Error("Missing A-group 未月 Level 1 fixture.");
}

export const normalMonthlyPlateTrace = {
  traceId: "trace.monthly.2026-07-08.v1",
  traceVersion: "1",
  traceMode: "audit",
  workflowId: "monthly-plate-level1-workflow",
  techniqueIds: monthlyPlateTechniques.map(({ techniqueId }) => techniqueId),
  normalizedInputs: [
    { fieldId: "targetDatetimeJst", value: "2026-07-08T12:00:00+09:00" },
    { fieldId: "timezone", value: "Asia/Tokyo" },
  ],
  boundaryRuleIds: [
    "boundary.jst-normalization.v1",
    "boundary.monthly-setsuiri-timestamp.v1",
  ],
  steps: [
    {
      stepId: "monthly-period-boundary",
      ruleReferenceIds: ["rule.monthly.period.setsuiri.v1"],
      input: [{ fieldId: "targetDatetimeJst", value: "2026-07-08T12:00:00+09:00" }],
      output: [
        { fieldId: "latestSetsuiri", value: "2026-07-07T10:56:57+09:00" },
        { fieldId: "monthBranch", value: "未" },
      ],
    },
    {
      stepId: "monthly-year-group",
      ruleReferenceIds: ["rule.monthly.year-group.v1"],
      input: [{ fieldId: "yearBranch", value: "午" }],
      output: [{ fieldId: "yearGroup", value: "A" }],
    },
    {
      stepId: "monthly-center",
      ruleReferenceIds: ["rule.monthly.center-by-group-and-branch.v1"],
      input: [{ fieldId: "yearGroup", value: "A" }, { fieldId: "monthBranch", value: "未" }],
      output: [{ fieldId: "centerStar", value: "3" }],
    },
    {
      stepId: "monthly-placement",
      ruleReferenceIds: ["rule.monthly.nine-palace-placement.v1"],
      input: [{ fieldId: "centerStar", value: "3" }],
      output: [{ fieldId: "palaceStars", value: palaceStarsByCenter["3"] }],
    },
    {
      stepId: "monthly-gohosatsu",
      ruleReferenceIds: ["rule.monthly.gohosatsu.v1"],
      input: [{ fieldId: "centerStar", value: "3" }],
      output: [{ fieldId: "gohosatsu", value: "西" }],
    },
    {
      stepId: "monthly-ankensatsu",
      ruleReferenceIds: ["rule.monthly.ankensatsu-opposite.v1"],
      input: [{ fieldId: "gohosatsu", value: "西" }],
      output: [{ fieldId: "ankensatsu", value: "東" }],
    },
    {
      stepId: "monthly-breaker",
      ruleReferenceIds: ["rule.monthly.breaker-by-branch-opposition.v1"],
      input: [{ fieldId: "monthBranch", value: "未" }],
      output: [{ fieldId: "monthBreaker", value: "北東" }],
    },
  ],
  result: [
    { fieldId: "yearBranch", value: "午" },
    { fieldId: "yearGroup", value: "A" },
    { fieldId: "monthBranch", value: "未" },
    { fieldId: "centerStar", value: "3" },
    { fieldId: "palaceStars", value: normalFixture.palaceStars },
    { fieldId: "gohosatsu", value: "西" },
    { fieldId: "ankensatsu", value: "東" },
    { fieldId: "monthBreaker", value: "北東" },
  ],
  conflictReferenceIds: [
    "conflict.monthly.c-tiger-gettoku-go.v1",
    "conflict.monthly.source-trine-vs-current.v1",
    "conflict.monthly.fine-markers-evidence.v1",
  ],
  unresolvedReferences: [],
} as const satisfies CalculationTrace;

const SOURCE_BOUNDARY_RULES = [
  "boundary.jst-normalization.v1",
  "boundary.monthly-setsuiri-timestamp.v1",
] as const;
const CURRENT_BOUNDARY_RULES = ["boundary.monthly-daily-master-resolution.v1"] as const;
const PERIOD_RULES = ["rule.monthly.period.setsuiri.v1", "rule.monthly.center-by-group-and-branch.v1"] as const;

function boundaryTrace(
  inputDatetimeJst: string,
  sourceMonthBranch: "午" | "未",
  sourceCenterStar: "4" | "3",
): BoundaryComparisonTrace {
  const differs = sourceMonthBranch !== "未";

  return {
    traceId: `trace.monthly.boundary.${inputDatetimeJst}.v1`,
    traceVersion: "1",
    inputDatetimeJst,
    lanes: [
      { lane: "source_rule", monthBranch: sourceMonthBranch, centerStar: sourceCenterStar, relatedBoundaryRuleIds: SOURCE_BOUNDARY_RULES, relatedRuleDefinitionIds: PERIOD_RULES },
      { lane: "project_adopted", monthBranch: sourceMonthBranch, centerStar: sourceCenterStar, relatedBoundaryRuleIds: SOURCE_BOUNDARY_RULES, relatedRuleDefinitionIds: PERIOD_RULES },
      { lane: "current_implementation", monthBranch: "未", centerStar: "3", relatedBoundaryRuleIds: CURRENT_BOUNDARY_RULES, relatedRuleDefinitionIds: PERIOD_RULES },
    ],
    differenceStatus: differs ? "implementation_gap" : "match",
    implementationGapId: differs ? "gap.monthly.2026-shosho-pre-boundary-daily-master.v1" : null,
  };
}

export const monthlyPlateBoundaryTraces = [
  boundaryTrace("2026-07-07T10:56:56+09:00", "午", "4"),
  boundaryTrace("2026-07-07T10:56:57+09:00", "未", "3"),
  boundaryTrace("2026-07-07T10:56:58+09:00", "未", "3"),
] as const satisfies readonly BoundaryComparisonTrace[];
