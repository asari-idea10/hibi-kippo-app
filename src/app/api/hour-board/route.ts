import { getCalendarDay, getCalendarDayRange } from "@/lib/calendar-day";
import {
  getHourBoardByBranch,
  getHourBoardByHour,
  getHourBoardRowsForCalendarDay,
  type HourBranch,
} from "@/lib/hour-board";

const hourBranches = new Set<HourBranch>([
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
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "2026-06-26";
  const branch = url.searchParams.get("branch");
  const hour = url.searchParams.get("hour");
  const calendarDay = getCalendarDay(date);

  if (!calendarDay) {
    return Response.json(
      {
        error: "calendar_day_not_found",
        message: "指定日の暦JSONが見つかりません。",
        date,
        range: getCalendarDayRange(),
      },
      { status: 404 },
    );
  }

  if (branch) {
    if (!hourBranches.has(branch as HourBranch)) {
      return Response.json(
        {
          error: "invalid_branch",
          message: "branch は 子〜亥 の十二支で指定してください。",
          branch,
        },
        { status: 400 },
      );
    }

    return Response.json({
      date,
      dayKyusei: calendarDay.kyusei.day,
      ton: calendarDay.kyusei.ton,
      hourBoard: getHourBoardByBranch(calendarDay, branch as HourBranch),
    });
  }

  if (hour) {
    const hourNumber = Number(hour);

    if (!Number.isInteger(hourNumber) || hourNumber < 0 || hourNumber > 23) {
      return Response.json(
        {
          error: "invalid_hour",
          message: "hour は 0〜23 の整数で指定してください。",
          hour,
        },
        { status: 400 },
      );
    }

    return Response.json({
      date,
      dayKyusei: calendarDay.kyusei.day,
      ton: calendarDay.kyusei.ton,
      hourBoard: getHourBoardByHour(calendarDay, hourNumber),
    });
  }

  return Response.json({
    date,
    dayKyusei: calendarDay.kyusei.day,
    ton: calendarDay.kyusei.ton,
    source: {
      spreadsheet: "風水計算",
      sheet: "時盤",
      sourceStatus: "rule_generated_from_sheet_v0",
      adoptedColumns: "A:V",
      deferredColumns: "W:BH",
    },
    hourBoards: getHourBoardRowsForCalendarDay(calendarDay),
  });
}

