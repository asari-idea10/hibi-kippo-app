import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, test } from "vitest";

import { getCalendarMasterRow, getCalendarMasterRows, type CalendarMasterRow } from "@/lib/calendar-master-rows";
import {
  monthlyPlateBoundaryRules,
  monthlyPlateImplementationBindings,
  monthlyPlateSourceClaims,
} from "@/lib/divination-provenance/monthly-plate/definitions";
import {
  personalStarBoundaryRules,
  personalStarConceptRelations,
  personalStarFutureRuleReferences,
  personalStarImplementationBindings,
  personalStarImplementationGaps,
  personalStarImplementationObservations,
  personalStarLineageContexts,
  personalStarProhibitedInferences,
  personalStarProjectClaims,
  personalStarRules,
  personalStarSourceClaims,
  personalStarTechniques,
  personalStarTimeBasisConflicts,
  personalStarVerificationRecords,
  personalStarWorkflow,
} from "./definitions";
import {
  annualNineStarCycleFixtures,
  getsumei36Fixtures,
  personalStarImplementationObservationFixtures,
  personalStarLookupTables,
  personalStarYearGroups,
  type PersonalKyusei,
  type PersonalMonthBranch,
} from "./fixtures";
import {
  getsumeiCalculationTrace,
  honmeiCalculationTrace,
  personalStarBoundaryTraces,
} from "./trace";
import { getSolarTerms } from "@/lib/solar-terms";

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const filePath = path.join(directory, name);
    return statSync(filePath).isDirectory()
      ? listSourceFiles(filePath)
      : /\.(ts|tsx)$/.test(name)
        ? [filePath]
        : [];
  });
}

const allPersonalIds = [
  ...personalStarSourceClaims.map(({ claimId }) => claimId),
  ...personalStarProjectClaims.map(({ claimId }) => claimId),
  ...personalStarLineageContexts.map(({ lineageContextId }) => lineageContextId),
  ...personalStarBoundaryRules.map(({ boundaryRuleId }) => boundaryRuleId),
  ...personalStarRules.map(({ ruleId }) => ruleId),
  ...personalStarLookupTables.map(({ lookupTableId }) => lookupTableId),
  ...personalStarTechniques.map(({ techniqueId }) => techniqueId),
  personalStarWorkflow.workflowId,
  ...personalStarImplementationBindings.map(({ bindingId }) => bindingId),
  ...personalStarImplementationObservations.map(({ observationId }) => observationId),
  ...personalStarVerificationRecords.map(({ verificationId }) => verificationId),
  ...personalStarTimeBasisConflicts.map(({ conflictId }) => conflictId),
  ...personalStarProhibitedInferences.map(({ prohibitedInferenceId }) => prohibitedInferenceId),
  ...personalStarImplementationGaps.map(({ implementationGapId }) => implementationGapId),
];

let calendarRows: CalendarMasterRow[];

beforeAll(() => {
  calendarRows = getCalendarMasterRows({ start: "1900-01-01", end: "2050-12-31" });
});

describe("個人星provenance schema", () => {
  test("全IDは一意で各registryがversionを持つ", () => {
    expect(new Set(allPersonalIds)).toHaveLength(allPersonalIds.length);
    expect(personalStarSourceClaims.every(({ sourceClaimVersion }) => sourceClaimVersion)).toBe(true);
    expect(personalStarProjectClaims.every(({ projectClaimVersion }) => projectClaimVersion)).toBe(true);
    expect(personalStarLineageContexts.every(({ lineageContextVersion }) => lineageContextVersion)).toBe(true);
    expect(personalStarBoundaryRules.every(({ boundaryVersion }) => boundaryVersion)).toBe(true);
    expect(personalStarRules.every(({ ruleVersion }) => ruleVersion)).toBe(true);
    expect(personalStarLookupTables.every(({ lookupTableVersion }) => lookupTableVersion)).toBe(true);
    expect(personalStarTechniques.every(({ techniqueVersion }) => techniqueVersion)).toBe(true);
    expect(personalStarWorkflow.workflowVersion).toBe("1");
  });

  test("5 Techniqueと重複しないeffect-free workflowを登録する", () => {
    expect(personalStarTechniques.map(({ techniqueId }) => techniqueId)).toEqual([
      "birth-datetime-normalization",
      "birth-year-period-resolution",
      "birth-month-period-resolution",
      "honmei-star-resolution",
      "getsumei-star-resolution",
    ]);
    expect(personalStarTechniques.some(({ techniqueId }) => techniqueId === personalStarWorkflow.workflowId)).toBe(false);
    expect(personalStarWorkflow).toMatchObject({
      workflowId: "personal-star-profile-workflow",
      effectType: "none",
      applicationPolicyIds: [],
      candidateConnected: false,
      rankingConnected: false,
      warningConnected: false,
    });
  });

  test("Technique・Rule・Boundary・bindingの参照IDが実在する", () => {
    const externalSourceIds = monthlyPlateSourceClaims.map(({ claimId }) => claimId);
    const externalBoundaryIds = monthlyPlateBoundaryRules.map(({ boundaryRuleId }) => boundaryRuleId);
    const externalBindingIds = monthlyPlateImplementationBindings.map(({ bindingId }) => bindingId);
    const sourceIds = new Set([...personalStarSourceClaims.map(({ claimId }) => claimId), ...externalSourceIds]);
    const projectIds = new Set(personalStarProjectClaims.map(({ claimId }) => claimId));
    const techniqueIds = new Set(personalStarTechniques.map(({ techniqueId }) => techniqueId));
    const ruleIds = new Set(personalStarRules.map(({ ruleId }) => ruleId));
    const boundaryIds = new Set([...personalStarBoundaryRules.map(({ boundaryRuleId }) => boundaryRuleId), ...externalBoundaryIds]);
    const bindingIds = new Set([...personalStarImplementationBindings.map(({ bindingId }) => bindingId), ...externalBindingIds]);
    const lookupIds = new Set(personalStarLookupTables.map(({ lookupTableId }) => lookupTableId));

    for (const technique of personalStarTechniques) {
      expect(technique.dependencyTechniqueIds.every((id) => techniqueIds.has(id))).toBe(true);
      expect(technique.ruleIds.every((id) => ruleIds.has(id))).toBe(true);
      expect(technique.boundaryRuleIds.every((id) => boundaryIds.has(id))).toBe(true);
      expect(technique.implementationBindingIds.every((id) => bindingIds.has(id))).toBe(true);
      expect(technique.sourceClaimIds.every((id) => sourceIds.has(id))).toBe(true);
      expect(technique.projectClaimIds.every((id) => projectIds.has(id))).toBe(true);
    }
    for (const rule of personalStarRules) {
      expect(techniqueIds.has(rule.techniqueId)).toBe(true);
      expect(rule.boundaryRuleIds.every((id) => boundaryIds.has(id))).toBe(true);
      expect(rule.sourceClaimIds.every((id) => sourceIds.has(id))).toBe(true);
      expect(rule.projectClaimIds.every((id) => projectIds.has(id))).toBe(true);
      expect(rule.lookupTableIds.every((id) => lookupIds.has(id))).toBe(true);
    }
  });

  test("source claim・project claim・PO lineage contextを分離する", () => {
    const sourceIds = new Set(personalStarSourceClaims.map(({ claimId }) => claimId));
    const projectIds = new Set(personalStarProjectClaims.map(({ claimId }) => claimId));
    expect([...sourceIds].filter((id) => projectIds.has(id))).toEqual([]);
    expect(personalStarLineageContexts).toEqual([
      expect.objectContaining({
        lineageContextId: "lineage-context.tomihisa-keisha.v1",
        status: "po_confirmed_lineage_context",
      }),
    ]);
    expect(personalStarLineageContexts[0].doesNotAssert).toHaveLength(4);
  });

  test("institutional specialist sourceは分類情報だけを持ち数値weightを持たない", () => {
    const institutional = personalStarSourceClaims.filter(
      ({ sourceType }) => sourceType === "institutional_specialist_source",
    );
    expect(institutional).toHaveLength(2);
    expect(institutional.every(({ materialType }) => materialType === "institutional_specialist_article")).toBe(true);
    expect(institutional.every(({ institution }) => institution === "一般財団法人 東洋運勢学会")).toBe(true);
    expect(institutional.every(({ lineageRelevance }) => lineageRelevance === "trusted_for_project")).toBe(true);
    expect(JSON.stringify(institutional)).not.toMatch(/weight|score|priority/);
  });

  test("書誌scopeは本文未確認を維持しexisting implementationをSourceClaimにしない", () => {
    const scope = personalStarSourceClaims.find(
      ({ claimId }) => claimId === "source-claim.tomihisa-2000.keisha-book-scope.v1",
    );
    expect(scope).toMatchObject({ claimType: "bibliographic_scope", bodyContentVerified: false });
    expect(personalStarSourceClaims.some(({ sourceType }) => sourceType === ("existing_implementation" as string))).toBe(false);
    expect(personalStarImplementationBindings).toHaveLength(3);
  });
});

describe("個人星静的fixtureと既存binding観測", () => {
  test("年家九星fixtureは9年一巡の静的期待値を保持する", () => {
    expect(annualNineStarCycleFixtures).toHaveLength(9);
    expect(annualNineStarCycleFixtures.map(({ annualNineStar }) => annualNineStar)).toEqual([
      "3", "2", "1", "9", "8", "7", "6", "5", "4",
    ]);
    expect(new Set(annualNineStarCycleFixtures.map(({ annualNineStar }) => annualNineStar))).toHaveLength(9);
  });

  test("月命星lookupは3群×12節月の36静的値を保持する", () => {
    expect(getsumei36Fixtures).toHaveLength(36);
    expect(new Set(getsumei36Fixtures.map(({ fixtureId }) => fixtureId))).toHaveLength(36);
    expect(Object.keys(personalStarYearGroups)).toEqual(["A", "B", "C"]);
    expect(personalStarLookupTables.map(({ entryCount }) => entryCount)).toEqual([9, 3, 36]);
  });

  test("36 lookupは月家九星値を月命星の別roleへ同値固定する", () => {
    for (const fixture of getsumei36Fixtures) {
      expect(fixture.getsumeiStar).toBe(fixture.monthlyPlateCenterStar);
    }
    expect(personalStarConceptRelations).toContainEqual(expect.objectContaining({
      left: "monthlyPlateCenterStar",
      right: "getsumeiStar",
      valueRelation: "same_value",
      conceptRelation: "derived_personal_attribute",
      roleRelation: "distinct_role",
      techniqueMerge: "prohibited",
    }));
  });

  test("9本命星×12節月の108入力を36静的値へ展開できる", () => {
    const expanded = getsumei36Fixtures.flatMap((fixture) =>
      fixture.annualStars.map((annualStar) => ({
        annualStar,
        monthBranch: fixture.monthBranch,
        getsumeiStar: fixture.getsumeiStar,
      })),
    );
    expect(expanded).toHaveLength(108);
    expect(new Set(expanded.map(({ annualStar, monthBranch }) => `${annualStar}|${monthBranch}`))).toHaveLength(108);
  });

  test("daily master 55,152日は36 lookupと一致する", () => {
    const fixtureByInput = new Map<string, PersonalKyusei>();
    for (const fixture of getsumei36Fixtures) {
      for (const annualStar of fixture.annualStars) {
        fixtureByInput.set(`${annualStar}|${fixture.monthBranch}`, fixture.getsumeiStar);
      }
    }
    expect(calendarRows).toHaveLength(55_152);
    for (const row of calendarRows) {
      expect(fixtureByInput.get(`${row.yearKyusei}|${row.duplicateMonth as PersonalMonthBranch}`), row.date).toBe(row.monthKyusei);
    }
  });

  test("fixtureはproduction式・daily masterから生成せず個人PIIを含まない", () => {
    const fixtureSource = readFileSync(path.join(process.cwd(), "src/lib/divination-provenance/personal-stars/fixtures.ts"), "utf8");
    expect(fixtureSource).not.toMatch(/getCalendarMaster|getCalendarDays|getYearKyusei|calculate/);
    const serialized = JSON.stringify({ annualNineStarCycleFixtures, getsumei36Fixtures });
    for (const pii of ["personName", "email", "address", "latitude", "longitude", "companionName"]) {
      expect(serialized).not.toContain(pii);
    }
  });
});

describe("個人星boundary・trace・verification", () => {
  test("exact boundaryと現行date境界を別BoundaryRuleにする", () => {
    const honmei = personalStarBoundaryRules.find(({ boundaryRuleId }) => boundaryRuleId === "boundary.honmei-risshun-timestamp.v1");
    const getsumei = personalStarBoundaryRules.find(({ boundaryRuleId }) => boundaryRuleId === "boundary.getsumei-setsuiri-timestamp.v1");
    const current = personalStarBoundaryRules.find(({ boundaryRuleId }) => boundaryRuleId === "boundary.personal-daily-master-resolution.v1");
    expect(honmei).toMatchObject({ effectiveResolution: "second", projectAdoptionStatus: "provisional", productionConnectionStatus: "not_connected" });
    expect(getsumei).toMatchObject({ effectiveResolution: "second", precisionStatus: "partially_confirmed", exactTimestampSupport: true, exactTimestampSupportScope: "schema_and_trace_only", productionConnectionStatus: "not_connected" });
    expect(current).toMatchObject({ effectiveResolution: "date", implementationResolution: "date", exactTimestampSupport: false, precisionStatus: "implementation_observed", productionConnectionStatus: "existing_date_binding" });
  });

  test("本命星traceは年星から人物本命へのrole bindingを別stepにする", () => {
    expect(honmeiCalculationTrace.steps.map(({ stepId }) => stepId)).toEqual([
      "personal-birth-normalization",
      "personal-year-boundary",
      "personal-annual-nine-star",
      "personal-honmei-role-binding",
    ]);
    expect(Object.fromEntries(honmeiCalculationTrace.result.map(({ fieldId, value }) => [fieldId, value]))).toEqual({
      adoptedYear: 2026,
      annualNineStar: "1",
      honmeiStar: "1",
    });
  });

  test("月命星traceは月家九星から人物属性へのrole bindingを別stepにする", () => {
    expect(getsumeiCalculationTrace.steps.map(({ stepId }) => stepId)).toEqual([
      "personal-birth-normalization",
      "personal-month-boundary",
      "personal-getsumei-lookup",
      "personal-getsumei-role-binding",
    ]);
    expect(Object.fromEntries(getsumeiCalculationTrace.result.map(({ fieldId, value }) => [fieldId, value]))).toEqual({
      adoptedYearBranchGroup: "A",
      adoptedSetsuMonthBranch: "未",
      monthlyPlateCenterStar: "3",
      getsumeiStar: "3",
    });
  });

  test("境界traceはsource・project provisional・currentの3 laneを保持する", () => {
    expect(personalStarBoundaryTraces).toHaveLength(8);
    for (const trace of personalStarBoundaryTraces) {
      expect(trace.lanes.map(({ lane }) => lane)).toEqual([
        "source_rule", "project_provisional", "current_daily_master",
      ]);
      expect(trace.fallbackStar).toBeNull();
    }
    expect(personalStarBoundaryTraces.find(({ traceId }) => traceId.includes("risshun-before"))?.implementationGapId).toBe("gap.personal.honmei-2026-risshun-pre-boundary.v1");
    expect(personalStarBoundaryTraces.find(({ traceId }) => traceId.includes("shosho-before"))?.implementationGapId).toBe("gap.personal.getsumei-2026-shosho-pre-boundary.v1");
  });

  test("birthTime不明の境界日はexact result unresolved・fallbackなし", () => {
    const unknown = personalStarBoundaryTraces.filter(({ differenceStatus }) => differenceStatus === "exact_result_unresolved");
    expect(unknown).toHaveLength(2);
    expect(unknown.every(({ inputDatetimeJst, sourceProjectExactResult, fallbackStar }) => inputDatetimeJst === null && sourceProjectExactResult === null && fallbackStar === null)).toBe(true);
    expect(unknown.every(({ currentImplementationResult }) => currentImplementationResult !== null)).toBe(true);
  });

  test("立春151件は150同日・1翌日・0 missingで理由を未解決に保つ", () => {
    const terms = getSolarTerms().filter(({ affectsYearBoundary }) => affectsYearBoundary);
    let sameDay = 0;
    let missing = 0;
    const nextDay: Array<{ date: string; term: string }> = [];
    for (const term of terms) {
      const previous = getCalendarMasterRow(addDays(term.date, -1));
      const current = getCalendarMasterRow(term.date);
      const next = getCalendarMasterRow(addDays(term.date, 1));
      if (!previous || !current || !next) missing += 1;
      else if (previous.duplicateYear !== current.duplicateYear) sameDay += 1;
      else if (current.duplicateYear !== next.duplicateYear) nextDay.push({ date: term.date, term: term.name });
    }
    expect(terms).toHaveLength(151);
    expect(sameDay).toBe(150);
    expect(nextDay).toEqual([{ date: "1900-02-04", term: "立春" }]);
    expect(missing).toBe(0);
    expect(personalStarImplementationObservationFixtures.risshun).toEqual({ officialEvents: 151, sameDaySwitch: 150, nextDaySwitch: 1, missing: 0 });
  });
});

describe("個人星非接続・HOLD・安全制約", () => {
  test("節入り1,812件は1,806同日・6翌日・0 missingを保持する", () => {
    const terms = getSolarTerms().filter(({ isSetsuiriForKyusei }) => isSetsuiriForKyusei);
    let sameDay = 0;
    let missing = 0;
    const nextDay: Array<{ date: string; term: string }> = [];
    for (const term of terms) {
      const previous = getCalendarMasterRow(addDays(term.date, -1));
      const current = getCalendarMasterRow(term.date);
      const next = getCalendarMasterRow(addDays(term.date, 1));
      if (!previous || !current || !next) missing += 1;
      else if (previous.duplicateMonth !== current.duplicateMonth) sameDay += 1;
      else if (current.duplicateMonth !== next.duplicateMonth) nextDay.push({ date: term.date, term: term.name });
    }
    expect(terms).toHaveLength(1_812);
    expect(sameDay).toBe(1_806);
    expect(nextDay).toEqual([...personalStarImplementationObservationFixtures.unresolvedMonthlyNextDay]);
    expect(missing).toBe(0);
  });

  test("JSTと自然時補正のconflictを未解決のまま保持する", () => {
    expect(personalStarTimeBasisConflicts).toEqual([
      expect.objectContaining({
        conflictId: "conflict.personal-stars.time-basis.v1",
        status: "conflicting",
        variants: ["standard_jst", "local_natural_time_correction"],
        projectCurrentSelection: { value: "assumed_jst", projectAdoptionStatus: "provisional" },
      }),
    ]);
    expect(personalStarTimeBasisConflicts[0].prohibitedResolution).toHaveLength(4);
  });

  test("傾斜RuleをHOLD参照だけにしexecutable Ruleへ登録しない", () => {
    expect(personalStarFutureRuleReferences).toEqual([
      expect.objectContaining({
        ruleId: "rule.personal.keisha-from-honmei-and-getsumei.v1",
        status: "hold",
        registeredAsExecutableRule: false,
      }),
    ]);
    expect(personalStarRules.some(({ ruleId }) => ruleId === "rule.personal.keisha-from-honmei-and-getsumei.v1")).toBe(false);
  });

  test("19件のprohibited inferenceを全Techniqueへ登録する", () => {
    expect(personalStarProhibitedInferences).toHaveLength(19);
    expect(personalStarTechniques.every(({ prohibitedInferenceIds }) => prohibitedInferenceIds.length === 19)).toBe(true);
    const ids = personalStarProhibitedInferences.map(({ prohibitedInferenceId }) => prohibitedInferenceId);
    expect(ids).toContain("prohibit.personal.institutional-source-auto-resolve");
    expect(ids).toContain("prohibit.personal.source-type-score");
    expect(ids).toContain("prohibit.personal.lineage-context-as-source-claim");
    expect(ids).toContain("prohibit.personal.ready-limited-as-production-ready");
  });

  test("candidate・ranking・warning・productionへ新規接続しない", () => {
    expect(personalStarTechniques.every(({ applicationPolicyIds }) => applicationPolicyIds.length === 0)).toBe(true);
    expect(personalStarWorkflow).toMatchObject({ candidateConnected: false, rankingConnected: false, warningConnected: false });
    expect(personalStarProjectClaims.every(({ productionConnectionStatus }) => productionConnectionStatus === "not_connected")).toBe(true);
    expect(personalStarImplementationGaps.every(({ status }) => status === "open")).toBe(true);
  });

  test("app・API・component・既存productionからimportされずclient bundleへ接続しない", () => {
    const provenanceRoot = path.join(process.cwd(), "src/lib/divination-provenance");
    const files = [
      ...listSourceFiles(path.join(process.cwd(), "src/app")),
      ...listSourceFiles(path.join(process.cwd(), "src/components")),
      ...listSourceFiles(path.join(process.cwd(), "src/lib")),
    ].filter((filePath) => !filePath.startsWith(provenanceRoot));
    const importers = files.filter((filePath) => readFileSync(filePath, "utf8").includes("divination-provenance"));
    expect(importers).toEqual([]);
  });
});
