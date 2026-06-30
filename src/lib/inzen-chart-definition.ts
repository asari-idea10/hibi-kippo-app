import inzenChartDefinitionJson from "@/data/inzen-chart-definition.json";

export type InzenColumnKey = "year" | "month" | "day" | "time";
export type InzenRowKey =
  | "heavenly_stem"
  | "earthly_branch"
  | "hidden_stems_main"
  | "hidden_stems_middle"
  | "hidden_stems_extra"
  | "nine_stars"
  | "story";

export type InzenColumnDefinition = {
  label: string;
  period: string;
  theme: string;
};

export type InzenRowDefinition = {
  label: string;
  description: string;
};

export type InzenCellContext = {
  meaning: string;
  challenge: string;
  value?: string;
};

export type InzenChartDefinition = {
  chart_definition: {
    columns: Record<InzenColumnKey, InzenColumnDefinition>;
    rows: Record<InzenRowKey, InzenRowDefinition>;
    matrix_content: Record<InzenColumnKey, Record<InzenRowKey, InzenCellContext>>;
  };
};

export const inzenColumnKeys: InzenColumnKey[] = [
  "year",
  "month",
  "day",
  "time",
];

export const inzenChartDefinition =
  inzenChartDefinitionJson as InzenChartDefinition;

export function getInzenCellContext(
  columnKey: InzenColumnKey,
  rowKey: InzenRowKey,
) {
  return inzenChartDefinition.chart_definition.matrix_content[columnKey][rowKey];
}
