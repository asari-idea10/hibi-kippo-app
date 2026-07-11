# Review Checklist

Last updated: 2026-07-11

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
- Documentation-only changes do not require Vercel Preview verification.
- For URL behavior changes, manually verify a saved URL with all affected parameters.
- For `purpose-calendar` calculation changes, verify at least one ordinary date and one boundary date such as 節入り, 立春, or 土用 when relevant.
- Record verification in `docs/ai-handoff.md`.

## NotebookLM / Google Drive

- After docs updates that should be reviewed by NotebookLM, run `bash scripts/sync-docs-to-drive.sh`.
- For existing docs already added as NotebookLM sources, Google Drive sync can update the source contents.
- For newly created docs, manually add the synced Drive file to NotebookLM sources.
- Before NotebookLM review, confirm required new files are present in the NotebookLM source list.
- `deployment-workflow.md` and `preview-urls.md` must be present as NotebookLM sources for Vercel workflow review.
- If new docs were created, the Codex final report must say that NotebookLM manual source addition is required.

## Vercel Preview

Use Vercel Preview for feature, UI, URL behavior, logic, and infrastructure changes before merging to `main`.

- Provide full Preview URLs for review, not only paths.
- Confirm the Preview URL is publicly viewable before sending it to ChatGPT, Gemini, or another external AI reviewer.
- Confirm unauthenticated access by using a private/incognito browser window or `curl -I "<full-preview-url>"`.
- Confirm `curl -I` returns `HTTP 200` and does not include `location: https://vercel.com/sso-api...`.
- Confirm `/purpose-calendar` displays successfully.
- Confirm the target URL keeps its query parameters after load and interaction.
- Confirm `purpose=yuki_tori`, `candidateCondition=has_candidate`, `birthDate`, `birthGender`, `companionJudgementMode`, `familyStars`, and `actionScale` are not broken.
- Confirm mobile display does not break.
- Confirm 祐気取り candidate days remain understandable.
- Confirm existing `/sanmeigaku`, `/calendar-db`, and `/calendar-notes` routes are not negatively affected when relevant.
- Confirm the Preview page does not expose secrets, environment variables, credentials, customer data, production-only private data, or authentication tokens.
- Prefer direct URL review over screenshots when ChatGPT/Gemini can access the public Preview URL.
- If an external AI fetch tool temporarily fails but `curl -I` returns `HTTP 200` and incognito browser display works, treat the URL as a public Preview and note the tool-specific failure in the handoff.
- Record the Preview URL and result in `docs/ai-handoff.md`.

## Production Merge

- Confirm `docs/deployment-workflow.md` has been followed.
- Confirm relevant URLs from `docs/preview-urls.md` were checked on Preview for non-doc changes.
- Confirm no `pending` or `source_review_required` item was implemented without explicit confirmation.
- Confirm rollback approach is clear for the change.

## Handoff

- Summarize changed files.
- Summarize tests or checks run.
- List unresolved TODOs.
- Note any decisions added to `docs/decision-log.md`.
