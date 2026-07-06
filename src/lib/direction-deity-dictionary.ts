import {
  directionDeityAdoptionMaster,
  type DirectionDeityCategory,
} from "@/lib/direction-deities";

export type DirectionDeityDictionaryEntry = {
  name: string;
  reading: string;
  category: DirectionDeityCategory;
  summary: string;
  recommended: string[];
  caution: string[];
  sourceStatus: string;
  verificationStatus: string;
  note: string;
};

const directionDeityReadingByName: Record<string, string> = {
  歳徳神: "としとくじん・さいとくじん",
  太歳神: "たいさいじん",
  歳破神: "さいはじん",
  大将軍: "だいしょうぐん",
  太陰神: "たいおんじん",
  歳刑神: "さいけいじん",
  歳殺神: "さいせつじん・さいさつじん",
  黄幡神: "おうばんじん",
  豹尾神: "ひょうびじん",
  金神: "こんじん",
  天道: "てんどう",
  天一神: "てんいちじん",
  天一天上: "てんいちてんじょう",
  月金神: "つきこんじん",
  日金神: "ひこんじん",
  日遊神: "にちゆうしん",
  大将軍遊行: "だいしょうぐんゆぎょう",
  "天徳・月徳": "てんとく・つきとく",
  目的地24山判定: "もくてきちにじゅうしざんはんてい",
};

function getRecommendedByCategory(category: DirectionDeityCategory) {
  if (category === "吉神") {
    return ["吉方位と重なる時の後押しとして見る", "参拝・祈願・移動の意味づけに使う"];
  }

  if (category === "凶神") {
    return ["大きな移動や動土では注意材料にする", "日常行動では確認・整えに翻訳する"];
  }

  if (category === "吉凶") {
    return ["吉意と注意点を分けて読む", "行動の種類によって扱いを変える"];
  }

  return ["検証用の注意レイヤーとして見る", "通常移動とは別に動土・伐採などを確認する"];
}

function getCautionByCategory(category: DirectionDeityCategory) {
  if (category === "吉神") {
    return ["吉神だけで凶殺を打ち消すとは扱わない", "九星方位・土用・目的と合わせて見る"];
  }

  if (category === "凶神") {
    return ["恐怖表示ではなく、移動の重さに応じた注意として扱う", "流派差・例外期間を継続検証する"];
  }

  if (category === "吉凶") {
    return ["万事に単純な吉凶をつけず、作用の種類を分けて読む"];
  }

  return ["v0では参考表示。候補除外の主条件にはしない"];
}

export function getDirectionDeityDictionaryEntries() {
  return directionDeityAdoptionMaster.map((entry) => ({
    name: entry.name,
    reading: directionDeityReadingByName[entry.name] ?? "-",
    category: entry.category,
    summary: entry.note,
    recommended: getRecommendedByCategory(entry.category),
    caution: getCautionByCategory(entry.category),
    sourceStatus: entry.adoptionStatus,
    verificationStatus: entry.implementationStatus,
    note: `${entry.currentScope} / 次: ${entry.nextCheck}`,
  })) satisfies DirectionDeityDictionaryEntry[];
}

export function getDirectionDeityDictionaryEntry(name: string) {
  const normalized = decodeURIComponent(name).trim();
  const entries = getDirectionDeityDictionaryEntries();

  return (
    entries.find((entry) => entry.name === normalized) ??
    entries.find(
      (entry) =>
        normalized.includes(entry.name) || entry.name.includes(normalized),
    ) ??
    null
  );
}
