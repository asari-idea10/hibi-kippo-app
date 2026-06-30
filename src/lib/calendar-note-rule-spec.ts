export const junichokuRuleSpec = {
  id: "junichoku_koyomi_reference_v1",
  title: "十二直 日次カレンダー採用ルール v1.1",
  adoptedFor: "calendar_note_occurrences",
  principle:
    "十二直は節月と日支から求める。日次カレンダーでは、こよみのページ・手元万年暦などの外部検証正本を最優先し、次にスプシ確認値、空欄日は日付単位の節月で計算補完する。",
  rules: [
    {
      id: "external_reference_first",
      label: "外部検証正本優先",
      description:
        "こよみのページや手元万年暦で確認した日は、その値を検証正本として採用する。",
    },
    {
      id: "legacy_second",
      label: "スプシ確認値を次点採用",
      description:
        "外部検証正本がない日は、スプレッドシートで確認済みの十二直を採用する。",
    },
    {
      id: "date_unit_fallback",
      label: "日付単位補完",
      description:
        "確認済み値がない日は、年月日マスターの日支と節月支を使い、月支を建として十二直を配当する。",
    },
    {
      id: "setsuiri_boundary_preserved",
      label: "節入り境界は差分保持",
      description:
        "節入り当日に参照元同士で値が異なる場合は、採用根拠を明示する。日次暦では外部検証正本を採用し、出生時刻を扱う命式計算では節入り時刻で別判定する。",
    },
  ],
  knownBoundaryCases: [
    {
      date: "2021-02-03",
      solarTerm: "立春",
      setsuiriTimeJst: "23:59",
      spreadsheet: "執",
      dateUnitCalculated: "定",
      adopted: "定",
      reason:
        "こよみのページの出力では定。日次暦は検証正本へ寄せ、命式では出生時刻と節入り時刻で別判定する。",
    },
  ],
} as const;
