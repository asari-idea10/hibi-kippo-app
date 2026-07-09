# Decision Log

Last updated: 2026-07-09

Record product, architecture, and rule decisions here. Do not use this file to justify guessed fortune logic.

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

## Pending Decisions

| ID | Item | Category | When to decide | Notes |
| --- | --- | --- | --- | --- |
| P-0001 | Canonical default `purpose` for `/purpose-calendar` | URL/product behavior | Decide before changing purpose/filter implementation | Current code parses `travel` by default but main month computation uses `yuki_tori`. |
| P-0002 | Whether `candidateCondition` is legacy or independently honored | URL/product behavior | Decide before changing filter implementation | Current effective behavior is driven by `actionScale`. |
| P-0003 | Official source-status labels for 天道・土用殺・方位殺・候補ランク | Fortune/source confirmation | Needs source review before logic changes | Do not decide from code alone. |
| P-0004 | Official behavior for `strict` / `standard` / `loose` companion judgement | Product + fortune confirmation | Needs review before changing companion logic | Current code can be documented, but intent is not confirmed. |
| P-0005 | Regression sample set for 節入り・立春・土用・年盤/月盤/日盤 switching | Test design | Can draft now; expected values need source confirmation | Useful before the next logic change. |
