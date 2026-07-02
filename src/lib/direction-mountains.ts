export type Direction8 =
  | "北"
  | "北東"
  | "東"
  | "南東"
  | "南"
  | "南西"
  | "西"
  | "北西";

export type DirectionMountain =
  | "壬"
  | "子"
  | "癸"
  | "丑"
  | "艮"
  | "寅"
  | "甲"
  | "卯"
  | "乙"
  | "辰"
  | "巽"
  | "巳"
  | "丙"
  | "午"
  | "丁"
  | "未"
  | "坤"
  | "申"
  | "庚"
  | "酉"
  | "辛"
  | "戌"
  | "乾"
  | "亥";

export type DirectionMountainEntry = {
  mountain: DirectionMountain;
  direction8: Direction8;
  centerDegree: number;
  startDegree: number;
  endDegree: number;
  kind: "十干" | "十二支" | "四隅";
};

const directionMountainBase = [
  { mountain: "壬", direction8: "北", centerDegree: 345, kind: "十干" },
  { mountain: "子", direction8: "北", centerDegree: 0, kind: "十二支" },
  { mountain: "癸", direction8: "北", centerDegree: 15, kind: "十干" },
  { mountain: "丑", direction8: "北東", centerDegree: 30, kind: "十二支" },
  { mountain: "艮", direction8: "北東", centerDegree: 45, kind: "四隅" },
  { mountain: "寅", direction8: "北東", centerDegree: 60, kind: "十二支" },
  { mountain: "甲", direction8: "東", centerDegree: 75, kind: "十干" },
  { mountain: "卯", direction8: "東", centerDegree: 90, kind: "十二支" },
  { mountain: "乙", direction8: "東", centerDegree: 105, kind: "十干" },
  { mountain: "辰", direction8: "南東", centerDegree: 120, kind: "十二支" },
  { mountain: "巽", direction8: "南東", centerDegree: 135, kind: "四隅" },
  { mountain: "巳", direction8: "南東", centerDegree: 150, kind: "十二支" },
  { mountain: "丙", direction8: "南", centerDegree: 165, kind: "十干" },
  { mountain: "午", direction8: "南", centerDegree: 180, kind: "十二支" },
  { mountain: "丁", direction8: "南", centerDegree: 195, kind: "十干" },
  { mountain: "未", direction8: "南西", centerDegree: 210, kind: "十二支" },
  { mountain: "坤", direction8: "南西", centerDegree: 225, kind: "四隅" },
  { mountain: "申", direction8: "南西", centerDegree: 240, kind: "十二支" },
  { mountain: "庚", direction8: "西", centerDegree: 255, kind: "十干" },
  { mountain: "酉", direction8: "西", centerDegree: 270, kind: "十二支" },
  { mountain: "辛", direction8: "西", centerDegree: 285, kind: "十干" },
  { mountain: "戌", direction8: "北西", centerDegree: 300, kind: "十二支" },
  { mountain: "乾", direction8: "北西", centerDegree: 315, kind: "四隅" },
  { mountain: "亥", direction8: "北西", centerDegree: 330, kind: "十二支" },
] satisfies Array<Omit<DirectionMountainEntry, "startDegree" | "endDegree">>;

export const directionMountains: DirectionMountainEntry[] = directionMountainBase.map((entry) => ({
  ...entry,
  startDegree: normalizeDegree(entry.centerDegree - 7.5),
  endDegree: normalizeDegree(entry.centerDegree + 7.5),
}));

export const branchOrder = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export type EarthlyBranch = (typeof branchOrder)[number];

export function normalizeDegree(degree: number) {
  return ((degree % 360) + 360) % 360;
}

export function getMountainEntry(mountain: string) {
  return (
    directionMountains.find((entry) => entry.mountain === mountain) ?? null
  );
}

export function getDirection8ByMountain(mountain: string) {
  return getMountainEntry(mountain)?.direction8 ?? null;
}

export function getOppositeBranch(branch: string) {
  const index = branchOrder.indexOf(branch as EarthlyBranch);

  if (index === -1) {
    return null;
  }

  return branchOrder[(index + 6) % branchOrder.length];
}

export function shiftBranch(branch: string, offset: number) {
  const index = branchOrder.indexOf(branch as EarthlyBranch);

  if (index === -1) {
    return null;
  }

  return branchOrder[(index + offset + branchOrder.length) % branchOrder.length];
}

export function getMountainByDegree(degree: number) {
  const normalized = normalizeDegree(degree);

  return (
    directionMountains.find((entry) => {
      if (entry.startDegree > entry.endDegree) {
        return normalized >= entry.startDegree || normalized < entry.endDegree;
      }

      return normalized >= entry.startDegree && normalized < entry.endDegree;
    }) ?? null
  );
}
