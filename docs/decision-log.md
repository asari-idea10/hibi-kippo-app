# Decision Log

Last updated: 2026-07-16

Record product, architecture, and rule decisions here. Do not use this file to justify guessed fortune logic.

## Status Legend

Use these exact status labels across docs when describing product and rule decisions.

| Status | Meaning |
| --- | --- |
| `accepted` | Adopted as product/spec direction. |
| `provisional` | Temporarily adopted for wording or planning, but must be reviewed before implementation or rule changes. |
| `pending` | Not decided. Do not implement as if decided. |
| `source_review_required` | Requires fortune/calendar/source confirmation before implementation or rule changes. |
| `implementation_pending` | Direction is known, but code/UI/URL behavior has not been changed yet. |

## Decisions

### D-0001: Documentation separates confirmed specification from current code behavior

- Date: 2026-07-09
- Status: accepted
- Decision: Documentation should distinguish "Confirmed", "Read From Current Code", and "TODO" sections when appropriate.
- Reason: Future agents need to avoid treating implementation details as final specification.

### D-0002: Fortune/calendar logic must not be changed by inference

- Date: 2026-07-09
- Status: accepted
- Decision: 九星気学, 祐気取り, 方位, 暦, 土用, 天道, and 算命学 logic require source/code confirmation before modification.
- Reason: Incorrect assumptions can silently corrupt calculation output.

### D-0003: Existing URLs and query parameters are compatibility-sensitive

- Date: 2026-07-09
- Status: accepted
- Decision: Existing routes and query parameters should be preserved unless a change is explicitly documented and reviewed.
- Reason: Current screens are query-driven, and users may rely on saved URLs.

### D-0004: Keep `purpose=travel` compatibility while moving default intent toward `yuki_tori`

- Date: 2026-07-09
- Status: `accepted`, `implementation_pending`
- Decision: Existing `purpose=travel` URLs remain compatible. If `purpose` is explicitly provided in the URL, the app should respect that value. If `purpose` is omitted, the future product direction is to make `yuki_tori` the initial/default purpose for `/purpose-calendar`.
- Reason: The page is now primarily used as a 九星方位 / 祐気取り calendar, but saved URLs and older links may still rely on `travel`.
- Implementation note: No code change was made when this decision was recorded.

### D-0005: Treat `candidateCondition` and `actionScale` as separate concepts

- Date: 2026-07-09
- Status: `accepted`, `implementation_pending`
- Decision: `candidateCondition` should be treated as an independent URL parameter. `actionScale` represents 行動の規模・距離感・実行負荷. `candidateCondition` represents candidate existence and filtering strictness.
- Reason: Combining them makes URL behavior and UI intent harder to reason about. Future URL/UI design should separate "how far / how heavy the action is" from "how strictly candidate days are filtered."
- Implementation note: Current code behavior may still derive effective candidate filtering from `actionScale`; this document records the desired design direction only.

### D-0006: Companion judgement mode meanings are provisional product guidance

- Date: 2026-07-09
- Status: `provisional`, `source_review_required`
- Decision: Use the following provisional meanings until source/domain review confirms the official rules:
  - `strict`: prioritize avoiding bad directions for every selected participant.
  - `standard`: recommended normal mode; the user/self remains primary while strong bad directions for companions are avoided.
  - `loose`: user/self remains primary; companion information is closer to reference display.
- Reason: The UI needs understandable mode labels and review targets, but the formal fortune specification is not yet confirmed.
- Implementation note: Do not change companion judgement logic from this text alone.

### D-0007: Split candidate rank design into fortune rank and practical rank

- Date: 2026-07-09
- Status: `accepted`, `implementation_pending`, `source_review_required`
- Decision: Future candidate ranking should distinguish fortune-rank factors from practical-rank factors.
- Fortune-rank factors may include 三盤一致, 年月一致, 月日一致, 天道, and bad-direction avoidance.
- Practical-rank factors may include 近場, 日帰り可, 温泉, 神社, 自然散策, 食事, and other ease-of-action signals.
- Reason: Current candidate labels mix calculation strength and real-world usability. Separating them will make future UI and scoring easier to explain.
- Implementation note: No candidate scoring code was changed when this decision was recorded.

### D-0008: Document Sanmeigaku input model before adding birth-time or daiun behavior

- Date: 2026-07-14
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: Future `/sanmeigaku` birth-time, unknown-time, gender, birth-place, timezone, time-pillar, daiun, dashboard, and animation work should start from `docs/sanmeigaku-input-and-time-pillar-research.md`.
- Decision: Sanmeigaku input design includes `birthGender: "male" | "female" | "unspecified"`; missing gender must not be silently normalized to `male` for daiun or time-pillar work.
- Decision: Calculation, dashboard view-model, and animation presentation layers should remain separated. Animation must not own fortune calculation rules.
- Reason: Birth time and daiun depend on source-sensitive rules. A design ledger prevents URL/form work from accidentally becoming inferred fortune logic.
- Implementation note: This decision records docs only. No source code, URL behavior, form behavior, or calculation logic was changed.

### D-0009: Protect Sanmeigaku calculation core before common-master implementation

- Date: 2026-07-15
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: Step 4A common-master work starts from `docs/common-master-architecture-decision.md`.
- Decision: The Step 3 十大主星 100 / 100 match and 十二大従星 120 / 120 match are treated as protected current calculation-core evidence.
- Decision: Step 4B should add regression tests before attempting shared-master refactors or common type extraction.
- Decision: 通変星 and 十二運 remain research comparison terms; do not add them to the Sanmeigaku UI or calculation model from this evidence alone.
- Decision: 方位神の破・冲・刑 and Sanmeigaku命式内の支合・冲・害・破・刑 must stay in separate evaluation layers until a source-reviewed architecture explicitly separates pure branch structures from use-case-specific fortune evaluation.
- Reason: Step 3 found strong evidence that existing Sanmeigaku star calculations are already aligned with the research ledger, while unresolved areas are architectural and source-review problems rather than immediate calculation fixes.
- Implementation note: This decision records docs only. No source code, data, tests, UI, URL behavior, or calculation logic was changed.

### D-0010: Keep Shichu Suimei and Sanmeigaku coexisting with explicit correspondence status

- Date: 2026-07-15
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: 四柱推命と算命学は排他的に扱わず、十干・十二支・陰陽五行の共有基盤を認め、名称・表現・解釈差を明示しながら併用・併記する。
- Decision: 個別項目は `equivalent`、`partially_equivalent`、`shared_foundation`、`shichu_only`、`sanmeigaku_only`、`source_review_required` で対応状態を記録し、完全一致を推測で断定しない。
- Decision: Step 5Aの追加資料は `docs/mannenreki-additional-masters-research.md` に集約し、既存コード照合対象と新規master候補を分離する。コード上の存在有無はStep 5Bのread-only調査で確定する。
- Decision: 医療診断、発症予測、死亡・寿命、子どもの事故・病気、神殺単独の人格・人生断定、古典的差別表現、現代医療の代替は採用しない。
- Reason: 共有構造を再利用可能にしつつ、体系差、未確認の成立条件、安全上の制限を曖昧にしないため。
- Implementation note: This decision records docs only. No source code, data, tests, master, UI, URL behavior, or calculation logic was changed.

### D-0011: Protect matched Getsumei values while isolating boundary research

- Date: 2026-07-15
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: 月命星相当の36対応と、本命星9種類 × 月支12種類の108入力は、研究台帳の独立期待値と既存暦DBで全件一致したため、現在値を回帰テストの保護対象とする。
- Decision: 次工程では値の36対応・108入力だけを独立期待値で回帰テスト化し、既存実装から期待値を生成しない。
- Decision: 節入り境界、本命星としての `yearKyusei`、月命星としての `monthKyusei` の意味上の正式定義は未確定とし、境界ロジックを置換・統合しない。
- Decision: 暦DBと公式節入りmasterの6件の境界日差は、値の回帰テストから隔離した別研究課題とする。どちらかを誤りと断定しない。
- Reason: 一致した現在値を安全に保護しながら、日付単位と時刻単位の境界問題を未確認のまま固定または変更しないため。
- Implementation note: This decision records docs only. No source code, data, tests, master, UI, URL behavior, or calculation logic was changed.

### D-0012: Protect verified monthly-plate values while deferring time-precision changes

- Date: 2026-07-16
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: Step 5B-2で一致した年支3グループ、月盤中宮36対応、洛書定位による324宮の内部配置、五黄殺・暗剣殺・月破の全期間内部整合を、独立期待値による回帰テストの保護対象とする。
- Decision: 「ユーザー提供画像をChatGPTが読解・整理した研究記録」として、2026年6月の芒種00:48と7月の小暑10:57を含む節入り時刻候補を記録する。Codexが原画像を直接確認したとは扱わない。
- Decision: Gregorian月には節入りを境に複数月盤が含まれ得る。固定検証には `selectedDate` または `date` を使い、`year` / `month` だけから単一代表盤を確定する検証APIを先行実装しない。
- Decision: 将来の出生時刻対応では節入り当日を雑に日単位へ丸めず、実際の節入り時刻との前後を扱う設計候補を保持する。ただし `birthTime` なしfallback、timezone、海外出生、真太陽時は別途仕様確認する。
- Decision: 現時点では既存の日付単位境界、既存URL、既存判定結果を変更しない。原資料324セル・全マーカーと境界6件の研究を分離し、次工程は確認済み月盤値の回帰テストとする。
- Reason: 確認済み値を保護しながら、原資料転記、時刻精度、代表日、API contractを未確定のまま既存計算へ混入させないため。
- Implementation note: This decision records docs only. No source code, tests, data, master, UI, URL, API, or boundary logic was changed.

### D-0013: Isolate the two Tendo paths and defer concrete direction expectations

- Date: 2026-07-16
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: Step 5B-3で、節月から単一8方位を返す天道と、月支の三合局から3支・3方向を返す天道の2経路を確認した。名称が同じでも出力構造・粒度・UI用途が異なるため、原資料確認前に同一概念として統合、名称変更、削除しない。
- Decision: 単一天道は全55,152日で三合天道3方向の一つに含まれ、単一天道と天徳は全55,152日・12節月で同じ8方位だった。ただし、これは現行コードの観測結果であり、正式な占術仕様、暫定流用、8方位化による一致のいずれかは未確定とする。
- Decision: 原資料の天道・天徳・三合マーカーおよび天徳24山を確認するまで、単一天道12方位、天徳12方位、天徳24山、三合マーカーを正式期待値として固定しない。
- Decision: 4三合局の純粋な支構成は将来のtests-only保護候補とする。吉神・凶殺ラベルの同時保持、強い凶殺の優先、天道チップのactive / blocked分離、天道・天徳が候補ランクへ直接加点しないことも、正式占術判断ではなく現行policyの保護候補として扱う。
- Decision: 現行policyでは五黄殺・暗剣殺・破が天道・天徳より優先し、吉神は凶殺を相殺せず、吉神の重複数による加点を行わない。次のdocs整理は天徳合・月徳・月徳合・生気を対象とする。
- Reason: 同名の重複経路と全期間一致を根拠に早期統合や具体値固定を行うと、原資料差、粒度差、用途差を失うため。
- Implementation note: This decision records docs only. No source code, tests, data, master, UI, URL, label, warning code, candidate judgement, or rank logic was changed.

### D-0014: Separate virtue-day, direction-deity, natal-spirit, and palace-blend concepts

- Date: 2026-07-16
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: 月盤方位神としての天徳合・月徳・月徳合は現時点で未実装とする。現在コードに存在する月徳は選日「月徳日」であり、月徳方位として扱わない。
- Decision: 現行の生気は、宮の五行が回座星の五行を生じる五行ブレンドであり、月盤方位神や八宅等の同名概念とは別に管理する。
- Decision: 月盤方位神、選日、命理神殺、五行ブレンドの同名概念を流用しない。天徳・月徳・命理神殺・生気blendから未確認の方位値を推測せず、原資料確認前に方位神masterを作らない。
- Decision: 天徳合・月徳方位・月徳合・方位神生気を候補ランク、吉神加点、凶殺相殺へ接続しない。現行生気の内部 `score: 2` は候補数値ランクとは別値として扱う。
- Decision: 次のdocs整理は月空・定位対冲を対象とし、原資料マーカー確認後に方位神としての実装可否をプロダクトオーナーが判断する。
- Reason: 同名・類似名を根拠に異なる入力基準、用途、粒度の値を流用すると、未確認の方位神を既存選日・命理・五行blendから誤生成するため。
- Implementation note: This decision records docs only. No source code, tests, data, master, UI, URL, API, ID, label, warning code, candidate judgement, rank logic, good-spirit scoring, or bad-direction cancellation was changed.

### D-0015: Keep fixed-profile Gekku separate from unimplemented Teii Taichu

- Date: 2026-07-17
- Status: `accepted`, `documentation_only`, `implementation_pending`, `source_review_required`
- Decision: 現行の月空は、`birthDate=1976-03-19` かつ本命星6の個人プロフィールに `月破` と併記する固定表示であり、月支・節入り・旬空・空亡・月盤から算出する一般月空規則ではない。月盤方位神の実装済み値として扱わず、固定条件を占術規則として一般化しない。
- Decision: 定位対冲は現時点でproduction未実装とする。暗剣殺の五黄殺対宮、月破等に使う十二支の冲、未確認の九星定位対冲を別概念として管理する。
- Decision: 月空・定位対冲の原資料マーカー、正式定義、対象盤、方位粒度、作用を確認するまで、固定プロフィール表示、暗剣殺map、十二支対冲map、九星定位表から計算式・master・warning・blockingを推測生成しない。
- Decision: 月空・定位対冲を候補判定、候補ランク、吉神加点、凶殺相殺へ接続しない。これは現工程での変更禁止であり、将来の採用可否と作用は原資料確認後にプロダクトオーナーが判断する。
- Decision: 次はStep 5B-3Bで安全な構造・policy tests-only範囲を確定し、Step 5B-3Cで原資料マーカーを確認する。一般月空規則、定位対冲計算、具体方位、24山値は固定しない。
- Reason: 個人向け固定サンプル、五黄の対宮、十二支の冲、九星定位を同じ「対向」構造として流用すると、未確認の月空・定位対冲を誤実装するため。
- Implementation note: This decision records docs only. No source code, tests, data, scripts, package/config files, calendar DB, master, UI, URL, API, ID, label, warning code, candidate judgement, rank logic, fixed-profile condition, month-break logic, Anketsu logic, or branch-opposition map was changed.

### D-0016: Register page 24 as the pilot source without promoting it to a master

- Date: 2026-07-17
- Status: `accepted`, `documentation_only`, `manual_transcription_review_required`, `source_review_required`
- Decision: ユーザー提供の『改訂版 平成・萬年暦』p.24画像で、年支3グループ×12月＝36月盤、側部凡例、寅月の八白・五黄・二黒中宮3盤を確認した。p.24原資料画像を現行コードより優先する比較元として登録する。
- Decision: 原資料の原記号、印刷ページ上の原位置、24山解釈、8方位派生、現行コード比較を別フィールドとして保持する。現行コードとの一致を使って原資料の方位基準や判読不能記号を逆算しない。
- Decision: p.24画像は `user_provided_image`、転記値は `manual_transcription_review_required` とする。手動転記の二重確認とプロダクトオーナー判断前に正式masterへ昇格しない。
- Decision: 不鮮明な小記号、24山、方位基準は推測補完しない。まず寅月3盤のpilotを接写で二重確認し、成功確認後にのみ36盤全件転記、現行コード全件比較、source master設計へ進む。
- Reason: 原資料と実装値、原位置と派生方位、確定値と判読候補を混ぜず、36盤転記前に画像品質と転記手順を検証するため。
- Implementation note: This decision records docs only. No production source, tests, data, master, scripts, package/config files, UI, API, URL, candidate logic, rank logic, warning code, image asset, or OCR artifact was changed.

### D-0017: Correct the page 24 pilot from an independent crop review

- Date: 2026-07-17
- Status: `accepted`, `documentation_only`, `manual_transcription_review_required`, `source_review_required`
- Decision: 登録済み原画像と同一SHA-256の画像から、リポジトリ外へ原寸cropを作成し、Step 5B-3C-1のPilot具体値表と現行コードを見ずに寅月3盤と側部凡例を独立再読解した。cropは読解補助であり、Git・Drive・正本へ追加しない。
- Decision: Pilot Aの大字9位置は一次転記と一致した。Pilot Bのleft / upper_leftは`三` / `四`、Pilot Cのleft / upper_leftは`九` / `一`へ原画像に基づき訂正する。Pilot C rightの`月合`候補は過大判定として撤回する。
- Decision: 3盤のupper_right `破`、Pilot A/B right `月合`、Pilot A lower_leftおよびPilot C upper_rightの`冲`、3盤bottomの`空`・`生`・`天合`を原位置付きでconfirmedとする。ただし名称対応、原位置、24山、8方位派生、現行コード比較を分離し、方位値や作用へ昇格しない。
- Decision: 側部凡例の印字対応を二重確認したが、`天月`が単一複合略号か複数記号か、`天`の天道・天徳への個別対応は未確定のままとする。各pilotのtop細字群、方位基準、24山は推測せず、必要な追加撮影をその箇所に限定する。
- Decision: 現行コード比較の`match`は中宮3件のみ、生気と月空の`concept_mismatch`は用途差2件のままとする。方位基準がないため、その他を方向別`match`へ昇格しない。
- Decision: 2 pilotの大字原位置訂正、Pilot Cの過大判定、top細字群、方位基準、24山が未解決であるため、36盤全件転記は開始しない。限定接写と方位基準資料の確認後に開始可否を再判定する。
- Reason: 一次転記の記録を維持することよりも原画像の独立再読解を優先し、誤った原位置や不確かな略号を36盤転記へ伝播させないため。
- Implementation note: This decision records docs only. No production source, tests, data, master, scripts, package/config files, UI, API, URL, candidate logic, rank logic, warning code, image asset, crop, or OCR artifact was changed.

### D-0018: Keep the completed monthly-plate research ledger out of production until promotion gates pass

- Date: 2026-07-18
- Status: `accepted`, `documentation_only`, `manual_transcription_review_required`, `source_review_required`, `implementation_pending`
- Decision: Googleスプレッドシート「月盤研究台帳」の3グループ×12か月×9区画=324行をread-only監査した。一次転記完了をproduction master昇格完了とは扱わず、研究原本とGitHub正式masterを分離する。
- Decision: 年支3グループ、月盤中宮36対応、九星1〜9一意性、五黄殺、暗剣殺、月破をLevel 1正式採用候補とする。ただし今回productionへ昇格せず、原資料marker全件確認とPO判断を別工程にする。
- Decision: 大字九星は322/324が現行式と一致するが、A寅の東・南東2区画が不一致であるため、324区画静的masterの一括採用を停止する。C寅の月徳合も、12か月期待値と盤内markerの差を解消するまで正式採用しない。
- Decision: `天月`・`天`と天道・天徳の8方位位置はLevel 2候補とするが、萬年暦本文の略記定義確認前は`source_unconfirmed`を維持する。月徳、天徳合、月徳合、月空、生気、定位対冲、三合はLevel 3研究データまたは差異解消までLevel 4とし、同名既存コードから補完しない。
- Decision: 将来構造は、九星配置を計算生成、方位神を原記号・原位置・24山・8方位派生が分離されたsource master候補、36盤台帳を比較・回帰fixture候補とするハイブリッド型を第一候補にする。正式採用は別Decisionとする。
- Reason: 324行のうち296行が`user_transcribed`で独立原画像照合前であり、台帳内・現行実装間の未解決差を含むため。計算整合と原資料確定、原記号と正規化名称、研究fixtureとproduction正本を混ぜないため。
- Implementation note: This decision records docs only. No production source, tests, data, master, scripts, package/config files, UI, API, URL, candidate logic, rank logic, warning code, Google Sheet value, image, crop, or OCR artifact was changed.

### D-0019: Resolve the A-Tiger transcription error while preserving the C-Tiger source discrepancy

- Date: 2026-07-18
- Status: `accepted`, `documentation_only`, `manual_transcription_review_required`, `source_review_required`, `implementation_pending`
- Decision: POが原資料現物を目視し、A寅の東=六白・原記号なし、南東=七赤・原記号なしを確認した。D-0018時点の研究台帳にあった東=7、南東=6は転記誤りであり、原資料と現行実装は一致する。大字九星比較を322/324から324/324一致へ更新する。
- Decision: POがC寅の南=六白・`天月 / 三合`、南西=八白・`ア / 破 / 冲`、西=四緑・原記号なしを確認し、C寅盤内の他区画にも`月合`表示がないことを確認した。
- Decision: C寅の月徳合は転記漏れではなく、古典期待値「月徳合=辛=西」と萬年暦盤面markerなしの未解決資料間不一致とする。古典側または萬年暦側のどちらが誤りかを推測で断定せず、月徳合を西としてproductionへ補完しない。
- Decision: 年支3グループ、中宮36対応、九星配置324/324、九星一意性36/36、五黄殺、暗剣殺36/36、月破36/36をLevel 1候補とする。月徳合はLevel 3研究保持とし、324区画全体のproduction master一括昇格、`天月`・`天`の本文定義確定、三合の現行3方向への統合は行わない。
- Reason: PO現物目視で解消できた転記誤りと、複数資料間でなお解消していない概念・表示差を分離し、確認済み九星配置だけを昇格候補へ更新するため。
- Implementation note: This decision records docs only. No production source, tests, data, master, scripts, package/config files, UI, API, URL, candidate logic, rank logic, warning code, Google Sheet value, image, crop, or OCR artifact was changed.

### D-0020: Adopt a shared provenance schema and independent verification axes for all divination techniques

- Date: 2026-07-18
- Status: `accepted`, `documentation_only`, `implementation_pending`
- Decision: hibi-kippo-appの全占技、暦情報、方位・人物・candidate・ranking policyへ適用する共通provenance schemaをPO仕様として採用する。静的な占技定義、source claim、PO/project claim、rule、boundary、implementation binding、application policy、verification、conflict、禁止推論と、個別入力に対する実行時`CalculationTrace`を分離する。
- Decision: `existing_implementation`は占術上の根拠にせず、現在挙動のimplementation binding、原典・資料・PO仕様との比較対象、回帰テスト対象に限定する。コードやmasterが存在することだけで正式占術仕様へ昇格させない。
- Decision: source verification、calculation verification、implementation match、project adoption、production connection、UI enablement、ranking connectionを独立statusとして保持し、「正式採用」という単一statusへ統合しない。PO採用仕様と原典確認済みclaimも分離する。
- Decision: 萬年暦raw markerは保持し、`天月=天道+天徳+月徳`、`天=天道+天徳`、`月=月徳`、`天合=天徳合`、`月合=月徳合`を`semanticExpansionStatus: po_confirmed_interpretation`として採用する一方、`sourceDefinitionStatus: source_unconfirmed`を維持する。独立吉神化、独自効果、一括加点、構成吉神の自動効果合算は行わない。
- Decision: 通常利用では説明traceをオンデマンド生成し、調査・監査モードでは完全traceを生成可能にする。完全traceは原則恒久保存せず、registryには入力の型と用途を記録して個人情報の実値を保存しない。
- Decision: `techniqueVersion`、`ruleVersion`、`sourceClaimVersion`、`projectClaimVersion`、`applicationPolicyVersion`、`traceVersion`を追跡し、過去結果を現在ruleで上書き再計算せず、使用時点のversionを参照可能にする。UI根拠表示は通常表示と詳細・研究モードの二層を前提とするが、今回UIは変更しない。
- Decision: 現行候補scoreは削除・変更せず`applicationPolicyStatus: provisional_existing_policy`として記録する。production使用中だが古典根拠・正式採点仕様とはせず、将来の占術rankと実用rankの分離対象とする。
- Decision: 一次棚卸し194 trace unitsを基準にする。正式registryでは同一占技の複数経路を`implementationBindings`で束ね、同名別概念、C寅月徳合の資料間不一致、既知の`concept_mismatch`を統合・上書きしない。
- Reason: 結果だけでなく、入力、暦境界、原資料、計算rule、中間値、アプリ採用方針、production作用、未確定事項を機械的に追跡し、AIや実装者がコード・master・同名概念から不足値を推測補完することを防ぐため。
- Implementation note: This decision and its four research docs change documentation only. No production source, tests, data, generated files, master, scripts, package/config, API, URL/query, UI, candidate, ranking, warning, Google Sheet, or Vercel configuration was changed.

### D-0021: Adopt trusted lineage context and limited personal-star provenance scope

- Date: 2026-07-18
- Status: `accepted`, `provenance_registry`, `production_not_connected`, `source_review_required`
- Decision: 東洋運勢学会を、本プロジェクトの月命星・傾斜法研究における`institutional_specialist_source`として扱う。記事本文で直接確認できたclaimだけをSourceClaimとし、未記載事項を同学会の見解として補完しない。source typeは分類情報であり、数値weight、score、資料間conflictの自動解決には使わない。
- Decision: 富久純光系統を`po_confirmed_lineage_context`として扱い、PO確認、書誌確認、本文確認を別recordにする。国籍、傾斜法の最初の発明者であること、未確認書籍本文、東洋運勢学会全体の未記載見解をlineage metadataから推測しない。
- Decision: 本命星provenanceを`READY`、月命星TechniqueDefinitionを`READY_WITH_LIMITATIONS`として登録する。月盤中宮星と月命星は同じ値・lookup・計算Ruleを共有できるが、月命星は出生人物へ固定する`derived_personal_attribute`かつ`distinct_role`であり、TechniqueDefinitionを統合しない。
- Decision: 本命星・月命星の静的registry、fixture、CalculationTrace、verificationだけを登録する。`personal-star-profile-workflow`はeffect-free aggregateとし、独立した吉凶効果、加点、candidate、ranking、warningを持たせない。
- Decision: 本命星の立春時刻境界は園田系統について`confirmed_for_named_lineage`、月命星の全12節exact timestamp境界は`partially_confirmed`とする。project adoptionはいずれも`provisional`、production connectionは`not_connected`とする。`exactTimestampSupport: true`はschema・traceが秒精度を表現可能という意味に限定し、全12節確認済みまたはproduction対応済みを意味しない。
- Decision: timezone未指定時の`assumed_jst`はprovisional project policyであり、唯一のsource truthとはしない。standard JSTとlocal natural time correctionの方式差をopen conflictとして保持し、海外出生、DST、経度補正、真太陽時、均時差を推測実装しない。出生時刻不明の境界日はexact resultを`unresolved`、fallbackを`null`とする。
- Decision: exact timestamp production接続、自然時補正、傾斜計算変更、中宮傾斜の流派選択、本命殺・本命的殺、月命殺・月命的殺、candidate、ranking、warning、同行者、UI、API、URLへの接続をHOLDとする。傾斜Ruleは将来参照に留め、executable ruleとして登録しない。
- Reason: 信頼する専門系譜と本文で確認できたclaimを活用しつつ、人物属性へのrole binding、境界の資料状態、PO方針、現行daily master、派生占技の流派差を混同せず、production挙動を変えずに追跡可能にするため。
- Implementation note: D-0020 schemaの後方互換拡張と、`src/lib/divination-provenance/personal-stars/`配下の静的registry・fixture・trace・test、および関連docsだけを追加する。既存production計算、calendar master、generated data、既存傾斜ロジック、API、URL/query、UI、candidate、ranking、warning、Google Sheet、Vercelは変更しない。

## Decision Status Matrix

| Topic | Status | Implementation status | Source review | Notes |
| --- | --- | --- | --- | --- |
| Preserve `purpose=travel` compatibility | `accepted` | Current compatibility must be preserved | Not required for compatibility itself | Do not break saved URLs. |
| Respect explicit `purpose` URL values | `accepted` | Verify before implementation changes | Not required for URL behavior itself | Explicit user-provided query values should win. |
| Omitted `purpose` should move toward `yuki_tori` | `accepted`, `implementation_pending` | Not implemented yet | Not required for URL default itself | Requires compatibility/migration plan. |
| Treat `candidateCondition` and `actionScale` as independent concepts | `accepted`, `implementation_pending` | Not implemented yet | Not required for URL concept itself | `actionScale` is action burden; `candidateCondition` is filtering. |
| Companion modes `strict` / `standard` / `loose` meanings | `provisional`, `source_review_required` | Do not change logic from wording alone | Required before rule changes | Product wording exists; formal fortune behavior is not confirmed. |
| Split candidate rank into fortune rank / practical rank | `accepted`, `implementation_pending`, `source_review_required` | Not implemented yet | Required for fortune-rank factors | Practical-rank design can proceed separately from fortune-source confirmation. |
| Sanmeigaku input model before time pillar / daiun | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Docs-only model recorded | Required before time/daiun calculation | Missing gender must not silently become male for Sanmeigaku daiun design. |
| Sanmeigaku calculation-core protection before common-master implementation | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Docs-only architecture boundary recorded | Required before unresolved common-master rule adoption | Start Step 4B with regression tests for 十大主星 100 and 十二大従星 120. |
| Shichu Suimei / Sanmeigaku coexistence and additional-master ledger | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Step 5A docs-only ledger recorded | Required per individual item | Keep shared foundations and system-specific rules explicit; Step 5B confirms code presence. |
| Getsumei 36 / 108 value protection and boundary isolation | `accepted`, `documentation_only`, `source_review_required` | Independent value regression tests added | Required for formal semantics and six boundary differences | Protect exact value mappings independently; do not replace boundary logic. |
| Monthly-plate 36 / 324 value protection and future time precision | `accepted`, `documentation_only`, `source_review_required` | Independent value and invariant regression tests added | Required for original 324 cells, markers, representative date, and time boundary | Keep current date-precision behavior; do not mix API or time-precision work into the protected values. |
| Shared divination provenance schema and independent verification axes | `accepted`, `documentation_only`, `implementation_pending` | Four architecture/research docs added; runtime registry and trace are not implemented | Source review remains per technique and claim | Existing implementation is a binding/comparison target, not fortune-source evidence; preserve conflicts and independent statuses. |
| p.24 monthly-plate marker transcription pilot | `accepted`, `documentation_only`, `manual_transcription_review_required`, `source_review_required` | Independent crop review corrected Pilot B/C page positions and withdrew one Pilot C marker candidate; no master or runtime change | Top-sector close-ups and source orientation / 24-mountain evidence required before all 36 plates | Preserve original symbols and page-relative positions; derive neither 24 mountains nor 8 directions from current code. |
| Tendo / Tentoku duplicate-path isolation and trine structural protection | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Two Tendo paths and current policy documented; concrete directions not fixed | Required for original Tendo, Tentoku, and trine markers and 24-mountain detail | Do not merge the two Tendo paths or freeze Tendo / Tentoku directions before source review. |
| Tentoku-go / Gettoku / Gettoku-go / Seiki purpose separation | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Getsutoku day and palace-blend Seiki documented as other-purpose implementations; monthly direction deities remain unimplemented | Required for original monthly markers, 24-mountain detail, and formal derivation rules | Do not derive directions from selected days, natal spirits, Tentoku / Gettoku, or palace-blend Seiki. |
| Gekku fixed-profile display / Teii Taichu separation | `accepted`, `documentation_only`, `implementation_pending`, `source_review_required` | Gekku exists only as a fixed-profile display; general Gekku and Teii Taichu are unimplemented | Required for original monthly markers, formal definitions, target plate, action, and 24-mountain detail | Do not generalize the fixed sample or derive Teii Taichu from Anketsu, branch opposition, or the nine-star fixed-position table. |
| Boundary regression samples for 節入り・立春・土用・board switching | `accepted`, `implementation_pending`, `source_review_required` | Test matrix not implemented yet | Required for authoritative expected values | High-priority test design task. |
| 天道・土用殺・方位殺・candidate-rank fortune basis | `source_review_required` | Do not change logic until reviewed | Required | Keep current behavior documented as code behavior only. |
| 本命星 handling | `source_review_required`, `pending` | Do not change personal-star logic until reviewed | Required | Current code derives from birth row year 九星. |
| 天赦日 candidate allowance without direction tags | `source_review_required`, `pending` | Do not change candidate logic until reviewed | Required | Current behavior needs product/source confirmation. |

## Pending Decisions

| ID | Item | Category | When to decide | Notes |
| --- | --- | --- | --- | --- |
| P-0003 | Official source-status labels for 天道・土用殺・方位殺・候補ランク | Fortune/source confirmation | Needs source review before logic changes | Do not decide from code alone. Candidate-rank design direction is split in D-0007, but official fortune basis is still pending. |
| P-0004 | Official behavior for `strict` / `standard` / `loose` companion judgement | Product + fortune confirmation | Needs review before changing companion logic | Current code can be documented, but intent is not confirmed. |
| P-0005 | Regression sample set for 節入り・立春・土用・年盤/月盤/日盤 switching | Test design | Can draft now; expected values need source confirmation | Useful before the next logic change. |
| P-0006 | Whether `birthGender=male` default is a final product decision | Product behavior | Before changing birth/profile forms | Current behavior defaults to male unless `female` is specified. |
| P-0007 | Whether 天赦日 can remain an almanac-only candidate without direction tags | Fortune/product behavior | Before changing monthly best-candidate logic | Needs source/product confirmation. |
| P-0008 | Whether using birth row year 九星 as 本命星 is final for all users | Fortune/source confirmation | Before changing personal-star calculations | Current behavior is documented but not confirmed as final. |
| P-0009 | Sanmeigaku time-pillar source rules | Fortune/source confirmation | Before adding `birthTime` to calculation | Includes time branch ranges, 子刻, day boundary, true solar time, longitude, timezone, DST, overseas births, and unknown time. |
| P-0010 | Sanmeigaku daiun source rules | Fortune/source confirmation | Before implementing daiun | Includes forward/reverse direction, gender relation, stem yin/yang basis, start age, rounding, counted/full age, and stem/branch progression. |
| P-0011 | Common-master Step 4B regression-test scope | Test design + architecture | Before commonizing shared masters | Start with 十大主星 100, 十二大従星 120, energy values, 初中老年, and 身強弱 boundaries before refactoring. |
| P-0012 | Relationship among single-direction Tendo, trine Tendo, and Tentoku | Fortune/source confirmation + product architecture | Before renaming, merging, deleting, or freezing direction expectations | Current values overlap across all 55,152 rows, but concept, source granularity, and intended UI meaning remain unresolved. |
| P-0013 | Whether and how Tentoku-go, Gettoku direction, Gettoku-go, and direction-deity Seiki should be adopted | Fortune/source confirmation + product decision | After original monthly markers and derivation rules are confirmed | Keep selected-day Gettoku, natal-spirit candidates, palace-blend Seiki, and monthly direction deities separate. |
| P-0014 | Whether and how Gekku and Teii Taichu should be adopted | Fortune/source confirmation + product decision | After the fixed-profile Gekku origin, original monthly markers, formal definitions, target plate, and derivation rules are confirmed | Keep fixed-profile Gekku, general Gekku, Anketsu opposite-palace logic, branch opposition, and Teii Taichu separate. |
