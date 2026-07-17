# Task Board

Last updated: 2026-07-17

## Done

- Baseline AI orchestration documentation created.
- Initial `purpose-calendar` query parameter and data-flow inventory documented.
- Initial fortune-rule TODO list documented.
- Product direction recorded for `purpose` compatibility/default intent and independent `candidateCondition`.
- Provisional companion judgement meanings recorded.
- Candidate rank design direction split into fortune rank and practical rank.
- Vercel Preview / Production workflow documented.
- Initial `docs/preview-urls.md` created with a Production baseline URL.
- NotebookLM source-addition behavior documented for newly created docs.
- `docs/preview-urls.md` expanded with primary Vercel Preview regression URL categories.
- `/sanmeigaku` 陽占人体星図の星名リンク Phase 1 implemented with placeholder detail pages.
- `/sanmeigaku` 星名リンク Phase 1 promoted to Production after Vercel Preview confirmation.
- 算命学星説明マスター Phase 2 connected source-confirmed spreadsheet ranges to `/calendar-notes/sanmeigaku/[name]`.
- `/sanmeigaku` whole-chart total energy and 身弱・身中・身強 judgement connected to `算命計算!A580:B616` boundaries.
- `/calendar-notes` index now includes a 算命学 category that links to 陽占 人体星図, 十大主星, and 十二大従星 detail pages.
- `/sanmeigaku` Phase UX-1 separates user-facing chart results from developer / verification sections behind a closed details block.
- `/sanmeigaku` input model and time-pillar / daiun research ledger documented in `docs/sanmeigaku-input-and-time-pillar-research.md`.
- 『改訂版 平成萬年暦』由来の四柱推命・算命学共通マスター研究を `docs/mannenreki-common-master-research.md` に整理。
- Step 4A common-master architecture boundary documented in `docs/common-master-architecture-decision.md`; 十大主星 100 / 100 and 十二大従星 120 / 120 matches are treated as protected calculation-core evidence.
- Step 4B-1A fixed all 100 日干 × 対象干 十大主星 results as static Vitest regression cases without changing the calculation core.
- Step 4B-1B fixed all 120 日干 × 対象支 十二大従星 results as static Vitest regression cases without changing the calculation core or energy values.
- Step 4B-1C fixed all 120 日干 × 対象支 energy values as static Vitest regression cases without changing the current calculation results.
- Step 4B-1D fixed 初年運 = 年支, 中年運 = 月支, and 老年運 = 日支 placement across three static profile regression cases, completing Step 4B-1 calculation-core protection.
- Vercel Preview public review workflow confirmed: Preview URLs can be shared directly with ChatGPT/Gemini after `HTTP 200` and no SSO redirect are verified.
- Step 5A additional 『改訂版 平成萬年暦』 research ledger documented in `docs/mannenreki-additional-masters-research.md`, separating existing-code comparison targets from possible new-master candidates without implementation.
- Step 5B-1 read-only comparison completed: Getsumei 36 / 36 and expanded 108 / 108 inputs match the current calendar DB, with no mismatch, undefined value, multiple output, or non-nine-star output.
- Step 5B-1 traced the current Getsumei-equivalent path and usage: daily `monthKyusei` feeds the self keisha profile; direct Getsumei display, companion judgement, Getsumei-satsu, and candidate ranking are not current uses.
- Step 5B-1B protected the Getsumei 36 mappings and 108 expanded inputs with independent static Vitest expectations; the total suite is 494 tests.
- Step 5B-2 read-only comparison completed: year-branch groups match all 55,152 calendar rows, and monthly-board centers match 36 / 36 independent mappings with no mismatch, undefined value, multiple output, or full-range exception.
- Step 5B-2 confirmed internal consistency for all 324 palace placements: no duplicate star, missing star, center mismatch, or differing placement from the same center star.
- Step 5B-2 confirmed full-range internal consistency for monthly 五黄殺, 暗剣殺, and 月破, including four five-yellow-center cases and preservation of overlapping warning labels.
- Step 5B-2 recorded the user-provided-image research for June and July 2026: 芒種 2026-06-06 00:48 and 小暑 2026-07-07 10:57 are time-precision boundary candidates, while current code remains date-precision.
- Step 5B-2B protected the independent 36 monthly-board centers, 324 palace values, monthly 五黄殺・暗剣殺・月破, overlap preservation, orientation independence, and the date-level 2026-07-06→07-07 switch; the total suite is 693 tests.
- Step 5B-3 read-only comparison completed for the direction-deity layer.
- Step 5B-3 confirmed two current Tendo paths: one single 8-direction path and one trine-based 3-direction path.
- Step 5B-3 confirmed that single-direction Tendo and Tentoku share the same 8-direction result across all 55,152 rows, while their formal relationship remains `source_review_required`.
- Step 5B-3 confirmed the pure four-trine branch structure and aggregated current overlaps with 五黄殺・暗剣殺・破 without changing candidate policy.
- Step 5B-3A-2 documented the current purpose separation for Tentoku-go, Gettoku, Gettoku-go, and Seiki without implementation.
- Step 5B-3A-2 confirmed that monthly direction-deity Tentoku-go is unimplemented.
- Step 5B-3A-2 separated selected-day Gettoku-nichi from the unimplemented Gettoku direction.
- Step 5B-3A-2 confirmed that monthly direction-deity Gettoku-go is unimplemented.
- Step 5B-3A-2 separated the current five-element palace-blend Seiki from the unconfirmed monthly direction-deity Seiki.
- Step 5B-3A-3 documented Gekku and Teii Taichu without implementation.
- Step 5B-3A-3 classified current Gekku as a fixed personal-profile display, not a general monthly rule.
- Step 5B-3A-3 recorded that general Gekku and Teii Taichu are unimplemented.
- Step 5B-3A-3 separated Anketsu opposite-palace logic, the six branch oppositions, and the unconfirmed nine-star Teii Taichu concept.
- Step 5B-3C-1 located and registered the user-provided p.24 images without adding them to Git.
- Step 5B-3C-1 confirmed the p.24 structure as three year-branch groups × 12 months = 36 monthly plates.
- Step 5B-3C-1 completed a first-pass transcription of the side legend while preserving original notation such as `冲` and unresolved compound symbols.
- Step 5B-3C-1 completed the Tiger-month pilot for the Eight White, Five Yellow, and Two Black center plates. Large-star positions are recorded page-relatively; 24 mountains, 8-direction derivation, and unclear small markers remain unconfirmed.

## Next

| Priority | Task | Difficulty | Impact | Type | Notes |
| --- | --- | --- | --- | --- | --- |
| P0 | Design and implement `purpose` default migration | Medium | High | URL/product implementation | `accepted`, `implementation_pending`: keep explicit `purpose=travel`; move omitted purpose toward `yuki_tori`. |
| P0 | Design and implement independent `candidateCondition` handling | Medium | High | URL/product implementation | `accepted`, `implementation_pending`: keep `actionScale` for action burden; use `candidateCondition` for filtering. |
| P0 | Draft boundary regression sample matrix for 節入り・立春・土用・年盤/月盤/日盤 switching | Medium | High | Test design | `accepted`, `implementation_pending`, `source_review_required`: expected values need source confirmation before tests are authoritative. |
| P0 | Research six Getsumei / setsuiri boundary-date differences | High | High | Source research | Keep separate from value regression tests. Do not declare either calendar DB or official solar-term master wrong, and do not replace boundary logic before review. |
| P0 | Reconfirm original 324 monthly-plate cells and all markers | High | High | Source research | The original-image cells and direction markers remain `manual_transcription_review_required` / `source_review_required`; do not claim complete source agreement from internal consistency alone. |
| P0 | Step 5B-3C-1 double-check the three Tiger-month pilot plates | High | High | Source research | Obtain straight-on close-ups and independently verify every small marker before promoting any value. Keep 24 mountains and 8 directions unset until the source establishes orientation. |
| P0 | Step 5B-3C transcribe all 36 monthly plates | High | High | Source research | Start only after the pilot double-check. Preserve original symbol and page position, then independently review, compare current code, obtain PO adoption, design a source master, and add tests-only protection in separate stages. |
| P0 | Reconfirm original Tendo, Tentoku, and trine monthly-plate markers | High | High | Source research | Do not freeze the observed 12-direction values or merge the two Tendo paths before complete source transcription. |
| P1 | Confirm `birthTime`-missing setsuiri fallback specification | Medium | High | Product / source decision | Current personal-star precision is date-only. Decide exact-time, timezone, overseas-birth, and unknown-time handling before boundary implementation. |
| P1 | Define future setsuiri time-precision requirements | High | High | Product / source decision | Preserve exact source times when birth time is available; keep current date-level behavior unchanged until fallback, timezone, overseas-birth, and true-solar-time rules are decided. |
| P1 | Decide the upper monthly-board representative-date UI | Medium | Medium | Product / UI decision | Current order is `selectedDate` → current day in displayed month → month start. Decide whether and how to label the board as “M/D時点”. |
| P1 | Design monthly-plate JSON verification API after regression tests | Medium | High | API design | Prefer `date` input. If `year` / `month` is supported, return period-based `segments[]` instead of inventing one representative plate. Do not implement before Step 5B-2B. |
| P1 | Step 5B-3B define structure / policy tests-only scope | Medium | High | Tests-only candidate | Limit expectations to confirmed trine structure, current label / warning priority, no direct candidate-rank change, Gekku display isolation, and prevention of inferred Teii Taichu runtime values. Do not permanently freeze the fixed Gekku profile condition or concrete unconfirmed directions. |
| P1 | Decide whether the two Tendo paths are separate concepts or an implementation duplication | High | High | Product / source decision | Current single-direction and trine paths overlap but differ in grain and UI use; do not rename, merge, or delete before source review. |
| P1 | Confirm source relationship between Gettoku-nichi and Gettoku direction | High | High | Source research | The selected day exists, but the monthly direction is unimplemented; do not derive one from the other. |
| P1 | Decide which Seiki system, if any, the product should adopt as a direction deity | High | High | Product / source decision | Current palace-blend Seiki is another-purpose implementation. Keep monthly-marker and Eight Mansions concepts separate until reviewed. |
| P1 | Research the origin of the fixed Gekku profile condition | Medium | High | Source / implementation-history research | Determine why `1976-03-19` and Honmei star 6 return the fixed labels. Do not generalize, delete, or replace the sample before review. |
| P1 | Confirm Gekku formal rule, school differences, and strength | High | High | Source research | Confirm month basis, void relationship, direction grain, action, boundary, and school differences before implementation. |
| P1 | Confirm the formal definition of Teii Taichu | High | High | Source research | Confirm target plate, target stars, direction count, center handling, relation to five-yellow and Anketsu, action, and original marker positions. |
| P1 | Make the Gekku / Teii Taichu product decision | High | High | Product / source decision | After source review, the product owner decides whether to adopt either item and whether it affects display, warning, blocking, or rank. |
| P1 | Keep unconfirmed direction-deity values out of fixed expectations | Medium | High | Test / source boundary | Do not freeze Tentoku-go, Gettoku direction, Gettoku-go, direction-deity Seiki, Gekku, Teii Taichu, or 24-mountain values before source review. |
| P1 | Continue Step 5B read-only comparison for remaining additional Mannenreki masters | Medium | High | Research / code inventory | Continue selected days, sexagenary internal relations, spirits, and body correspondence after the monthly-plate inventory. |
| P1 | Confirm NotebookLM source list after new docs are synced | Low | Medium | AI orchestration docs | New Drive files require manual NotebookLM source addition; existing sources update through Drive sync. |
| P1 | Add initial non-authoritative regression fixtures for boundary dates | Medium | High | Test/docs | Mark expected values TODO until source-confirmed. |
| P1 | Audit `calendar-db` form parameters and complete URL table | Low | Medium | Docs | Helps API/page consistency. |
| P1 | Add source-status annotations for 天道, 土用殺, 方位殺, selected-day rules | High | High | Fortune/source review | Requires domain/source confirmation. |
| P1 | Review 算命学 star detail copy by public Preview URL | Low | Medium | Sanmeigaku content QA | Confirm the spreadsheet-derived wording is readable on 十大主星 and 十二大従星 pages. Prefer URL review over screenshots when Preview is public. No inferred text was added. |
| P1 | Source-confirm 身弱・身中・身強 meaning text | Medium | Medium | Sanmeigaku content QA | Current `/sanmeigaku` display is label-only: total energy, judgement, target positions, and `算命計算!A580:B616`. Add meaning text only after a source master is confirmed. |
| P1 | Decide whether 身弱・身中・身強 should become dictionary terms | Low | Medium | Sanmeigaku content design | They are intentionally not shown in `/calendar-notes` index yet because meaning text and route intent are not confirmed. |
| P1 | Source-review Sanmeigaku time-pillar rules | High | High | Sanmeigaku source review | `source_review_required`: time branch ranges, 子刻, day boundary, true solar time, longitude, timezone, DST, overseas births, unknown time. |
| P1 | Source-review Sanmeigaku daiun rules | High | High | Sanmeigaku source review | `source_review_required`: forward/reverse direction, gender relation, stem yin/yang basis, start age, rounding, counted/full age, and stem/branch progression. |
| P1 | Continue Step 4B regression tests for protected Sanmeigaku calculation core | Medium | High | Test implementation | Step 4B-1A through Step 4B-1D are complete. Continue with 身弱・身中・身強 boundary regression before common-master refactors. |
| P1 | Decide minimal common-master extraction scope after regression tests | Medium | High | Architecture implementation | Common candidates are 十干, 十二支, 九星 identity data, pure 三合4局 composition, and result-preserving relation structures. Do not include unresolved 干合・位相法. |
| P1 | Design `/sanmeigaku` birth-time / unknown-time / gender form | Medium | High | Sanmeigaku UI design | Do after source-review planning. Keep `birthDate`-only URLs compatible and do not use new inputs for calculation until rules are confirmed. |
| P1 | Draft time-pillar regression sample table | Medium | High | Sanmeigaku test design | Minimum 20 samples; ideal 40-60. Include 23:00 boundary, solar-term boundary, DST, overseas births, and unknown time. |
| P2 | Document companion judgement examples for strict/standard/loose | Medium | Medium | Spec/test design | Use current code examples first, then confirm intent. |
| P2 | Design candidate rank UI/data split into fortune rank and practical rank | Medium | Medium | Product/UI design | Do not change scoring until rank factors are confirmed. |

## Backlog

| Priority | Task | Difficulty | Impact | Notes |
| --- | --- | --- | --- | --- |
| P2 | Create a compact architecture diagram for calendar DB data generation and reading | Medium | Medium | Useful for onboarding other AIs. |
| P2 | Add route-level screenshots or screen map after UI stabilizes | Medium | Medium | Avoid churn while UI is still changing. |
| P2 | Define product wording for candidate ranks | Low | Medium | Needs confirmation of rank meaning. |
| P3 | Formalize ChatGPT/Gemini review prompts for spec and rule review | Low | Medium | Helpful once docs stabilize. |

## Blocked / Needs Human Confirmation

- `source_review_required`: Official meaning and final product status of each candidate rank.
- `source_review_required`: Authoritative source for each fortune/calendar rule.
- `provisional`, `source_review_required`: Whether current companion judgement modes match intended product behavior.
- `source_review_required`: Official expected values for 節入り, 立春, 土用, and board-switching regression samples.
- `source_review_required`: Complete transcription of the original 36 monthly plates, 324 palace cells, and all direction markers.
- `pending`, `source_review_required`: Upper monthly-board representative date, fixed-verification URL behavior, and future verification API contract.
- `pending`, `source_review_required`: Setsuiri time precision, `birthTime`-missing fallback, timezone, overseas birth, and true solar time. Keep the six date differences isolated.
- `pending`, `source_review_required`: Whether birth row year 九星 as 本命星 is final for all users.
- `pending`, `source_review_required`: Getsumei UI scope, companion use, Getsumei-satsu / Getsumei-tekisatsu, and candidate-rank effects.
- `pending`, `source_review_required`: Whether 天赦日 can be an almanac-only candidate without direction tags.
- `source_review_required`: Sanmeigaku time-pillar, true-solar-time, child-hour, date-boundary, timezone, DST, overseas-birth, and unknown-time rules.
- `source_review_required`: Sanmeigaku daiun forward/reverse, gender relation, start-age, rounding, counted/full-age, and stem/branch progression rules.
- `source_review_required`: Common-master research adoption for 干合/自化干合, 合化成立, 支関係, 半合/半会, and 位相法. See `docs/mannenreki-common-master-research.md` and `docs/common-master-architecture-decision.md`.
- `implementation_pending`: Step 4B regression tests for protected Sanmeigaku calculation core before common-master refactors.

## Decision Timing

- `accepted`, `implementation_pending`: `purpose` compatibility/default direction and `candidateCondition` vs `actionScale` separation.
- `provisional`, `source_review_required`: companion-mode meanings.
- `accepted`, `implementation_pending`, `source_review_required`: candidate rank split.
- `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`: protect Step 5B-2 monthly-plate values first; defer time-precision, representative-date, and API changes.
- `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`: common-master Step 4A boundary. Step 4B starts with regression tests, not refactors.
- Implement next: `purpose` migration and independent `candidateCondition` behavior after compatibility plan.
- Can wait: route screenshots, architecture diagram, public product wording.
- `source_review_required`: 天道, 土用殺, 方位殺, candidate ranks, companion judgement intent, expected values for boundary regression samples.
- Deployment flow is documented; the primary regression URL set is now available for Preview review.
- Primary regression URL set is documented; next URL work is source-confirmed boundary samples and route-specific details as features change.
- NotebookLM source behavior is documented; when new docs are created, remember that Google Drive sync alone is not enough.
