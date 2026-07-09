# Task Board

Last updated: 2026-07-09

## Done

- Baseline AI orchestration documentation created.
- Initial `purpose-calendar` query parameter and data-flow inventory documented.
- Initial fortune-rule TODO list documented.

## Next

| Priority | Task | Difficulty | Impact | Type | Notes |
| --- | --- | --- | --- | --- | --- |
| P0 | Decide `/purpose-calendar` default `purpose` behavior | Medium | High | URL/product decision | Needed before changing filter semantics. |
| P0 | Decide whether `candidateCondition` remains derived from `actionScale` | Medium | High | URL/product decision | Needed before changing query behavior. |
| P1 | Draft regression sample list for 節入り・立春・土用・盤 switching | Medium | High | Test design | Expected values still need source confirmation. |
| P1 | Audit `calendar-db` form parameters and complete URL table | Low | Medium | Docs | Helps API/page consistency. |
| P1 | Add source-status annotations for 天道, 土用殺, 方位殺, selected-day rules | High | High | Fortune/source review | Requires domain/source confirmation. |
| P2 | Document companion judgement examples for strict/standard/loose | Medium | Medium | Spec/test design | Use current code examples first, then confirm intent. |

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

## Decision Timing

- Decide now: `purpose` default, `candidateCondition` vs `actionScale`.
- Can wait: route screenshots, architecture diagram, public product wording.
- Requires fortune/source confirmation: 天道, 土用殺, 方位殺, candidate ranks, companion judgement intent, expected values for boundary regression samples.
