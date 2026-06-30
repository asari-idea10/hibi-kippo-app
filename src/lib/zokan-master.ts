import type { CalendarDay } from "@/lib/calendar-day";

export type ZokanBranch = {
  branch: string;
  extra: string;
  middle: string | null;
  main: string;
  ranges: Array<{
    type: "extra" | "middle" | "main";
    label: "余気" | "中気" | "本気";
    stem: string;
    startDay: number;
    endDay: number | null;
  }>;
};

export type ZokanMethod = {
  id: "asari_spreadsheet_v0" | "month_law_three_phase_v0" | "single_main_v0";
  label: string;
  status: "adopted_tentative" | "reference_v0";
  sourceNote: string;
  scope: string;
};

export const zokanMethods: ZokanMethod[] = [
  {
    id: "asari_spreadsheet_v0",
    label: "スプシ方式 v0",
    status: "adopted_tentative",
    sourceNote:
      "★フォーチューンマイレージマスタ > 蔵干シートと年月日 Z〜AH の結果。現時点の仮採用方式。",
    scope:
      "既存スプシの年/月/日蔵干を保持する。月支以外へ節入り日数を使う妥当性は検証中。",
  },
  {
    id: "month_law_three_phase_v0",
    label: "月律分野 v0",
    status: "reference_v0",
    sourceNote:
      "一般的な月支蔵干分野表を参考にした照合用マスター。流派差があるため正本扱いしない。",
    scope: "月支 + 節入りからの日数で、余気/中気/本気のどれが司令するかを見る。",
  },
  {
    id: "single_main_v0",
    label: "単蔵干 v0",
    status: "reference_v0",
    sourceNote:
      "各支の本気のみを見る簡易方式。命式表を簡潔にしたい場合の比較用。",
    scope: "節入り日数を使わず、地支の本気だけを採る。",
  },
];

export const monthLawZokanMaster: ZokanBranch[] = [
  createBranch("子", "壬", null, "癸", [10, 0]),
  createBranch("丑", "癸", "辛", "己", [9, 3]),
  createBranch("寅", "戊", "丙", "甲", [5, 9]),
  createBranch("卯", "甲", null, "乙", [10, 0]),
  createBranch("辰", "乙", "癸", "戊", [9, 3]),
  createBranch("巳", "戊", "庚", "丙", [5, 9]),
  createBranch("午", "丙", null, "丁", [10, 0]),
  createBranch("未", "丁", "乙", "己", [9, 3]),
  createBranch("申", "戊", "壬", "庚", [5, 9]),
  createBranch("酉", "庚", null, "辛", [10, 0]),
  createBranch("戌", "辛", "丁", "戊", [9, 3]),
  createBranch("亥", "戊", "甲", "壬", [5, 9]),
];

function createBranch(
  branch: string,
  extra: string,
  middle: string | null,
  main: string,
  [extraDays, middleDays]: [number, number],
): ZokanBranch {
  const ranges: ZokanBranch["ranges"] = [
    {
      type: "extra",
      label: "余気",
      stem: extra,
      startDay: 1,
      endDay: extraDays,
    },
  ];

  if (middle && middleDays > 0) {
    ranges.push({
      type: "middle",
      label: "中気",
      stem: middle,
      startDay: extraDays + 1,
      endDay: extraDays + middleDays,
    });
  }

  ranges.push({
    type: "main",
    label: "本気",
    stem: main,
    startDay: extraDays + middleDays + 1,
    endDay: null,
  });

  return {
    branch,
    extra,
    middle,
    main,
    ranges,
  };
}

export function getMonthLawZokan(branch: string, daysFromSetsuiri: number | null) {
  const master = monthLawZokanMaster.find((entry) => entry.branch === branch);

  if (!master || !daysFromSetsuiri) {
    return null;
  }

  const activeRange =
    master.ranges.find(
      (range) =>
        daysFromSetsuiri >= range.startDay &&
        (range.endDay === null || daysFromSetsuiri <= range.endDay),
    ) ?? master.ranges[master.ranges.length - 1];

  return {
    branch,
    daysFromSetsuiri,
    extra: master.extra,
    middle: master.middle,
    main: master.main,
    active: activeRange,
    method: zokanMethods[1],
  };
}

export function getSingleMainZokan(branch: string) {
  const master = monthLawZokanMaster.find((entry) => entry.branch === branch);

  if (!master) {
    return null;
  }

  return {
    branch,
    selected: master.main,
    method: zokanMethods[2],
  };
}

export function getZokanComparison(day: CalendarDay) {
  const daysFromSetsuiri =
    day.solarTerm.officialDaysFromSetsuiri ?? day.solarTerm.daysFromSetsuiri;
  const monthLaw = getMonthLawZokan(day.branches.month, daysFromSetsuiri);
  const singleMain = getSingleMainZokan(day.branches.month);

  return {
    status: "method_selectable_v0" as const,
    adoptedMethod: {
      id: "asari_spreadsheet_v0" as const,
      confidence: "tentative" as const,
      reason:
        "既存スプシの思想を保持しつつ、外部参照方式との差分を開発者画面で検証するため。",
    },
    target: {
      pillar: "month" as const,
      branch: day.branches.month,
      daysFromSetsuiri,
      note:
        "v0では月支だけを節入り日数による蔵干比較対象にする。年支・日支への同ルール適用は保留。",
    },
    spreadsheet: {
      method: zokanMethods[0],
      source: "★フォーチューンマイレージマスタ > 年月日 Z〜AH / 蔵干シート",
      year: day.zokan.year,
      month: day.zokan.month,
      day: day.zokan.day,
      caution:
        "スプシは年支・月支・日支すべてに節入り日数をlookupしているため、年支・日支は要検証。",
    },
    references: {
      monthLaw,
      singleMain,
    },
    diffs: monthLaw
      ? [
          day.zokan.month.extra !== monthLaw.extra
            ? `余気: スプシ=${day.zokan.month.extra || "-"} / v0=${monthLaw.extra}`
            : null,
          day.zokan.month.middle !== (monthLaw.middle ?? "")
            ? `中気: スプシ=${day.zokan.month.middle || "-"} / v0=${monthLaw.middle ?? "-"}`
            : null,
          day.zokan.month.main !== monthLaw.main
            ? `本気: スプシ=${day.zokan.month.main || "-"} / v0=${monthLaw.main}`
            : null,
        ].filter((diff): diff is string => Boolean(diff))
      : ["v0参照マスターに該当支がありません"],
  };
}
