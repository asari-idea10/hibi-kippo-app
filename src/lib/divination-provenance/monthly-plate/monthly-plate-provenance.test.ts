import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import {
  monthlyPlateBoundaryRules,
  monthlyPlateConflictReferences,
  monthlyPlateImplementationBindings,
  monthlyPlateImplementationGaps,
  monthlyPlateImplementationObservations,
  monthlyPlateProhibitedInferences,
  monthlyPlateProjectClaims,
  monthlyPlateRules,
  monthlyPlateSourceClaims,
  monthlyPlateTechniques,
  monthlyPlateVerificationRecords,
  monthlyPlateWorkflow,
  nextDayBoundaryObservations,
} from "@/lib/divination-provenance/monthly-plate/definitions";
import {
  monthlyPlateLevel1Fixtures,
  monthlyPlateLookupTables,
  monthlyYearGroups,
  type MonthBranch,
  type MonthlyPlateGroup,
  type YearBranch,
} from "@/lib/divination-provenance/monthly-plate/fixtures";
import {
  monthlyPlateBoundaryTraces,
  normalMonthlyPlateTrace,
} from "@/lib/divination-provenance/monthly-plate/trace";
import {
  getCalendarMasterRow,
  getCalendarMasterRows,
} from "@/lib/calendar-master-rows";
import { getSolarTerms } from "@/lib/solar-terms";

const allIds = [
  ...monthlyPlateSourceClaims.map(({ claimId }) => claimId),
  ...monthlyPlateProjectClaims.map(({ claimId }) => claimId),
  ...monthlyPlateBoundaryRules.map(({ boundaryRuleId }) => boundaryRuleId),
  ...monthlyPlateRules.map(({ ruleId }) => ruleId),
  ...monthlyPlateLookupTables.map(({ lookupTableId }) => lookupTableId),
  ...monthlyPlateTechniques.map(({ techniqueId }) => techniqueId),
  monthlyPlateWorkflow.workflowId,
  ...monthlyPlateImplementationBindings.map(({ bindingId }) => bindingId),
  ...monthlyPlateImplementationObservations.map(({ observationId }) => observationId),
  ...monthlyPlateVerificationRecords.map(({ verificationId }) => verificationId),
  ...monthlyPlateConflictReferences.map(({ conflictId }) => conflictId),
  ...monthlyPlateProhibitedInferences.map(({ prohibitedInferenceId }) => prohibitedInferenceId),
  ...monthlyPlateImplementationGaps.map(({ implementationGapId }) => implementationGapId),
];

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

describe("月盤Level 1 provenance registry", () => {
  test("全IDが一意でversionを持つ", () => {
    expect(new Set(allIds)).toHaveLength(allIds.length);
    expect(monthlyPlateTechniques.every(({ techniqueVersion }) => techniqueVersion)).toBe(true);
    expect(monthlyPlateRules.every(({ ruleVersion }) => ruleVersion)).toBe(true);
    expect(monthlyPlateBoundaryRules.every(({ boundaryVersion }) => boundaryVersion)).toBe(true);
    expect(monthlyPlateLookupTables.every(({ lookupTableVersion }) => lookupTableVersion)).toBe(true);
    expect(monthlyPlateSourceClaims.every(({ sourceClaimVersion }) => sourceClaimVersion)).toBe(true);
    expect(monthlyPlateProjectClaims.every(({ projectClaimVersion }) => projectClaimVersion)).toBe(true);
    expect(monthlyPlateWorkflow.workflowVersion).toBe("1");
  });

  test("8 Techniqueと効果なしworkflow aggregateを保持する", () => {
    expect(monthlyPlateTechniques.map(({ techniqueId }) => techniqueId)).toEqual([
      "monthly-period-resolution",
      "monthly-year-group-resolution",
      "monthly-center-star",
      "monthly-nine-palace-placement",
      "monthly-gohosatsu",
      "monthly-ankensatsu",
      "monthly-breaker",
      "monthly-source-orientation",
    ]);
    expect(monthlyPlateWorkflow.techniqueIds).toEqual(
      monthlyPlateTechniques.map(({ techniqueId }) => techniqueId),
    );
    expect(monthlyPlateWorkflow.effectType).toBe("none");
    expect(monthlyPlateWorkflow.applicationPolicyIds).toEqual([]);
  });

  test("Technique依存・rule・boundary・bindingの参照IDが実在する", () => {
    const techniqueIds = new Set(monthlyPlateTechniques.map(({ techniqueId }) => techniqueId));
    const ruleIds = new Set(monthlyPlateRules.map(({ ruleId }) => ruleId));
    const boundaryIds = new Set(monthlyPlateBoundaryRules.map(({ boundaryRuleId }) => boundaryRuleId));
    const bindingIds = new Set(monthlyPlateImplementationBindings.map(({ bindingId }) => bindingId));
    const sourceClaimIds = new Set(monthlyPlateSourceClaims.map(({ claimId }) => claimId));
    const projectClaimIds = new Set(monthlyPlateProjectClaims.map(({ claimId }) => claimId));
    const lookupIds = new Set(monthlyPlateLookupTables.map(({ lookupTableId }) => lookupTableId));

    for (const technique of monthlyPlateTechniques) {
      expect(technique.dependencyTechniqueIds.every((id) => techniqueIds.has(id))).toBe(true);
      expect(technique.ruleIds.every((id) => ruleIds.has(id))).toBe(true);
      expect(technique.boundaryRuleIds.every((id) => boundaryIds.has(id))).toBe(true);
      expect(technique.implementationBindingIds.every((id) => bindingIds.has(id))).toBe(true);
      expect(technique.sourceClaimIds.every((id) => sourceClaimIds.has(id))).toBe(true);
      expect(technique.projectClaimIds.every((id) => projectClaimIds.has(id))).toBe(true);
    }

    for (const rule of monthlyPlateRules) {
      expect(techniqueIds.has(rule.techniqueId)).toBe(true);
      expect(rule.boundaryRuleIds.every((id) => boundaryIds.has(id))).toBe(true);
      expect(rule.sourceClaimIds.every((id) => sourceClaimIds.has(id))).toBe(true);
      expect(rule.projectClaimIds.every((id) => projectClaimIds.has(id))).toBe(true);
      expect(rule.lookupTableIds.every((id) => lookupIds.has(id))).toBe(true);
    }
  });

  test("source claimとproject claimを分離する", () => {
    const sourceIds = new Set(monthlyPlateSourceClaims.map(({ claimId }) => claimId));
    const projectIds = new Set(monthlyPlateProjectClaims.map(({ claimId }) => claimId));
    expect([...sourceIds].filter((id) => projectIds.has(id))).toEqual([]);
    expect(sourceIds.has("source-claim.monthly-setsuiri-boundary-rule.v1")).toBe(true);
    expect(projectIds.has("project-claim.monthly-boundary-at-setsuiri.v1")).toBe(true);
    expect(
      monthlyPlateSourceClaims.find(
        ({ claimId }) => claimId === "source-claim.monthly-setsuiri-boundary-rule.v1",
      )?.sourceVerificationStatus,
    ).toBe("partially_confirmed");
    expect(
      monthlyPlateProjectClaims.find(
        ({ claimId }) => claimId === "project-claim.monthly-boundary-at-setsuiri.v1",
      )?.projectAdoptionStatus,
    ).toBe("adopted");
  });

  test("PO確認claimを古典一次資料と区別する", () => {
    const poClaims = monthlyPlateSourceClaims.filter(({ sourceType }) => sourceType === "po_confirmed");
    expect(poClaims.map(({ claimId }) => claimId)).toEqual([
      "source-claim.po-a-tiger-large-stars.v1",
      "source-claim.po-c-tiger-large-stars.v1",
    ]);
    expect(poClaims.every(({ sourceType }) => sourceType !== ("classical_primary" as string))).toBe(true);
  });

  test("existing implementationをSourceClaimへ昇格しない", () => {
    expect(monthlyPlateSourceClaims.some(({ sourceType }) => sourceType === ("existing_implementation" as string))).toBe(false);
    expect(monthlyPlateImplementationBindings).toHaveLength(4);
    expect(monthlyPlateImplementationObservations[0].status).toBe("implementation_observed");
  });
});

describe("月盤Level 1静的fixture", () => {
  test("3 group×12月の36 fixtureと324宮を保持する", () => {
    expect(monthlyPlateLevel1Fixtures).toHaveLength(36);
    expect(
      monthlyPlateLevel1Fixtures.reduce(
        (count, fixture) => count + Object.keys(fixture.palaceStars).length,
        0,
      ),
    ).toBe(324);
  });

  test("各盤は九星1〜9を一度ずつ含む", () => {
    for (const fixture of monthlyPlateLevel1Fixtures) {
      const stars = Object.values(fixture.palaceStars);
      expect(stars).toHaveLength(9);
      expect(new Set(stars)).toHaveLength(9);
      expect([...stars].sort()).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
      expect(fixture.palaceStars.中央).toBe(fixture.centerStar);
    }
  });

  test("年支groupは12支を重複なく覆う", () => {
    const branches = Object.values(monthlyYearGroups).flatMap(({ yearBranches }) => yearBranches);
    expect(branches).toHaveLength(12);
    expect(new Set(branches)).toHaveLength(12);
  });

  test("A寅はPO確認済みの東6・南東7", () => {
    const fixture = monthlyPlateLevel1Fixtures.find(
      ({ yearGroup, monthBranch }) => yearGroup === "A" && monthBranch === "寅",
    );
    expect(fixture?.palaceStars.東).toBe("6");
    expect(fixture?.palaceStars.南東).toBe("7");
  });

  test("C寅はPO確認済みの南6・南西8・西4", () => {
    const fixture = monthlyPlateLevel1Fixtures.find(
      ({ yearGroup, monthBranch }) => yearGroup === "C" && monthBranch === "寅",
    );
    expect(fixture?.palaceStars.南).toBe("6");
    expect(fixture?.palaceStars.南西).toBe("8");
    expect(fixture?.palaceStars.西).toBe("4");
  });

  test("Level 1以外のmarker・application値を含めない", () => {
    const allowedKeys = [
      "fixtureId", "yearGroup", "yearBranches", "monthBranch", "monthNumber",
      "centerStar", "palaceStars", "gohosatsu", "ankensatsu", "monthBreaker",
      "sourceOrientationLookupId",
    ].sort();
    for (const fixture of monthlyPlateLevel1Fixtures) {
      expect(Object.keys(fixture).sort()).toEqual(allowedKeys);
    }
    const serialized = JSON.stringify(monthlyPlateLevel1Fixtures);
    for (const excluded of ["天道", "天徳", "月徳", "月空", "生気", "定位対冲", "三合", "天月", "candidate", "ranking", "warning", "mountain24"]) {
      expect(serialized).not.toContain(excluded);
    }
  });

  test("daily master全55,152日がLevel 1 fixtureに対応する", () => {
    const fixtures = new Map(
      monthlyPlateLevel1Fixtures.map((fixture) => [
        `${fixture.yearGroup}|${fixture.monthBranch}`,
        fixture,
      ]),
    );
    const groupByBranch = Object.fromEntries(
      Object.entries(monthlyYearGroups).flatMap(([group, { yearBranches }]) =>
        yearBranches.map((branch) => [branch, group]),
      ),
    ) as Readonly<Record<YearBranch, MonthlyPlateGroup>>;
    const rows = getCalendarMasterRows({ start: "1900-01-01", end: "2050-12-31" });

    expect(rows).toHaveLength(55_152);
    for (const row of rows) {
      const fixture = fixtures.get(
        `${groupByBranch[row.duplicateYear as YearBranch]}|${row.duplicateMonth as MonthBranch}`,
      );
      expect(fixture?.centerStar, row.date).toBe(row.monthKyusei);
      expect(fixture?.gohosatsu ?? "", row.date).toBe(row.monthGohosatsu);
      expect(fixture?.ankensatsu ?? "", row.date).toBe(row.monthAnkensatsu);
      expect(fixture?.monthBreaker, row.date).toBe(row.monthSaiha);
    }
  });
});

describe("月盤dual-lane boundary provenance", () => {
  test("source/project時刻境界とdaily master日境界を別BoundaryRuleにする", () => {
    const timestamp = monthlyPlateBoundaryRules.find(
      ({ boundaryRuleId }) => boundaryRuleId === "boundary.monthly-setsuiri-timestamp.v1",
    );
    const daily = monthlyPlateBoundaryRules.find(
      ({ boundaryRuleId }) => boundaryRuleId === "boundary.monthly-daily-master-resolution.v1",
    );
    expect(timestamp?.effectiveResolution).toBe("second");
    expect(timestamp?.exactTimestampSupport).toBe(true);
    expect(daily?.precisionStatus).toBe("daily_normalized_confirmed");
    expect(daily?.implementationResolution).toBe("date");
    expect(daily?.exactTimestampSupport).toBe(false);
    expect(daily?.sourceClaimIds).toEqual([]);
    expect(daily?.projectClaimIds).toEqual([]);
  });

  test("通常traceは2026-07-08の9宮とLevel 1結果を保持する", () => {
    const result = Object.fromEntries(
      normalMonthlyPlateTrace.result.map(({ fieldId, value }) => [fieldId, value]),
    );
    expect(result).toMatchObject({
      yearBranch: "午",
      yearGroup: "A",
      monthBranch: "未",
      centerStar: "3",
      gohosatsu: "西",
      ankensatsu: "東",
      monthBreaker: "北東",
    });
    expect(result.palaceStars).toEqual({
      北: "8", 北東: "6", 東: "1", 南東: "2", 南: "7",
      南西: "9", 西: "5", 北西: "4", 中央: "3",
    });
    expect(normalMonthlyPlateTrace.steps).toHaveLength(7);
  });

  test("節入り直前だけcurrent implementationとの差を保持する", () => {
    expect(monthlyPlateBoundaryTraces.map(({ differenceStatus }) => differenceStatus)).toEqual([
      "implementation_gap", "match", "match",
    ]);
    const before = monthlyPlateBoundaryTraces[0];
    expect(before.lanes).toEqual([
      expect.objectContaining({ lane: "source_rule", monthBranch: "午", centerStar: "4" }),
      expect.objectContaining({ lane: "project_adopted", monthBranch: "午", centerStar: "4" }),
      expect.objectContaining({ lane: "current_implementation", monthBranch: "未", centerStar: "3" }),
    ]);
    expect(before.implementationGapId).toBe(
      "gap.monthly.2026-shosho-pre-boundary-daily-master.v1",
    );
  });

  test("境界traceの全laneがBoundaryRuleとRuleDefinitionを参照する", () => {
    const boundaryIds = new Set(monthlyPlateBoundaryRules.map(({ boundaryRuleId }) => boundaryRuleId));
    const ruleIds = new Set(monthlyPlateRules.map(({ ruleId }) => ruleId));
    for (const trace of monthlyPlateBoundaryTraces) {
      expect(trace.lanes.map(({ lane }) => lane)).toEqual([
        "source_rule", "project_adopted", "current_implementation",
      ]);
      for (const lane of trace.lanes) {
        expect(lane.relatedBoundaryRuleIds.every((id) => boundaryIds.has(id))).toBe(true);
        expect(lane.relatedRuleDefinitionIds.every((id) => ruleIds.has(id))).toBe(true);
      }
    }
  });

  test("公式節入り1,812件のdaily master切替観測を再現する", () => {
    const terms = getSolarTerms().filter(({ isSetsuiriForKyusei }) => isSetsuiriForKyusei);
    const nextDay: Array<{ date: string; term: string }> = [];
    let sameDay = 0;
    let missing = 0;

    for (const term of terms) {
      const previous = getCalendarMasterRow(addDays(term.date, -1));
      const current = getCalendarMasterRow(term.date);
      const next = getCalendarMasterRow(addDays(term.date, 1));
      if (!previous || !current || !next) {
        missing += 1;
      } else if (previous.duplicateMonth !== current.duplicateMonth) {
        sameDay += 1;
      } else if (current.duplicateMonth !== next.duplicateMonth) {
        nextDay.push({ date: term.date, term: term.name });
      }
    }

    expect(terms).toHaveLength(1812);
    expect(sameDay).toBe(1806);
    expect(nextDay).toEqual([...nextDayBoundaryObservations]);
    expect(missing).toBe(0);
    expect(monthlyPlateImplementationObservations[0].counts).toEqual({
      officialSolarTermTimestamps: 1812,
      sameDaySwitch: 1806,
      nextDaySwitch: 6,
      missing: 0,
    });
  });

  test("翌日切替6件の理由と境界gapをunresolved/openで保持する", () => {
    expect(nextDayBoundaryObservations).toHaveLength(6);
    expect(monthlyPlateImplementationObservations[0].unresolvedIssues).toHaveLength(1);
    expect(monthlyPlateImplementationGaps).toEqual([
      expect.objectContaining({
        implementationGapId: "gap.monthly.2026-shosho-pre-boundary-daily-master.v1",
        status: "open",
      }),
    ]);
  });
});

describe("Level 1非接続・conflict・安全制約", () => {
  test("conflict参照を消さずLevel 1結果から除外する", () => {
    expect(monthlyPlateConflictReferences.map(({ conflictId }) => conflictId)).toEqual([
      "conflict.monthly.c-tiger-gettoku-go.v1",
      "conflict.monthly.source-trine-vs-current.v1",
      "conflict.monthly.fine-markers-evidence.v1",
    ]);
    expect(monthlyPlateConflictReferences.every(({ excludedFromLevel1Result }) => excludedFromLevel1Result)).toBe(true);
    expect(normalMonthlyPlateTrace.conflictReferenceIds).toEqual(
      monthlyPlateConflictReferences.map(({ conflictId }) => conflictId),
    );
  });

  test("candidate・ranking・warningへ接続しない", () => {
    expect(monthlyPlateTechniques.every(({ applicationPolicyIds }) => applicationPolicyIds.length === 0)).toBe(true);
    expect(monthlyPlateWorkflow.applicationPolicyIds).toEqual([]);
    expect(monthlyPlateWorkflow.effectType).toBe("none");
  });

  test("prohibited inference 10件を登録する", () => {
    expect(monthlyPlateProhibitedInferences).toHaveLength(10);
    expect(monthlyPlateTechniques.every(
      ({ prohibitedInferenceIds }) => prohibitedInferenceIds.length === 10,
    )).toBe(true);
  });

  test("静的registryに個人情報の実値用fieldを登録しない", () => {
    const serialized = JSON.stringify({
      claims: monthlyPlateSourceClaims,
      projectClaims: monthlyPlateProjectClaims,
      techniques: monthlyPlateTechniques,
      workflow: monthlyPlateWorkflow,
    });
    for (const piiField of ["personName", "birthDate", "birthTime", "latitude", "longitude", "companionName"]) {
      expect(serialized).not.toContain(piiField);
    }
  });

  test("app・component・既存production moduleにprovenance import経路がない", () => {
    const provenanceRoot = path.join(process.cwd(), "src/lib/divination-provenance");
    const files = [
      ...listSourceFiles(path.join(process.cwd(), "src/app")),
      ...listSourceFiles(path.join(process.cwd(), "src/components")),
      ...listSourceFiles(path.join(process.cwd(), "src/lib")),
    ].filter((filePath) => !filePath.startsWith(provenanceRoot));
    const importers = files.filter((filePath) =>
      readFileSync(filePath, "utf8").includes("divination-provenance"),
    );
    expect(importers).toEqual([]);
  });
});
