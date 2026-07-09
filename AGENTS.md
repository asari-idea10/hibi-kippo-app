<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Rules

This repository is a Next.js application for 日々吉方 / 九星方位 / 算命学 related views. Future work may be shared across Codex, ChatGPT, and Gemini, so keep code, docs, and handoffs explicit.

## Before Work

- Read this file first.
- Before implementation, read the relevant files in `docs/`, especially:
  - `docs/product-spec.md`
  - `docs/fortune-rules.md`
  - `docs/screen-design.md`
  - `docs/url-parameters.md`
  - `docs/ai-handoff.md`
  - `docs/decision-log.md`
- For large changes, present the target files, implementation approach, impact range, and unknowns before editing.
- Classify every requested change as one of:
  - documentation-only
  - UI-only
  - URL/query behavior
  - data generation/import
  - fortune/calendar judgement logic
  - infrastructure/build
- If the change is not documentation-only, check whether `docs/ai-handoff.md` has unresolved notes that affect the task.
- If a requested change touches 九星気学, 祐気取り, 方位, 暦, 土用, 天道, 算命学, or related calculations, do not infer rules from general knowledge. Confirm the existing code path and source status first.

## Implementation Rules

- Use the smallest practical diff.
- As a rule, make feature additions, UI changes, URL behavior changes, and logic changes on a feature branch.
- Avoid direct changes to `main` for implementation work.
- Prefer existing components, data shapes, and helper functions over new abstractions.
- Do not casually change existing URLs, query parameters, route behavior, or judgement logic.
- Preserve backwards-compatible query parameters unless a documented decision says otherwise.
- Preserve existing URLs, especially `/purpose-calendar` query parameter compatibility.
- Do not change fortune-telling, calendar, direction, 土用, 天道, or candidate judgement logic by guesswork.
- Keep "current code behavior" separate from "confirmed product specification" in docs and user-facing summaries.
- If a TODO blocks implementation, pause and state the specific decision needed instead of filling the gap with assumptions.
- When a specification decision is made, record it in `docs/decision-log.md`.
- When URL parameters change, update `docs/url-parameters.md`.
- When UI changes, update `docs/screen-design.md`.
- When fortune/calendar rules change, update `docs/fortune-rules.md`.

## After Work

- For code changes, run the relevant verification command, usually `npm run lint` and `npm run build` unless clearly unnecessary or blocked.
- For non-documentation changes, expect local verification plus Vercel Preview URL verification before production merge.
- When a Vercel Preview URL is issued, record it in `docs/ai-handoff.md`.
- Before production merge, check `docs/review-checklist.md`.
- For documentation-only changes, confirm the diff does not include feature code.
- Report whether `git diff -- src` is empty for documentation-only work.
- After docs updates that should be visible to NotebookLM, run `bash scripts/sync-docs-to-drive.sh` to sync Google Drive.
- Append a short handoff note to `docs/ai-handoff.md` with:
  - change summary
  - changed files
  - verification results
  - unresolved issues / TODOs
- Do not overwrite unrelated user changes. If the worktree is dirty, inspect before editing and keep unrelated changes intact.
