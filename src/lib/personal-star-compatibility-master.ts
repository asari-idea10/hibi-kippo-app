export type PersonalDirectionLabel =
  | "最大吉方候補"
  | "吉方候補"
  | "比和"
  | "中立"
  | "相剋注意";

export type PersonalStarRelation =
  | "親星"
  | "子星"
  | "剋される"
  | "剋す"
  | "中立"
  | "比和";

export type PersonalStarCompatibility = {
  relation: PersonalStarRelation;
  label: PersonalDirectionLabel;
};

const relationLabelBySymbol: Record<string, PersonalStarCompatibility> = {
  "◎": { relation: "親星", label: "最大吉方候補" },
  "◯": { relation: "子星", label: "吉方候補" },
  "✕": { relation: "剋される", label: "相剋注意" },
  "▲": { relation: "剋す", label: "相剋注意" },
  "＝": { relation: "中立", label: "中立" },
  "ー": { relation: "比和", label: "比和" },
};

const compatibilitySymbols: Record<string, Record<string, string>> = {
  "1": { "1": "＝", "2": "✕", "3": "◯", "4": "◯", "5": "✕", "6": "◎", "7": "◎", "8": "✕", "9": "▲" },
  "2": { "1": "▲", "2": "＝", "3": "✕", "4": "✕", "5": "ー", "6": "◯", "7": "◯", "8": "ー", "9": "◎" },
  "3": { "1": "◎", "2": "▲", "3": "＝", "4": "ー", "5": "▲", "6": "✕", "7": "✕", "8": "▲", "9": "◯" },
  "4": { "1": "◎", "2": "▲", "3": "ー", "4": "＝", "5": "▲", "6": "✕", "7": "✕", "8": "▲", "9": "◯" },
  "5": { "1": "▲", "2": "ー", "3": "✕", "4": "✕", "5": "＝", "6": "◯", "7": "◯", "8": "ー", "9": "◎" },
  "6": { "1": "◯", "2": "◎", "3": "▲", "4": "▲", "5": "◎", "6": "＝", "7": "ー", "8": "◎", "9": "✕" },
  "7": { "1": "◯", "2": "◎", "3": "▲", "4": "▲", "5": "◎", "6": "ー", "7": "＝", "8": "◎", "9": "✕" },
  "8": { "1": "▲", "2": "ー", "3": "✕", "4": "✕", "5": "ー", "6": "◯", "7": "◯", "8": "＝", "9": "◎" },
  "9": { "1": "✕", "2": "◯", "3": "◎", "4": "◎", "5": "◯", "6": "▲", "7": "▲", "8": "◯", "9": "＝" },
};

export const favorablePersonalDirectionLabels = new Set<PersonalDirectionLabel>([
  "最大吉方候補",
  "吉方候補",
  "比和",
]);

export const personalDirectionCompatibilityLabels: Record<
  string,
  Record<string, PersonalDirectionLabel>
> = Object.fromEntries(
  Object.entries(compatibilitySymbols).map(([selfStar, relations]) => [
    selfStar,
    Object.fromEntries(
      Object.entries(relations).map(([targetStar, symbol]) => [
        targetStar,
        relationLabelBySymbol[symbol].label,
      ]),
    ),
  ]),
) as Record<string, Record<string, PersonalDirectionLabel>>;

export function getPersonalStarCompatibility(
  selfStar: string,
  targetStar: string,
): PersonalStarCompatibility | null {
  const symbol = compatibilitySymbols[selfStar]?.[targetStar];

  return symbol ? relationLabelBySymbol[symbol] : null;
}

export function getPersonalDirectionCompatibilityLabel(
  selfStar: string,
  targetStar: string,
) {
  return getPersonalStarCompatibility(selfStar, targetStar)?.label ?? null;
}
