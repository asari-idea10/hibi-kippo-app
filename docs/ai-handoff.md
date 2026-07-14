# AI Handoff

Last updated: 2026-07-14

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

- Phase 2 has since connected the source-confirmed 十大主星・十二大従星 explanation text from the spreadsheet ranges.
- Continue to avoid inferred star meaning text outside the connected source ranges.

## NotebookLM Clarification: Sanmeigaku Star Links Phase 1 / Phase 2

Date: 2026-07-09

Purpose:

- Make `/sanmeigaku` star-link Phase 1 and the remaining Phase 2 task explicit enough for NotebookLM, ChatGPT, Gemini, and Codex to read consistently.
- Keyword for NotebookLM retrieval: `sanmeigaku 星名リンク`.

Phase 1 status:

- Status: `implemented`, `production_released`.
- `feature/sanmeigaku-star-links` was fast-forward merged into `main`.
- Production is reflected at `https://hibi-kippo-app.vercel.app`.
- `/sanmeigaku` 陽占人体星図 now links 十大主星・十二大従星 names to existing `/calendar-notes/[kind]/[name]`.
- Link format: `/calendar-notes/sanmeigaku/[星名]`.
- Example star detail paths:
  - `/calendar-notes/sanmeigaku/車騎星`
  - `/calendar-notes/sanmeigaku/司禄星`
  - `/calendar-notes/sanmeigaku/天印星`
- Star links navigate in the same tab.
- `/calendar-notes/sanmeigaku/[星名]` is not 404.
- Current star detail pages show `この星の説明文は準備中です。`.
- Existing `/calendar-notes/sanmeigaku/陽占 人体星図` remains available.
- Phase 1 did not change 算命学 logic, star calculation logic, or 陽占人体星図 placement logic.

Production check URLs:

- `https://hibi-kippo-app.vercel.app/sanmeigaku?birthDate=1976-03-19`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E8%BB%8A%E9%A8%8E%E6%98%9F`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E5%8F%B8%E7%A6%84%E6%98%9F`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E5%A4%A9%E5%8D%B0%E6%98%9F`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E9%99%BD%E5%8D%A0%20%E4%BA%BA%E4%BD%93%E6%98%9F%E5%9B%B3`

Phase 2 status:

- Status: `implemented`, `source_connected`.
- Source-confirmed explanation masters are connected to `/calendar-notes/sanmeigaku/[星名]`.
- 十大主星 pages display the 5 position-specific 人体星図 explanations.
- 十二大従星 pages display power, energy, age range, strength class, animal/group attributes, colors, and keywords.

Phase 2 source candidate:

- Spreadsheet: `https://docs.google.com/spreadsheets/d/1cA4_swLTarSTJkz2nSxvF6oBlrAo363A4U5xTWOQv7g/edit?gid=1235637842#gid=1235637842`
- Sheet: `算命計算`
- 十二大従星: `算命計算!B512:N524`
- 十大主星: `算命計算!A528:E577`
- 身強・身中・身弱: `算命計算!A580:B616`

十二大従星 expected fields:

- 星名
- パワー数
- エネルギー
- 相当年齢
- 身強／身弱
- 動物占い
- グループ
- 種族
- 表記
- 軸
- 目標／状況
- カラー
- 特徴

十大主星 structure:

- `算命計算!A528:E577` is position-specific 人体星図 explanation data, not only one generic explanation per star.
- Examples: `中心 × 車騎星`, `頭 × 車騎星`, `腹 × 車騎星`, `右手 × 車騎星`, `左手 × 車騎星`.
- Expected fields: `position`, `star`, `key`, `theme`, `description`.

身強・身中・身弱 handling:

- `算命計算!A580:B616` is a helper master for classifying 身弱・身中・身強 from total energy.
- It is represented as an energy-total helper master.
- It is not used to generate direct star-detail body text.
- Broader whole-chart display placement remains a separate follow-up decision.

Phase 2 implementation files:

- `src/lib/sanmeigaku-star-description-master.ts`
- `src/app/calendar-notes/[kind]/[name]/page.tsx`

Guardrails:

- Do not add explanation text outside the confirmed spreadsheet ranges.
- Do not infer star meanings.
- Do not change 算命学 logic.
- Do not change star calculation logic.
- Do not change 陽占人体星図 placement logic.
- Do not expand 身強・身中・身弱 into direct star-detail body text without a separate design decision.
- Treat `/calendar-notes` index sanmeigaku category exposure as a separate task if needed.

## Sanmeigaku Star Explanation Master Phase 2 Implementation

Date: 2026-07-09

Summary:

- Added `src/lib/sanmeigaku-star-description-master.ts`.
- Connected `/calendar-notes/sanmeigaku/[星名]` to spreadsheet-derived explanation masters.
- Kept `src/lib/sanmeigaku-term-master.ts` as the thin star-name/category route master.
- Did not change 算命学 calculation logic, star derivation logic, or 陽占人体星図 placement logic.
- Did not add explanation text outside the requested spreadsheet ranges.

Source ranges:

- 十二大従星: `算命計算!B512:N524`
- 十大主星: `算命計算!A528:E577`
- 身強・身中・身弱: `算命計算!A580:B616`

Changed files:

- `src/lib/sanmeigaku-star-description-master.ts`
- `src/app/calendar-notes/[kind]/[name]/page.tsx`
- `docs/product-spec.md`
- `docs/screen-design.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`

Verification plan:

- `npm run lint`
- `npm run build`
- Check `/calendar-notes/sanmeigaku/車騎星` displays 5 position-specific 十大主星 descriptions.
- Check `/calendar-notes/sanmeigaku/司禄星` displays 5 position-specific 十大主星 descriptions.
- Check `/calendar-notes/sanmeigaku/天印星` displays 十二大従星 attributes and keywords.
- Check `/calendar-notes/sanmeigaku/陽占%20人体星図` remains available.

## Vercel Preview Public Review Workflow

Date: 2026-07-11

Summary:

- Vercel Project Settings > Deployment Protection was updated outside the codebase.
- Vercel Authentication is disabled for Preview review.
- Production settings and environment variables were not changed as part of this workflow note.
- Active Preview URL was confirmed to be publicly viewable without Vercel login.
- `curl -I "https://hibi-kippo-vdghnsawl-toshi-mar19.vercel.app/sanmeigaku?birthDate=1976-03-19"` returned `HTTP/2 200`.
- The response did not include `location: https://vercel.com/sso-api...`.

Operational rule:

- Use Vercel Preview for UI changes, visible behavior changes, link changes, URL route changes, and other feature changes where browser review is useful.
- Codex should provide full Preview URLs, not only paths.
- Before sharing a Preview URL with ChatGPT, Gemini, or another external AI reviewer, confirm unauthenticated access with an incognito/private browser window or `curl -I`.
- If `curl -I` returns `HTTP 200` and incognito display works, treat the URL as a public Preview even if an external AI fetch tool has a temporary retrieval failure.
- Prefer URL-based external AI review over screenshots when the Preview URL is publicly accessible.
- Documentation-only changes do not require Vercel Preview.

Security guardrails:

- Do not expose secrets, environment variables, credentials, customer data, production-only private data, or authentication tokens in Preview.
- Production settings and environment variables are outside the scope of the public Preview review workflow.

## Sanmeigaku Energy Strength Display Connection

Date: 2026-07-11

Summary:

- Aligned `/sanmeigaku` whole-chart 身弱・身中・身強 judgement with the spreadsheet-derived helper master.
- Source range: `算命計算!A580:B616`.
- Boundary values:
  - `1-12`: 身弱
  - `13-24`: 身中
  - `25-36`: 身強
- The total energy target remains the existing three 十二大従星 positions:
  - 初年運: 日干 × 年支
  - 中年運: 日干 × 月支
  - 老年運: 日干 × 日支
- The `/sanmeigaku` 陽占人体星図 meta cell now shows total energy, judgement, target positions, and source range.
- No URL or query parameter changes were made.
- No inferred meaning text for 身弱・身中・身強 was added.
- 算命学 logic, star derivation logic, and 陽占人体星図 placement logic were not changed.

Changed files:

- `src/lib/sanmeigaku-yosen-master.ts`
- `src/app/sanmeigaku/page.tsx`
- `docs/product-spec.md`
- `docs/screen-design.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`

Verification:

- Run `npm run lint`.
- Run `npm run build`.
- Check `/sanmeigaku?birthDate=1976-03-19`.
- Check `/sanmeigaku?birthDate=2008-12-28`.
- Check `/calendar-notes/sanmeigaku/天印星`.
- Check `/calendar-notes/sanmeigaku/天報星`.

Remaining TODO:

- Add source-confirmed meaning text for 身弱・身中・身強 only after an explanation master is confirmed.
- Decide whether 身弱・身中・身強 should become dictionary terms after meaning text and route intent are confirmed.

## Calendar Notes Sanmeigaku Index Category

Date: 2026-07-11

Summary:

- Added a 算命学 category to `/calendar-notes`.
- The category links to existing detail pages only:
  - `/calendar-notes/sanmeigaku/陽占 人体星図`
  - 十大主星 pages under `/calendar-notes/sanmeigaku/[星名]`
  - 十二大従星 pages under `/calendar-notes/sanmeigaku/[星名]`
- Term chips use meta labels so the index remains compact:
  - `陽占`
  - `十大主星`
  - `十二大従星`
- 身弱・身中・身強 is intentionally not listed in `/calendar-notes` because it is currently a `/sanmeigaku` whole-chart helper judgement and dictionary meaning text is not connected.
- No URL or query parameter changes were made.
- 算命学 logic, star derivation logic, and 陽占人体星図 placement logic were not changed.
- Existing `/calendar-notes/sanmeigaku/[name]` behavior was not changed.

Changed files:

- `src/app/calendar-notes/page.tsx`
- `src/lib/term-dictionary-status.ts`
- `docs/product-spec.md`
- `docs/screen-design.md`
- `docs/url-parameters.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`

Verification:

- Run `npm run lint`.
- Run `npm run build`.
- Check `/calendar-notes`.
- Check `/calendar-notes/sanmeigaku/陽占%20人体星図`.
- Check `/calendar-notes/sanmeigaku/車騎星`.
- Check `/calendar-notes/sanmeigaku/司禄星`.
- Check `/calendar-notes/sanmeigaku/玉堂星`.
- Check `/calendar-notes/sanmeigaku/天報星`.
- Check `/calendar-notes/sanmeigaku/天印星`.

Remaining TODO:

- Decide later whether 身弱・身中・身強 should have dictionary detail pages after source-confirmed meaning text exists.

## Calendar Notes SEO Status Label Clarification

Date: 2026-07-12

Summary:

- Changed only the category-card status display on `/calendar-notes` so `seoArticleStatus` is explicitly labeled as SEO status.
- Display wording is now `SEO 未着手`, `SEO 進行中`, or `SEO 完了` according to the existing data value.
- The `seoArticleStatus` data values, connection/body status, sanmeigaku category, links, URLs, and logic were not changed.

Changed files:

- `src/app/calendar-notes/page.tsx`
- `docs/ai-handoff.md`

Verification:

- `npm run lint`: passed.
- `npm run build`: passed.
- Vercel Preview deployment for commit `83a4e79`: completed.
- Preview URL: `https://hibi-kippo-app-git-feature-calendar-notes-sa-a8664b-toshi-mar19.vercel.app/calendar-notes`
- Preview returned `HTTP/2 200` without a `Location` header or Vercel SSO redirect.
- Preview category cards displayed `SEO 未着手` from the existing `seoArticleStatus` values.

Unresolved / TODO:

- None for this label-only change.

## Sanmeigaku Phase UX-1 Implementation

Date: 2026-07-12

Branch:

- `feature/sanmeigaku-ux-phase1`

Summary:

- Updated `/sanmeigaku` hero copy to match the current implementation: birth date displays 陰占 and 陽占, birth time is not used, and 人体星図 star names link to detail pages.
- Grouped developer / verification sections after 陽占 人体星図 into one initially closed details block labeled `開発・検証情報を表示`.
- The details block contains the existing 蔵干マスター, 蔵干流派別検証ステータス, and 算命学マスター棚卸し sections in their existing order.
- Removed the old `陽占マスター接続予定` page section because 陽占, 十大主星, 十二大従星, and star detail pages are already connected.
- Did not change 算命学 calculation logic, star derivation logic, 人体星図 placement, URLs, query parameters, source ranges, hover behavior, or 時柱 behavior.

Changed files:

- `src/app/sanmeigaku/page.tsx`
- `src/app/globals.css`
- `docs/product-spec.md`
- `docs/screen-design.md`
- `docs/fortune-rules.md`
- `docs/url-parameters.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`

Verification:

- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Local `/sanmeigaku`: hero copy and empty state render; old `陽占マスター接続予定` text is absent.
- Local `/sanmeigaku?birthDate=1976-03-19`: 陰占, 陰占の柱, 陽占 人体星図, total energy `16`, judgement `身中`, and star links render; developer details exists once and is initially closed.
- Local `/sanmeigaku?birthDate=2008-12-28`: 陰占, 陰占の柱, 陽占 人体星図, total energy `28`, judgement `身強`, and star links render; developer details exists once and is initially closed.
- Browser mobile check at 390px width: summary displayed without horizontal breakage, details was initially closed, and clicking summary opened all three developer / verification sections.

Preview:

- Base URL: `https://hibi-kippo-app-git-feature-sanmeigaku-ux-phase1-toshi-mar19.vercel.app`
- GitHub/Vercel status: deployment completed for commit `7b2e56ea75c0ba4c7244303cdbdeb4ae8edc2cf6`.
- `https://hibi-kippo-app-git-feature-sanmeigaku-ux-phase1-toshi-mar19.vercel.app/sanmeigaku`: HTTP 200, no `Location` header, no Vercel SSO redirect.
- `https://hibi-kippo-app-git-feature-sanmeigaku-ux-phase1-toshi-mar19.vercel.app/sanmeigaku?birthDate=1976-03-19`: HTTP 200, no `Location` header, no Vercel SSO redirect.
- `https://hibi-kippo-app-git-feature-sanmeigaku-ux-phase1-toshi-mar19.vercel.app/sanmeigaku?birthDate=2008-12-28`: HTTP 200, no `Location` header, no Vercel SSO redirect.
- Preview body checks confirmed updated hero copy, empty state, user-facing result sections, star links, one initially closed developer details block, all three developer / verification sections inside it, and absence of old `陽占マスター接続予定`.

Unresolved / TODO:

- No new TODO from this Phase UX-1 change.

## Sanmeigaku Input Model and Time Pillar Research Ledger

Date: 2026-07-14

Summary:

- Added a docs-only Sanmeigaku input model and research ledger for future birth-time, unknown-time, gender, birth-place, timezone, time-pillar, daiun, dashboard, and animation work.
- Created `docs/sanmeigaku-input-and-time-pillar-research.md` as the detailed ledger.
- Documented `SanmeigakuProfileInputV0` as a future design model only; no source code was added.
- Recorded that existing `/sanmeigaku?birthDate=YYYY-MM-DD` URLs must remain compatible.
- Recorded that Sanmeigaku gender design must support `unspecified`; missing gender must not be silently normalized to `male` for daiun or time-pillar work.
- Recorded that birth time input must not make the time pillar authoritative until time-pillar, true-solar-time, date-boundary, and source rules are confirmed.
- Recorded that calculation, dashboard view-model, and animation presentation layers should stay separated. Animation must not own fortune calculation rules.

Changed files:

- `docs/sanmeigaku-input-and-time-pillar-research.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/screen-design.md`
- `docs/url-parameters.md`
- `docs/decision-log.md`
- `docs/task-board.md`
- `docs/ai-handoff.md`

Verification:

- Confirm `git diff -- src` is empty.
- Run `git diff --check`.
- Confirm docs treat time-pillar and daiun items as `source_review_required` and do not describe them as implemented.

Unresolved / TODO:

- Source-review time-pillar, child-hour, true-solar-time, date-boundary, timezone, DST, overseas-birth, and unknown-time rules.
- Source-review daiun forward/reverse, gender relation, stem yin/yang basis, start age, rounding, counted/full age, and stem/branch progression rules.
- Decide final `/sanmeigaku` URL behavior before adding birth-time or gender form fields.

## Mannenreki Common Master Research Handoff

Date: 2026-07-14

Source:

- User-provided 『改訂版 平成萬年暦』 material as interpreted and organized by ChatGPT.
- Auxiliary Shichu Suimei historical source is noted only for limited comparison.

Summary:

- Added `docs/mannenreki-common-master-research.md` as the central ledger for Step 1-2 common-master research covering 十干, 十二支, 九星, 月建, 二十四節気, 通変星, 十二運, 干合, 自化干合, 支合, 三合, 冲/沖, 害, 破, 刑, 自刑, and visual references.
- The ledger separates source-transcribed candidates, provisional mappings, source-review items, historical-reference items, and Shichu-only concepts.
- This is not a Sanmeigaku formal rule adoption and does not change code/data masters.

Changed docs:

- `docs/mannenreki-common-master-research.md`
- `docs/product-spec.md`
- `docs/fortune-rules.md`
- `docs/task-board.md`
- `docs/sanmeigaku-input-and-time-pillar-research.md`

Verification:

- Documentation-only change.
- `git diff -- src` should remain empty.

Unresolved:

- Source page/colophon confirmation for the user-provided material.
- Step 3 comparison with current code/data masters and Sanmeigaku-specific sources.
