# Decision Log

Last updated: 2026-07-15

Record product, architecture, and rule decisions here. Do not use this file to justify guessed fortune logic.

## Status Legend

Use these exact status labels across docs when describing product and rule decisions.

| Status | Meaning |
| --- | --- |
| `accepted` | Adopted as product/spec direction. |
| `provisional` | Temporarily adopted for wording or planning, but must be reviewed before implementation or rule changes. |
| `pending` | Not decided. Do not implement as if decided. |
| `source_review_required` | Requires fortune/calendar/source confirmation before implementation or rule changes. |
| `implementation_pending` | Direction is known, but code/UI/URL behavior has not been changed yet. |

## Decisions

### D-0001: Documentation separates confirmed specification from current code behavior

- Date: 2026-07-09
- Status: accepted
- Decision: Documentation should distinguish "Confirmed", "Read From Current Code", and "TODO" sections when appropriate.
- Reason: Future agents need to avoid treating implementation details as final specification.

### D-0002: Fortune/calendar logic must not be changed by inference

- Date: 2026-07-09
- Status: accepted
- Decision: 九星気学, 祐気取り, 方位, 暦, 土用, 天道, and 算命学 logic require source/code confirmation before modification.
- Reason: Incorrect assumptions can silently corrupt calculation output.

### D-0003: Existing URLs and query parameters are compatibility-sensitive

- Date: 2026-07-09
- Status: accepted
- Decision: Existing routes and query parameters should be preserved unless a change is explicitly documented and reviewed.
- Reason: Current screens are query-driven, and users may rely on saved URLs.

### D-0004: Keep `purpose=travel` compatibility while moving default intent toward `yuki_tori`

- Date: 2026-07-09
- Status: `accepted`, `implementation_pending`
- Decision: Existing `purpose=travel` URLs remain compatible. If `purpose` is explicitly provided in the URL, the app should respect that value. If `purpose` is omitted, the future product direction is to make `yuki_tori` the initial/default purpose for `/purpose-calendar`.
- Reason: The page is now primarily used as a 九星方位 / 祐気取り calendar, but saved URLs and older links may still rely on `travel`.
- Implementation note: No code change was made when this decision was recorded.

### D-0005: Treat `candidateCondition` and `actionScale` as separate concepts

- Date: 2026-07-09
- Status: `accepted`, `implementation_pending`
- Decision: `candidateCondition` should be treated as an independent URL parameter. `actionScale` represents 行動の規模・距離感・実行負荷. `candidateCondition` represents candidate existence and filtering strictness.
- Reason: Combining them makes URL behavior and UI intent harder to reason about. Future URL/UI design should separate "how far / how heavy the action is" from "how strictly candidate days are filtered."
- Implementation note: Current code behavior may still derive effective candidate filtering from `actionScale`; this document records the desired design direction only.

### D-0006: Companion judgement mode meanings are provisional product guidance

- Date: 2026-07-09
- Status: `provisional`, `source_review_required`
- Decision: Use the following provisional meanings until source/domain review confirms the official rules:
  - `strict`: prioritize avoiding bad directions for every selected participant.
  - `standard`: recommended normal mode; the user/self remains primary while strong bad directions for companions are avoided.
  - `loose`: user/self remains primary; companion information is closer to reference display.
- Reason: The UI needs understandable mode labels and review targets, but the formal fortune specification is not yet confirmed.
- Implementation note: Do not change companion judgement logic from this text alone.

### D-0007: Split candidate rank design into fortune rank and practical rank

- Date: 2026-07-09
- Status: `accepted`, `implementation_pending`, `source_review_required`
- Decision: Future candidate ranking should distinguish fortune-rank factors from practical-rank factors.
- Fortune-rank factors may include 三盤一致, 年月一致, 月日一致, 天道, and bad-direction avoidance.
- Practical-rank factors may include 近場, 日帰り可, 温泉, 神社, 自然散策, 食事, and other ease-of-action signals.
- Reason: Current candidate labels mix calculation strength and real-world usability. Separating them will make future UI and scoring easier to explain.
- Implementation note: No candidate scoring code was changed when this decision was recorded.

### D-0008: Document Sanmeigaku input model before adding birth-time or daiun behavior

- Date: 2026-07-14
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: Future `/sanmeigaku` birth-time, unknown-time, gender, birth-place, timezone, time-pillar, daiun, dashboard, and animation work should start from `docs/sanmeigaku-input-and-time-pillar-research.md`.
- Decision: Sanmeigaku input design includes `birthGender: "male" | "female" | "unspecified"`; missing gender must not be silently normalized to `male` for daiun or time-pillar work.
- Decision: Calculation, dashboard view-model, and animation presentation layers should remain separated. Animation must not own fortune calculation rules.
- Reason: Birth time and daiun depend on source-sensitive rules. A design ledger prevents URL/form work from accidentally becoming inferred fortune logic.
- Implementation note: This decision records docs only. No source code, URL behavior, form behavior, or calculation logic was changed.

### D-0009: Protect Sanmeigaku calculation core before common-master implementation

- Date: 2026-07-15
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: Step 4A common-master work starts from `docs/common-master-architecture-decision.md`.
- Decision: The Step 3 十大主星 100 / 100 match and 十二大従星 120 / 120 match are treated as protected current calculation-core evidence.
- Decision: Step 4B should add regression tests before attempting shared-master refactors or common type extraction.
- Decision: 通変星 and 十二運 remain research comparison terms; do not add them to the Sanmeigaku UI or calculation model from this evidence alone.
- Decision: 方位神の破・冲・刑 and Sanmeigaku命式内の支合・冲・害・破・刑 must stay in separate evaluation layers until a source-reviewed architecture explicitly separates pure branch structures from use-case-specific fortune evaluation.
- Reason: Step 3 found strong evidence that existing Sanmeigaku star calculations are already aligned with the research ledger, while unresolved areas are architectural and source-review problems rather than immediate calculation fixes.
- Implementation note: This decision records docs only. No source code, data, tests, UI, URL behavior, or calculation logic was changed.

### D-0010: Keep Shichu Suimei and Sanmeigaku coexisting with explicit correspondence status

- Date: 2026-07-15
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: 四柱推命と算命学は排他的に扱わず、十干・十二支・陰陽五行の共有基盤を認め、名称・表現・解釈差を明示しながら併用・併記する。
- Decision: 個別項目は `equivalent`、`partially_equivalent`、`shared_foundation`、`shichu_only`、`sanmeigaku_only`、`source_review_required` で対応状態を記録し、完全一致を推測で断定しない。
- Decision: Step 5Aの追加資料は `docs/mannenreki-additional-masters-research.md` に集約し、既存コード照合対象と新規master候補を分離する。コード上の存在有無はStep 5Bのread-only調査で確定する。
- Decision: 医療診断、発症予測、死亡・寿命、子どもの事故・病気、神殺単独の人格・人生断定、古典的差別表現、現代医療の代替は採用しない。
- Reason: 共有構造を再利用可能にしつつ、体系差、未確認の成立条件、安全上の制限を曖昧にしないため。
- Implementation note: This decision records docs only. No source code, data, tests, master, UI, URL behavior, or calculation logic was changed.

### D-0011: Protect matched Getsumei values while isolating boundary research

- Date: 2026-07-15
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: 月命星相当の36対応と、本命星9種類 × 月支12種類の108入力は、研究台帳の独立期待値と既存暦DBで全件一致したため、現在値を回帰テストの保護対象とする。
- Decision: 次工程では値の36対応・108入力だけを独立期待値で回帰テスト化し、既存実装から期待値を生成しない。
- Decision: 節入り境界、本命星としての `yearKyusei`、月命星としての `monthKyusei` の意味上の正式定義は未確定とし、境界ロジックを置換・統合しない。
- Decision: 暦DBと公式節入りmasterの6件の境界日差は、値の回帰テストから隔離した別研究課題とする。どちらかを誤りと断定しない。
- Reason: 一致した現在値を安全に保護しながら、日付単位と時刻単位の境界問題を未確認のまま固定または変更しないため。
- Implementation note: This decision records docs only. No source code, data, tests, master, UI, URL behavior, or calculation logic was changed.

## Decision Status Matrix

| Topic | Status | Implementation status | Source review | Notes |
| --- | --- | --- | --- | --- |
| Preserve `purpose=travel` compatibility | `accepted` | Current compatibility must be preserved | Not required for compatibility itself | Do not break saved URLs. |
| Respect explicit `purpose` URL values | `accepted` | Verify before implementation changes | Not required for URL behavior itself | Explicit user-provided query values should win. |
| Omitted `purpose` should move toward `yuki_tori` | `accepted`, `implementation_pending` | Not implemented yet | Not required for URL default itself | Requires compatibility/migration plan. |
| Treat `candidateCondition` and `actionScale` as independent concepts | `accepted`, `implementation_pending` | Not implemented yet | Not required for URL concept itself | `actionScale` is action burden; `candidateCondition` is filtering. |
| Companion modes `strict` / `standard` / `loose` meanings | `provisional`, `source_review_required` | Do not change logic from wording alone | Required before rule changes | Product wording exists; formal fortune behavior is not confirmed. |
| Split candidate rank into fortune rank / practical rank | `accepted`, `implementation_pending`, `source_review_required` | Not implemented yet | Required for fortune-rank factors | Practical-rank design can proceed separately from fortune-source confirmation. |
| Sanmeigaku input model before time pillar / daiun | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Docs-only model recorded | Required before time/daiun calculation | Missing gender must not silently become male for Sanmeigaku daiun design. |
| Sanmeigaku calculation-core protection before common-master implementation | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Docs-only architecture boundary recorded | Required before unresolved common-master rule adoption | Start Step 4B with regression tests for 十大主星 100 and 十二大従星 120. |
| Shichu Suimei / Sanmeigaku coexistence and additional-master ledger | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Step 5A docs-only ledger recorded | Required per individual item | Keep shared foundations and system-specific rules explicit; Step 5B confirms code presence. |
| Getsumei 36 / 108 value protection and boundary isolation | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Values documented; regression tests not added yet | Required for formal semantics and six boundary differences | Protect exact value mappings independently; do not replace boundary logic. |
| Boundary regression samples for 節入り・立春・土用・board switching | `accepted`, `implementation_pending`, `source_review_required` | Test matrix not implemented yet | Required for authoritative expected values | High-priority test design task. |
| 天道・土用殺・方位殺・candidate-rank fortune basis | `source_review_required` | Do not change logic until reviewed | Required | Keep current behavior documented as code behavior only. |
| 本命星 handling | `source_review_required`, `pending` | Do not change personal-star logic until reviewed | Required | Current code derives from birth row year 九星. |
| 天赦日 candidate allowance without direction tags | `source_review_required`, `pending` | Do not change candidate logic until reviewed | Required | Current behavior needs product/source confirmation. |

## Pending Decisions

| ID | Item | Category | When to decide | Notes |
| --- | --- | --- | --- | --- |
| P-0003 | Official source-status labels for 天道・土用殺・方位殺・候補ランク | Fortune/source confirmation | Needs source review before logic changes | Do not decide from code alone. Candidate-rank design direction is split in D-0007, but official fortune basis is still pending. |
| P-0004 | Official behavior for `strict` / `standard` / `loose` companion judgement | Product + fortune confirmation | Needs review before changing companion logic | Current code can be documented, but intent is not confirmed. |
| P-0005 | Regression sample set for 節入り・立春・土用・年盤/月盤/日盤 switching | Test design | Can draft now; expected values need source confirmation | Useful before the next logic change. |
| P-0006 | Whether `birthGender=male` default is a final product decision | Product behavior | Before changing birth/profile forms | Current behavior defaults to male unless `female` is specified. |
| P-0007 | Whether 天赦日 can remain an almanac-only candidate without direction tags | Fortune/product behavior | Before changing monthly best-candidate logic | Needs source/product confirmation. |
| P-0008 | Whether using birth row year 九星 as 本命星 is final for all users | Fortune/source confirmation | Before changing personal-star calculations | Current behavior is documented but not confirmed as final. |
| P-0009 | Sanmeigaku time-pillar source rules | Fortune/source confirmation | Before adding `birthTime` to calculation | Includes time branch ranges, 子刻, day boundary, true solar time, longitude, timezone, DST, overseas births, and unknown time. |
| P-0010 | Sanmeigaku daiun source rules | Fortune/source confirmation | Before implementing daiun | Includes forward/reverse direction, gender relation, stem yin/yang basis, start age, rounding, counted/full age, and stem/branch progression. |
| P-0011 | Common-master Step 4B regression-test scope | Test design + architecture | Before commonizing shared masters | Start with 十大主星 100, 十二大従星 120, energy values, 初中老年, and 身強弱 boundaries before refactoring. |
