import { describe, expect, test } from "vitest";

import { getAdoptionStatusInfo } from "@/lib/adoption-status";
import {
  getCommonCalendarCompletionItems,
  getCommonCalendarCompletionSummary,
} from "@/lib/common-calendar-completion";
import {
  getVerificationRegistryItems,
  getVerificationRegistrySummary,
} from "@/lib/verification-registry";

const completionItems = getCommonCalendarCompletionItems();

function completionItem(id: string) {
  const item = completionItems.find((candidate) => candidate.id === id);
  expect(item, `completion item ${id}`).toBeDefined();
  return item!;
}

describe("adoption-status current progress", () => {
  test("keeps the completion summary counts explicit", () => {
    expect(getCommonCalendarCompletionSummary()).toEqual({
      total: 41,
      implemented: 15,
      v0Verifying: 14,
      notImplemented: 8,
      later: 4,
    });
  });

  test("keeps completion item IDs unique", () => {
    const ids = completionItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("shows monthly plate Level 1 as complete but intentionally disconnected", () => {
    const item = completionItem("monthly_plate_level1");

    expect(item.status).toBe("implemented");
    expect(item.adoptionStatus).toBe("provenance_complete_not_connected");
    expect(item.scope).toContain("九星配置324宮");
    expect(item.progressDetails).toEqual(
      expect.arrayContaining([
        "design: completed",
        "production connection: intentionally_not_connected",
        "source orientation: registered_partially_confirmed",
        "Level 2 marker research: ongoing",
        "exact timestamp production: not_implemented",
      ]),
    );
  });

  test("keeps monthly plate Level 2 separate from Level 1 closure", () => {
    const item = completionItem("monthly_plate_level2");

    expect(item.status).toBe("v0_verifying");
    expect(item.adoptionStatus).toBe("research_ongoing");
    expect(item.note).toContain("寅月Pilotの天合・冲");
    expect(item.note).toContain("全月で基本盤の照合状態");
    expect(item.nextAction).toContain("照合範囲を段階的に拡張");
    expect(item.progressDetails).toEqual(
      expect.arrayContaining([
        "C寅月徳合: unresolved source discrepancy",
        "原資料三合marker vs 現行三合4局・三合天道: concept_mismatch",
        "296 fine-marker cells: transcribed, promotion pending",
        "24-mountain fine positions: unreadable",
        "UI: all months show source-review coverage; Tiger pilots show 天合・冲 evidence details",
      ]),
    );
  });

  test("shows limited personal-star provenance without production adoption", () => {
    const item = completionItem("personal_star_provenance");

    expect(item.status).toBe("v0_verifying");
    expect(item.adoptionStatus).toBe("provenance_limited_not_connected");
    expect(item.progressDetails).toEqual(
      expect.arrayContaining([
        "honmei: READY",
        "getsumei: READY_WITH_LIMITATIONS",
        "provenance tests: 24/24",
        "production connection: not_connected",
        "candidate connection: not_connected",
        "ranking connection: not_connected",
        "warning connection: not_connected",
      ]),
    );
  });

  test("updates the hour-board next action without changing its verification status", () => {
    const item = completionItem("hour_board");

    expect(item.status).toBe("v0_verifying");
    expect(item.scope).toContain("日付詳細表示");
    expect(item.nextAction).toContain("時盤表示は接続済み");
    expect(item.note).toContain("purpose-calendarに表示済み");
  });

  test("records personal-direction features already visible in purpose-calendar", () => {
    const item = completionItem("personal_directions");

    expect(item.status).toBe("v0_verifying");
    expect(item.adoptionStatus).toBe("personal_direction_visible_v0");
    expect(getAdoptionStatusInfo(item.adoptionStatus).label).toContain(
      "表示接続済み",
    );
    expect(item.nextAction).toContain("月命殺・月命的殺");
    expect(item.note).toContain("本人・同行者判定はpurpose-calendarに表示済み");
  });

  test("separates visible directional deities from monthly fine markers", () => {
    const visible = completionItem("good_fortune_directions");
    const monthly = completionItem("monthly_plate_level2");

    expect(visible.name).toBe("年神・表示済み方位神");
    expect(visible.scope).toContain("現行天道・現行三合局");
    expect(visible.note).toContain("原資料三合markerはこの項目へ統合しない");
    expect(monthly.scope).toContain("月徳合");
  });

  test("shows the photographed Mannenreki manifest as not implemented", () => {
    const item = completionItem("mannenreki_source_manifest");

    expect(item.status).toBe("not_implemented");
    expect(item.adoptionStatus).toBe("not_connected");
    expect(item.nextAction).toContain("manifestを作成する");
    expect(item.note).toContain("画像をGitへ追加することを意味しない");
  });

  test("provides dedicated adoption labels for provenance progress", () => {
    expect(getAdoptionStatusInfo("provenance_complete_not_connected").label).toBe(
      "provenance完了・意図的未接続",
    );
    expect(getAdoptionStatusInfo("provenance_limited_not_connected").label).toBe(
      "制限付きprovenance・未接続",
    );
    expect(getAdoptionStatusInfo("research_ongoing").label).toBe(
      "研究継続・未接続",
    );
  });

  test("keeps verification registry IDs unique", () => {
    const ids = getVerificationRegistryItems().map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("splits visible deities and monthly Level 2 in the registry", () => {
    const items = getVerificationRegistryItems();
    const visible = items.find((item) => item.id === "direction-deities");
    const monthly = items.find(
      (item) => item.id === "monthly-plate-level2-direction-deities",
    );

    expect(visible?.status).toBe("サンプル検証中");
    expect(visible?.target).toBe("年神・表示済み方位神");
    expect(monthly?.status).toBe("外部照合待ち");
    expect(monthly?.internalApis).toEqual([]);
    expect(monthly?.scope).toContain("production未接続");
  });

  test("updates the verification registry summary after the split", () => {
    expect(getVerificationRegistrySummary()).toMatchObject({
      total: 8,
      highPriority: 7,
      externalPending: 1,
    });
  });
});
