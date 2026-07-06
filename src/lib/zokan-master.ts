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
  id:
    | "asari_spreadsheet_v0"
    | "month_law_three_phase_v0"
    | "classical_pdf_12_month_v0"
    | "single_main_v0";
  label: string;
  status: "adopted_confirmed" | "adopted_tentative" | "reference_v0";
  sourceNote: string;
  scope: string;
};

export const zokanMethods: ZokanMethod[] = [
  {
    id: "classical_pdf_12_month_v0",
    label: "PDF十二支月令 v0",
    status: "adopted_confirmed",
    sourceNote:
      "ユーザー共有PDF『丑子子.pdf』十二支 各月の分析を目視転記し、年支・月支・日支の蔵干・司令の採用方式として確定。",
    scope:
      "十二支の余気・中気・正気と日数をPDF表の値で読む。年支・月支・日支は同じ節入り日数ルールで採用値を決める。",
  },
  {
    id: "asari_spreadsheet_v0",
    label: "スプシ方式 v0",
    status: "adopted_tentative",
    sourceNote:
      "★フォーチューンマイレージマスタ > 蔵干シートと年月日 Z〜AH の結果。PDF方式との照合用に保持。",
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

export const classicalPdfZokanMaster: ZokanBranch[] = [
  createBranch("子", "壬", null, "癸", [10, 0]),
  createBranch("丑", "癸", "辛", "己", [9, 3]),
  createBranch("寅", "戊", "丙", "甲", [7, 6]),
  createBranch("卯", "甲", null, "乙", [10, 0]),
  createBranch("辰", "乙", "癸", "戊", [9, 3]),
  createBranch("巳", "戊", "庚", "丙", [5, 10]),
  createBranch("午", "丙", "己", "丁", [10, 10]),
  createBranch("未", "丁", "乙", "己", [9, 3]),
  createBranch("申", "己", "壬", "庚", [7, 6]),
  createBranch("酉", "庚", null, "辛", [10, 0]),
  createBranch("戌", "辛", "丁", "戊", [9, 3]),
  createBranch("亥", "戊", "甲", "壬", [7, 5]),
];

function getZokanMethod(id: ZokanMethod["id"]) {
  const method = zokanMethods.find((entry) => entry.id === id);

  if (!method) {
    throw new Error(`Unknown zokan method: ${id}`);
  }

  return method;
}

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
  return getZokanByMaster(
    branch,
    daysFromSetsuiri,
    monthLawZokanMaster,
    getZokanMethod("month_law_three_phase_v0"),
  );
}

export function getClassicalPdfZokan(
  branch: string,
  daysFromSetsuiri: number | null,
) {
  return getZokanByMaster(
    branch,
    daysFromSetsuiri,
    classicalPdfZokanMaster,
    getZokanMethod("classical_pdf_12_month_v0"),
  );
}

function getZokanByMaster(
  branch: string,
  daysFromSetsuiri: number | null,
  masterRows: ZokanBranch[],
  method: ZokanMethod,
) {
  const master = masterRows.find((entry) => entry.branch === branch);

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
    method,
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
    method: getZokanMethod("single_main_v0"),
  };
}

export function getAdoptedZokanForDay(day: CalendarDay) {
  const daysFromSetsuiri =
    day.solarTerm.officialDaysFromSetsuiri ?? day.solarTerm.daysFromSetsuiri;
  const year = getAdoptedZokanForBranch(
    day.branches.year,
    daysFromSetsuiri,
    day.zokan.year,
  );
  const month = getAdoptedZokanForBranch(
    day.branches.month,
    daysFromSetsuiri,
    day.zokan.month,
  );
  const dayZokan = getAdoptedZokanForBranch(
    day.branches.day,
    daysFromSetsuiri,
    day.zokan.day,
  );

  return {
    year,
    month,
    day: dayZokan,
  };
}

function getAdoptedZokanForBranch(
  branch: string,
  daysFromSetsuiri: number | null,
  fallback: CalendarDay["zokan"]["year"],
) {
  const classicalPdf = getClassicalPdfZokan(branch, daysFromSetsuiri);

  if (!classicalPdf) {
    return {
      ...fallback,
      active: null,
      source: "calendar_db_spreadsheet_fallback" as const,
    };
  }

  return {
    extra: classicalPdf.extra,
    middle: classicalPdf.middle ?? "",
    main: classicalPdf.main,
    active: classicalPdf.active,
    source: "classical_pdf_12_month_v0" as const,
  };
}

export function getZokanComparison(day: CalendarDay) {
  const daysFromSetsuiri =
    day.solarTerm.officialDaysFromSetsuiri ?? day.solarTerm.daysFromSetsuiri;
  const monthLaw = getMonthLawZokan(day.branches.month, daysFromSetsuiri);
  const classicalPdf = getClassicalPdfZokan(
    day.branches.month,
    daysFromSetsuiri,
  );
  const singleMain = getSingleMainZokan(day.branches.month);

  return {
    status: "method_selectable_v0" as const,
    adoptedMethod: {
      id: "classical_pdf_12_month_v0" as const,
      confidence: "confirmed_month_branch_v0" as const,
      reason:
        "PDF『十二支 各月の分析』を年支・月支・日支の蔵干・司令の採用方式として確定し、既存スプシ値は差分検証用に保持します。",
    },
    target: {
      pillar: "month" as const,
      branch: day.branches.month,
      daysFromSetsuiri,
      note:
        "採用方式では年支・月支・日支を同じ節入り日数ルールで読む。差分表では代表として月支を比較する。",
    },
    spreadsheet: {
      method: getZokanMethod("asari_spreadsheet_v0"),
      source: "★フォーチューンマイレージマスタ > 年月日 Z〜AH / 蔵干シート",
      year: day.zokan.year,
      month: day.zokan.month,
      day: day.zokan.day,
      caution:
        "スプシ値は照合用として保持します。採用値はPDF十二支月令 v0 を支ごとに引き、同じ節入り日数で司令を決めます。",
    },
    references: {
      monthLaw,
      classicalPdf,
      singleMain,
    },
    diffs: classicalPdf
      ? [
          day.zokan.month.extra !== classicalPdf.extra
            ? `余気: スプシ=${day.zokan.month.extra || "-"} / PDF=${classicalPdf.extra}`
            : null,
          day.zokan.month.middle !== (classicalPdf.middle ?? "")
            ? `中気: スプシ=${day.zokan.month.middle || "-"} / PDF=${classicalPdf.middle ?? "-"}`
            : null,
          day.zokan.month.main !== classicalPdf.main
            ? `本気: スプシ=${day.zokan.month.main || "-"} / PDF=${classicalPdf.main}`
            : null,
        ].filter((diff): diff is string => Boolean(diff))
      : ["PDF十二支月令 v0 に該当支がありません"],
  };
}
