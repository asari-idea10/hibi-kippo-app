# Screen Design

Last updated: 2026-07-14

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
- 星名リンク先は source-connected spreadsheet explanation masters を表示する。
- 陽占 人体星図より後の開発・検証情報は、初期状態で閉じた `開発・検証情報を表示` details にまとめる。

### Star Link Phase 1

Status: `implemented`, `production_released`

- 陽占人体星図内の十大主星・十二大従星の星名をリンク化した。
- リンク先は `/calendar-notes/sanmeigaku/[星名]`。
- Examples:
  - `/calendar-notes/sanmeigaku/車騎星`
  - `/calendar-notes/sanmeigaku/司禄星`
  - `/calendar-notes/sanmeigaku/天印星`
- 星名リンクは同一タブ遷移。
- Phase 1 release時点では `/calendar-notes/sanmeigaku/[星名]` は 404 ではなく、準備中ページとして表示していた。
- 準備中ページには `この星の説明文は準備中です。` を表示していた。
- 既存の `/calendar-notes/sanmeigaku/陽占 人体星図` の用語詳細ページは維持されている。
- 算命学ロジック、星の算出ロジック、人体星図の配置ロジックは変更していない。
- This phase was superseded by the source-connected Phase 2 detail pages.

### Star Detail Phase 2 UI Considerations

Status: `implemented`, `source_connected`

- 十二大従星 master candidate range: `算命計算!B512:N524`.
- 十大主星 master candidate range: `算命計算!A528:E577`.
- 身強・身中・身弱 helper range: `算命計算!A580:B616`.
- 十大主星 range is position-based, not only a simple one-row-per-star description. The detail UI may need to show position-specific explanations such as `中心 × 車騎星`, `頭 × 車騎星`, `腹 × 車騎星`, `右手 × 車騎星`, and `左手 × 車騎星`.
- 陽占人体星図のメタセル displays:
  - 総エネルギー
  - 判定
  - 対象: 初年運・中年運・老年運
  - 参照: `算命計算!A580:B616`
- 身強・身中・身弱 is treated as a whole-chart energy helper, not as a direct star detail page field.
- Implemented display:
  - 十大主星 pages display 5 position-specific lines in the main explanation list.
  - 十二大従星 pages display power, energy, age range, strength class, animal/group attributes, colors, and keywords.
  - `/sanmeigaku` displays the whole-chart energy judgement label only; no inferred meaning text is shown.
  - When a star has no connected master entry, the existing preparation wording remains.

### Phase UX-1 Layout

Status: `implemented`

- `/sanmeigaku` hero copy describes the current implemented state: birth date displays 陰占 and 陽占, birth time is not used, and 人体星図 star names link to detail pages.
- The following developer / verification sections are grouped into a single closed details block after 陽占 人体星図:
  - 蔵干マスター.
  - 蔵干流派別検証ステータス.
  - 算命学マスター棚卸し.
- The old `陽占マスター接続予定` page section was removed because 陽占, 十大主星, 十二大従星, and star detail pages are already connected.
- User-facing result sections remain always visible: 生年月日入力, 陰占表, 陰占の柱カード, 陽占 人体星図, 総エネルギー, 身弱・身中・身強判定, and star detail links.

### Future Input Form Direction

Status: `design_documented`, `implementation_pending`

Detailed ledger: `docs/sanmeigaku-input-and-time-pillar-research.md`

- Keep the existing `birthDate` input and existing `birthDate`-only URL behavior.
- Future minimal input candidates are birth time, birth time unknown, and Sanmeigaku gender.
- Birth place and timezone are reserved for a later correction phase; do not add them to the first form without a source and UX decision.
- If gender is added to `/sanmeigaku`, the UI must support an unspecified state rather than defaulting silently to male.
- Birth time input should be allowed to remain informational until time-pillar and true-solar-time rules are confirmed.
- Future dashboard and animation UI should consume a view model from the calculation layer, not implement fortune calculation inside presentation components.

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
- `calendar-notes` includes a 算命学 category that links to:
  - `/calendar-notes/sanmeigaku/陽占 人体星図`
  - 十大主星 detail pages under `/calendar-notes/sanmeigaku/[星名]`
  - 十二大従星 detail pages under `/calendar-notes/sanmeigaku/[星名]`
- The 算命学 category uses compact term chips with meta labels: `陽占`, `十大主星`, and `十二大従星`.
- 身弱・身中・身強 is not listed in the `/calendar-notes` index because it is currently a `/sanmeigaku` whole-chart helper judgement and its meaning text is not connected as a dictionary term.
- `adoption-status` is a verification and source-status screen. It keeps source/provenance readiness, calculation verification, production connection, and UI visibility as separate progress axes.
- Its completion table includes monthly-plate Level 1 closure, monthly-plate Level 2 research, limited personal-star provenance, visible hour-board/personal-direction scope, and the photographed-Mannenreki source manifest.
- Monthly-plate Level 1 may be shown as complete inside its declared scope while its production connection remains intentionally absent. Level 2 fine markers and directional deities remain a separate ongoing research item.
- `READY_WITH_LIMITATIONS` and provenance completion must not be presented as production-ready. The page expands compound status details below the affected item rather than collapsing them into a single completion label.
- Visible annual/directional deities and unconnected monthly fine-marker deities are separate registry rows. Same-name concepts such as 月徳日/方位, 月空, 生気, and 三合 are not merged by the screen.
- `direction-palace-blends` is a master/reference screen.

### Monthly Plate Source Marker Evidence

Status: `implemented_for_verified_pilots`, `display_only`

- Every selected-date monthly-board card includes `月盤原典の照合状況` immediately after the monthly-board metadata and before the monthly compass.
- The status always shows `基本盤：照合済み` with 中宮・九星配置・五黄殺・暗剣殺・月破. A source-confirmed Tiger pilot shows `追加marker：Pilot確認あり`; any other month shows `追加marker：この月は未照合` and says that fine-marker review is proceeding from the Tiger pilots.
- When the selected date resolves to one of the source-confirmed Tiger-month A/B/C pilots, the status includes a closed `月盤原典marker（検証中）` details panel.
- The initial scope is exactly five static records: `天合` for A/B/C and `冲` for A/C.
- Each record displays the raw marker, page-relative position, side-legend correspondence, photo-verification status, pilot group, p.24 source, and `HMA-P24-IMG-20260715`.
- Page-relative positions use `紙面上`等の固定表示 only. They are not converted to north/south/east/west or 24 mountains.
- The panel explicitly states that the markers are source evidence and are not used for candidate, rank, warning, or fortune judgement.
- Marker details are absent when no verified pilot matches, but the all-month coverage status remains visible. Neither status nor details are rendered in calendar cells, candidate lists/reasons, the direction compass, the 24-mountain ring, direction blends, companion judgement, or URL controls.

### TODO

- Add more screen-level structure for `direction-palace-blends` when it is next edited.

## UI Change Rules

- Update this document whenever a screen layout or visible behavior changes.
- Keep dense operational screens compact and scannable.
- Avoid changing labels that are used to verify calculation output unless the underlying spec is documented.
