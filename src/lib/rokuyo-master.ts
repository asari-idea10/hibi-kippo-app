export type RokuyoMasterEntry = {
  name: string;
  reading: string;
  fortune: "good" | "bad" | "mixed" | "neutral";
  summary: string;
  recommended: string[];
  caution: string[];
  sourceStatus: "lunar_calendar_generated_v0";
  verificationStatus: "pending_manual_almanac_check";
};

const commonStatus = {
  sourceStatus: "lunar_calendar_generated_v0",
  verificationStatus: "pending_manual_almanac_check",
} as const;

export const rokuyoMaster: Record<string, RokuyoMasterEntry> = {
  先勝: {
    name: "先勝",
    reading: "せんしょう・さきがち",
    fortune: "mixed",
    summary: "早めに動くことがよいとされる六曜。午前の着手や連絡に寄せて使います。",
    recommended: ["午前中の連絡・予約・小さな開始", "先に済ませたい用事の処理"],
    caution: ["午後に大事を詰め込みすぎない", "急ぎすぎて確認を省かない"],
    ...commonStatus,
  },
  友引: {
    name: "友引",
    reading: "ともびき",
    fortune: "mixed",
    summary: "友を引くとされる六曜。人との予定や祝い事では使いやすく、弔事では注意されます。",
    recommended: ["会食・紹介・相談", "人と一緒に整える行動"],
    caution: ["弔事や別れの文脈では配慮する", "人に流されすぎない"],
    ...commonStatus,
  },
  先負: {
    name: "先負",
    reading: "せんぷ・さきまけ",
    fortune: "mixed",
    summary: "急がず控えめに進める六曜。午前は静かに整え、午後に動く読み方をします。",
    recommended: ["午後からの用事", "準備・確認・静かな作業"],
    caution: ["焦って勝ちに行く行動", "午前中の強引な決定"],
    ...commonStatus,
  },
  仏滅: {
    name: "仏滅",
    reading: "ぶつめつ",
    fortune: "bad",
    summary: "物事がいったん滅する意を持つ六曜。大きな祝い事より、整理や仕切り直しに寄せます。",
    recommended: ["片付け・手放し・リセット", "予定の見直し"],
    caution: ["婚礼・開業などの大きな開始", "必要以上に不安を強めること"],
    ...commonStatus,
  },
  大安: {
    name: "大安",
    reading: "たいあん",
    fortune: "good",
    summary: "大いに安しとされる六曜。婚礼、契約、開始などで広く使われる吉日です。",
    recommended: ["祝い事・契約・開始", "安心して進めたい用事"],
    caution: ["六曜だけで判断せず、方位や暦注も合わせて確認する"],
    ...commonStatus,
  },
  赤口: {
    name: "赤口",
    reading: "しゃっこう・しゃっく",
    fortune: "bad",
    summary: "火や刃物、言葉の衝突に注意を置く六曜。正午前後は比較的扱いやすいとされます。",
    recommended: ["短時間で済む用事", "火元・刃物・言葉の確認"],
    caution: ["口論・事故・火気への油断", "長時間の大事を無理に詰めること"],
    ...commonStatus,
  },
};

export function getRokuyoEntry(name: string) {
  return rokuyoMaster[name] ?? null;
}
