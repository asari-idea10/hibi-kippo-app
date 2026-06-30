import { getCalendarDays, type CalendarDayRangeQuery } from "@/lib/calendar-day";
import type { CalendarDay } from "@/lib/calendar-day";

type ScoreReason = {
  label: string;
  points: number;
  detail: string;
  source: "direction_warning" | "calendar_note_definition" | "observation";
};

export type BestDayScore = {
  date: string;
  score: number;
  rankLabel: "候補日" | "注意日" | "要確認日";
  summary: string;
  day: CalendarDay;
  reasons: ScoreReason[];
  observations: {
    dayKyusei: string;
    kuubou: string;
    dayPillar: string;
    personalCheckRequired: boolean;
  };
};

const baseScore = 70;

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function buildDirectionReasons(day: CalendarDay): ScoreReason[] {
  const reasons: ScoreReason[] = [];
  const warnings = day.directionWarnings.day;

  if (warnings.ankensatsu) {
    reasons.push({
      label: "日盤 暗剣殺",
      points: -18,
      detail: `日盤の暗剣殺方位: ${warnings.ankensatsu}`,
      source: "direction_warning",
    });
  }

  if (warnings.gohosatsu) {
    reasons.push({
      label: "日盤 五黄殺",
      points: -18,
      detail: `日盤の五黄殺方位: ${warnings.gohosatsu}`,
      source: "direction_warning",
    });
  }

  if (warnings.saiha) {
    reasons.push({
      label: "日盤 破",
      points: -10,
      detail: `日盤の破の方位: ${warnings.saiha}`,
      source: "direction_warning",
    });
  }

  return reasons;
}

function buildCalendarNoteDefinitionReasons(day: CalendarDay): ScoreReason[] {
  return day.calendarNotes.activeDefinitions.map((definition) => ({
    label: definition.name,
    points: definition.weight,
    detail: `${definition.displayText} ${definition.cautionText}`,
    source: "calendar_note_definition",
  }));
}

function buildObservationReasons(day: CalendarDay): ScoreReason[] {
  return [
    {
      label: "日九星",
      points: 0,
      detail: `日九星は ${day.kyusei.day}。吉凶判定は本人固有条件と九星名称マスター接続後に扱います。`,
      source: "observation",
    },
    {
      label: "空亡",
      points: 0,
      detail: `空亡は ${day.void.kuubou}。本人命式との照合前なので、現時点では採点に入れません。`,
      source: "observation",
    },
  ];
}

function buildRankLabel(score: number): BestDayScore["rankLabel"] {
  if (score >= 70) {
    return "候補日";
  }

  if (score >= 45) {
    return "要確認日";
  }

  return "注意日";
}

function buildSummary(day: CalendarDay, score: number) {
  const warningCount = Object.values(day.directionWarnings.day).filter(Boolean).length;
  const legacy = day.calendarNotes.legacyRaw;
  const goodNotes = day.calendarNotes.activeDefinitions
    .filter((definition) => definition.weight > 0)
    .map((definition) => definition.name);

  if (score >= 70 && goodNotes.length > 0) {
    return `${goodNotes.join("・")}を含む候補日です。日盤の注意方位は${warningCount}件あります。`;
  }

  if (warningCount >= 2) {
    return "日盤の注意方位が複数あります。旅行や方位取りでは方位条件の確認が必要です。";
  }

  if (legacy.fujoju) {
    return "不成就日の旧判定があります。正式な暦注マスター接続後に再評価します。";
  }

  return "本人固有条件を入れる前の仮採点では、追加確認しながら候補化できる日です。";
}

export function scoreBestDay(day: CalendarDay): BestDayScore {
  const reasons = [
    ...buildDirectionReasons(day),
    ...buildCalendarNoteDefinitionReasons(day),
    ...buildObservationReasons(day),
  ];
  const score = clampScore(
    reasons.reduce((total, reason) => total + reason.points, baseScore),
  );

  return {
    date: day.date,
    score,
    rankLabel: buildRankLabel(score),
    summary: buildSummary(day, score),
    day,
    reasons,
    observations: {
      dayKyusei: day.kyusei.day,
      kuubou: day.void.kuubou,
      dayPillar: day.pillars.day,
      personalCheckRequired: true,
    },
  };
}

export function getBestDayScores(query: CalendarDayRangeQuery = {}) {
  return getCalendarDays(query)
    .map(scoreBestDay)
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
}
