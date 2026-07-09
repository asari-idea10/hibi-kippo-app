# Fortune Rules

Last updated: 2026-07-09

This document records what the code currently does. It does not define new fortune-telling rules.

## Status Terms

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

- Confirm whether using birth row year 九星 as 本命星 is final or temporary for all users.
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
- Confirm whether 天赦日 should be allowed as an almanac-only candidate even without direction tags.

## Unconfirmed Items Classification

| Item | Classification | Reason |
| --- | --- | --- |
| `/purpose-calendar` default `purpose` (`travel` vs `yuki_tori`) | Decide now before URL behavior changes | It affects query semantics and saved URL expectations. |
| `candidateCondition` independent parameter vs `actionScale` derived behavior | Decide now before URL/filter changes | It affects backwards compatibility and UI/filter behavior. |
| 天道・土用殺・方位殺・候補ランク official adoption basis | Requires fortune/source confirmation | These are domain rules and should not be inferred from code alone. |
| Companion judgement modes `strict` / `standard` / `loose` official behavior | Requires product and fortune confirmation | Current code has behavior, but final intent needs human confirmation. |
| Regression samples for 節入り・立春・土用・盤 switching | Can start now as test-design work; expected values need confirmation | The list of boundary cases can be prepared, but expected answers should be source-checked. |

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

### TODO

- Confirm whether query parameter `candidateCondition` should be independently honored when `actionScale` is present.

## Companion Judgement

### Read From Current Code

- Modes are `strict`, `standard`, and `loose`.
- `strict`: all selected members must qualify for the same direction and required boards.
- `standard`: primary member must qualify; companion rows are checked for blocking labels.
- `loose`: primary member must qualify; companion blocking labels are reduced compared with standard.
- Blocking labels include combinations of `暗剣殺`, `五黄殺`, `破`, `本命殺`, `的殺`, `土用殺`, and `凶方位優先`, depending on mode.

### TODO

- Confirm whether the first selected member should always be treated as primary.
- Confirm which blocking labels are official for each mode.

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

### TODO

- Confirm all external master ranges and source statuses for 陽占 人体星図 and related term pages.
