# Screen Design

Last updated: 2026-07-09

## General UI Direction

### Read From Current Code

- The app uses quiet, information-dense panels for calendar and fortune data.
- Navigation is grouped by user-facing, calendar, chart, master, status, and developer sections.
- The interface favors tables, detail panels, tags, chips, and compact labels over marketing-style layouts.

### Confirmed

- UI changes should preserve existing route structure and query-driven navigation.
- UI copy should not imply fortune rule certainty where the code/source status is provisional.

## purpose-calendar

### Current Layout

1. Hero / title area
   - `KYUSEI DIRECTION CALENDAR`
   - Page title and description.
   - Section navigation.
2. Condition panel
   - Birth date.
   - Gender.
   - 小児殺 toggle.
   - Companion judgement mode and selected stars.
   - Personal profile summary when birth date exists.
   - Year/month selection.
   - Compass orientation.
   - Auspicious-only toggle.
   - Keyword input.
   - Action scale options.
3. Current condition collapsed summary.
4. Monthly view
   - Month heading.
   - Selected date title and calendar-note chips.
   - Previous day / date input / next day controls.
   - Year, month, and day board panels.
   - Solar term and birth chart premise notes.
   - Four-board candidates for the selected date.
   - Monthly best candidate list.
   - Month calendar grid.
5. Reading memo
   - Action scale descriptions.

### Key Components

- `DirectionCompass`: compact palace / direction board visualization.
- `DirectionMountainRing`: mountain / deity ring visualization.
- `SiteSectionNav`: page-group navigation.

### Current Calendar Cell Content

### Read From Current Code

- Date link.
- Candidate rank badge when applicable.
- 六曜, old calendar, holiday, solar term, 干支, 納音, 空亡, daily 九星.
- Compact year/month/day 九星 labels.
- Candidate overlap tag.
- Day direction compass.
- 天道 chip when applicable.
- Warning chips and 土用 display.
- Expandable hour-board list.
- Calendar-note chips.

### TODO

- Define visual priority rules for warnings versus good candidates.
- Confirm exact mobile layout expectations.
- Confirm whether selected date should stay visible after navigation or scroll.

## sanmeigaku

### Read From Current Code

- Birth date is read from `birthDate`; empty state is shown when no birth date is provided.
- When a profile exists, the screen renders:
  - 陰占 preview.
  - Pillar cards.
  - 陽占 人体星図.
  - 蔵干 master.
  - Verification references.
- 陽占 人体星図の十大主星・十二大従星の星名は、`/calendar-notes/sanmeigaku/[name]` への同一タブリンクとして表示される。
- 星名リンク先の説明本文は未接続で、現時点では準備中文言を表示する。

### Star Link Phase 1

Status: `implemented`, `production_released`

- 陽占人体星図内の十大主星・十二大従星の星名をリンク化した。
- リンク先は `/calendar-notes/sanmeigaku/[星名]`。
- Examples:
  - `/calendar-notes/sanmeigaku/車騎星`
  - `/calendar-notes/sanmeigaku/司禄星`
  - `/calendar-notes/sanmeigaku/天印星`
- 星名リンクは同一タブ遷移。
- `/calendar-notes/sanmeigaku/[星名]` は現在 404 ではなく、準備中ページとして表示される。
- 準備中ページには `この星の説明文は準備中です。` を表示する。
- 既存の `/calendar-notes/sanmeigaku/陽占 人体星図` の用語詳細ページは維持されている。
- 算命学ロジック、星の算出ロジック、人体星図の配置ロジックは変更していない。

### Star Detail Phase 2 UI Considerations

Status: `implemented`, `source_connected`

- 十二大従星 master candidate range: `算命計算!B512:N524`.
- 十大主星 master candidate range: `算命計算!A528:E577`.
- 身強・身中・身弱 helper candidate range: `算命計算!A580:B616`.
- 十大主星 range is position-based, not only a simple one-row-per-star description. The detail UI may need to show position-specific explanations such as `中心 × 車騎星`, `頭 × 車騎星`, `腹 × 車騎星`, `右手 × 車騎星`, and `左手 × 車騎星`.
- 身強・身中・身弱 should probably be treated as an energy-total/helper explanation for the whole chart, not directly as a star detail page field, but this is not final.
- Implemented display:
  - 十大主星 pages display 5 position-specific lines in the main explanation list.
  - 十二大従星 pages display power, energy, age range, strength class, animal/group attributes, colors, and keywords.
  - When a star has no connected master entry, the existing preparation wording remains.

### TODO

- Confirm which sanmeigaku sections should remain on one page and which should become linked term/detail pages.
- Confirm spreadsheet source ranges for 十大主星・十二大従星 explanation text before adding meanings.

## calendar-db

### Read From Current Code

- Search form for inspecting calendar DB rows.
- Displays results in different views such as kyusei, summary, selected days, direction deities, doyo, and all.
- Result rows link back to developer verification for individual dates.

### TODO

- Document the full table layout and compact/all-view differences after a screen-specific pass.

## calendar-notes / adoption-status / direction-palace-blends

### Read From Current Code

- `calendar-notes` is a term index and term detail entry point.
- `adoption-status` is a verification and source-status screen.
- `direction-palace-blends` is a master/reference screen.

### TODO

- Add screen-level structure for these pages when they are next edited.

## UI Change Rules

- Update this document whenever a screen layout or visible behavior changes.
- Keep dense operational screens compact and scannable.
- Avoid changing labels that are used to verify calculation output unless the underlying spec is documented.
