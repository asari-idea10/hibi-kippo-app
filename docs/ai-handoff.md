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
- `docs/deployment-workflow.md`
- `docs/preview-urls.md`
- The active Vercel Preview URL when reviewing a feature branch.
- The specific code files being reviewed, not the whole repository by default.
- A clear instruction to preserve the distinction between confirmed specification, current code behavior, and TODO.

## NotebookLM Drive Sync

Use `scripts/sync-docs-to-drive.sh` after documentation updates when NotebookLM should read the latest project docs from Google Drive.

Command:

```bash
bash scripts/sync-docs-to-drive.sh
```

The script:

- copies only `AGENTS.md` and top-level `docs/*.md`
- copies into `/Users/asaritoshiyuki/Library/CloudStorage/GoogleDrive-asari.graphic@gmail.com/マイドライブ/hibi-kippo-app-notebooklm`
- prints the copy target and file list before copying
- requires typing `yes`
- checks the destination for disallowed names such as `src`, `.env`, `secret`, `credential`, `token`, `node_modules`, `.next`, and `.vercel`

Do not use the script to sync source code, environment files, credentials, build output, or dependencies.

Important NotebookLM source behavior:

- Google Drive sync updates file contents for Drive files that are already added as NotebookLM sources.
- New Markdown files copied to Google Drive are not automatically added to an existing NotebookLM note.
- When new docs are created, run the sync script, then manually add the new Drive files to the NotebookLM source list.
- During NotebookLM review, confirm that all required new files are visible in the source list.
- `docs/deployment-workflow.md` and `docs/preview-urls.md` must be added as NotebookLM sources.
- Codex completion reports should explicitly say "NotebookLM manual source addition is required" when new docs were created.

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

## Decision Status Clarification Follow-up

Date: 2026-07-09

Source:

- NotebookLM follow-up review of copied documentation.

Summary:

- Added canonical decision status labels to keep NotebookLM, ChatGPT, Gemini, and Codex aligned:
  - `accepted`
  - `provisional`
  - `pending`
  - `source_review_required`
  - `implementation_pending`
- Clarified that `purpose=travel` compatibility and respecting explicit `purpose` values are `accepted`.
- Clarified that omitted `purpose` moving toward `yuki_tori`, independent `candidateCondition`, and candidate-rank split are design directions with `implementation_pending` where code behavior has not changed.
- Clarified that companion modes are `provisional` and still `source_review_required`.
- Clarified that 天道, 土用殺, 方位殺, candidate-rank fortune basis, 本命星 handling, and 天赦日 candidate allowance remain source-review or pending topics.

Changed docs:

- `docs/decision-log.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`
- `docs/review-checklist.md`

Verification:

- Documentation-only change.
- `git diff -- src` should remain empty.

## Vercel Workflow Documentation Follow-up

Date: 2026-07-09

Summary:

- Added Vercel Preview / Production workflow documentation for AI-orchestrated development.
- Recorded GitHub as the source of truth for code and docs.
- Recorded `main` as the production branch and feature branches as the normal Codex implementation path.
- Added Preview URL usage for ChatGPT/Gemini review and Production URL usage as stable baseline.
- Added a regression URL index with the current Production `/purpose-calendar` baseline.
- Added review-checklist items for Vercel Preview and production merge readiness.

Changed docs:

- `AGENTS.md`
- `docs/deployment-workflow.md`
- `docs/preview-urls.md`
- `docs/ai-handoff.md`
- `docs/review-checklist.md`
- `docs/task-board.md`

Verification:

- Documentation-only change.
- No Vercel settings, GitHub settings, app code, UI code, or fortune/calendar logic were changed.
- `git diff -- src` should remain empty.

TODO:

- Fill remaining regression URL slots in `docs/preview-urls.md`.
- Confirm exact Vercel Preview URL recording convention after the next feature-branch deployment.
- Confirm project-specific rollback procedure before relying on it operationally.

## NotebookLM Source Addition Follow-up

Date: 2026-07-09

Source:

- NotebookLM re-check after adding `docs/deployment-workflow.md` and `docs/preview-urls.md` as sources.

Summary:

- Confirmed that after `docs/deployment-workflow.md` and `docs/preview-urls.md` were manually added to NotebookLM sources, NotebookLM could read the workflow:
  - `main` is Production.
  - feature branches are Preview.
  - Vercel Preview URLs are used for ChatGPT/Gemini review.
- Clarified NotebookLM operation:
  - existing Drive source files can update through Drive sync
  - newly created docs require manual source addition in NotebookLM after Google Drive sync

Still unresolved:

- Whether pull requests should be required before merge to `main`.
- Project-specific rollback procedure.
- Production domain ownership/settings confirmation.
- Regression URL expansion in `docs/preview-urls.md`.

## Preview URL Expansion Follow-up

Date: 2026-07-09

Summary:

- Expanded `docs/preview-urls.md` from placeholder slots into a concrete Vercel Preview regression URL set.
- Added review entries for `/purpose-calendar` baseline, `purpose`, `candidateCondition`, all current `actionScale` values, companion judgement modes, family star variations, `selectedDate`, alternate birth date, compass orientation, `/sanmeigaku`, `/calendar-db`, `/calendar-notes`, `/adoption-status`, and `/direction-palace-blends`.
- Each entry records purpose, Production baseline URL, Preview host replacement rule, check points, related parameters, and what must not be broken.

Changed docs:

- `docs/preview-urls.md`
- `docs/ai-handoff.md`
- `docs/task-board.md`

Verification:

- Documentation-only change.
- No URL behavior, UI behavior, app code, or fortune/calendar logic was changed.
- `git diff -- src` should remain empty.

TODO:

- Add source-confirmed boundary-date URLs for 節入り, 立春, 土用, and year/month/day board switching.
- Add `/calendar-db` representative query URL after its parameter table is finalized.
- Add more `/calendar-notes` detail URLs for term categories affected by future changes.

## Sanmeigaku Star Detail Phase 1

Date: 2026-07-09

Summary:

- Added a small 算命学 star-term master for the 10 十大主星 and 12 十二大従星 names.
- Made 陽占 人体星図 star names on `/sanmeigaku` link to `/calendar-notes/sanmeigaku/[name]` in the same tab.
- Extended the existing `calendar-notes` detail route so star terms render placeholder pages instead of 404.
- Kept `/calendar-notes/sanmeigaku/陽占 人体星図` behavior intact.

Changed files:

- `src/lib/sanmeigaku-term-master.ts`
- `src/app/sanmeigaku/page.tsx`
- `src/app/calendar-notes/[kind]/[name]/page.tsx`
- `docs/screen-design.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/ai-handoff.md`
- `docs/task-board.md`

Verification:

- `npm run lint`: passed.
- `npm run build`: passed.
- `/sanmeigaku?birthDate=1976-03-19`: returned 200 locally and includes star links.
- `/calendar-notes/sanmeigaku/車騎星`: returned 200 locally with placeholder text.
- `/calendar-notes/sanmeigaku/司禄星`: returned 200 locally with placeholder text.
- `/calendar-notes/sanmeigaku/天印星`: returned 200 locally with placeholder text.
- `/calendar-notes/sanmeigaku/陽占%20人体星図`: returned 200 locally.

TODO:

- Confirm source spreadsheet sheets/ranges for 十大主星 and 十二大従星 explanation text.
- Replace placeholder wording with source-confirmed explanation text only after the master is connected.
- Decide whether to add a 算命学 category to `/calendar-notes` index.

## Sanmeigaku Star Detail Preview Review

Date: 2026-07-09

Branch:

- `feature/sanmeigaku-star-links`

Commit:

- `8513e952cb6359990c169e5c5b56322fc8e9afa6`

Vercel Preview:

- Base URL: `https://hibi-kippo-app-git-feature-sanmeigaku-star-links-toshi-mar19.vercel.app`
- GitHub/Vercel status: deployment completed.
- Vercel Authentication / SSO is enabled. AI-side direct unauthenticated checks may redirect to Vercel SSO, so final visual confirmation should be done by Toshi or through shared screenshots.

Review URLs:

- `https://hibi-kippo-app-git-feature-sanmeigaku-star-links-toshi-mar19.vercel.app/sanmeigaku?birthDate=1976-03-19`
- `https://hibi-kippo-app-git-feature-sanmeigaku-star-links-toshi-mar19.vercel.app/calendar-notes/sanmeigaku/%E8%BB%8A%E9%A8%8E%E6%98%9F`
- `https://hibi-kippo-app-git-feature-sanmeigaku-star-links-toshi-mar19.vercel.app/calendar-notes/sanmeigaku/%E5%8F%B8%E7%A6%84%E6%98%9F`
- `https://hibi-kippo-app-git-feature-sanmeigaku-star-links-toshi-mar19.vercel.app/calendar-notes/sanmeigaku/%E5%A4%A9%E5%8D%B0%E6%98%9F`
- `https://hibi-kippo-app-git-feature-sanmeigaku-star-links-toshi-mar19.vercel.app/calendar-notes/sanmeigaku/%E9%99%BD%E5%8D%A0%20%E4%BA%BA%E4%BD%93%E6%98%9F%E5%9B%B3`

Manual review checklist:

- `/sanmeigaku?birthDate=1976-03-19` renders.
- 陽占人体星図 star names are clickable.
- Star clicks navigate in the same tab.
- 車騎星, 司禄星, and 天印星 detail pages do not 404.
- Detail pages show preparation wording such as `説明文準備中`.
- Existing `/calendar-notes/sanmeigaku/陽占 人体星図` remains available.
- Calculation output, star names, and chart placement remain unchanged from before the link-only implementation.
- Mobile layout has no major breakage.

Status:

- Toshi manually accepted the Vercel Preview on 2026-07-09.
- Confirmed on Preview: `車騎星` detail page is not 404, placeholder text is shown, existing `/calendar-notes/sanmeigaku/陽占 人体星図` is intact, and the Preview display is usable.
- The branch is approved for `main` merge and Production promotion.

## Sanmeigaku Star Detail Production Release

Date: 2026-07-09

Branch:

- `main`

Merged source branch:

- `feature/sanmeigaku-star-links`

Production URL:

- `https://hibi-kippo-app.vercel.app`

Commits:

- Feature implementation: `8513e952cb6359990c169e5c5b56322fc8e9afa6`
- Preview checklist: `7145dce064df353c67606d78be664f47cdb9ad13`

Verification before push:

- `npm run lint`: passed.
- `npm run build`: passed.

Production checks:

- `https://hibi-kippo-app.vercel.app/sanmeigaku?birthDate=1976-03-19`: HTTP 200.
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E8%BB%8A%E9%A8%8E%E6%98%9F`: HTTP 200 and includes `この星の説明文は準備中です。`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E5%8F%B8%E7%A6%84%E6%98%9F`: HTTP 200.
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E5%A4%A9%E5%8D%B0%E6%98%9F`: HTTP 200.
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E9%99%BD%E5%8D%A0%20%E4%BA%BA%E4%BD%93%E6%98%9F%E5%9B%B3`: HTTP 200.

Remaining TODO:

- Phase 2 remains: connect source-confirmed 十大主星・十二大従星 explanation text after the spreadsheet sheets/ranges are finalized.
- Do not add inferred star meaning text before the source master is confirmed.
