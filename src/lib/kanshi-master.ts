import kanshiMasterJson from "@/data/kanshi-master.json";

export type KanshiId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60;

export type KanshiIjouType = "通常" | "暗合" | null;

export type KanshiMasterEntry = {
  id: KanshiId;
  kanshi: string;
  nacchin: string;
  kuubou: string;
  meaning: string;
  note: string;
  is_kaigou: boolean;
  is_jun_kaigou: boolean;
  ijou_type: KanshiIjouType;
};

const allowedIjouTypes = new Set<KanshiIjouType>(["通常", "暗合", null]);

function isKanshiId(value: unknown): value is KanshiId {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 60;
}

function isKanshiMasterEntry(value: unknown): value is KanshiMasterEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    isKanshiId(entry.id) &&
    typeof entry.kanshi === "string" &&
    typeof entry.nacchin === "string" &&
    typeof entry.kuubou === "string" &&
    typeof entry.meaning === "string" &&
    typeof entry.note === "string" &&
    typeof entry.is_kaigou === "boolean" &&
    typeof entry.is_jun_kaigou === "boolean" &&
    allowedIjouTypes.has(entry.ijou_type as KanshiIjouType)
  );
}

function loadKanshiMaster() {
  if (!Array.isArray(kanshiMasterJson)) {
    throw new Error("kanshi-master.json must be an array.");
  }

  if (kanshiMasterJson.length !== 60) {
    throw new Error(
      `kanshi-master.json must contain 60 entries. actual=${kanshiMasterJson.length}`,
    );
  }

  const invalidIndex = kanshiMasterJson.findIndex(
    (entry) => !isKanshiMasterEntry(entry),
  );

  if (invalidIndex !== -1) {
    throw new Error(`Invalid kanshi master entry at index ${invalidIndex}.`);
  }

  return kanshiMasterJson as KanshiMasterEntry[];
}

const kanshiMaster = loadKanshiMaster();
const kanshiById = new Map<KanshiId, KanshiMasterEntry>(
  kanshiMaster.map((entry) => [entry.id, entry]),
);
const kanshiByName = new Map<string, KanshiMasterEntry>(
  kanshiMaster.map((entry) => [entry.kanshi, entry]),
);

export function getKanshiMasterEntries() {
  return kanshiMaster;
}

export function getKanshiById(id: KanshiId | number) {
  if (!isKanshiId(id)) {
    return null;
  }

  return kanshiById.get(id) ?? null;
}

export function getKanshiByName(kanshi: string) {
  return kanshiByName.get(kanshi.trim()) ?? null;
}

export function getKanshiMasterSummary() {
  return {
    total: kanshiMaster.length,
    kaigou: kanshiMaster.filter((entry) => entry.is_kaigou).length,
    junKaigou: kanshiMaster.filter((entry) => entry.is_jun_kaigou).length,
    ijou: kanshiMaster.filter((entry) => entry.ijou_type !== null).length,
  };
}
