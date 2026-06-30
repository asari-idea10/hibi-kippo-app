import type { CalendarDbKyuseiBoard } from "@/lib/calendar-db-view";

export type ActionPurposeId =
  | "none"
  | "yuki_tori"
  | "travel"
  | "moving"
  | "work"
  | "competition"
  | "relationship"
  | "recovery"
  | "daily";

export type ActionPurposeEntry = {
  id: ActionPurposeId;
  label: string;
  description: string;
  emphasizedBoards: CalendarDbKyuseiBoard[];
};

export const actionPurposeOptions: ActionPurposeEntry[] = [
  {
    id: "none",
    label: "指定なし",
    description: "目的別の盤強調を行わない",
    emphasizedBoards: [],
  },
  {
    id: "yuki_tori",
    label: "吉方取り向き",
    description: "祐気取り・お水取り・本格的な開運行動",
    emphasizedBoards: ["year", "month", "day"],
  },
  {
    id: "travel",
    label: "旅行向き",
    description: "吉方旅・温泉・神社・カフェ・遠出",
    emphasizedBoards: ["month", "day"],
  },
  {
    id: "moving",
    label: "引越し・移転向き",
    description: "引越し・転居・事務所移転",
    emphasizedBoards: ["year", "month"],
  },
  {
    id: "work",
    label: "仕事・会議向き",
    description: "商談・重要会議・訪問・勤務",
    emphasizedBoards: ["month", "day"],
  },
  {
    id: "competition",
    label: "勝負・試験向き",
    description: "試験・勝負・プレゼン・交渉",
    emphasizedBoards: ["day"],
  },
  {
    id: "relationship",
    label: "縁づくり向き",
    description: "見合い・紹介・結婚式・取引信用",
    emphasizedBoards: ["month", "day"],
  },
  {
    id: "recovery",
    label: "健康・回復向き",
    description: "病院・休養・温泉・静養",
    emphasizedBoards: ["month", "day"],
  },
  {
    id: "daily",
    label: "日常行動向き",
    description: "買い物・短時間の外出・毎日の整え",
    emphasizedBoards: ["day"],
  },
];

export function getActionPurpose(value: string | null | undefined) {
  return (
    actionPurposeOptions.find((option) => option.id === value) ??
    actionPurposeOptions[0]
  );
}
