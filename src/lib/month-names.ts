const traditionalMonthNames = [
  "睦月",
  "如月",
  "弥生",
  "卯月",
  "皐月",
  "水無月",
  "文月",
  "葉月",
  "長月",
  "神無月",
  "霜月",
  "師走",
] as const;

export function getTraditionalMonthName(month: number) {
  return traditionalMonthNames[month - 1] ?? null;
}

