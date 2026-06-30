import { NextResponse } from "next/server";

import {
  calendarNoteDefinitions,
  calendarNoteMaster,
  getCalendarNoteMasterSummary,
} from "@/lib/calendar-notes";
import { getCalendarDays } from "@/lib/calendar-day";

const legacyFlagToDefinitionCode = {
  tenshaBi: "tensha_bi",
  ichiryumanbaibi: "ichiryumanbaibi",
  tenichiTenjo: "tenichi_tenjo",
  fujoju: "fujoju",
  sanrinbou: "sanrinbou",
  jippoGure: "jippo_gure",
  hassen: "hassen",
  roujitsu: "roujitsu",
  kasshi: "kasshi",
  koushin: "koushin",
  shinnyu: "shinnyu",
  tsuchinotoMi: "tsuchinoto_mi",
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const days = getCalendarDays({ start, end }).map((day) => {
    const activeCodes = new Set(
      day.calendarNotes.activeDefinitions.map((definition) => definition.code),
    );
    const legacyFlags = Object.fromEntries(
      Object.keys(legacyFlagToDefinitionCode).map((flag) => [
        flag,
        day.calendarNotes.legacyRaw[
          flag as keyof typeof legacyFlagToDefinitionCode
        ],
      ]),
    );
    const definitionDiffs = Object.entries(legacyFlagToDefinitionCode)
      .map(([flag, code]) => {
        const legacy = Boolean(
          day.calendarNotes.legacyRaw[
            flag as keyof typeof legacyFlagToDefinitionCode
          ],
        );
        const active = activeCodes.has(code);

        return legacy === active
          ? null
          : {
              flag,
              code,
              legacy,
              active,
            };
      })
      .filter(Boolean);

    return {
      date: day.date,
      junichoku: day.calendarNotes.junichoku,
      nijuhachishuku: day.calendarNotes.nijuhachishuku,
      activeDefinitions: day.calendarNotes.activeDefinitions,
      legacyFlags,
      legacySummary: day.calendarNotes.legacyRaw.summary,
      definitionDiffs,
      sourceStatus: day.calendarNotes.status,
    };
  });
  const definitionDiffCount = days.reduce(
    (total, day) => total + day.definitionDiffs.length,
    0,
  );

  return NextResponse.json({
    summary: {
      ...getCalendarNoteMasterSummary(),
      totalDays: days.length,
      definitionDiffCount,
      definitionValidationStatus:
        definitionDiffCount === 0 ? "matched" : "mismatched",
    },
    master: calendarNoteMaster,
    definitions: calendarNoteDefinitions,
    days,
  });
}
