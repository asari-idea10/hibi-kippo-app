import type { CalculationTrace, TraceValue } from "@/lib/divination-provenance/types";

import { personalStarBoundaryFixtures, type PersonalKyusei } from "./fixtures";

type PersonalTraceLane = {
  lane: "source_rule" | "project_provisional" | "current_daily_master";
  result: PersonalKyusei | null;
  precisionStatus: "exact_timestamp" | "date" | "date_only_unresolved";
  relatedBoundaryRuleIds: readonly string[];
  relatedRuleDefinitionIds: readonly string[];
};

export type PersonalBoundaryTrace = {
  traceId: string;
  traceVersion: "1";
  techniqueId: "honmei-star-resolution" | "getsumei-star-resolution";
  inputDate: string;
  inputDatetimeJst: string | null;
  timezoneStatus: "assumed_jst";
  lanes: readonly PersonalTraceLane[];
  sourceProjectExactResult: PersonalKyusei | null;
  fallbackStar: null;
  currentImplementationResult: PersonalKyusei;
  differenceStatus: "match" | "implementation_gap" | "exact_result_unresolved";
  implementationGapId: string | null;
  conflictReferenceIds: readonly string[];
};

const traceValue = (fieldId: string, value: TraceValue["value"]): TraceValue => ({ fieldId, value });

export const honmeiCalculationTrace = {
  traceId: "trace.personal.honmei-2026-risshun-after.v1",
  traceVersion: "1",
  traceMode: "audit",
  workflowId: "personal-star-profile-workflow",
  techniqueIds: [
    "birth-datetime-normalization",
    "birth-year-period-resolution",
    "honmei-star-resolution",
  ],
  normalizedInputs: [
    traceValue("birthDatetimeJst", "2026-02-04T05:02:09+09:00"),
    traceValue("timezoneStatus", "assumed_jst"),
    traceValue("inputPrecision", "exact_timestamp"),
  ],
  boundaryRuleIds: [
    "boundary.jst-normalization.v1",
    "boundary.personal-input-date-resolution.v1",
    "boundary.honmei-risshun-timestamp.v1",
  ],
  steps: [
    {
      stepId: "personal-birth-normalization",
      ruleReferenceIds: ["rule.personal.birth-datetime-normalization.v1"],
      input: [traceValue("birthDatetime", "2026-02-04T05:02:09+09:00")],
      output: [traceValue("birthDatetimeJst", "2026-02-04T05:02:09+09:00")],
    },
    {
      stepId: "personal-year-boundary",
      ruleReferenceIds: ["rule.personal.birth-year-period-resolution.v1"],
      input: [
        traceValue("birthDatetimeJst", "2026-02-04T05:02:09+09:00"),
        traceValue("risshunInstantJst", "2026-02-04T05:02:08+09:00"),
      ],
      output: [traceValue("adoptedYear", 2026)],
    },
    {
      stepId: "personal-annual-nine-star",
      ruleReferenceIds: ["rule.personal.year-nine-star-cycle.v1"],
      input: [traceValue("adoptedYear", 2026)],
      output: [traceValue("annualNineStar", "1")],
    },
    {
      stepId: "personal-honmei-role-binding",
      ruleReferenceIds: ["rule.personal.honmei-from-adopted-year-star.v1"],
      input: [traceValue("annualNineStar", "1")],
      output: [traceValue("honmeiStar", "1")],
    },
  ],
  result: [
    traceValue("adoptedYear", 2026),
    traceValue("annualNineStar", "1"),
    traceValue("honmeiStar", "1"),
  ],
  conflictReferenceIds: ["conflict.personal-stars.time-basis.v1"],
  unresolvedReferences: ["production exact timestamp connection HOLD"],
} as const satisfies CalculationTrace;

export const getsumeiCalculationTrace = {
  traceId: "trace.personal.getsumei-2026-shosho-after.v1",
  traceVersion: "1",
  traceMode: "audit",
  workflowId: "personal-star-profile-workflow",
  techniqueIds: [
    "birth-datetime-normalization",
    "birth-year-period-resolution",
    "birth-month-period-resolution",
    "getsumei-star-resolution",
  ],
  normalizedInputs: [
    traceValue("birthDatetimeJst", "2026-07-07T10:56:58+09:00"),
    traceValue("timezoneStatus", "assumed_jst"),
    traceValue("inputPrecision", "exact_timestamp"),
  ],
  boundaryRuleIds: [
    "boundary.jst-normalization.v1",
    "boundary.personal-input-date-resolution.v1",
    "boundary.getsumei-setsuiri-timestamp.v1",
  ],
  steps: [
    {
      stepId: "personal-birth-normalization",
      ruleReferenceIds: ["rule.personal.birth-datetime-normalization.v1"],
      input: [traceValue("birthDatetime", "2026-07-07T10:56:58+09:00")],
      output: [traceValue("birthDatetimeJst", "2026-07-07T10:56:58+09:00")],
    },
    {
      stepId: "personal-month-boundary",
      ruleReferenceIds: ["rule.personal.birth-month-period-resolution.v1"],
      input: [
        traceValue("birthDatetimeJst", "2026-07-07T10:56:58+09:00"),
        traceValue("setsuiriInstantJst", "2026-07-07T10:56:57+09:00"),
      ],
      output: [traceValue("adoptedSetsuMonthBranch", "未")],
    },
    {
      stepId: "personal-getsumei-lookup",
      ruleReferenceIds: ["rule.personal.getsumei-from-year-group-and-setsu-month.v1"],
      input: [
        traceValue("adoptedYearBranchGroup", "A"),
        traceValue("adoptedSetsuMonthBranch", "未"),
      ],
      output: [traceValue("monthlyPlateCenterStar", "3")],
    },
    {
      stepId: "personal-getsumei-role-binding",
      ruleReferenceIds: ["rule.personal.getsumei-role-binding.v1"],
      input: [traceValue("monthlyPlateCenterStar", "3")],
      output: [traceValue("getsumeiStar", "3")],
    },
  ],
  result: [
    traceValue("adoptedYearBranchGroup", "A"),
    traceValue("adoptedSetsuMonthBranch", "未"),
    traceValue("monthlyPlateCenterStar", "3"),
    traceValue("getsumeiStar", "3"),
  ],
  conflictReferenceIds: ["conflict.personal-stars.time-basis.v1"],
  unresolvedReferences: ["全12節exact timestampの専門書本文確認", "production exact timestamp connection HOLD"],
} as const satisfies CalculationTrace;

export const personalStarBoundaryTraces = personalStarBoundaryFixtures.map((fixture) => {
  const isHonmei = fixture.techniqueId === "honmei-star-resolution";
  const exactBoundaryRuleId = isHonmei
    ? "boundary.honmei-risshun-timestamp.v1"
    : "boundary.getsumei-setsuiri-timestamp.v1";
  const periodRuleId = isHonmei
    ? "rule.personal.birth-year-period-resolution.v1"
    : "rule.personal.birth-month-period-resolution.v1";
  const currentRuleId = isHonmei
    ? "rule.personal.honmei-from-adopted-year-star.v1"
    : "rule.personal.getsumei-role-binding.v1";
  const exactPrecision = fixture.birthTimeStatus === "known" ? "exact_timestamp" : "date_only_unresolved";

  return {
    traceId: `trace.personal.boundary.${fixture.fixtureId}.v1`,
    traceVersion: "1",
    techniqueId: fixture.techniqueId,
    inputDate: fixture.inputDate,
    inputDatetimeJst: fixture.inputDatetimeJst,
    timezoneStatus: "assumed_jst",
    lanes: [
      {
        lane: "source_rule",
        result: fixture.sourceProjectExactResult,
        precisionStatus: exactPrecision,
        relatedBoundaryRuleIds: [exactBoundaryRuleId],
        relatedRuleDefinitionIds: [periodRuleId],
      },
      {
        lane: "project_provisional",
        result: fixture.sourceProjectExactResult,
        precisionStatus: exactPrecision,
        relatedBoundaryRuleIds: [exactBoundaryRuleId],
        relatedRuleDefinitionIds: [periodRuleId],
      },
      {
        lane: "current_daily_master",
        result: fixture.currentImplementationResult,
        precisionStatus: "date",
        relatedBoundaryRuleIds: ["boundary.personal-daily-master-resolution.v1"],
        relatedRuleDefinitionIds: [currentRuleId],
      },
    ],
    sourceProjectExactResult: fixture.sourceProjectExactResult,
    fallbackStar: null,
    currentImplementationResult: fixture.currentImplementationResult,
    differenceStatus: fixture.differenceStatus,
    implementationGapId:
      fixture.differenceStatus !== "implementation_gap"
        ? null
        : isHonmei
          ? "gap.personal.honmei-2026-risshun-pre-boundary.v1"
          : "gap.personal.getsumei-2026-shosho-pre-boundary.v1",
    conflictReferenceIds: ["conflict.personal-stars.time-basis.v1"],
  };
}) satisfies readonly PersonalBoundaryTrace[];
