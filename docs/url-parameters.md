# URL Parameters

Last updated: 2026-07-12

## `/purpose-calendar`

### Confirmed

- This page is controlled by query parameters.
- Existing parameters should not be removed or repurposed without a documented decision.

### Read From Current Code

| Parameter | Values / format | Current default / fallback | Current use |
| --- | --- | --- | --- |
| `year` | Number, 1900-2050 | Current JST year | Visible month year and DB search range. |
| `month` | Number, 1-12 | Current JST month | Visible month and DB search range. |
| `selectedDate` | `YYYY-MM-DD` | If valid within visible month: that date. Else today when in month. Else first day of month. | Selected date for top premise and year/month/day board display. |
| `birthDate` | `YYYY-MM-DD` | Empty string | Creates self personal context and birth chart premise when present. |
| `birthGender` | `male` or `female` | `male` | Passed to DB search / personal context. |
| `familyStars` | Comma-separated IDs | `self` | Companion/self star selection. IDs include `self`, `star-1` ... `star-9`. |
| `purpose` | Purpose ID | `travel` in query parsing; form posts `yuki_tori` | Used by keyword-matched DB search. Full month computation uses `yuki_tori` constant. |
| `keyword` | Text | Empty string | Filters keyword-matched dates. |
| `auspiciousOnly` | `on` | Off | Restricts matched dates to rows with selected-day good chips. |
| `showChildSatsu` | `on` | Off | Controls display of 小児殺-related information. |
| `compassOrientation` | `north-top`, `south-top` | `north-top` | Direction board orientation. |
| `actionScale` | `near`, `day_trip`, `overnight`, `base`, `hour_precision` | `near` or legacy-derived value | Determines current action scale and effective candidate condition. |
| `companionJudgementMode` | `strict`, `standard`, `loose` | `standard` | Companion/family filtering strictness. |
| `candidateCondition` | `all`, `has_candidate`, `practical`, `long_term`, `strong` | Effective value currently derived from `actionScale` | Legacy / condition concept. Not the primary driver when `actionScale` exists. |
| `candidate` | `all`, `has_candidate` | Used only for legacy action-scale derivation | Legacy candidate filter concept. |
| `goodDirectionMatch` | `all`, `year_month_day`, `month_day`, `year_month` | Used only for legacy action-scale derivation and helper mapping | Legacy good-direction match concept. |
| `kyuseiMatch` | Currently fixed to `all` in page flow | `all` | Passed as fixed value for searches. |

### Parameter Interactions

- `year` and `month` define the visible monthly calendar range.
- `selectedDate` changes the top year/month/day board display without changing the visible month when it remains inside that month.
- Current code: `actionScale` drives `candidateCondition`.
- `accepted`, `implementation_pending`: `actionScale` and `candidateCondition` should be independent query concepts.
- If `actionScale` is absent, legacy `candidate` and `goodDirectionMatch` may be used to derive an action scale.
- `familyStars=self` only produces a member when `birthDate` produces personal context.
- Direct companion stars use `star-1` through `star-9`; labels are 一白水星 through 九紫火星.
- `birthGender` accepts `female`; every other value falls back to `male` in the current page code.
- `compassOrientation` accepts `south-top`; every other value falls back to `north-top` in the current page code.

### Purpose Compatibility Direction

- `accepted`: Keep existing `purpose=travel` URLs working.
- `accepted`: Respect explicit `purpose` values in URLs.
- `accepted`, `implementation_pending`: If `purpose` is omitted, future behavior should move toward `yuki_tori` as the initial/default purpose.
- This is a documented design direction only; no implementation change has been made yet.

### Candidate Condition Direction

- `accepted`, `implementation_pending`: `actionScale` should describe 行動の規模・距離感・実行負荷.
- `accepted`, `implementation_pending`: `candidateCondition` should describe 候補日の有無や絞り込み条件.
- `accepted`: Future URL and UI design should not collapse these meanings into one control.
- Existing `candidate`, `goodDirectionMatch`, and current derived behavior need a compatibility/migration plan before implementation.

### TODO

- `implementation_pending`: Design and implement the `purpose` default migration.
- `implementation_pending`: Design and implement independent `candidateCondition` behavior.
- Confirm whether `selectedDate` should allow navigating to another month or always stay constrained to the visible month.
- `pending`: Confirm whether `birthGender=male` default is a product decision.

### Compatibility Notes

- Treat `candidate`, `goodDirectionMatch`, and `candidateCondition` as compatibility-sensitive until their future role is decided.
- Do not remove or rename query parameters without a migration note and decision-log entry.

## `/sanmeigaku`

| Parameter | Values / format | Current default / fallback | Current use |
| --- | --- | --- | --- |
| `birthDate` | `YYYY-MM-DD` | Empty string | When present, builds and displays the 算命学 profile. When absent, shows empty-state guidance. |

## `/calendar-notes/sanmeigaku/[name]`

### Read From Current Code

- This route uses a path segment, not query parameters.
- Existing `/calendar-notes/sanmeigaku/陽占 人体星図` remains available.
- 十大主星 and 十二大従星 star names resolve to source-connected detail pages when a master entry exists.
- Star explanation text is connected from the source-confirmed spreadsheet masters without adding query parameters.

### Phase 1 URL Behavior

Status: `implemented`, `production_released`

- `/sanmeigaku` 陽占人体星図の星名リンクは同一タブで this route に遷移する。
- Link format: `/calendar-notes/sanmeigaku/[星名]`.
- Example paths:
  - `/calendar-notes/sanmeigaku/車騎星`
  - `/calendar-notes/sanmeigaku/司禄星`
  - `/calendar-notes/sanmeigaku/天印星`
- `/calendar-notes/sanmeigaku/[星名]` does not require query parameters.
- At the Phase 1 release, star detail pages were placeholders and showed `この星の説明文は準備中です。`.
- Existing `/calendar-notes/sanmeigaku/陽占 人体星図` continues to resolve.

Production check URLs:

- `https://hibi-kippo-app.vercel.app/sanmeigaku?birthDate=1976-03-19`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E8%BB%8A%E9%A8%8E%E6%98%9F`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E5%8F%B8%E7%A6%84%E6%98%9F`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E5%A4%A9%E5%8D%B0%E6%98%9F`
- `https://hibi-kippo-app.vercel.app/calendar-notes/sanmeigaku/%E9%99%BD%E5%8D%A0%20%E4%BA%BA%E4%BD%93%E6%98%9F%E5%9B%B3`

### Phase 2 URL Notes

Status: `implemented`, `source_connected`

- Phase 2 connects explanation body text without changing the existing URL format.
- Do not rename `/calendar-notes/sanmeigaku/[name]` without a migration note.
- `/calendar-notes` index now exposes links to existing sanmeigaku term detail pages.
- The index addition does not create new routes and does not change path encoding behavior.
- No query parameters were added for Phase 2.

### Sanmeigaku Energy Strength Display URL Notes

Status: `implemented`, `no_url_change`

- `/sanmeigaku` displays the whole-chart total energy and 身弱・身中・身強 judgement inside the existing page.
- The display uses existing profile data and `算命計算!A580:B616`.
- No route was added.
- No query parameter was added.
- Existing `/calendar-notes/sanmeigaku/[name]` star detail URLs were not changed.

### TODO

- Decide separately whether 身弱・身中・身強 should become `/calendar-notes/sanmeigaku/[name]` dictionary terms after a source-confirmed meaning master exists.

## `/calendar-db`

### Read From Current Code

The page and API use the same search concepts as `searchCalendarDb`, including:

- `year`
- date range fields
- `birthDate`
- `birthGender`
- `honmeiStar`
- `keyword`
- `limit`
- `view`
- `dayType`
- `kyuseiMatch`
- `purpose`
- `candidate`
- `goodDirectionMatch`

### TODO

- Add a full `/calendar-db` parameter table after inspecting the form component in detail.

## API Routes

### Read From Current Code

Several API routes accept simple query parameters such as `date`, `year`, `start`, `end`, and route-specific flags.

### TODO

- Add per-API parameter tables only when those APIs become integration targets.
