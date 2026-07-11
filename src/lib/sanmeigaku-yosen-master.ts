import { getEnergyStrengthRule } from "@/lib/sanmeigaku-star-description-master";

export type HeavenlyStem =
  | "甲"
  | "乙"
  | "丙"
  | "丁"
  | "戊"
  | "己"
  | "庚"
  | "辛"
  | "壬"
  | "癸";

export type EarthlyBranch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

export type JuudaiShusei =
  | "貫索星"
  | "石門星"
  | "鳳閣星"
  | "調舒星"
  | "禄存星"
  | "司禄星"
  | "車騎星"
  | "牽牛星"
  | "龍高星"
  | "玉堂星";

export type JuunidaiJusei =
  | "天馳星"
  | "天極星"
  | "天報星"
  | "天胡星"
  | "天庫星"
  | "天印星"
  | "天恍星"
  | "天堂星"
  | "天貴星"
  | "天南星"
  | "天禄星"
  | "天将星";

export type YosenJuudaiPositionKey =
  | "head"
  | "leftHand"
  | "center"
  | "rightHand"
  | "belly";

export type YosenJuunidaiPositionKey = "early" | "middle" | "late";

export type YosenJuudaiPosition = {
  key: YosenJuudaiPositionKey;
  label: string;
  theme: string;
  sourceLabel: string;
  dayStem: string;
  targetStem: string;
  star: JuudaiShusei | "-";
};

export type YosenJuunidaiPosition = {
  key: YosenJuunidaiPositionKey;
  label: string;
  theme: string;
  sourceLabel: string;
  dayStem: string;
  targetBranch: string;
  star: JuunidaiJusei | "-";
  energy: number | null;
};

export type SanmeigakuYosenChart = {
  source: string;
  dayStem: string;
  energyTotal: number;
  strengthLabel: "身弱" | "身中" | "身強" | "未判定";
  juudai: Record<YosenJuudaiPositionKey, YosenJuudaiPosition>;
  juunidai: Record<YosenJuunidaiPositionKey, YosenJuunidaiPosition>;
};

export const yosenChartSource =
  "★フォーチューンマイレージvol.05 > 算命計算!A360:AV373 / A420:AV520";

export const heavenlyStems: HeavenlyStem[] = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
];

export const earthlyBranches: EarthlyBranch[] = [
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
];

export const juudaiShuseiByStemPair: Record<
  HeavenlyStem,
  Record<HeavenlyStem, JuudaiShusei>
> = {
  甲: {
    甲: "貫索星",
    乙: "石門星",
    丙: "鳳閣星",
    丁: "調舒星",
    戊: "禄存星",
    己: "司禄星",
    庚: "車騎星",
    辛: "牽牛星",
    壬: "龍高星",
    癸: "玉堂星",
  },
  乙: {
    甲: "石門星",
    乙: "貫索星",
    丙: "調舒星",
    丁: "鳳閣星",
    戊: "司禄星",
    己: "禄存星",
    庚: "牽牛星",
    辛: "車騎星",
    壬: "玉堂星",
    癸: "龍高星",
  },
  丙: {
    甲: "龍高星",
    乙: "玉堂星",
    丙: "貫索星",
    丁: "石門星",
    戊: "鳳閣星",
    己: "調舒星",
    庚: "禄存星",
    辛: "司禄星",
    壬: "車騎星",
    癸: "牽牛星",
  },
  丁: {
    甲: "玉堂星",
    乙: "龍高星",
    丙: "石門星",
    丁: "貫索星",
    戊: "調舒星",
    己: "鳳閣星",
    庚: "司禄星",
    辛: "禄存星",
    壬: "牽牛星",
    癸: "車騎星",
  },
  戊: {
    甲: "車騎星",
    乙: "牽牛星",
    丙: "龍高星",
    丁: "玉堂星",
    戊: "貫索星",
    己: "石門星",
    庚: "鳳閣星",
    辛: "調舒星",
    壬: "禄存星",
    癸: "司禄星",
  },
  己: {
    甲: "牽牛星",
    乙: "車騎星",
    丙: "玉堂星",
    丁: "龍高星",
    戊: "石門星",
    己: "貫索星",
    庚: "調舒星",
    辛: "鳳閣星",
    壬: "司禄星",
    癸: "禄存星",
  },
  庚: {
    甲: "禄存星",
    乙: "司禄星",
    丙: "車騎星",
    丁: "牽牛星",
    戊: "龍高星",
    己: "玉堂星",
    庚: "貫索星",
    辛: "石門星",
    壬: "鳳閣星",
    癸: "調舒星",
  },
  辛: {
    甲: "司禄星",
    乙: "禄存星",
    丙: "牽牛星",
    丁: "車騎星",
    戊: "玉堂星",
    己: "龍高星",
    庚: "石門星",
    辛: "貫索星",
    壬: "調舒星",
    癸: "鳳閣星",
  },
  壬: {
    甲: "鳳閣星",
    乙: "調舒星",
    丙: "禄存星",
    丁: "司禄星",
    戊: "車騎星",
    己: "牽牛星",
    庚: "龍高星",
    辛: "玉堂星",
    壬: "貫索星",
    癸: "石門星",
  },
  癸: {
    甲: "調舒星",
    乙: "鳳閣星",
    丙: "司禄星",
    丁: "禄存星",
    戊: "牽牛星",
    己: "車騎星",
    庚: "玉堂星",
    辛: "龍高星",
    壬: "石門星",
    癸: "貫索星",
  },
};

const juunidaiEnergyByStemBranch: Record<
  HeavenlyStem,
  Record<EarthlyBranch, number>
> = {
  甲: { 子: 7, 丑: 10, 寅: 11, 卯: 12, 辰: 8, 巳: 4, 午: 2, 未: 5, 申: 1, 酉: 3, 戌: 6, 亥: 9 },
  乙: { 子: 4, 丑: 8, 寅: 12, 卯: 11, 辰: 10, 巳: 7, 午: 9, 未: 6, 申: 3, 酉: 1, 戌: 5, 亥: 2 },
  丙: { 子: 3, 丑: 6, 寅: 9, 卯: 7, 辰: 10, 巳: 11, 午: 12, 未: 8, 申: 4, 酉: 2, 戌: 5, 亥: 1 },
  丁: { 子: 1, 丑: 5, 寅: 2, 卯: 4, 辰: 8, 巳: 12, 午: 11, 未: 10, 申: 7, 酉: 9, 戌: 6, 亥: 3 },
  戊: { 子: 3, 丑: 6, 寅: 9, 卯: 7, 辰: 10, 巳: 11, 午: 12, 未: 8, 申: 4, 酉: 2, 戌: 5, 亥: 1 },
  己: { 子: 1, 丑: 5, 寅: 2, 卯: 4, 辰: 8, 巳: 12, 午: 11, 未: 10, 申: 7, 酉: 9, 戌: 6, 亥: 3 },
  庚: { 子: 2, 丑: 5, 寅: 1, 卯: 3, 辰: 6, 巳: 9, 午: 7, 未: 10, 申: 11, 酉: 12, 戌: 8, 亥: 4 },
  辛: { 子: 9, 丑: 6, 寅: 3, 卯: 1, 辰: 5, 巳: 2, 午: 4, 未: 8, 申: 12, 酉: 11, 戌: 10, 亥: 7 },
  壬: { 子: 12, 丑: 8, 寅: 4, 卯: 2, 辰: 5, 巳: 1, 午: 3, 未: 6, 申: 9, 酉: 7, 戌: 10, 亥: 11 },
  癸: { 子: 11, 丑: 10, 寅: 7, 卯: 9, 辰: 6, 巳: 3, 午: 1, 未: 5, 申: 2, 酉: 4, 戌: 8, 亥: 12 },
};

export const juunidaiJuseiByEnergy: Record<number, JuunidaiJusei> = {
  1: "天馳星",
  2: "天極星",
  3: "天報星",
  4: "天胡星",
  5: "天庫星",
  6: "天印星",
  7: "天恍星",
  8: "天堂星",
  9: "天貴星",
  10: "天南星",
  11: "天禄星",
  12: "天将星",
};

function isHeavenlyStem(value: string): value is HeavenlyStem {
  return heavenlyStems.includes(value as HeavenlyStem);
}

function isEarthlyBranch(value: string): value is EarthlyBranch {
  return earthlyBranches.includes(value as EarthlyBranch);
}

export function getJuudaiShusei(dayStem: string, targetStem: string) {
  if (!isHeavenlyStem(dayStem) || !isHeavenlyStem(targetStem)) {
    return "-";
  }

  return juudaiShuseiByStemPair[dayStem][targetStem];
}

export function getJuunidaiJusei(dayStem: string, targetBranch: string) {
  if (!isHeavenlyStem(dayStem) || !isEarthlyBranch(targetBranch)) {
    return { star: "-" as const, energy: null };
  }

  const energy = juunidaiEnergyByStemBranch[dayStem][targetBranch];

  return {
    star: juunidaiJuseiByEnergy[energy],
    energy,
  };
}

export function getEnergyStrengthLabel(total: number) {
  if (!Number.isFinite(total) || total <= 0) {
    return "未判定";
  }

  return getEnergyStrengthRule(total)?.strengthClass ?? "未判定";
}
