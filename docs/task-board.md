# Task Board

Last updated: 2026-07-09

## Done

- Baseline AI orchestration documentation created.
- Initial `purpose-calendar` query parameter and data-flow inventory documented.
- Initial fortune-rule TODO list documented.
- Product direction recorded for `purpose` compatibility/default intent and independent `candidateCondition`.
- Provisional companion judgement meanings recorded.
- Candidate rank design direction split into fortune rank and practical rank.

## Next

| Priority | Task | Difficulty | Impact | Type | Notes |
| --- | --- | --- | --- | --- | --- |
| P0 | Design and implement `purpose` default migration | Medium | High | URL/product implementation | Keep explicit `purpose=travel`; move omitted purpose toward `yuki_tori`. |
| P0 | Design and implement independent `candidateCondition` handling | Medium | High | URL/product implementation | Keep `actionScale` for action burden; use `candidateCondition` for filtering. |
| P0 | Draft boundary regression sample matrix for 節入り・立春・土用・年盤/月盤/日盤 switching | Medium | High | Test design | Expected values still need source confirmation before tests are authoritative. |
| P1 | Add initial non-authoritative regression fixtures for boundary dates | Medium | High | Test/docs | Mark expected values TODO until source-confirmed. |
| P1 | Audit `calendar-db` form parameters and complete URL table | Low | Medium | Docs | Helps API/page consistency. |
| P1 | Add source-status annotations for 天道, 土用殺, 方位殺, selected-day rules | High | High | Fortune/source review | Requires domain/source confirmation. |
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

- Official meaning and final product status of each candidate rank.
- Authoritative source for each fortune/calendar rule.
- Whether current companion judgement modes match intended product behavior.
- Official expected values for 節入り, 立春, 土用, and board-switching regression samples.
- Whether birth row year 九星 as 本命星 is final for all users.
- Whether 天赦日 can be an almanac-only candidate without direction tags.

## Decision Timing

- Decided as design direction, not implemented: `purpose` compatibility/default direction, `candidateCondition` vs `actionScale` separation, provisional companion-mode meanings, candidate rank split.
- Implement next: `purpose` migration and independent `candidateCondition` behavior after compatibility plan.
- Can wait: route screenshots, architecture diagram, public product wording.
- Requires fortune/source confirmation: 天道, 土用殺, 方位殺, candidate ranks, companion judgement intent, expected values for boundary regression samples.
