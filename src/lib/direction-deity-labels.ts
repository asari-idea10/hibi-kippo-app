export type DirectionDeityLabelSource = {
  code: string;
  name: string;
};

const directionDeityShortLabels: Record<string, string> = {
  saitokujin: "恵方",
  taisai: "太歳",
  taiin: "太陰",
  saiha: "歳破",
  daishogun: "大将",
  saikei: "歳刑",
  saisatsu: "歳殺",
  kohan: "黄幡",
  hyobi: "豹尾",
  konjin_year: "金神",
  tenichijin: "天一",
};

export function getDirectionDeityShortLabel(entry: DirectionDeityLabelSource) {
  return directionDeityShortLabels[entry.code] ?? entry.name.slice(0, 1);
}
