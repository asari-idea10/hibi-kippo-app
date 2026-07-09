# Product Spec

Last updated: 2026-07-09

## Purpose

### Confirmed

- This app provides screens for 日々吉方, 九星方位カレンダー, 暦DB, 用語辞典, 方位ブレンド, 採用ステータス, and 算命学.
- The main user-facing navigation is defined in `src/components/site-section-nav.tsx`.
- `purpose-calendar` is the current monthly 九星方位 calendar screen.
- `sanmeigaku` displays a 算命学命式 view based on a birth date when one is provided.

### Read From Current Code

- `purpose-calendar` combines calendar DB rows, year/month/day direction boards, personal star context, companion star checks, and monthly candidate summaries.
- The visible monthly calendar is currently query-driven; saved URLs can reproduce a month, selected date, birth date, companion settings, and display options.
- The app is positioned as more than a daily good/bad display: existing docs and code point toward a calendar and direction engine that can support 吉方旅, 引越し, best-day search, verification, and future AI-assisted analysis.
- `calendar-db` exposes searchable calendar DB views for `kyusei`, `summary`, `selected_days`, `direction_deities`, `doyo`, and `all`.
- `calendar-notes` is a dictionary/index for calendar terms and term detail pages.
- `adoption-status` shows source/adoption/verification status and sample links.
- `direction-palace-blends` displays direction and palace blend information.

### TODO

- Confirm the official product name and short description for public use.
- Confirm whether `purpose-calendar` should remain the main 九星方位 screen or split into multiple purpose-specific routes later.

## Major Pages

| Route | Current role |
| --- | --- |
| `/` | Top / developer verification entry point. `?view=dev` is linked as 検証画面. |
| `/purpose-calendar` | Monthly 九星方位 calendar with purpose, birth date, companion, and direction candidate filtering. |
| `/sanmeigaku` | 算命学 命式 page. Uses `birthDate` when present. 陽占人体星図の星名から算命学用語詳細へ遷移できる。 |
| `/calendar-notes` | 用語辞典 index. |
| `/calendar-notes/[kind]/[name]` | Calendar / fortune term detail page. `kind=sanmeigaku` also handles 陽占人体星図 and star-term placeholder pages. |
| `/calendar-db` | Search and inspect calendar DB rows. |
| `/direction-palace-blends` | 方位ブレンド master view. |
| `/adoption-status` | Adoption and verification status view. |

## purpose-calendar Product Direction

### Design Direction

- `accepted`: Preserve existing `purpose=travel` URLs for compatibility.
- `accepted`: Respect an explicitly provided `purpose` query value.
- `accepted`, `implementation_pending`: When `purpose` is omitted, future product direction is to make `yuki_tori` the initial/default purpose.
- `accepted`, `implementation_pending`: Treat `actionScale` and `candidateCondition` as separate concepts:
  - `actionScale`: 行動の規模・距離感・実行負荷.
  - `candidateCondition`: 候補日の有無や絞り込み条件.

### Not Implemented Yet

- The current code may still default or derive values differently. This section records product direction only.
- Any code change must update `docs/url-parameters.md`, `docs/ai-handoff.md`, and relevant regression notes.

## Candidate Ranking Product Direction

### Design Direction

- `accepted`, `implementation_pending`, `source_review_required`: Separate candidate ranking into:
  - fortune rank: 三盤一致, 年月一致, 月日一致, 天道, 凶方位回避, and other calculation-derived signals.
  - practical rank: 近場, 日帰り可, 温泉, 神社, 自然散策, 食事, and other ease-of-action signals.

### TODO

- Confirm official domain meaning and source basis for each fortune-rank factor.
- Decide how practical-rank signals are collected, stored, and displayed.

## Product-Spec Status Terms

- `accepted`: Adopted as product/spec direction.
- `provisional`: Temporarily adopted for wording or planning, but must be reviewed before implementation or rule changes.
- `pending`: Not decided.
- `source_review_required`: Requires fortune/calendar/source confirmation before implementation or rule changes.
- `implementation_pending`: Direction is known, but code/UI/URL behavior has not been changed yet.
- Confirmed: explicitly requested by the user or already established as an operating rule for future work.
- Read From Current Code: behavior observed in the current repository. This is not automatically final product specification.
- TODO: unknown, `pending`, `provisional`, or `source_review_required`.

## Current Technical Stack

### Read From Current Code

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- ESLint 9 with `eslint-config-next`
- Data is stored under `src/data` and read through helper modules under `src/lib`.
- UI is implemented mainly with server components in `src/app/**/page.tsx` plus reusable components under `src/components`.

### Common Commands

- `npm run dev`
- `npm run lint`
- `npm run build`
- Calendar/regression scripts are listed in `package.json`; select only the relevant script for the touched area.

## Data Flow Overview

### Read From Current Code

1. Route query parameters are read in a server page.
2. Parameters are normalized in the route file or a library.
3. Calendar data is retrieved through `searchCalendarDb`.
4. Purpose, direction, personal-star, and calendar-note helpers enrich rows.
5. The page renders panels, boards, tags, candidate summaries, and calendar cells.

## Improvement Candidates

- Formalize source status for every fortune/calendar rule used in `purpose-calendar`.
- Add regression tests for edge dates around 節入り, 立春, 土用, and month/year switching.
- Reduce duplicated query parameter concepts between `actionScale`, `candidateCondition`, `candidate`, and `goodDirectionMatch`.
- Clarify which rules are product decisions and which are temporary implementation choices.
- Connect source-confirmed 算命学 star explanation masters after spreadsheet ranges are finalized.
