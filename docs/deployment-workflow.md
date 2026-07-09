# Deployment Workflow

Last updated: 2026-07-09

This document defines how GitHub, Codex, Vercel, ChatGPT, Gemini, NotebookLM, Google Drive, and local docs should work together. It records workflow policy only. It does not change Vercel settings, GitHub settings, application code, UI, or fortune logic.

## Source Of Truth

- GitHub is the source of truth for application code and documentation.
- `main` is the production branch.
- Feature work should be done on feature branches.
- Google Drive copies are for NotebookLM reading and review, not the canonical source.
- NotebookLM summaries are review inputs. If they lead to accepted decisions, record those decisions in Git-tracked docs.
- NotebookLM automatically reflects content changes only for Drive files already added as sources.
- New docs copied to Google Drive must be manually added to the NotebookLM source list.

## Branch Flow

1. Create or use a feature branch for feature additions, UI changes, URL behavior changes, logic changes, and infrastructure changes.
2. Make the smallest practical diff.
3. Update relevant docs in the same branch.
4. Run local verification.
5. Commit and push the feature branch to GitHub.
6. Use the generated Vercel Preview URL for external review.
7. Share the Preview URL with ChatGPT or Gemini when visual, URL, or behavior review is useful.
8. Merge to `main` only after review and checklist completion.
9. Let Vercel Production deploy from `main`.

## Environment Roles

| Environment / tool | Role |
| --- | --- |
| Local workspace | Investigation, implementation, local lint/build, docs updates. |
| Codex | Codebase investigation, implementation, verification, Git commits, concise handoff. |
| GitHub | Canonical code/docs history, branches, commits, pull requests. |
| Vercel Preview | Review environment for feature branches before production. |
| Vercel Production | Stable public version deployed from `main`. |
| ChatGPT project | Product/spec discussion and review using docs plus Preview URL. |
| Gemini | Secondary long-context or visual/spec review using docs plus Preview URL. |
| Google Drive | Sync target for NotebookLM source files. |
| NotebookLM | Documentation review and summarization. |

## Preview Review

When a feature branch is pushed, use the Vercel Preview URL to verify the change before merging.

Preview URLs should be recorded in `docs/ai-handoff.md` when they are available.

Use `docs/preview-urls.md` as the regression URL index. Replace the host with the active Preview URL when checking a branch.

## Production Baseline

Production URL is the stable baseline. Treat it as the user-visible version and do not use it for experimental review.

Production baseline URLs are listed in `docs/preview-urls.md`.

## Post-Implementation Documentation Flow

After implementation work:

1. Update relevant docs.
2. Commit code and docs to GitHub.
3. Push the feature branch.
4. Check the Vercel Preview URL.
5. Record the Preview URL and verification notes in `docs/ai-handoff.md`.
6. Run `bash scripts/sync-docs-to-drive.sh` after docs updates that should be visible to NotebookLM.
7. If new docs were created, manually add those Drive files to the NotebookLM source list.
8. Confirm the required files are present in NotebookLM sources before asking for review.
9. Ask NotebookLM to review the updated Google Drive docs when appropriate.
10. Record any accepted decisions in `docs/decision-log.md`.

Required NotebookLM sources:

- `deployment-workflow.md`
- `preview-urls.md`
- Other new docs created for the current workflow or implementation review.

## Vercel Preview Checklist

Check these on the Preview URL when the change affects code, UI, URL behavior, or logic:

- `/purpose-calendar` loads successfully.
- The target regression URL preserves query parameters.
- `purpose`, `candidateCondition`, `birthDate`, `birthGender`, `companionJudgementMode`, `familyStars`, and `actionScale` continue to behave as expected.
- Mobile layout does not break.
- 祐気取り candidate display remains understandable.
- Existing `/sanmeigaku`, `/calendar-db`, and `/calendar-notes` routes still load when relevant.
- No private files, environment variables, or credentials are exposed.

Documentation-only changes do not require Vercel Preview verification.

## Before Production

Before merging to `main`:

- Confirm local verification results.
- Confirm Vercel Preview review results for non-doc changes.
- Confirm `docs/review-checklist.md` has been followed.
- Confirm `/purpose-calendar` query parameter compatibility is preserved.
- Confirm unresolved `pending` or `source_review_required` items are not implemented as if decided.
- Confirm `docs/ai-handoff.md` contains Preview URL and verification notes when applicable.
- Confirm docs were synced to Google Drive if NotebookLM should read them.
- Confirm any newly created docs were manually added to NotebookLM sources when NotebookLM review is expected.

## Rollback Approach

If production rollback is needed:

- Prefer reverting the problematic Git commit when the issue is code or docs in Git.
- Use Vercel deployment rollback only when a fast production restore is needed.
- After rollback, document the incident, affected URL, suspected cause, and follow-up task in `docs/ai-handoff.md` or `docs/decision-log.md` as appropriate.

TODO:

- Confirm the repository's exact Vercel project settings and production domain ownership.
- Confirm whether pull requests are required before merge to `main`.
- Confirm the preferred Vercel rollback procedure for this project.
