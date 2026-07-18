export type EvidenceReferenceType =
  | "classical_primary"
  | "historical_calendar"
  | "modern_reference"
  | "dictionary"
  | "official_dataset"
  | "institutional_specialist_source"
  | "project_research_ledger"
  | "po_confirmed"
  | "project_policy";

export type SourceVerificationStatus =
  | "confirmed"
  | "confirmed_for_named_lineage"
  | "partially_confirmed"
  | "conflict"
  | "source_review_required"
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

export type ProductionConnectionStatus =
  | "not_connected"
  | "existing_date_binding"
  | "exact_timestamp_connected";

export type SourceClaim = {
  claimId: string;
  sourceClaimVersion: string;
  sourceId: string;
  sourceType: EvidenceReferenceType;
  claimType:
    | "source_fact"
    | "interpretation"
    | "calculation_rule"
    | "bibliographic_scope";
  summary: string;
  sourceVerificationStatus: SourceVerificationStatus;
  materialType?: "institutional_specialist_article" | "book" | "dataset";
  institution?: string;
  lineageRelevance?: "trusted_for_project";
  bodyContentVerified?: boolean;
  pageOrRange?: string;
  notes: readonly string[];
};

export type ProjectClaim = {
  claimId: string;
  projectClaimVersion: string;
  claimType: "po_specification" | "application_policy";
  summary: string;
  projectAdoptionStatus: ProjectAdoptionStatus;
  productionConnectionStatus?: ProductionConnectionStatus;
  relatedSourceClaimIds: readonly string[];
};

export type LineageContext = {
  lineageContextId: string;
  lineageContextVersion: string;
  subjectIds: readonly string[];
  status: "po_confirmed_lineage_context";
  summary: string;
  relatedSourceIds: readonly string[];
  relatedSourceClaimIds: readonly string[];
  doesNotAssert: readonly string[];
};

export type BoundaryRuleDefinition = {
  boundaryRuleId: string;
  boundaryVersion: string;
  label: string;
  boundaryType:
    | "timezone"
    | "personal_input"
    | "risshun_year"
    | "setsuiri_month"
    | "implementation_resolution";
  precisionStatus: PrecisionStatus;
  effectiveResolution: EffectiveResolution;
  implementationResolution?: EffectiveResolution;
  exactTimestampSupport: boolean;
  exactTimestampSupportScope?: "schema_and_trace_only";
  timezonePolicy: string;
  sourceVerificationStatus?: SourceVerificationStatus;
  projectAdoptionStatus?: ProjectAdoptionStatus;
  productionConnectionStatus?: ProductionConnectionStatus;
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
  operation:
    | "lookup"
    | "date_boundary"
    | "normalization"
    | "role_binding"
    | "aggregation";
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
  candidateConnected?: false;
  rankingConnected?: false;
  warningConnected?: false;
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

export type ConflictRecord = {
  conflictId: string;
  conflictVersion: string;
  status: "open" | "conflicting";
  summary: string;
  variants: readonly string[];
  projectCurrentSelection?: {
    value: string;
    projectAdoptionStatus: ProjectAdoptionStatus;
  };
  relatedSourceClaimIds: readonly string[];
  prohibitedResolution: readonly string[];
};

export type FutureRuleReference = {
  ruleId: string;
  status: "hold";
  registeredAsExecutableRule: false;
  summary: string;
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
