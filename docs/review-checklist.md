# Review Checklist

Last updated: 2026-07-09

Use this before merging or handing off changes.

## Before Editing

- Read `AGENTS.md`.
- Read the relevant docs for the touched area.
- Check `docs/decision-log.md` for the current status labels: `accepted`, `provisional`, `pending`, `source_review_required`, and `implementation_pending`.
- Do not implement items marked `pending` or `source_review_required` without explicit user/source confirmation.
- For items marked `implementation_pending`, confirm the accepted direction, migration plan, and affected URL/UI behavior before editing code.
- Identify target files and expected impact.
- Check `git status --short`.
- For large changes, present approach and unknowns before editing.

## Code Safety

- Keep the diff minimal.
- Do not refactor unrelated code.
- Do not overwrite unrelated user changes.
- Preserve existing routes and query parameters unless documented.
- Preserve existing data shapes unless migration is documented.

## Fortune / Calendar Logic

- Confirm the exact code path before changing calculations.
- Do not infer 九星気学, 祐気取り, 方位, 暦, 土用, 天道, or 算命学 rules.
- Add or update regression samples for boundary-sensitive logic.
- Update `docs/fortune-rules.md` for rule changes.
- Record specification decisions in `docs/decision-log.md`.
- For any rule change, list before/after examples for at least one normal date and one boundary date when applicable.
- If expected values are not source-confirmed, mark the test/design note as TODO instead of encoding the assumption.

## UI / UX

- Update `docs/screen-design.md` for visible behavior or layout changes.
- Confirm labels used for calculation verification remain clear.
- Check mobile and desktop layouts when UI changes.

## URL Parameters

- Update `docs/url-parameters.md` when adding, removing, or changing query behavior.
- Preserve old parameters when practical.
- Document fallbacks and default behavior.

## Verification

- For code changes, run `npm run lint` and `npm run build` unless clearly unrelated or blocked.
- For documentation-only changes, confirm `git diff` does not include feature code.
- For documentation-only changes, explicitly check `git diff -- src`.
- For URL behavior changes, manually verify a saved URL with all affected parameters.
- For `purpose-calendar` calculation changes, verify at least one ordinary date and one boundary date such as 節入り, 立春, or 土用 when relevant.
- Record verification in `docs/ai-handoff.md`.

## Handoff

- Summarize changed files.
- Summarize tests or checks run.
- List unresolved TODOs.
- Note any decisions added to `docs/decision-log.md`.
