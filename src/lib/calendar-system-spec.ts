export type CalendarSystemSpec = {
  id: "solar_term" | "lunar_calendar";
  label: string;
  basis: string;
  sourceMaster: string;
  coreFields: string[];
  usedFor: string[];
  notUsedFor: string[];
  verificationPolicy: string;
};

export const calendarSystemSpecs: CalendarSystemSpec[] = [
  {
    id: "solar_term",
    label: "太陽ベース: 二十四節気・節入り",
    basis: "太陽黄経。節入りは太陽が15度刻みの節の境界を越える瞬間。",
    sourceMaster: "src/data/solar-terms-1900-2050.verified.json",
    coreFields: [
      "二十四節気名",
      "節入りフラグ",
      "節入り時刻",
      "直近節入り",
      "節入りからの日数",
    ],
    usedFor: [
      "年柱・月柱の切替",
      "四柱推命/算命学の月令",
      "蔵干計算",
      "土用・土用殺",
      "九星気学の月盤切替",
    ],
    notUsedFor: ["旧暦日付の生成", "六曜の直接計算"],
    verificationPolicy:
      "国立天文台、手元万年暦、チェックポイントで検算し、節入り日数はスプレッドシートV列と照合する。",
  },
  {
    id: "lunar_calendar",
    label: "月ベース: 旧暦・六曜",
    basis: "朔。旧暦月は新月から次の新月まで、中気の有無で閏月を判定する。",
    sourceMaster: "src/data/lunar-calendar/by-year/*.json",
    coreFields: [
      "旧暦年/月/日",
      "朔日",
      "次朔",
      "月大小",
      "閏月",
      "六曜",
    ],
    usedFor: ["旧暦表示", "六曜", "旧暦由来の年中行事", "暦注・雑節の一部検証"],
    notUsedFor: ["節入り日数の生成", "月柱・蔵干の直接判定"],
    verificationPolicy:
      "生成データをいきなり本採用せず、開発者画面でサンプル旧暦と比較してからverifiedへ昇格する。",
  },
];
