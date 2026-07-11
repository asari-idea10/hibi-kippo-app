# Fortune Rules

Last updated: 2026-07-09

This document records what the code currently does. It does not define new fortune-telling rules.

## Status Terms

- `accepted`: Adopted as product/spec direction.
- `provisional`: Temporarily adopted for wording or planning, but must be reviewed before implementation or rule changes.
- `pending`: Not decided.
- `source_review_required`: Requires fortune/calendar/source confirmation before implementation or rule changes.
- `implementation_pending`: Direction is known, but code/UI/URL behavior has not been changed yet.
- Confirmed: a process rule or product rule that has been explicitly accepted.
- Read From Current Code: implementation behavior observed in the repository.
- TODO: not confirmed. Do not implement changes from TODO items without user/source confirmation.

## Boundaries

### Confirmed

- Do not change 九星気学, 祐気取り, 方位, 暦, 土用, 天道, or 算命学 logic by inference.
- If a rule is not proven from code or source material, leave it as TODO.

### TODO

- Add explicit source references for each adopted rule.
- Mark each rule as confirmed, provisional, sample-only, or TODO.

## Calendar DB

### Read From Current Code

- `src/lib/calendar-db-view.ts` is the main read/search layer for calendar DB rows.
- Rows include date, era, holiday, solar term, old calendar, 六曜, 干支, 納音, 空亡, 九星, direction board values, direction deities, 方位殺, 吉神方位, 天道, 小児殺, 三元九運, 十二直, 二十八宿, 雑節, 主要選日, 下段暦注, and 土用 fields.
- `searchCalendarDb` supports filtering by year/date range, keyword, view, day type, purpose, candidate existence, good direction match, kyusei match, birth date, gender, and direct honmei star.
- Personal context currently derives the 本命星 from the birth date row's year 九星.
- Direct honmei star context is used for family / companion checks.

### TODO

- `pending`, `source_review_required`: Confirm whether using birth row year 九星 as 本命星 is final or temporary for all users.
- Confirm exact supported DB date range from generated data, not only UI constants.

## purpose-calendar Candidate Flow

### Read From Current Code

- The page builds a full month result using `searchCalendarDb` with:
  - `view: "kyusei"`
  - `purpose: "yuki_tori"`
  - `dayType: "all"`
  - `candidate: "all"`
  - `goodDirectionMatch: "all"`
  - `kyuseiMatch: "all"`
- Birth date is optional. If no birth date is provided, self personal context is not created.
- Companion stars can include:
  - `self` when birth date context exists
  - direct star options `star-1` to `star-9`
- Family / companion rows are searched per selected member star with direct `honmeiStar`.
- Direction tags are grouped by direction and board layer from `purposeTags`.
- Candidate overlap labels are derived from board inclusion:
  - year + month + day: 三盤一致
  - month + day: 月・日一致
  - year + month: 年・月一致
  - otherwise: board-specific candidate label
- Monthly best candidates are ranked from overlap, selected-day chips, weekend/holiday status, warnings, and special handling for 天赦日.
- Current code treats the selected display date and the monthly calendar range separately. The selected date controls the top year/month/day boards; the month range controls the calendar grid and monthly candidates.

### TODO

- Confirm product meaning of each candidate rank: 最有力候補, 実用候補, 長期候補, 暦後押し候補, 条件つき候補.
- `pending`, `source_review_required`: Confirm whether 天赦日 should be allowed as an almanac-only candidate even without direction tags.

## Candidate Rank Design Direction

### Design Direction

- `accepted`, `implementation_pending`, `source_review_required`: Candidate rank should be separated into fortune rank and practical rank.
- `source_review_required`: Fortune rank may include 三盤一致, 年月一致, 月日一致, 天道, and bad-direction avoidance, but each factor's official source basis must be confirmed.
- `accepted`, `implementation_pending`: Practical rank may include 近場, 日帰り可, 温泉, 神社, 自然散策, 食事, and other action-ease signals.

### Still Unconfirmed

- Official fortune meaning and source basis for each rank factor.
- Exact score weights and label thresholds.
- Whether current labels should be renamed or split in the UI.

## Unconfirmed Items Classification

| Item | Status | Reason |
| --- | --- | --- |
| `/purpose-calendar` default `purpose` (`travel` vs `yuki_tori`) | `accepted`, `implementation_pending` | Keep `purpose=travel` compatibility, respect explicit purpose, move omitted purpose toward `yuki_tori`. |
| `candidateCondition` independent parameter vs `actionScale` derived behavior | `accepted`, `implementation_pending` | Treat `candidateCondition` as filtering condition and `actionScale` as action scale. |
| 天道・土用殺・方位殺・候補ランク official adoption basis | `source_review_required` | These are domain rules and should not be inferred from code alone. |
| Companion judgement modes `strict` / `standard` / `loose` official behavior | `provisional`, `source_review_required` | Current code has behavior and provisional meanings, but final占術 specification is not confirmed. |
| Regression samples for 節入り・立春・土用・盤 switching | `accepted`, `implementation_pending`, `source_review_required` | The list of boundary cases can be prepared, but expected answers should be source-checked. |
| Birth row year 九星 as 本命星 | `pending`, `source_review_required` | Current behavior is observed, but final product/fortune specification is not confirmed. |
| 天赦日 almanac-only candidate allowance | `pending`, `source_review_required` | Current ranking mentions special handling, but final allowance rule is not confirmed. |

## Action Scale

### Read From Current Code

`src/app/purpose-calendar/page.tsx` defines five action scales:

| ID | Label | Candidate condition |
| --- | --- | --- |
| `near` | 近場 | `has_candidate` |
| `day_trip` | 日帰り | `has_candidate` |
| `overnight` | 宿泊 | `practical` |
| `base` | 大きな予定 | `long_term` |
| `hour_precision` | 特別時刻 | `strong` |

The effective candidate condition is currently derived from `actionScale`.

### Design Direction

- `accepted`, `implementation_pending`: `actionScale` and `candidateCondition` should be separated in future URL/UI design.
- `accepted`: `actionScale` represents action scale, travel distance, and execution burden.
- `accepted`: `candidateCondition` represents candidate existence and filtering strictness.
- Existing implementation behavior should not be changed without a URL/design update.

### TODO

- Update code and tests only after the URL behavior migration is designed.

## Companion Judgement

### Read From Current Code

- Modes are `strict`, `standard`, and `loose`.
- `strict`: all selected members must qualify for the same direction and required boards.
- `standard`: primary member must qualify; companion rows are checked for blocking labels.
- `loose`: primary member must qualify; companion blocking labels are reduced compared with standard.
- Blocking labels include combinations of `暗剣殺`, `五黄殺`, `破`, `本命殺`, `的殺`, `土用殺`, and `凶方位優先`, depending on mode.

### Provisional Product Direction

- `provisional`, `source_review_required`: `strict` prioritizes avoiding bad directions for every selected participant.
- `provisional`, `source_review_required`: `standard` is the recommended normal mode; the user/self remains primary while strong bad directions for companions are avoided.
- `provisional`, `source_review_required`: `loose` keeps the user/self primary; companion information is closer to reference display.

### TODO

- Confirm whether the first selected member should always be treated as primary.
- Confirm which blocking labels are official for each mode.
- Confirm the official fortune specification before changing companion judgement logic.

## Direction / Warning / 天道

### Read From Current Code

- Direction order is 北, 北東, 東, 南東, 南, 南西, 西, 北西.
- `DirectionCompass` and `DirectionMountainRing` render board and deity visualizations.
- Movement warning chips are parsed from direction warning fields and personalized board values.
- 土用殺 is added to day-layer warning chips unless the 土用 text includes 間日.
- 天道 display uses month/day branch information and trine data through `getTendoTrineByMonthBranch`.

### TODO

- Confirm authoritative source for 天道 trine mapping.
- Confirm 土用殺 handling, including 間日 behavior.
- Confirm how warning labels should interact with candidate scoring.

## Hour Board

### Read From Current Code

- Four-board candidates require year/month/day overlap and selected personal stars.
- Hour-board good direction candidates are filtered by direction match and warning labels.
- The hour board logic distinguishes strict, standard, and loose companion judgement behavior.

### TODO

- Add regression samples for four-board candidate days.
- Confirm whether current hour ranges and day-boundary handling are product-final.

## 算命学

### Read From Current Code

- `src/lib/sanmeigaku-profile.ts` builds profile data from calendar DB rows.
- The page displays 陰占, pillars, 陽占 人体星図, 蔵干 master, and verification content when `birthDate` is provided.
- Time pillar remains placeholder until birth time and location correction are connected.
- 十大主星・十二大従星の星名 detail routes are available under `/calendar-notes/sanmeigaku/[name]`.
- Current star detail pages are placeholders only; they do not contain inferred meanings.

### Star Link Phase 1

Status: `implemented`, `production_released`

- `/sanmeigaku` の陽占人体星図で、十大主星・十二大従星の星名をリンク化した。
- Link route format: `/calendar-notes/sanmeigaku/[星名]`.
- The linked pages currently show `この星の説明文は準備中です。`.
- Existing `/calendar-notes/sanmeigaku/陽占 人体星図` remains available.
- This Phase 1 did not change 算命学 calculation logic, star derivation logic, or 陽占人体星図 placement logic.

### Star Explanation Master Phase 2

Status: `implemented`, `source_connected`

Target spreadsheet:

- `https://docs.google.com/spreadsheets/d/1cA4_swLTarSTJkz2nSxvF6oBlrAo363A4U5xTWOQv7g/edit?gid=1235637842#gid=1235637842`

Target sheet:

- `算命計算`

Target ranges:

- 十二大従星: `算命計算!B512:N524`
- 十大主星: `算命計算!A528:E577`
- 身強・身中・身弱: `算命計算!A580:B616`

十二大従星 master expected columns / fields:

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

十大主星 master structure:

- `算命計算!A528:E577` is not simply one generic explanation per star.
- It appears to be position-specific 人体星図 explanation data.
- Examples:
  - 中心 × 車騎星
  - 頭 × 車騎星
  - 腹 × 車騎星
  - 右手 × 車騎星
  - 左手 × 車騎星
- Expected fields:
  - `position`
  - `star`
  - `key`
  - `theme`
  - `description`

身強・身中・身弱 helper master:

- `算命計算!A580:B616` is a helper master for classifying 身弱・身中・身強 from total energy.
- Current implementation stores it as `SanmeigakuEnergyStrengthRule`.
- `/sanmeigaku` uses this helper as a whole-chart energy judgement in the 陽占人体星図 section.
- The total energy target is the existing three 十二大従星 positions:
  - 初年運: 日干 × 年支
  - 中年運: 日干 × 月支
  - 老年運: 日干 × 日支
- Boundary values from `算命計算!A580:B616`:
  - `1-12`: 身弱
  - `13-24`: 身中
  - `25-36`: 身強
- Direct star-detail body text is not generated from this helper. Meaning text for 身強・身中・身弱 remains unconnected.

Guardrails:

- Do not add explanation text from outside the confirmed ranges.
- Do not infer meanings for stars.
- Do not change 算命学 logic, star calculation logic, or chart placement logic.
- Do not expand 身強・身中・身弱 into meaning/body text without a source-confirmed explanation master.
- Do not add a 算命学 category to `/calendar-notes` index unless it is handled as a separate task.

### TODO

- Review the spreadsheet-derived wording in Vercel Preview before Production promotion.
- Decide separately whether to expose 算命学 categories on the `/calendar-notes` index.
