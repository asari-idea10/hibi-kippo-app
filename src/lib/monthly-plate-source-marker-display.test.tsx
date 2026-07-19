import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  MonthlyPlateSourceCoverage,
  MonthlyPlateSourceMarkers,
} from "@/components/monthly-plate-source-markers";
import {
  getMonthlyPlateSourceCoverageForDisplay,
  getMonthlyPlateSourceMarkerGroupForYearBranch,
  getMonthlyPlateSourceMarkersForDisplay,
  monthlyPlateSourceMarkerFixtures,
  monthlyPlateSourcePositionLabels,
} from "@/lib/monthly-plate-source-marker-display";

const repoRoot = process.cwd();

describe("monthly plate source marker display fixtures", () => {
  test("keeps the first evidence-only scope at five static records", () => {
    expect(monthlyPlateSourceMarkerFixtures).toHaveLength(5);
    expect(
      monthlyPlateSourceMarkerFixtures.filter(({ rawLabel }) => rawLabel === "天合"),
    ).toHaveLength(3);
    expect(
      monthlyPlateSourceMarkerFixtures.filter(({ rawLabel }) => rawLabel === "冲"),
    ).toHaveLength(2);
  });

  test("keeps the approved A, B, and C Tiger marker sets", () => {
    expect(
      getMonthlyPlateSourceMarkersForDisplay({
        yearBranchGroup: "A",
        monthBranch: "寅",
      }).map(({ rawLabel, sourcePosition }) => [rawLabel, sourcePosition]),
    ).toEqual([
      ["天合", "bottom"],
      ["冲", "lower_left"],
    ]);
    expect(
      getMonthlyPlateSourceMarkersForDisplay({
        yearBranchGroup: "B",
        monthBranch: "寅",
      }).map(({ rawLabel, sourcePosition }) => [rawLabel, sourcePosition]),
    ).toEqual([["天合", "bottom"]]);
    expect(
      getMonthlyPlateSourceMarkersForDisplay({
        yearBranchGroup: "C",
        monthBranch: "寅",
      }).map(({ rawLabel, sourcePosition }) => [rawLabel, sourcePosition]),
    ).toEqual([
      ["天合", "bottom"],
      ["冲", "upper_right"],
    ]);
  });

  test("resolves the accepted year-branch groups without importing provenance", () => {
    expect(["子", "卯", "午", "酉"].map(getMonthlyPlateSourceMarkerGroupForYearBranch)).toEqual([
      "A",
      "A",
      "A",
      "A",
    ]);
    expect(["丑", "辰", "未", "戌"].map(getMonthlyPlateSourceMarkerGroupForYearBranch)).toEqual([
      "B",
      "B",
      "B",
      "B",
    ]);
    expect(["寅", "巳", "申", "亥"].map(getMonthlyPlateSourceMarkerGroupForYearBranch)).toEqual([
      "C",
      "C",
      "C",
      "C",
    ]);
    expect(getMonthlyPlateSourceMarkerGroupForYearBranch("-")).toBeNull();
  });

  test("returns no panel data outside the verified Tiger pilots", () => {
    expect(
      getMonthlyPlateSourceMarkersForDisplay({
        yearBranchGroup: "A",
        monthBranch: "未",
      }),
    ).toEqual([]);
    expect(
      getMonthlyPlateSourceMarkersForDisplay({
        yearBranchGroup: null,
        monthBranch: "寅",
      }),
    ).toEqual([]);
  });

  test("retains source, asset, interpretation, and non-direction evidence fields", () => {
    expect(new Set(monthlyPlateSourceMarkerFixtures.map(({ sourceId }) => sourceId))).toEqual(
      new Set(["HMA-P24-IMG-20260715"]),
    );
    expect(monthlyPlateSourceMarkerFixtures.every(({ assetIds }) => assetIds.length >= 2)).toBe(true);
    expect(
      monthlyPlateSourceMarkerFixtures.every(
        ({ direction8, mountain24, displayPolicy, verificationStatus }) =>
          direction8 === null &&
          mountain24 === null &&
          displayPolicy === "visible_evidence_only" &&
          verificationStatus === "photo_confirmed",
      ),
    ).toBe(true);
    expect(
      monthlyPlateSourceMarkerFixtures.map(({ interpretation }) => interpretation.status),
    ).toEqual(Array(5).fill("legend_confirmed_rule_unconnected"));
  });

  test("does not ingest unresolved or out-of-scope markers", () => {
    const labels = monthlyPlateSourceMarkerFixtures.map(({ rawLabel }) => rawLabel);
    expect(labels).not.toContain("月合");
    expect(labels).not.toContain("天月");
    expect(labels).not.toContain("三合");
    expect(monthlyPlateSourceMarkerFixtures).toHaveLength(5);
  });

  test("keeps paper-position labels separate from compass directions", () => {
    expect(monthlyPlateSourcePositionLabels.bottom).toBe("紙面下");
    expect(monthlyPlateSourcePositionLabels.lower_left).toBe("紙面左下");
    expect(monthlyPlateSourcePositionLabels.upper_right).toBe("紙面右上");
    expect(Object.values(monthlyPlateSourcePositionLabels)).not.toContain("北");
    expect(Object.values(monthlyPlateSourcePositionLabels)).not.toContain("南");
  });
});

describe("monthly plate source marker evidence panel", () => {
  test("renders nothing for an empty fixture match", () => {
    expect(renderToStaticMarkup(<MonthlyPlateSourceMarkers markers={[]} />)).toBe("");
  });

  test("renders raw evidence, source, and the non-judgement notice", () => {
    const markers = getMonthlyPlateSourceMarkersForDisplay({
      yearBranchGroup: "A",
      monthBranch: "寅",
    });
    const markup = renderToStaticMarkup(<MonthlyPlateSourceMarkers markers={markers} />);

    expect(markup).toContain("月盤原典marker（検証中）");
    expect(markup).toContain("天合");
    expect(markup).toContain("冲");
    expect(markup).toContain("紙面下");
    expect(markup).toContain("紙面左下");
    expect(markup).toContain("HMA-P24-IMG-20260715");
    expect(markup).toContain("8方位・24山として確定していません");
    expect(markup).toContain("候補、ランク、警告、吉凶判定には使用していません");
  });
});

describe("monthly plate source coverage", () => {
  test("keeps Level 1 confirmed for every month", () => {
    const coverage = getMonthlyPlateSourceCoverageForDisplay({
      yearBranchGroup: "A",
      monthBranch: "未",
    });

    expect(coverage.level1).toEqual({
      status: "confirmed",
      items: [
        "center",
        "large_star_grid",
        "five_yellow",
        "dark_sword",
        "month_break",
      ],
    });
  });

  test("shows non-pilot months as not yet reviewed without marker details", () => {
    const coverage = getMonthlyPlateSourceCoverageForDisplay({
      yearBranchGroup: "A",
      monthBranch: "未",
    });
    const markup = renderToStaticMarkup(
      <MonthlyPlateSourceCoverage coverage={coverage} />,
    );

    expect(coverage.level2.status).toBe("not_yet_reviewed");
    expect(coverage.level2.markers).toEqual([]);
    expect(markup).toContain("月盤原典の照合状況");
    expect(markup).toContain("基本盤：照合済み");
    expect(markup).toContain("中宮・九星配置・五黄殺・暗剣殺・月破");
    expect(markup).toContain("追加marker：この月は未照合");
    expect(markup).toContain("細字方位神は寅月Pilotから順次確認中");
    expect(markup).not.toContain("月盤原典marker（検証中）");
    expect(markup).not.toContain("天合");
    expect(markup).not.toContain("冲");
  });

  test("shows pilot coverage and nests the confirmed marker details", () => {
    const coverage = getMonthlyPlateSourceCoverageForDisplay({
      yearBranchGroup: "A",
      monthBranch: "寅",
    });
    const markup = renderToStaticMarkup(
      <MonthlyPlateSourceCoverage coverage={coverage} />,
    );

    expect(coverage.level2.status).toBe("pilot_confirmed");
    expect(markup).toContain("基本盤：照合済み");
    expect(markup).toContain("追加marker：Pilot確認あり");
    expect(markup).toContain("天合・冲");
    expect(markup).toContain("月盤原典marker（検証中）");
    expect(markup).toContain("8方位・24山として確定していません");
    expect(markup).toContain("候補、ランク、警告、吉凶判定には使用していません");
  });

  test("shows only the marker labels confirmed for each pilot group", () => {
    const coverage = getMonthlyPlateSourceCoverageForDisplay({
      yearBranchGroup: "B",
      monthBranch: "寅",
    });
    const markup = renderToStaticMarkup(
      <MonthlyPlateSourceCoverage coverage={coverage} />,
    );

    expect(markup).toContain("追加marker：Pilot確認あり");
    expect(markup).toContain(">天合<");
    expect(markup).not.toContain("天合・冲");
  });
});

describe("monthly plate source marker import boundaries", () => {
  test("is imported only by its component, page, and dedicated test", () => {
    const files = [
      "src/lib/calendar-db-view.ts",
      "src/lib/good-fortune-directions.ts",
      "src/lib/direction-deities.ts",
      "src/lib/direction-palace-blend-master.ts",
      "src/components/direction-compass.tsx",
      "src/components/direction-mountain-ring.tsx",
    ];

    files.forEach((file) => {
      expect(fs.readFileSync(path.join(repoRoot, file), "utf8"), file).not.toContain(
        "monthly-plate-source-marker-display",
      );
    });
  });

  test("does not add an API or URL parameter binding", () => {
    const apiFiles = fs
      .readdirSync(path.join(repoRoot, "src/app/api"), { recursive: true })
      .filter((entry) => typeof entry === "string" && /\.(ts|tsx)$/.test(entry));

    apiFiles.forEach((entry) => {
      const source = fs.readFileSync(path.join(repoRoot, "src/app/api", entry), "utf8");
      expect(source, entry).not.toContain("monthly-plate-source-marker-display");
    });
    expect(fs.readFileSync(path.join(repoRoot, "docs/url-parameters.md"), "utf8")).not.toContain(
      "monthlyPlateSourceMarker",
    );
  });

  test("passes the coverage result only to the evidence component", () => {
    const pageSource = fs.readFileSync(
      path.join(repoRoot, "src/app/purpose-calendar/page.tsx"),
      "utf8",
    );

    expect(pageSource.match(/monthlySourceCoverage/g)).toHaveLength(2);
    expect(pageSource).toContain(
      "<MonthlyPlateSourceCoverage coverage={monthlySourceCoverage} />",
    );
    expect(pageSource.indexOf("<MonthlyPlateSourceCoverage coverage={monthlySourceCoverage} />")).toBeGreaterThan(
      pageSource.indexOf("{directionMountainScopeCopy.month.note}"),
    );
    expect(pageSource.indexOf("<MonthlyPlateSourceCoverage coverage={monthlySourceCoverage} />")).toBeLessThan(
      pageSource.indexOf('centerLabel="月盤"'),
    );
  });

});
