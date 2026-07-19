export type MonthlyPlateSourceMarkerPosition =
  | "top"
  | "upper_right"
  | "right"
  | "lower_right"
  | "bottom"
  | "lower_left"
  | "left"
  | "upper_left"
  | "center";

export type MonthlyPlateSourceMarkerGroup = "A" | "B" | "C";
export type MonthlyPlateSourceMarkerRawLabel = "天合" | "冲";

export type MonthlyPlateSourceMarker = {
  markerId: string;
  yearBranchGroup: MonthlyPlateSourceMarkerGroup;
  monthBranch: "寅";
  sourcePosition: MonthlyPlateSourceMarkerPosition;
  direction8: null;
  mountain24: null;
  rawLabel: MonthlyPlateSourceMarkerRawLabel;
  interpretation: {
    label: "天徳合" | "定位対冲";
    status: "legend_confirmed_rule_unconnected";
  };
  sourceId: "HMA-P24-IMG-20260715";
  assetIds: readonly string[];
  verificationStatus: "photo_confirmed";
  evidenceScope: "pilot_only";
  displayPolicy: "visible_evidence_only";
};

export type MonthlyPlateSourceCoverage = {
  level1: {
    status: "confirmed";
    items: readonly [
      "center",
      "large_star_grid",
      "five_yellow",
      "dark_sword",
      "month_break",
    ];
  };
  level2: {
    status: "pilot_confirmed" | "not_yet_reviewed";
    markers: readonly MonthlyPlateSourceMarker[];
  };
};

export const monthlyPlateSourceMarkerFixtures = [
  {
    markerId: "monthly-source-marker-A-tiger-tengou",
    yearBranchGroup: "A",
    monthBranch: "寅",
    sourcePosition: "bottom",
    direction8: null,
    mountain24: null,
    rawLabel: "天合",
    interpretation: {
      label: "天徳合",
      status: "legend_confirmed_rule_unconnected",
    },
    sourceId: "HMA-P24-IMG-20260715",
    assetIds: ["hma-p24-01", "hma-p24-03", "hma-p24-05"],
    verificationStatus: "photo_confirmed",
    evidenceScope: "pilot_only",
    displayPolicy: "visible_evidence_only",
  },
  {
    markerId: "monthly-source-marker-A-tiger-chu",
    yearBranchGroup: "A",
    monthBranch: "寅",
    sourcePosition: "lower_left",
    direction8: null,
    mountain24: null,
    rawLabel: "冲",
    interpretation: {
      label: "定位対冲",
      status: "legend_confirmed_rule_unconnected",
    },
    sourceId: "HMA-P24-IMG-20260715",
    assetIds: ["hma-p24-01", "hma-p24-03", "hma-p24-05"],
    verificationStatus: "photo_confirmed",
    evidenceScope: "pilot_only",
    displayPolicy: "visible_evidence_only",
  },
  {
    markerId: "monthly-source-marker-B-tiger-tengou",
    yearBranchGroup: "B",
    monthBranch: "寅",
    sourcePosition: "bottom",
    direction8: null,
    mountain24: null,
    rawLabel: "天合",
    interpretation: {
      label: "天徳合",
      status: "legend_confirmed_rule_unconnected",
    },
    sourceId: "HMA-P24-IMG-20260715",
    assetIds: ["hma-p24-01", "hma-p24-05"],
    verificationStatus: "photo_confirmed",
    evidenceScope: "pilot_only",
    displayPolicy: "visible_evidence_only",
  },
  {
    markerId: "monthly-source-marker-C-tiger-tengou",
    yearBranchGroup: "C",
    monthBranch: "寅",
    sourcePosition: "bottom",
    direction8: null,
    mountain24: null,
    rawLabel: "天合",
    interpretation: {
      label: "天徳合",
      status: "legend_confirmed_rule_unconnected",
    },
    sourceId: "HMA-P24-IMG-20260715",
    assetIds: ["hma-p24-02", "hma-p24-04", "hma-p24-05"],
    verificationStatus: "photo_confirmed",
    evidenceScope: "pilot_only",
    displayPolicy: "visible_evidence_only",
  },
  {
    markerId: "monthly-source-marker-C-tiger-chu",
    yearBranchGroup: "C",
    monthBranch: "寅",
    sourcePosition: "upper_right",
    direction8: null,
    mountain24: null,
    rawLabel: "冲",
    interpretation: {
      label: "定位対冲",
      status: "legend_confirmed_rule_unconnected",
    },
    sourceId: "HMA-P24-IMG-20260715",
    assetIds: ["hma-p24-02", "hma-p24-04", "hma-p24-05"],
    verificationStatus: "photo_confirmed",
    evidenceScope: "pilot_only",
    displayPolicy: "visible_evidence_only",
  },
] as const satisfies readonly MonthlyPlateSourceMarker[];

const groupByYearBranch = {
  子: "A",
  卯: "A",
  午: "A",
  酉: "A",
  丑: "B",
  辰: "B",
  未: "B",
  戌: "B",
  寅: "C",
  巳: "C",
  申: "C",
  亥: "C",
} as const satisfies Readonly<Record<string, MonthlyPlateSourceMarkerGroup>>;

export function getMonthlyPlateSourceMarkerGroupForYearBranch(
  yearBranch: string,
): MonthlyPlateSourceMarkerGroup | null {
  return groupByYearBranch[yearBranch as keyof typeof groupByYearBranch] ?? null;
}

export function getMonthlyPlateSourceMarkersForDisplay({
  yearBranchGroup,
  monthBranch,
}: {
  yearBranchGroup: MonthlyPlateSourceMarkerGroup | null;
  monthBranch: string;
}): readonly MonthlyPlateSourceMarker[] {
  if (!yearBranchGroup || monthBranch !== "寅") {
    return [];
  }

  return monthlyPlateSourceMarkerFixtures.filter(
    (marker) =>
      marker.yearBranchGroup === yearBranchGroup &&
      marker.monthBranch === monthBranch,
  );
}

export function getMonthlyPlateSourceCoverageForDisplay({
  yearBranchGroup,
  monthBranch,
}: {
  yearBranchGroup: MonthlyPlateSourceMarkerGroup | null;
  monthBranch: string;
}): MonthlyPlateSourceCoverage {
  const markers = getMonthlyPlateSourceMarkersForDisplay({
    yearBranchGroup,
    monthBranch,
  });

  return {
    level1: {
      status: "confirmed",
      items: [
        "center",
        "large_star_grid",
        "five_yellow",
        "dark_sword",
        "month_break",
      ],
    },
    level2: {
      status: markers.length > 0 ? "pilot_confirmed" : "not_yet_reviewed",
      markers,
    },
  };
}

export const monthlyPlateSourcePositionLabels = {
  top: "紙面上",
  upper_right: "紙面右上",
  right: "紙面右",
  lower_right: "紙面右下",
  bottom: "紙面下",
  lower_left: "紙面左下",
  left: "紙面左",
  upper_left: "紙面左上",
  center: "紙面中央",
} as const satisfies Readonly<Record<MonthlyPlateSourceMarkerPosition, string>>;
