const branches = [
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

const junichokuOrder = [
  "建",
  "除",
  "満",
  "平",
  "定",
  "執",
  "破",
  "危",
  "成",
  "納",
  "開",
  "閉",
] as const;

const nijuhachishukuOrder = [
  "角",
  "亢",
  "氐",
  "房",
  "心",
  "尾",
  "箕",
  "斗",
  "牛",
  "女",
  "虚",
  "危",
  "室",
  "壁",
  "奎",
  "婁",
  "胃",
  "昴",
  "畢",
  "觜",
  "参",
  "井",
  "鬼",
  "柳",
  "星",
  "張",
  "翼",
  "軫",
] as const;

const nijuhachishukuReferenceDate = "2026-05-28";

function dateToUtcIndex(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function calculateJunichoku(monthBranch: string, dayBranch: string) {
  const monthIndex = branches.indexOf(monthBranch as (typeof branches)[number]);
  const dayIndex = branches.indexOf(dayBranch as (typeof branches)[number]);

  if (monthIndex === -1 || dayIndex === -1) {
    return null;
  }

  return junichokuOrder[(dayIndex - monthIndex + 12) % 12];
}

export function calculateNijuhachishuku(date: string) {
  const referenceIndex = dateToUtcIndex(nijuhachishukuReferenceDate);
  const targetIndex = dateToUtcIndex(date);
  const orderIndex =
    ((targetIndex - referenceIndex) % nijuhachishukuOrder.length +
      nijuhachishukuOrder.length) %
    nijuhachishukuOrder.length;

  return nijuhachishukuOrder[orderIndex];
}
