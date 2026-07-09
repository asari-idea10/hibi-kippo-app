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

### D-0004: Keep `purpose=travel` compatibility while moving default intent toward `yuki_tori`

- Date: 2026-07-09
- Status: accepted as design direction, not implemented
- Decision: Existing `purpose=travel` URLs remain compatible. If `purpose` is explicitly provided in the URL, the app should respect that value. If `purpose` is omitted, the future product direction is to make `yuki_tori` the initial/default purpose for `/purpose-calendar`.
- Reason: The page is now primarily used as a 九星方位 / 祐気取り calendar, but saved URLs and older links may still rely on `travel`.
- Implementation note: No code change was made when this decision was recorded.

### D-0005: Treat `candidateCondition` and `actionScale` as separate concepts

- Date: 2026-07-09
- Status: accepted as design direction, not implemented
- Decision: `candidateCondition` should be treated as an independent URL parameter. `actionScale` represents 行動の規模・距離感・実行負荷. `candidateCondition` represents candidate existence and filtering strictness.
- Reason: Combining them makes URL behavior and UI intent harder to reason about. Future URL/UI design should separate "how far / how heavy the action is" from "how strictly candidate days are filtered."
- Implementation note: Current code behavior may still derive effective candidate filtering from `actionScale`; this document records the desired design direction only.

### D-0006: Companion judgement mode meanings are provisional product guidance

- Date: 2026-07-09
- Status: provisional
- Decision: Use the following provisional meanings until source/domain review confirms the official rules:
  - `strict`: prioritize avoiding bad directions for every selected participant.
  - `standard`: recommended normal mode; the user/self remains primary while strong bad directions for companions are avoided.
  - `loose`: user/self remains primary; companion information is closer to reference display.
- Reason: The UI needs understandable mode labels and review targets, but the formal fortune specification is not yet confirmed.
- Implementation note: Do not change companion judgement logic from this text alone.

### D-0007: Split candidate rank design into fortune rank and practical rank

- Date: 2026-07-09
- Status: accepted as design direction, not implemented
- Decision: Future candidate ranking should distinguish fortune-rank factors from practical-rank factors.
- Fortune-rank factors may include 三盤一致, 年月一致, 月日一致, 天道, and bad-direction avoidance.
- Practical-rank factors may include 近場, 日帰り可, 温泉, 神社, 自然散策, 食事, and other ease-of-action signals.
- Reason: Current candidate labels mix calculation strength and real-world usability. Separating them will make future UI and scoring easier to explain.
- Implementation note: No candidate scoring code was changed when this decision was recorded.

## Pending Decisions

| ID | Item | Category | When to decide | Notes |
| --- | --- | --- | --- | --- |
| P-0003 | Official source-status labels for 天道・土用殺・方位殺・候補ランク | Fortune/source confirmation | Needs source review before logic changes | Do not decide from code alone. Candidate-rank design direction is split in D-0007, but official fortune basis is still pending. |
| P-0004 | Official behavior for `strict` / `standard` / `loose` companion judgement | Product + fortune confirmation | Needs review before changing companion logic | Current code can be documented, but intent is not confirmed. |
| P-0005 | Regression sample set for 節入り・立春・土用・年盤/月盤/日盤 switching | Test design | Can draft now; expected values need source confirmation | Useful before the next logic change. |
| P-0006 | Whether `birthGender=male` default is a final product decision | Product behavior | Before changing birth/profile forms | Current behavior defaults to male unless `female` is specified. |
| P-0007 | Whether 天赦日 can remain an almanac-only candidate without direction tags | Fortune/product behavior | Before changing monthly best-candidate logic | Needs source/product confirmation. |
| P-0008 | Whether using birth row year 九星 as 本命星 is final for all users | Fortune/source confirmation | Before changing personal-star calculations | Current behavior is documented but not confirmed as final. |
