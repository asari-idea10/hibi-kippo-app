import type { CalendarDay } from "@/lib/calendar-day";

export type HourBoardTon = "陽遁" | "陰遁";

export type HourBranch =
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

export type HourBoardDirection =
  | "北"
  | "北東"
  | "東"
  | "南東"
  | "南"
  | "南西"
  | "西"
  | "北西";

export type HourBoardWarningCode = "暗剣殺" | "五黄殺" | "破";

export type HourBoardDirectionState = {
  direction: HourBoardDirection;
  star: number;
  warnings: HourBoardWarningCode[];
  warningLabel: string;
};

export type HourBoardEntry = {
  source: {
    spreadsheet: "風水計算";
    sheet: "時盤";
    sourceStatus: "rule_generated_from_sheet_v0";
    adoptedColumns: "A:V";
    deferredColumns: "W:BH";
  };
  ton: HourBoardTon;
  dayStar: number;
  branch: HourBranch;
  timeRange: {
    label: string;
    startHour: number;
    endHour: number;
    crossesDate: boolean;
  };
  centerStar: number;
  directions: Record<HourBoardDirection, HourBoardDirectionState>;
};

const directions: HourBoardDirection[] = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
];

const hourBranches: Array<{
  branch: HourBranch;
  label: string;
  startHour: number;
  endHour: number;
  crossesDate: boolean;
}> = [
  { branch: "子", label: "23:00〜1:00", startHour: 23, endHour: 1, crossesDate: true },
  { branch: "丑", label: "1:00〜3:00", startHour: 1, endHour: 3, crossesDate: false },
  { branch: "寅", label: "3:00〜5:00", startHour: 3, endHour: 5, crossesDate: false },
  { branch: "卯", label: "5:00〜7:00", startHour: 5, endHour: 7, crossesDate: false },
  { branch: "辰", label: "7:00〜9:00", startHour: 7, endHour: 9, crossesDate: false },
  { branch: "巳", label: "9:00〜11:00", startHour: 9, endHour: 11, crossesDate: false },
  { branch: "午", label: "11:00〜13:00", startHour: 11, endHour: 13, crossesDate: false },
  { branch: "未", label: "13:00〜15:00", startHour: 13, endHour: 15, crossesDate: false },
  { branch: "申", label: "15:00〜17:00", startHour: 15, endHour: 17, crossesDate: false },
  { branch: "酉", label: "17:00〜19:00", startHour: 17, endHour: 19, crossesDate: false },
  { branch: "戌", label: "19:00〜21:00", startHour: 19, endHour: 21, crossesDate: false },
  { branch: "亥", label: "21:00〜23:00", startHour: 21, endHour: 23, crossesDate: false },
];

const hourBoardBasePositionStars: Record<HourBoardDirection, number> = {
  北: 1,
  北東: 6,
  東: 7,
  南東: 2,
  南: 9,
  南西: 4,
  西: 3,
  北西: 8,
};

const warningBasePositionStars: Record<HourBoardDirection, number> = {
  北: 1,
  北東: 8,
  東: 3,
  南東: 4,
  南: 9,
  南西: 2,
  西: 7,
  北西: 6,
};

const oppositeDirections: Record<HourBoardDirection, HourBoardDirection> = {
  北: "南",
  北東: "南西",
  東: "西",
  南東: "北西",
  南: "北",
  南西: "北東",
  西: "東",
  北西: "南東",
};

const hourBreakDirections: Record<HourBranch, HourBoardDirection> = {
  子: "南",
  丑: "南西",
  寅: "南西",
  卯: "西",
  辰: "北西",
  巳: "北西",
  午: "北",
  未: "北東",
  申: "北東",
  酉: "東",
  戌: "南東",
  亥: "南東",
};

const warningLabelByCode: Record<HourBoardWarningCode, string> = {
  暗剣殺: "剣",
  五黄殺: "五",
  破: "破",
};

function normalizeTon(value: string): HourBoardTon | null {
  if (value === "陽遁") {
    return "陽遁";
  }

  if (value === "陰遁" || value === "隠遁") {
    return "陰遁";
  }

  return null;
}

function toStarNumber(value: string | number | null | undefined) {
  const number = Number(value);

  return Number.isInteger(number) && number >= 1 && number <= 9 ? number : null;
}

function rotateStar(centerStar: number, baseStar: number) {
  return ((baseStar - 5 + centerStar + 8) % 9) + 1;
}

function getHourCenterStartStar(ton: HourBoardTon, dayStar: number) {
  const groupIndex = (dayStar - 1) % 3;

  return ton === "陽遁" ? groupIndex * 3 + 1 : groupIndex * 3 + 3;
}

function getHourCenterStar(ton: HourBoardTon, dayStar: number, hourIndex: number) {
  const startStar = getHourCenterStartStar(ton, dayStar);
  const offset = ton === "陽遁" ? hourIndex : -hourIndex;

  return ((startStar + offset - 1 + 18) % 9) + 1;
}

function buildWarningMap(centerStar: number, branch: HourBranch) {
  const warningMap = new Map<HourBoardDirection, HourBoardWarningCode[]>();

  const addWarning = (
    direction: HourBoardDirection,
    warning: HourBoardWarningCode,
  ) => {
    const existing = warningMap.get(direction) ?? [];
    warningMap.set(direction, [...existing, warning]);
  };

  const fiveDirection = directions.find(
    (direction) => rotateStar(centerStar, warningBasePositionStars[direction]) === 5,
  );

  if (fiveDirection) {
    addWarning(fiveDirection, "五黄殺");
    addWarning(oppositeDirections[fiveDirection], "暗剣殺");
  }

  addWarning(hourBreakDirections[branch], "破");

  return warningMap;
}

function warningLabel(warnings: HourBoardWarningCode[]) {
  return warnings.map((warning) => warningLabelByCode[warning]).join("");
}

export function getHourBoardRowsForDay(
  tonValue: string,
  dayStarValue: string | number,
): HourBoardEntry[] {
  const ton = normalizeTon(tonValue);
  const dayStar = toStarNumber(dayStarValue);

  if (!ton || !dayStar) {
    return [];
  }

  return hourBranches.map((hour, index) => {
    const centerStar = getHourCenterStar(ton, dayStar, index);
    const warningMap = buildWarningMap(centerStar, hour.branch);
    const directionEntries = directions.map((direction) => {
      const warnings = warningMap.get(direction) ?? [];

      return [
        direction,
        {
          direction,
          star: rotateStar(centerStar, hourBoardBasePositionStars[direction]),
          warnings,
          warningLabel: warningLabel(warnings),
        },
      ] as const;
    });

    return {
      source: {
        spreadsheet: "風水計算",
        sheet: "時盤",
        sourceStatus: "rule_generated_from_sheet_v0",
        adoptedColumns: "A:V",
        deferredColumns: "W:BH",
      },
      ton,
      dayStar,
      branch: hour.branch,
      timeRange: {
        label: hour.label,
        startHour: hour.startHour,
        endHour: hour.endHour,
        crossesDate: hour.crossesDate,
      },
      centerStar,
      directions: Object.fromEntries(directionEntries) as Record<
        HourBoardDirection,
        HourBoardDirectionState
      >,
    };
  });
}

export function getHourBoardRowsForCalendarDay(day: CalendarDay) {
  return getHourBoardRowsForDay(day.kyusei.ton, day.kyusei.day);
}

export function getHourBoardByBranch(
  day: CalendarDay,
  branch: HourBranch,
) {
  return (
    getHourBoardRowsForCalendarDay(day).find((row) => row.branch === branch) ??
    null
  );
}

export function getHourBranchByHour(hour: number): HourBranch | null {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return null;
  }

  if (hour === 23 || hour === 0) {
    return "子";
  }

  return (
    hourBranches.find(
      (entry) =>
        !entry.crossesDate && hour >= entry.startHour && hour < entry.endHour,
    )?.branch ?? null
  );
}

export function getHourBoardByHour(day: CalendarDay, hour: number) {
  const branch = getHourBranchByHour(hour);

  return branch ? getHourBoardByBranch(day, branch) : null;
}

