import type {
  JuudaiShusei,
  JuunidaiJusei,
} from "@/lib/sanmeigaku-yosen-master";

export type SanmeigakuTermCategory = "十大主星" | "十二大従星";

export type SanmeigakuTermMasterEntry = {
  name: JuudaiShusei | JuunidaiJusei;
  category: SanmeigakuTermCategory;
  sourceStatus: string;
  verificationStatus: string;
};

export const juudaiShuseiTermNames: JuudaiShusei[] = [
  "貫索星",
  "石門星",
  "鳳閣星",
  "調舒星",
  "禄存星",
  "司禄星",
  "車騎星",
  "牽牛星",
  "龍高星",
  "玉堂星",
];

export const juunidaiJuseiTermNames: JuunidaiJusei[] = [
  "天馳星",
  "天極星",
  "天報星",
  "天胡星",
  "天庫星",
  "天印星",
  "天恍星",
  "天堂星",
  "天貴星",
  "天南星",
  "天禄星",
  "天将星",
];

export const sanmeigakuTermMasterEntries: SanmeigakuTermMasterEntry[] = [
  ...juudaiShuseiTermNames.map((name) => ({
    name,
    category: "十大主星" as const,
    sourceStatus: "pending_sanmeigaku_star_text_master",
    verificationStatus: "pending_sanmeigaku_star_text_connection",
  })),
  ...juunidaiJuseiTermNames.map((name) => ({
    name,
    category: "十二大従星" as const,
    sourceStatus: "pending_sanmeigaku_star_text_master",
    verificationStatus: "pending_sanmeigaku_star_text_connection",
  })),
];

export function getSanmeigakuTermMasterEntry(name: string) {
  return (
    sanmeigakuTermMasterEntries.find((entry) => entry.name === name) ?? null
  );
}
