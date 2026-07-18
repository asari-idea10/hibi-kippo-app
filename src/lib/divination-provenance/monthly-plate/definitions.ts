import type {
  BoundaryRuleDefinition,
  ConflictReference,
  ImplementationBinding,
  ImplementationGap,
  ImplementationObservation,
  ProhibitedInference,
  ProjectClaim,
  RuleDefinition,
  SourceClaim,
  TechniqueDefinition,
  VerificationRecord,
  WorkflowAggregateDefinition,
} from "@/lib/divination-provenance/types";

export const monthlyPlateSourceClaims = [
  {
    claimId: "source-claim.hma-p24.monthly-plates.v1",
    sourceClaimVersion: "1",
    sourceId: "HMA-P24-IMG-20260715",
    sourceType: "historical_calendar",
    claimType: "source_fact",
    summary: "『改訂版 平成・萬年暦』p.24には3年支グループ×12月の36月盤がある。",
    sourceVerificationStatus: "partially_confirmed",
    pageOrRange: "p.24",
    notes: ["大字九星Level 1を対象とし、細字markerと24山は含めない。"],
  },
  {
    claimId: "source-claim.monthly-ledger.level1.v1",
    sourceClaimVersion: "1",
    sourceId: "hibi-kippo_monthly_plate_research_ledger",
    sourceType: "project_research_ledger",
    claimType: "interpretation",
    summary: "研究台帳の年支group、中宮、九星配置、五黄殺、暗剣殺、月破をLevel 1比較fixtureとして保持する。",
    sourceVerificationStatus: "partially_confirmed",
    notes: ["296細字区画はuser_transcribedのままで、Level 1 source confirmationには含めない。"],
  },
  {
    claimId: "source-claim.po-a-tiger-large-stars.v1",
    sourceClaimVersion: "1",
    sourceId: "HMA-P24-IMG-20260715",
    sourceType: "po_confirmed",
    claimType: "source_fact",
    summary: "PO現物確認でA寅の東=六白、南東=七赤、両区画の原記号なしを確認した。",
    sourceVerificationStatus: "confirmed",
    pageOrRange: "p.24 A寅盤",
    notes: ["研究台帳の旧値は転記誤りだった。"],
  },
  {
    claimId: "source-claim.po-c-tiger-large-stars.v1",
    sourceClaimVersion: "1",
    sourceId: "HMA-P24-IMG-20260715",
    sourceType: "po_confirmed",
    claimType: "source_fact",
    summary: "PO現物確認でC寅の南=六白、南西=八白、西=四緑を確認した。",
    sourceVerificationStatus: "confirmed",
    pageOrRange: "p.24 C寅盤",
    notes: ["細字markerはLevel 1 fixtureへ含めない。"],
  },
  {
    claimId: "source-claim.solar-term-timestamps.v1",
    sourceClaimVersion: "1",
    sourceId: "solar-terms-1900-2050.verified",
    sourceType: "official_dataset",
    claimType: "source_fact",
    summary: "1900〜2050年の節入りについてJST日時、太陽黄経通過、秒・分精度を保持する。",
    sourceVerificationStatus: "confirmed",
    notes: ["アプリは静的verified masterを参照し、runtime天文計算を行わない。"],
  },
  {
    claimId: "source-claim.monthly-setsuiri-boundary-rule.v1",
    sourceClaimVersion: "1",
    sourceId: "monthly-boundary-research-record",
    sourceType: "project_research_ledger",
    claimType: "calculation_rule",
    summary: "月盤の月界を節入り時刻とする資料・占術規則を追跡する。",
    sourceVerificationStatus: "partially_confirmed",
    notes: ["古典一次資料の書誌・頁claimは未登録であり、project採用claimと統合しない。"],
  },
] as const satisfies readonly SourceClaim[];

export const monthlyPlateProjectClaims = [
  {
    claimId: "project-claim.monthly-level1-scope.v1",
    projectClaimVersion: "1",
    claimType: "po_specification",
    summary: "月盤Level 1を年支group、月支、中宮、9宮配置、五黄殺、暗剣殺、月破、source orientationに限定する。",
    projectAdoptionStatus: "adopted",
    relatedSourceClaimIds: [
      "source-claim.hma-p24.monthly-plates.v1",
      "source-claim.monthly-ledger.level1.v1",
      "source-claim.po-a-tiger-large-stars.v1",
      "source-claim.po-c-tiger-large-stars.v1",
    ],
  },
  {
    claimId: "project-claim.monthly-boundary-at-setsuiri.v1",
    projectClaimVersion: "1",
    claimType: "po_specification",
    summary: "hibi-kippo-appの月盤境界方針として、正確なJST節入り時刻で月支を切り替える。",
    projectAdoptionStatus: "adopted",
    relatedSourceClaimIds: [
      "source-claim.monthly-setsuiri-boundary-rule.v1",
      "source-claim.solar-term-timestamps.v1",
    ],
  },
  {
    claimId: "project-claim.monthly-unresolved-markers-excluded.v1",
    projectClaimVersion: "1",
    claimType: "po_specification",
    summary: "細字marker、C寅月徳合、三合、24山、candidate、ranking、warning、UI effectをLevel 1結果から除外する。",
    projectAdoptionStatus: "adopted",
    relatedSourceClaimIds: ["source-claim.monthly-ledger.level1.v1"],
  },
] as const satisfies readonly ProjectClaim[];

export const monthlyPlateImplementationBindings = [
  {
    bindingId: "implementation.monthly.daily-master.v1",
    techniqueIds: ["monthly-period-resolution", "monthly-year-group-resolution", "monthly-center-star", "monthly-gohosatsu", "monthly-ankensatsu", "monthly-breaker"],
    sourceFiles: ["src/lib/calendar-master-rows.ts", "src/data/calendar-master/by-year/{year}.json"],
    functions: ["getCalendarMasterRow", "getCalendarMasterRows"],
    masterColumns: ["duplicateYear", "duplicateMonth", "monthKyusei", "monthGohosatsu", "monthAnkensatsu", "monthSaiha"],
    tests: ["src/lib/monthly-plate-regression.test.ts"],
    currentBehaviorSummary: "1日1行のdaily master値をその日の全時刻へ使用する。",
    implementationResolution: "date",
    exactTimestampSupport: false,
  },
  {
    bindingId: "implementation.monthly.calendar-day.v1",
    techniqueIds: ["monthly-period-resolution", "monthly-center-star", "monthly-gohosatsu", "monthly-ankensatsu", "monthly-breaker"],
    sourceFiles: ["src/lib/calendar-day.ts"],
    functions: ["getCalendarDay", "getCalendarDays"],
    masterColumns: [],
    tests: ["src/lib/monthly-plate-regression.test.ts"],
    currentBehaviorSummary: "CalendarMasterRowの月支・月九星・月警告をCalendarDayへ移す。",
  },
  {
    bindingId: "implementation.monthly.public-board.v1",
    techniqueIds: ["monthly-nine-palace-placement", "monthly-source-orientation"],
    sourceFiles: ["src/lib/calendar-db-view.ts"],
    functions: ["getKyuseiDirectionStar", "buildCalendarDbRow", "searchCalendarDb"],
    masterColumns: [],
    tests: ["src/lib/monthly-plate-regression.test.ts"],
    currentBehaviorSummary: "中宮から9宮九星を生成し、public CalendarDbRowへ表示用盤を構成する。",
  },
  {
    bindingId: "implementation.solar-term.verified-master.v1",
    techniqueIds: ["monthly-period-resolution"],
    sourceFiles: ["src/lib/solar-terms.ts", "src/data/solar-terms-1900-2050.verified.json"],
    functions: ["getSolarTerms", "getSolarTermByDate", "getSetsuiriContextByDate"],
    masterColumns: ["datetimeJst", "exactDatetimeJst", "isSetsuiriForKyusei", "affectsMonthBoundary"],
    tests: [],
    currentBehaviorSummary: "節入りのJST日時を保持するが、daily master月盤値の時刻内切替には接続されていない。",
    implementationResolution: "second",
    exactTimestampSupport: true,
  },
] as const satisfies readonly ImplementationBinding[];

export const monthlyPlateBoundaryRules = [
  {
    boundaryRuleId: "boundary.jst-normalization.v1",
    boundaryVersion: "1",
    label: "月盤入力時刻のJST正規化",
    boundaryType: "timezone",
    precisionStatus: "exact_timestamp_confirmed",
    effectiveResolution: "second",
    exactTimestampSupport: true,
    timezonePolicy: "Asia/Tokyo (+09:00)",
    sourceClaimIds: ["source-claim.solar-term-timestamps.v1"],
    projectClaimIds: ["project-claim.monthly-boundary-at-setsuiri.v1"],
    implementationBindingIds: ["implementation.solar-term.verified-master.v1"],
    ruleSummary: "offset付き日時をJSTへ正規化して節入り境界と比較する。",
    unresolvedIssues: [],
  },
  {
    boundaryRuleId: "boundary.monthly-setsuiri-timestamp.v1",
    boundaryVersion: "1",
    label: "節入り時刻による月盤月界",
    boundaryType: "setsuiri_month",
    precisionStatus: "exact_timestamp_confirmed",
    effectiveResolution: "second",
    exactTimestampSupport: true,
    timezonePolicy: "Asia/Tokyo (+09:00)",
    sourceClaimIds: ["source-claim.monthly-setsuiri-boundary-rule.v1", "source-claim.solar-term-timestamps.v1"],
    projectClaimIds: ["project-claim.monthly-boundary-at-setsuiri.v1"],
    implementationBindingIds: ["implementation.solar-term.verified-master.v1"],
    ruleSummary: "対象時刻が節入りのexactDatetimeJst以上なら新しい月支を採用する。",
    unresolvedIssues: ["占術規則の古典一次資料の書誌・頁claimは未登録。"],
  },
  {
    boundaryRuleId: "boundary.monthly-daily-master-resolution.v1",
    boundaryVersion: "1",
    label: "現行daily master月盤境界",
    boundaryType: "implementation_resolution",
    precisionStatus: "daily_normalized_confirmed",
    effectiveResolution: "date",
    implementationResolution: "date",
    exactTimestampSupport: false,
    timezonePolicy: "date key only; time is not accepted",
    sourceClaimIds: [],
    projectClaimIds: [],
    implementationBindingIds: ["implementation.monthly.daily-master.v1"],
    ruleSummary: "現行productionは1日1行のmonth値を終日使用する。",
    unresolvedIssues: ["1,812件中6件が公式節入り日の翌日切替となる理由は未解決。"],
  },
] as const satisfies readonly BoundaryRuleDefinition[];

const step = (stepId: string, label: string, ruleId: string, inputFieldIds: readonly string[], outputFieldIds: readonly string[]) => ({
  stepId,
  label,
  inputFieldIds,
  operation: stepId.includes("boundary") ? "date_boundary" as const : "lookup" as const,
  ruleReferenceIds: [ruleId],
  outputFieldIds,
});

export const monthlyPlateRules = [
  { ruleId: "rule.monthly.period.setsuiri.v1", ruleVersion: "1", techniqueId: "monthly-period-resolution", status: "partially_confirmed", inputFieldIds: ["targetDatetimeJst"], outputFieldIds: ["monthBranch", "latestSetsuiri"], boundaryRuleIds: ["boundary.jst-normalization.v1", "boundary.monthly-setsuiri-timestamp.v1"], sourceClaimIds: ["source-claim.monthly-setsuiri-boundary-rule.v1", "source-claim.solar-term-timestamps.v1"], projectClaimIds: ["project-claim.monthly-boundary-at-setsuiri.v1"], lookupTableIds: [], derivationSteps: [step("monthly-period-boundary", "節入り時刻から月支を決定", "rule.monthly.period.setsuiri.v1", ["targetDatetimeJst"], ["monthBranch", "latestSetsuiri"])] },
  { ruleId: "rule.monthly.year-group.v1", ruleVersion: "1", techniqueId: "monthly-year-group-resolution", status: "table_confirmed", inputFieldIds: ["yearBranch"], outputFieldIds: ["yearGroup"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.year-groups.v1"], derivationSteps: [step("monthly-year-group", "年支から3groupを決定", "rule.monthly.year-group.v1", ["yearBranch"], ["yearGroup"])] },
  { ruleId: "rule.monthly.center-by-group-and-branch.v1", ruleVersion: "1", techniqueId: "monthly-center-star", status: "table_confirmed", inputFieldIds: ["yearGroup", "monthBranch"], outputFieldIds: ["centerStar"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.centers-36.v1"], derivationSteps: [step("monthly-center", "groupと月支から中宮を決定", "rule.monthly.center-by-group-and-branch.v1", ["yearGroup", "monthBranch"], ["centerStar"])] },
  { ruleId: "rule.monthly.nine-palace-placement.v1", ruleVersion: "1", techniqueId: "monthly-nine-palace-placement", status: "table_confirmed", inputFieldIds: ["centerStar"], outputFieldIds: ["palaceStars"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.palace-stars-36x9.v1"], derivationSteps: [step("monthly-placement", "中宮に対応する9宮配置を参照", "rule.monthly.nine-palace-placement.v1", ["centerStar"], ["palaceStars"])] },
  { ruleId: "rule.monthly.gohosatsu.v1", ruleVersion: "1", techniqueId: "monthly-gohosatsu", status: "table_confirmed", inputFieldIds: ["centerStar", "palaceStars"], outputFieldIds: ["gohosatsu"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.gohosatsu-9.v1"], derivationSteps: [step("monthly-gohosatsu", "五黄の方位を参照", "rule.monthly.gohosatsu.v1", ["centerStar", "palaceStars"], ["gohosatsu"])] },
  { ruleId: "rule.monthly.ankensatsu-opposite.v1", ruleVersion: "1", techniqueId: "monthly-ankensatsu", status: "table_confirmed", inputFieldIds: ["gohosatsu"], outputFieldIds: ["ankensatsu"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.ankensatsu-9.v1", "lookup.direction.opposites-8.v1"], derivationSteps: [step("monthly-ankensatsu", "五黄方位の対宮を参照", "rule.monthly.ankensatsu-opposite.v1", ["gohosatsu"], ["ankensatsu"])] },
  { ruleId: "rule.monthly.breaker-by-branch-opposition.v1", ruleVersion: "1", techniqueId: "monthly-breaker", status: "table_confirmed", inputFieldIds: ["monthBranch"], outputFieldIds: ["monthBreaker"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.breaker-12.v1"], derivationSteps: [step("monthly-breaker", "月支の対冲方位を参照", "rule.monthly.breaker-by-branch-opposition.v1", ["monthBranch"], ["monthBreaker"])] },
  { ruleId: "rule.monthly.source-position-to-direction8.v1", ruleVersion: "1", techniqueId: "monthly-source-orientation", status: "partially_confirmed", inputFieldIds: ["sourcePosition"], outputFieldIds: ["direction8"], boundaryRuleIds: [], sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.po-a-tiger-large-stars.v1", "source-claim.po-c-tiger-large-stars.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], lookupTableIds: ["lookup.monthly.source-orientation.v1"], derivationSteps: [step("monthly-source-orientation", "紙面原位置から8方位へ派生", "rule.monthly.source-position-to-direction8.v1", ["sourcePosition"], ["direction8"])] },
] as const satisfies readonly RuleDefinition[];

const allProhibitedInferenceIds = [
  "prohibit.monthly.daily-master-timestamp-assumption",
  "prohibit.monthly.six-boundary-reason-guess",
  "prohibit.monthly.generated-master-auto-fix",
  "prohibit.monthly.direction8-to-mountain24",
  "prohibit.monthly.unresolved-markers-in-level1",
  "prohibit.monthly.c-tiger-gettoku-go-fill",
  "prohibit.monthly.trine-concept-merge",
  "prohibit.monthly.application-auto-connect",
  "prohibit.monthly.registry-overwrites-production",
  "prohibit.monthly.source-project-claim-merge",
] as const;

export const monthlyPlateTechniques = [
  { techniqueId: "monthly-period-resolution", techniqueVersion: "1", label: "月盤月支決定", domain: "calendar", sourceClaimIds: ["source-claim.monthly-setsuiri-boundary-rule.v1", "source-claim.solar-term-timestamps.v1"], projectClaimIds: ["project-claim.monthly-boundary-at-setsuiri.v1"], ruleIds: ["rule.monthly.period.setsuiri.v1"], boundaryRuleIds: ["boundary.jst-normalization.v1", "boundary.monthly-setsuiri-timestamp.v1", "boundary.monthly-daily-master-resolution.v1"], implementationBindingIds: ["implementation.monthly.daily-master.v1", "implementation.monthly.calendar-day.v1", "implementation.solar-term.verified-master.v1"], dependencyTechniqueIds: [], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-year-group-resolution", techniqueVersion: "1", label: "月盤年支group決定", domain: "nine_star", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.year-group.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.daily-master.v1"], dependencyTechniqueIds: [], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-center-star", techniqueVersion: "1", label: "月盤中宮星", domain: "nine_star", sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.center-by-group-and-branch.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.daily-master.v1", "implementation.monthly.calendar-day.v1"], dependencyTechniqueIds: ["monthly-period-resolution", "monthly-year-group-resolution"], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-nine-palace-placement", techniqueVersion: "1", label: "月盤九星9宮配置", domain: "nine_star", sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.nine-palace-placement.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.public-board.v1"], dependencyTechniqueIds: ["monthly-center-star", "monthly-source-orientation"], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-gohosatsu", techniqueVersion: "1", label: "月盤五黄殺", domain: "direction", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.gohosatsu.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.daily-master.v1", "implementation.monthly.calendar-day.v1"], dependencyTechniqueIds: ["monthly-nine-palace-placement"], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-ankensatsu", techniqueVersion: "1", label: "月盤暗剣殺", domain: "direction", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.ankensatsu-opposite.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.daily-master.v1", "implementation.monthly.calendar-day.v1"], dependencyTechniqueIds: ["monthly-gohosatsu"], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-breaker", techniqueVersion: "1", label: "月破", domain: "direction", sourceClaimIds: ["source-claim.monthly-ledger.level1.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.breaker-by-branch-opposition.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.daily-master.v1", "implementation.monthly.calendar-day.v1"], dependencyTechniqueIds: ["monthly-period-resolution"], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
  { techniqueId: "monthly-source-orientation", techniqueVersion: "1", label: "月盤原資料方位基準", domain: "direction", sourceClaimIds: ["source-claim.hma-p24.monthly-plates.v1", "source-claim.po-a-tiger-large-stars.v1", "source-claim.po-c-tiger-large-stars.v1"], projectClaimIds: ["project-claim.monthly-level1-scope.v1"], ruleIds: ["rule.monthly.source-position-to-direction8.v1"], boundaryRuleIds: [], implementationBindingIds: ["implementation.monthly.public-board.v1"], dependencyTechniqueIds: [], applicationPolicyIds: [], prohibitedInferenceIds: allProhibitedInferenceIds },
] as const satisfies readonly TechniqueDefinition[];

export const monthlyPlateWorkflow = {
  workflowId: "monthly-plate-level1-workflow",
  workflowVersion: "1",
  label: "月盤Level 1 provenance workflow",
  techniqueIds: monthlyPlateTechniques.map(({ techniqueId }) => techniqueId),
  applicationPolicyIds: [],
  effectType: "none",
  resultFieldIds: ["yearGroup", "monthBranch", "centerStar", "palaceStars", "gohosatsu", "ankensatsu", "monthBreaker", "sourceOrientation"],
} as const satisfies WorkflowAggregateDefinition;

export const monthlyPlateProhibitedInferences = [
  { prohibitedInferenceId: allProhibitedInferenceIds[0], summary: "daily masterが節入り時刻精度を持つと解釈しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[1], summary: "6件の翌日切替理由を推測しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[2], summary: "公式節入り日時を理由にgenerated masterを修正しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[3], summary: "8方位から24山を補完しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[4], summary: "天月等の未確定markerをLevel 1へ混入させない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[5], summary: "C寅月徳合を西へ補完しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[6], summary: "原資料三合を現行三合経路へ統合しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[7], summary: "五黄殺等をcandidate・ranking・warningへ新規接続しない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[8], summary: "registry値でproduction結果を上書きしない。" },
  { prohibitedInferenceId: allProhibitedInferenceIds[9], summary: "source claimとproject claimを同一claimへ統合しない。" },
] as const satisfies readonly ProhibitedInference[];

export const monthlyPlateImplementationObservations = [
  {
    observationId: "observation.monthly.daily-boundary-1900-2050.v1",
    implementationBindingId: "implementation.monthly.daily-master.v1",
    status: "implementation_observed",
    summary: "公式節入り1,812件に対しdaily masterは1,806件を同日、6件を翌日から切り替える。",
    counts: { officialSolarTermTimestamps: 1812, sameDaySwitch: 1806, nextDaySwitch: 6, missing: 0 },
    unresolvedIssues: ["翌日切替6件の丸め・timezone・source由来の理由は未解決。"],
  },
] as const satisfies readonly ImplementationObservation[];

export const nextDayBoundaryObservations = [
  { date: "1900-01-06", term: "小寒" },
  { date: "1900-02-04", term: "立春" },
  { date: "1902-09-08", term: "白露" },
  { date: "1919-08-08", term: "立秋" },
  { date: "1939-06-06", term: "芒種" },
  { date: "1964-09-07", term: "白露" },
] as const;

export const monthlyPlateVerificationRecords = [
  { verificationId: "verification.monthly.centers-36.v1", subjectIds: ["monthly-center-star"], verificationVersion: "1", status: "verified", actual: 36, expected: 36, unit: "monthly plates", notes: [] },
  { verificationId: "verification.monthly.palace-stars-324.v1", subjectIds: ["monthly-nine-palace-placement"], verificationVersion: "1", status: "verified", actual: 324, expected: 324, unit: "palace values", notes: [] },
  { verificationId: "verification.monthly.unique-stars-36.v1", subjectIds: ["monthly-nine-palace-placement"], verificationVersion: "1", status: "verified", actual: 36, expected: 36, unit: "unique star sets", notes: [] },
  { verificationId: "verification.monthly.ankensatsu-36.v1", subjectIds: ["monthly-ankensatsu"], verificationVersion: "1", status: "verified", actual: 36, expected: 36, unit: "monthly plates", notes: [] },
  { verificationId: "verification.monthly.breaker-36.v1", subjectIds: ["monthly-breaker"], verificationVersion: "1", status: "verified", actual: 36, expected: 36, unit: "monthly plates", notes: [] },
  { verificationId: "verification.monthly.gohosatsu.v1", subjectIds: ["monthly-gohosatsu"], verificationVersion: "1", status: "verified", actual: 36, expected: 36, unit: "32 directions plus 4 center cases", notes: [] },
  { verificationId: "verification.monthly.po-a-tiger.v1", subjectIds: ["source-claim.po-a-tiger-large-stars.v1"], verificationVersion: "1", status: "verified", actual: 2, expected: 2, unit: "PO confirmed cells", notes: ["東6・南東7"] },
  { verificationId: "verification.monthly.po-c-tiger.v1", subjectIds: ["source-claim.po-c-tiger-large-stars.v1"], verificationVersion: "1", status: "verified", actual: 3, expected: 3, unit: "PO confirmed cells", notes: ["南6・南西8・西4"] },
  { verificationId: "verification.monthly.daily-master-days.v1", subjectIds: ["implementation.monthly.daily-master.v1"], verificationVersion: "1", status: "implementation_observed", actual: 55152, expected: 55152, unit: "daily rows", notes: [] },
  { verificationId: "verification.monthly.setsuiri-boundaries.v1", subjectIds: ["boundary.monthly-daily-master-resolution.v1"], verificationVersion: "1", status: "implementation_observed", actual: 1812, expected: 1812, unit: "official setsuiri timestamps", notes: ["1,806 same-day, 6 next-day, 0 missing"] },
  { verificationId: "verification.monthly.source-orientation.v1", subjectIds: ["monthly-source-orientation"], verificationVersion: "1", status: "partially_confirmed", actual: 5, expected: 9, unit: "PO direction cells / source orientation basis", notes: ["A寅2セルとC寅3セルをPO確認。24山細位置は対象外。"] },
] as const satisfies readonly VerificationRecord[];

export const monthlyPlateConflictReferences = [
  { conflictId: "conflict.monthly.c-tiger-gettoku-go.v1", status: "open", summary: "C寅盤面に月合表示がない一方、古典期待値は月徳合=辛=西。", excludedFromLevel1Result: true, prohibitedResolution: ["西をproductionへ補完しない。"] },
  { conflictId: "conflict.monthly.source-trine-vs-current.v1", status: "concept_mismatch", summary: "原資料三合markerと現行三合4局・三合天道は同一概念として統合しない。", excludedFromLevel1Result: true, prohibitedResolution: ["現行3方向へ置換しない。"] },
  { conflictId: "conflict.monthly.fine-markers-evidence.v1", status: "evidence_limited", summary: "296細字区画はuser_transcribedで、Level 1の計算結果へ含めない。", excludedFromLevel1Result: true, prohibitedResolution: ["大字324/324一致を細字確認済みへ拡張しない。"] },
] as const satisfies readonly ConflictReference[];

export const monthlyPlateImplementationGaps = [
  {
    implementationGapId: "gap.monthly.2026-shosho-pre-boundary-daily-master.v1",
    status: "open",
    summary: "2026-07-07 00:00〜10:56:56 JSTはproject採用時刻境界では午月だが、現行daily masterは未月を終日返す。",
    relatedBoundaryRuleIds: ["boundary.monthly-setsuiri-timestamp.v1", "boundary.monthly-daily-master-resolution.v1"],
    prohibitedActions: ["現行productionを変更しない。", "daily masterに時刻精度があると記録しない。"],
  },
] as const satisfies readonly ImplementationGap[];
