# AI Handoff

Last updated: 2026-07-09

This file is the shared handoff log for Codex, ChatGPT, and Gemini.

## Agent Roles

### Suggested

- Codex: codebase investigation, implementation, local verification, concise handoff notes.
- ChatGPT: specification drafting, wording, review of TODOs and product decisions.
- Gemini: secondary review, long-context comparison, source/reference cross-checking.

These roles are operational suggestions, not product requirements.

## Handoff Rules

- Separate confirmed specification, current code behavior, and TODOs.
- Do not treat unexplained current behavior as final specification.
- Do not change fortune/calendar logic by inference.
- For implementation changes, record changed files, verification, and unresolved issues.

## Share Packet For Other AIs

When handing this project to ChatGPT or Gemini, include:

- `AGENTS.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/decision-log.md`
- The specific code files being reviewed, not the whole repository by default.
- A clear instruction to preserve the distinction between confirmed specification, current code behavior, and TODO.

## Current Baseline Handoff

Date: 2026-07-09

Summary:

- Created baseline documentation for AI-assisted development.
- No feature, UI, or fortune/calendar logic changes are intended in this documentation pass.
- The current focus is documenting `purpose-calendar`, URL parameters, candidate flow, and future agent rules.

Changed files:

- `AGENTS.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/screen-design.md`
- `docs/url-parameters.md`
- `docs/ai-handoff.md`
- `docs/decision-log.md`
- `docs/task-board.md`
- `docs/review-checklist.md`

Verification:

- Documentation-only change.
- `git diff -- src` returned no feature-code diff.
- `git status --short` shows only `AGENTS.md` and new files under `docs/`.

Unresolved:

- See TODO sections in each document.
- Highest-priority open decisions are listed in `docs/decision-log.md`.
- Prioritized implementation candidates are listed in `docs/task-board.md`.

## Future Handoff Template

Date:

Summary:

Changed files:

Verification:

Unresolved / TODO:

Docs updated:

Decision-log updates:

## External AI Review Follow-up

Date: 2026-07-09

Source:

- NotebookLM review of copied documentation.

Summary:

- Recorded product direction for `/purpose-calendar` purpose handling:
  - keep `purpose=travel` compatibility
  - respect explicit URL purpose values
  - move omitted-purpose initial behavior toward `yuki_tori` in future
- Recorded product direction that `candidateCondition` and `actionScale` are separate concepts.
- Recorded provisional companion judgement meanings for `strict`, `standard`, and `loose`.
- Recorded design direction to split candidate ranking into fortune rank and practical rank.
- Promoted boundary regression samples for 節入り, 立春, 土用, and year/month/day board switching to high-priority tasks.

Changed docs:

- `docs/decision-log.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`

Verification:

- Documentation-only change.
- `git diff -- src` returned no feature-code diff.

Still unresolved:

- Official source basis for 天道, 土用殺, 方位殺, candidate-rank fortune factors, and companion judgement rules.
- Authoritative expected values for boundary regression samples.
