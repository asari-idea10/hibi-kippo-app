# Task Board

Last updated: 2026-07-09

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

## Next

| Priority | Task | Difficulty | Impact | Type | Notes |
| --- | --- | --- | --- | --- | --- |
| P0 | Design and implement `purpose` default migration | Medium | High | URL/product implementation | `accepted`, `implementation_pending`: keep explicit `purpose=travel`; move omitted purpose toward `yuki_tori`. |
| P0 | Design and implement independent `candidateCondition` handling | Medium | High | URL/product implementation | `accepted`, `implementation_pending`: keep `actionScale` for action burden; use `candidateCondition` for filtering. |
| P0 | Draft boundary regression sample matrix for 節入り・立春・土用・年盤/月盤/日盤 switching | Medium | High | Test design | `accepted`, `implementation_pending`, `source_review_required`: expected values need source confirmation before tests are authoritative. |
| P1 | Confirm NotebookLM source list after new docs are synced | Low | Medium | AI orchestration docs | New Drive files require manual NotebookLM source addition; existing sources update through Drive sync. |
| P1 | Add initial non-authoritative regression fixtures for boundary dates | Medium | High | Test/docs | Mark expected values TODO until source-confirmed. |
| P1 | Audit `calendar-db` form parameters and complete URL table | Low | Medium | Docs | Helps API/page consistency. |
| P1 | Add source-status annotations for 天道, 土用殺, 方位殺, selected-day rules | High | High | Fortune/source review | Requires domain/source confirmation. |
| P1 | Connect source-confirmed 算命学 star explanation master | Medium | High | Sanmeigaku content/source implementation | Phase 2: after spreadsheet sheets/ranges are finalized, connect 十大主星・十二大従星 explanation text to `/calendar-notes/sanmeigaku/[name]`. |
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
- `pending`, `source_review_required`: Whether birth row year 九星 as 本命星 is final for all users.
- `pending`, `source_review_required`: Whether 天赦日 can be an almanac-only candidate without direction tags.
- `source_review_required`: Exact spreadsheet sheets/ranges for 十大主星・十二大従星 explanation text.

## Decision Timing

- `accepted`, `implementation_pending`: `purpose` compatibility/default direction and `candidateCondition` vs `actionScale` separation.
- `provisional`, `source_review_required`: companion-mode meanings.
- `accepted`, `implementation_pending`, `source_review_required`: candidate rank split.
- Implement next: `purpose` migration and independent `candidateCondition` behavior after compatibility plan.
- Can wait: route screenshots, architecture diagram, public product wording.
- `source_review_required`: 天道, 土用殺, 方位殺, candidate ranks, companion judgement intent, expected values for boundary regression samples.
- Deployment flow is documented; the primary regression URL set is now available for Preview review.
- Primary regression URL set is documented; next URL work is source-confirmed boundary samples and route-specific details as features change.
- NotebookLM source behavior is documented; when new docs are created, remember that Google Drive sync alone is not enough.
