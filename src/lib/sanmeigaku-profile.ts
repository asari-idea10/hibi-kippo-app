import { getCalendarDay, type CalendarDay } from "@/lib/calendar-day";
import {
  getInzenCellContext,
  inzenChartDefinition,
  inzenColumnKeys,
  type InzenColumnKey,
  type InzenRowKey,
} from "@/lib/inzen-chart-definition";
import { getKanshiByName } from "@/lib/kanshi-master";
import {
  getEnergyStrengthLabel,
  getJuudaiShusei,
  getJuunidaiJusei,
  type SanmeigakuYosenChart,
} from "@/lib/sanmeigaku-yosen-master";
import { getAdoptedZokanForDay } from "@/lib/zokan-master";

export type SanmeigakuInsenRow = {
  label: string;
  rowKey: InzenRowKey;
  valueKey:
    | "heavenly_stem"
    | "earthly_branch"
    | "hidden_stems_main"
    | "hidden_stems_middle"
    | "hidden_stems_extra"
    | "nine_stars"
    | "story";
  isStory?: boolean;
};

export type SanmeigakuInsenColumnValue = {
  heavenly_stem: string;
  earthly_branch: string;
  hidden_stems_main: string;
  hidden_stems_middle: string;
  hidden_stems_extra: string;
  nine_stars: string;
  story: string;
};

export type SanmeigakuPillar = {
  key: "year" | "month" | "day" | "time";
  label: string;
  theme: string;
  pillar: string;
  stem: string;
  branch: string;
  nacchin: string;
  kuubou: string;
  meaning: string;
  note: string;
  hiddenStems: {
    main: string;
    middle: string;
    extra: string;
    activeLabel: string;
    activeStem: string;
    source: string;
  };
  status: "connected" | "pending_time_pillar";
};

export type SanmeigakuProfile = {
  birthDate: string;
  birthDay: CalendarDay;
  columns: Array<{
    key: InzenColumnKey;
    label: string;
    period: string;
    theme: string;
  }>;
  rows: SanmeigakuInsenRow[];
  values: Record<InzenColumnKey, SanmeigakuInsenColumnValue>;
  pillars: Record<SanmeigakuPillar["key"], SanmeigakuPillar>;
  yosenChart: SanmeigakuYosenChart;
  dayMaster: ReturnType<typeof getKanshiByName>;
  sourceStatus: "calendar_db_v0";
  note: string;
};

export const sanmeigakuInsenRows: SanmeigakuInsenRow[] = [
  {
    label: "天干",
    rowKey: "heavenly_stem",
    valueKey: "heavenly_stem",
  },
  {
    label: "地支",
    rowKey: "earthly_branch",
    valueKey: "earthly_branch",
  },
  {
    label: "蔵干 主",
    rowKey: "hidden_stems_main",
    valueKey: "hidden_stems_main",
  },
  {
    label: "蔵干 中",
    rowKey: "hidden_stems_middle",
    valueKey: "hidden_stems_middle",
  },
  {
    label: "蔵干 余",
    rowKey: "hidden_stems_extra",
    valueKey: "hidden_stems_extra",
  },
  {
    label: "九星",
    rowKey: "nine_stars",
    valueKey: "nine_stars",
  },
  {
    label: "ストーリー",
    rowKey: "story",
    valueKey: "story",
    isStory: true,
  },
];

export function getSanmeigakuProfile(birthDate: string) {
  const normalizedBirthDate = birthDate.trim();
  const birthDay = getCalendarDay(normalizedBirthDate);

  if (!birthDay) {
    return null;
  }

  const columns = inzenColumnKeys.map((key) => ({
    key,
    ...inzenChartDefinition.chart_definition.columns[key],
  }));
  const adoptedZokan = getAdoptedZokanForDay(birthDay);
  const values = {
    year: {
      heavenly_stem: birthDay.stems.year,
      earthly_branch: birthDay.branches.year,
      hidden_stems_main: adoptedZokan.year.main,
      hidden_stems_middle: adoptedZokan.year.middle,
      hidden_stems_extra: adoptedZokan.year.extra,
      nine_stars: birthDay.kyusei.year,
      story: "家系・社会から受け取る外側の土台",
    },
    month: {
      heavenly_stem: birthDay.stems.month,
      earthly_branch: birthDay.branches.month,
      hidden_stems_main: adoptedZokan.month.main,
      hidden_stems_middle: adoptedZokan.month.middle,
      hidden_stems_extra: adoptedZokan.month.extra,
      nine_stars: birthDay.kyusei.month,
      story: "社会での役割、現実の動き方、仕事の土台",
    },
    day: {
      heavenly_stem: birthDay.stems.day,
      earthly_branch: birthDay.branches.day,
      hidden_stems_main: adoptedZokan.day.main,
      hidden_stems_middle: adoptedZokan.day.middle,
      hidden_stems_extra: adoptedZokan.day.extra,
      nine_stars: birthDay.kyusei.day,
      story: "自分自身、内側の気質、人生の中心",
    },
    time: {
      heavenly_stem: "",
      earthly_branch: "",
      hidden_stems_main: "",
      hidden_stems_middle: "",
      hidden_stems_extra: "",
      nine_stars: "",
      story: "時柱・真太陽時・出生地補正の工程で後続接続",
    },
  } satisfies Record<InzenColumnKey, SanmeigakuInsenColumnValue>;

  const pillars = {
    year: buildPillar("year", "年柱", "家系・社会", birthDay, adoptedZokan.year),
    month: buildPillar(
      "month",
      "月柱",
      "仕事・社会運",
      birthDay,
      adoptedZokan.month,
    ),
    day: buildPillar("day", "日柱", "自分自身", birthDay, adoptedZokan.day),
    time: {
      key: "time",
      label: "時柱",
      theme: "晩年・子ども・成果",
      pillar: "-",
      stem: "-",
      branch: "-",
      nacchin: "-",
      kuubou: "-",
      meaning: "出生時刻と出生地補正を接続してから表示します。",
      note: "v0では未接続。算命学・四柱推命の精密化フェーズで扱います。",
      hiddenStems: {
        main: "-",
        middle: "-",
        extra: "-",
        activeLabel: "-",
        activeStem: "-",
        source: "pending",
      },
      status: "pending_time_pillar",
    },
  } satisfies Record<SanmeigakuPillar["key"], SanmeigakuPillar>;
  const yosenChart = buildYosenChart(birthDay, pillars);

  return {
    birthDate: normalizedBirthDate,
    birthDay,
    columns,
    rows: sanmeigakuInsenRows,
    values,
    pillars,
    yosenChart,
    dayMaster: getKanshiByName(birthDay.pillars.day),
    sourceStatus: "calendar_db_v0",
    note: "共通暦DBの年柱・月柱・日柱を陰占の入口として再編集しています。蔵干はPDF十二支月令 v0 を採用し、年支・月支・日支を同じ節入り日数ルールで読みます。陽占は十大主星・十二大従星のマスターから人体星図 v0 として表示しています。時柱、真太陽時は後続フェーズです。",
  } satisfies SanmeigakuProfile;
}

function buildYosenChart(
  birthDay: CalendarDay,
  pillars: Record<SanmeigakuPillar["key"], SanmeigakuPillar>,
) {
  const dayStem = birthDay.stems.day;
  const yearHiddenStem = pillars.year.hiddenStems.activeStem;
  const monthHiddenStem = pillars.month.hiddenStems.activeStem;
  const dayHiddenStem = pillars.day.hiddenStems.activeStem;
  const early = getJuunidaiJusei(dayStem, birthDay.branches.year);
  const middle = getJuunidaiJusei(dayStem, birthDay.branches.month);
  const late = getJuunidaiJusei(dayStem, birthDay.branches.day);
  const energyTotal = [early.energy, middle.energy, late.energy]
    .filter((energy): energy is number => typeof energy === "number")
    .reduce((sum, energy) => sum + energy, 0);

  return {
    source:
      "算命計算!A360:AV373 の人体星図配置 / A420:AV520 の十大主星表 / A1:AV120 の十二大従星エネルギー値表",
    dayStem,
    energyTotal,
    strengthLabel: getEnergyStrengthLabel(energyTotal),
    juudai: {
      head: {
        key: "head",
        label: "頭",
        theme: "目上に対する顔",
        sourceLabel: "日干 × 年干",
        dayStem,
        targetStem: birthDay.stems.year,
        star: getJuudaiShusei(dayStem, birthDay.stems.year),
      },
      leftHand: {
        key: "leftHand",
        label: "左手",
        theme: "家族に見せる顔",
        sourceLabel: "日干 × 日支司令",
        dayStem,
        targetStem: dayHiddenStem,
        star: getJuudaiShusei(dayStem, dayHiddenStem),
      },
      center: {
        key: "center",
        label: "中心",
        theme: "自分の本質",
        sourceLabel: "日干 × 月支司令",
        dayStem,
        targetStem: monthHiddenStem,
        star: getJuudaiShusei(dayStem, monthHiddenStem),
      },
      rightHand: {
        key: "rightHand",
        label: "右手",
        theme: "社会に見せる顔",
        sourceLabel: "日干 × 年支司令",
        dayStem,
        targetStem: yearHiddenStem,
        star: getJuudaiShusei(dayStem, yearHiddenStem),
      },
      belly: {
        key: "belly",
        label: "腹",
        theme: "目下に見せる顔",
        sourceLabel: "日干 × 月干",
        dayStem,
        targetStem: birthDay.stems.month,
        star: getJuudaiShusei(dayStem, birthDay.stems.month),
      },
    },
    juunidai: {
      early: {
        key: "early",
        label: "初年運",
        theme: "若年期",
        sourceLabel: "日干 × 年支",
        dayStem,
        targetBranch: birthDay.branches.year,
        ...early,
      },
      middle: {
        key: "middle",
        label: "中年運",
        theme: "現役期",
        sourceLabel: "日干 × 月支",
        dayStem,
        targetBranch: birthDay.branches.month,
        ...middle,
      },
      late: {
        key: "late",
        label: "老年運",
        theme: "晩年期",
        sourceLabel: "日干 × 日支",
        dayStem,
        targetBranch: birthDay.branches.day,
        ...late,
      },
    },
  } satisfies SanmeigakuYosenChart;
}

export function getSanmeigakuCellContext(
  columnKey: InzenColumnKey,
  rowKey: InzenRowKey,
) {
  return getInzenCellContext(columnKey, rowKey);
}

function buildPillar(
  key: "year" | "month" | "day",
  label: string,
  theme: string,
  birthDay: CalendarDay,
  hiddenStems: {
    main: string;
    middle: string;
    extra: string;
    active?: {
      label: string;
      stem: string;
    } | null;
    source: string;
  },
): SanmeigakuPillar {
  const pillar = birthDay.pillars[key];
  const master = getKanshiByName(pillar);

  return {
    key,
    label,
    theme,
    pillar,
    stem: birthDay.stems[key],
    branch: birthDay.branches[key],
    nacchin: master?.nacchin ?? "-",
    kuubou: master?.kuubou ?? "-",
    meaning: master?.meaning ?? "-",
    note: master?.note ?? "-",
    hiddenStems: {
      main: hiddenStems.main,
      middle: hiddenStems.middle,
      extra: hiddenStems.extra,
      activeLabel: hiddenStems.active?.label ?? "-",
      activeStem: hiddenStems.active?.stem ?? "-",
      source: hiddenStems.source,
    },
    status: "connected",
  };
}
