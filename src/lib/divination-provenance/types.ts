export type EvidenceReferenceType =
  | "classical_primary"
  | "historical_calendar"
  | "modern_reference"
  | "dictionary"
  | "official_dataset"
  | "project_research_ledger"
  | "po_confirmed"
  | "project_policy";

export type SourceVerificationStatus =
  | "confirmed"
  | "partially_confirmed"
  | "conflict"
  | "unresolved";

export type ProjectAdoptionStatus =
  | "adopted"
  | "provisional"
  | "research_only"
  | "rejected";

export type PrecisionStatus =
  | "exact_timestamp_confirmed"
  | "daily_normalized_confirmed"
  | "implementation_observed"
  | "partially_confirmed"
  | "unresolved";

export type EffectiveResolution = "second" | "minute" | "date";

export type SourceClaim = {
  claimId: string;
  sourceClaimVersion: string;
  sourceId: string;
  sourceType: EvidenceReferenceType;
  claimType: "source_fact" | "interpretation" | "calculation_rule";
  summary: string;
  sourceVerificationStatus: SourceVerificationStatus;
  pageOrRange?: string;
  notes: readonly string[];
};

export type ProjectClaim = {
  claimId: string;
  projectClaimVersion: string;
  claimType: "po_specification" | "application_policy";
  summary: string;
  projectAdoptionStatus: ProjectAdoptionStatus;
  relatedSourceClaimIds: readonly string[];
};

export type BoundaryRuleDefinition = {
  boundaryRuleId: string;
  boundaryVersion: string;
  label: string;
  boundaryType: "timezone" | "setsuiri_month" | "implementation_resolution";
  precisionStatus: PrecisionStatus;
  effectiveResolution: EffectiveResolution;
  implementationResolution?: EffectiveResolution;
  exactTimestampSupport: boolean;
  timezonePolicy: string;
  sourceClaimIds: readonly string[];
  projectClaimIds: readonly string[];
  implementationBindingIds: readonly string[];
  ruleSummary: string;
  unresolvedIssues: readonly string[];
};

export type CalculationStepDefinition = {
  stepId: string;
  label: string;
  inputFieldIds: readonly string[];
  operation: "lookup" | "date_boundary" | "normalization" | "aggregation";
  ruleReferenceIds: readonly string[];
  outputFieldIds: readonly string[];
};

export type RuleDefinition = {
  ruleId: string;
  ruleVersion: string;
  techniqueId: string;
  status:
    | "formula_confirmed"
    | "table_confirmed"
    | "master_dependent"
    | "partially_confirmed";
  inputFieldIds: readonly string[];
  outputFieldIds: readonly string[];
  boundaryRuleIds: readonly string[];
  sourceClaimIds: readonly string[];
  projectClaimIds: readonly string[];
  lookupTableIds: readonly string[];
  derivationSteps: readonly CalculationStepDefinition[];
};

export type LookupTableDefinition = {
  lookupTableId: string;
  lookupTableVersion: string;
  label: string;
  sourceClaimIds: readonly string[];
  projectClaimIds: readonly string[];
  entryCount: number;
};

export type TechniqueDefinition = {
  techniqueId: string;
  techniqueVersion: string;
  label: string;
  domain: "calendar" | "nine_star" | "direction";
  sourceClaimIds: readonly string[];
  projectClaimIds: readonly string[];
  ruleIds: readonly string[];
  boundaryRuleIds: readonly string[];
  implementationBindingIds: readonly string[];
  dependencyTechniqueIds: readonly string[];
  applicationPolicyIds: readonly string[];
  prohibitedInferenceIds: readonly string[];
};

export type WorkflowAggregateDefinition = {
  workflowId: string;
  workflowVersion: string;
  label: string;
  techniqueIds: readonly string[];
  applicationPolicyIds: readonly string[];
  effectType: "none";
  resultFieldIds: readonly string[];
};

export type ImplementationBinding = {
  bindingId: string;
  techniqueIds: readonly string[];
  sourceFiles: readonly string[];
  functions: readonly string[];
  masterColumns: readonly string[];
  tests: readonly string[];
  currentBehaviorSummary: string;
  implementationResolution?: EffectiveResolution;
  exactTimestampSupport?: boolean;
};

export type ImplementationObservation = {
  observationId: string;
  implementationBindingId: string;
  status: "implementation_observed";
  summary: string;
  counts?: Readonly<Record<string, number>>;
  unresolvedIssues: readonly string[];
};

export type VerificationRecord = {
  verificationId: string;
  subjectIds: readonly string[];
  verificationVersion: string;
  status: "verified" | "partially_confirmed" | "implementation_observed";
  actual: number;
  expected: number;
  unit: string;
  notes: readonly string[];
};

export type ConflictReference = {
  conflictId: string;
  status: "open" | "concept_mismatch" | "evidence_limited";
  summary: string;
  excludedFromLevel1Result: true;
  prohibitedResolution: readonly string[];
};

export type ProhibitedInference = {
  prohibitedInferenceId: string;
  summary: string;
};

export type TraceValue = {
  fieldId: string;
  value: string | number | boolean | null | Readonly<Record<string, string>>;
};

export type CalculationStepTrace = {
  stepId: string;
  ruleReferenceIds: readonly string[];
  input: readonly TraceValue[];
  output: readonly TraceValue[];
};

export type CalculationTrace = {
  traceId: string;
  traceVersion: string;
  traceMode: "audit";
  workflowId: string;
  techniqueIds: readonly string[];
  normalizedInputs: readonly TraceValue[];
  boundaryRuleIds: readonly string[];
  steps: readonly CalculationStepTrace[];
  result: readonly TraceValue[];
  conflictReferenceIds: readonly string[];
  unresolvedReferences: readonly string[];
};

export type BoundaryLaneResult = {
  lane: "source_rule" | "project_adopted" | "current_implementation";
  monthBranch: string;
  centerStar: string;
  relatedBoundaryRuleIds: readonly string[];
  relatedRuleDefinitionIds: readonly string[];
};

export type BoundaryComparisonTrace = {
  traceId: string;
  traceVersion: string;
  inputDatetimeJst: string;
  lanes: readonly BoundaryLaneResult[];
  differenceStatus: "match" | "implementation_gap";
  implementationGapId: string | null;
};

export type ImplementationGap = {
  implementationGapId: string;
  status: "open";
  summary: string;
  relatedBoundaryRuleIds: readonly string[];
  prohibitedActions: readonly string[];
};
