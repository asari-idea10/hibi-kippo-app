# 月盤研究台帳 正式データ昇格可否監査

調査日: 2026-07-18
作業区分: `documentation_only`
対象スプレッドシート: `hibi-kippo_monthly_plate_research_ledger`
Spreadsheet ID: `1du3QGUmT8tO4hC5DZifi1C_r7KI9W4rrbqTZmZxa6aE`

## 1. 結論

研究台帳は、3年グループ × 12か月 × 9区画 = 324行を保持し、36盤すべてについて一次転記と研究上の一次検算が記録されている。ただし、現時点で324区画をそのままproduction masterへ一括昇格してはならない。

主な理由は次のとおり。

- 324行のうち画像確認済みは28行、`user_transcribed`は296行であり、296行は独立原画像照合済みではない。
- Aグループ寅月の東・南東2区画は、研究台帳と現行の中宮8飛泊配置が一致しない。
- `12か月方位神期待値`の寅月は月徳合を西とする一方、Cグループ寅月の西区画には`月合`がなく、研究台帳内で未解決の差がある。
- `天月`と`天`は配置との整合性が高いが、萬年暦本文による複合略記の明示的定義が未確認である。
- 月徳方位、天徳合、月徳合、一般月空、方位神生気、定位対冲はproduction未実装である。盤内`三合`と現行三合4局は粒度が異なる。

したがって、昇格対象は一括masterではなく項目単位で扱う。現時点の推奨はハイブリッド型であり、九星配置を計算生成、方位神を原記号・正規化名・原位置・8方位派生が分離されたsource master候補、36盤台帳を比較・回帰fixture候補として保持する。

> 研究台帳の一次転記完了 ≠ production masterへの正式昇格完了

## 2. 調査範囲と証拠境界

### 2.1 対象シート

| sheet | role | observed state |
| --- | --- | --- |
| `月盤研究台帳` | 1行1区画の研究台帳 | 324/324行、36/36盤、各盤9区画 |
| `記号辞書` | 原記号と正規化名称の分離 | 11記号を保持。`天月`・`天`の意味は`strongly_supported`だが本文定義未確認 |
| `Aグループ検算` | A 12盤の一次検算記録 | 結果セルは手入力値。独立原典検証とは別 |
| `Bグループ検算` | B 12盤の一次検算記録 | 結果セルは手入力値。独立原典検証とは別 |
| `Cグループ検算` | C 12盤の一次検算記録 | 結果セルは手入力値。独立原典検証とは別 |
| `36月盤一覧` | 36盤の進捗一覧 | 寅月3盤は確認済み、その他は主に目視入力済み |
| `12か月方位神期待値` | 方位神の別表候補 | 寅月だけ入力済み。卯〜丑は未入力 |
| `使い方` | 入力規則 | 紙面上端=南、時計回りの8方位変換を記録 |

### 2.2 行数と確認状態

| status | cells | meaning in this audit |
| --- | ---: | --- |
| `confirmed` / 画像確認済み | 28 | 寅月3盤27区画とA亥月破1区画。画像番号または限定接写記録あり |
| `user_transcribed` / 目視入力済み | 296 | ユーザー一次転記。機械的整合確認の対象にはできるが、独立原画像確認済みとはしない |
| total | 324 | 3グループ × 12か月 × 9区画 |

`A/B/Cグループ検算`の「一致」「一次検算済み」は研究上の有用な記録だが、対象範囲のセルに検算式はなく、結果文字列は手入力である。本監査ではこれを独立機械比較の期待値には使わず、`月盤研究台帳`の324行を現行コードの計算結果へ直接比較した。

## 3. 現行実装の所在と責務

| item | file | function / type | generation source | current responsibility |
| --- | --- | --- | --- | --- |
| 日次月盤入力 | `src/lib/calendar-master-rows.ts` | `CalendarMasterRow`, `getCalendarMasterRow`, `getCalendarMasterRows` | `src/data/calendar-master/by-year/{year}.json` | `monthKyusei`、月暗剣殺、月五黄殺、月破を読み込む |
| 日次domain model | `src/lib/calendar-day.ts` | `CalendarDay`, `getCalendarDay` | `CalendarMasterRow` | 月九星と月警告を日次モデルへ移す |
| 9宮配置 | `src/lib/calendar-db-view.ts` | `getKyuseiDirectionStar` | 中宮星 + 洛書定位 | 中宮から北〜北西・中央の9値を計算生成 |
| 方位警告重畳 | `src/lib/calendar-db-view.ts` | `getDirectionMatrix` | `CalendarDay.directionWarnings` | 暗剣殺、五黄殺、破を年/月/日盤へ配置 |
| 公開DB row | `src/lib/calendar-db-view.ts` | `CalendarDbRow`, `buildCalendarDbRow`, `searchCalendarDb` | 日次model + 生成盤 | 方位別の月盤表示値と検索結果を組み立てる |
| 単一天道・天徳 | `src/lib/good-fortune-directions.ts` | `GoodFortuneDirectionEntry`, `getGoodFortuneDirections` | 月支→節月12対応表 | 月単位の天道・天徳を8方位へ表示 |
| 三合4局 | `src/lib/feng-shui-virtue-master.ts` | `TendoTrineVirtueEntry`, `tendoTrineVirtueMaster` | 月支→三合局 | 月天道・日天道の別経路として3支・3方向を保持 |
| 24山方位神 | `src/lib/direction-deities.ts` | `DirectionDeityEntry`, `getDirectionDeities` | 年干・年支・日干支等 | 24山方位神を生成。今回の未実装月盤marker masterではない |
| UI | `src/app/purpose-calendar/page.tsx` | 月盤・方位神盤・候補組立 | `CalendarDbRow`等 | 月盤、警告、天道、三合補助、候補理由を表示 |
| DB UI | `src/app/calendar-db/page.tsx` | calendar DB table | `searchCalendarDb` | 月盤・方位神の検証表示 |
| API | `src/app/api/direction-deities/route.ts` | `GET` | `getDirectionDeities` | `date`指定の方位神API。36盤master APIではない |
| regression | `src/lib/monthly-plate-regression.test.ts` | Vitest | 静的独立期待値 + public DB | 36中宮、9静的盤、324配置、三警告、日付境界を保護 |

### 3.1 現在の月盤フロー

```text
calendar-master JSON
  -> CalendarMasterRow.monthKyusei / month warnings
  -> CalendarDay.kyusei.month / directionWarnings.month
  -> getKyuseiDirectionStar(center, direction)
  -> getDirectionMatrix(warnings + single Tendo/Tentoku)
  -> CalendarDbRow.directionBoardValues
  -> purpose-calendar / calendar-db
```

月盤中宮星を日次に決めるpure functionはproductionに存在せず、生成済み日次JSONの`monthKyusei`を読み込む。8方位九星は`getKyuseiDirectionStar`が計算生成する。月支切替は既存暦DBの日付精度を使い、研究台帳自体は境界日時の期待値を持たない。

## 4. 比較方法

1. `月盤研究台帳`の324行を`pattern + month_branch + direction_8`で集約する。
2. 各盤の中宮を既存36静的期待値と比較する。
3. 各区画の大字九星を`getKyuseiDirectionStar`と同じ洛書定位式で比較する。
4. 五黄殺・暗剣殺を現行9中宮対応、月破を現行12月支対応と比較する。
5. 天道・天徳は現行の節月12対応と位置だけ比較し、`天月`・`天`の意味は別判定にする。
6. 未実装項目はproduction値を生成せず、`not_implemented`、`concept_mismatch`、`source_unconfirmed`、`cannot_compare`に分ける。

使用する結果分類は次の6種類に限定する。

| result | meaning |
| --- | --- |
| `match` | 同一概念・同一粒度で一致 |
| `mismatch` | 同一概念・同一粒度として比較でき、値が不一致 |
| `not_implemented` | 研究台帳側に値があるが、対応するproduction値がない |
| `concept_mismatch` | 同名または近似名だが用途・粒度・生成概念が異なる |
| `source_unconfirmed` | 位置は整合しても原記号の意味または独立原典確認が不足 |
| `cannot_compare` | 比較キー、境界、方位粒度等が不足 |

## 5. 36月盤比較一覧

`source_state`は盤内9区画の状態を示す。A亥は月破1区画だけconfirmedで、残り8区画がuser-transcribedのため`mixed`とした。

| group | month | center | large stars | ankensatsu | month break | Tendo / Tentoku | source_state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | 寅 | 8 `match` | `mismatch`: 東=台帳7/現行6、南東=台帳6/現行7 | `match` | `match` | 位置36対応内`match`、意味`source_unconfirmed` | confirmed |
| A | 卯 | 7 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 辰 | 6 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 巳 | 5 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 午 | 4 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 未 | 3 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 申 | 2 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 酉 | 1 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 戌 | 9 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 亥 | 8 `match` | 9/9 `match` | `match` | `match` | 同上 | mixed |
| A | 子 | 7 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| A | 丑 | 6 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 寅 | 5 `match` | 9/9 `match` | `match`（なし） | `match` | 位置36対応内`match`、意味`source_unconfirmed` | confirmed |
| B | 卯 | 4 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 辰 | 3 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 巳 | 2 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 午 | 1 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 未 | 9 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 申 | 8 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 酉 | 7 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 戌 | 6 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 亥 | 5 `match` | 9/9 `match` | `match`（なし） | `match` | 同上 | user_transcribed |
| B | 子 | 4 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| B | 丑 | 3 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 寅 | 2 `match` | 9/9 `match` | `match` | `match` | 位置36対応内`match`、意味`source_unconfirmed` | confirmed |
| C | 卯 | 1 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 辰 | 9 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 巳 | 8 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 午 | 7 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 未 | 6 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 申 | 5 `match` | 9/9 `match` | `match`（なし） | `match` | 同上 | user_transcribed |
| C | 酉 | 4 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 戌 | 3 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 亥 | 2 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 子 | 1 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |
| C | 丑 | 9 `match` | 9/9 `match` | `match` | `match` | 同上 | user_transcribed |

天道・天徳の36位置は`月盤研究台帳`の正規化名称から抽出した。`12か月方位神期待値`は寅月以外が未入力であるため、位置一致を独立した12か月規則表による検証とは扱わない。

### 5.1 集計

| comparison | result |
| --- | --- |
| 年グループ | 3/3構成、12/12年支が現行グループと`match` |
| 中宮星 | 36/36 `match` |
| 各盤九星1〜9の一意性 | 36/36 `match` |
| 大字九星 | 322/324 `match`、2/324 `mismatch` |
| 五黄殺 | 中宮5の4盤は方位なし、その他32盤は`match` |
| 暗剣殺 | 中宮5の4盤は方位なし、その他32盤は`match` |
| 月破 | 36/36 `match` |
| 天道・天徳 | 現行単一8方位との位置は各36/36一致。最終分類は`source_unconfirmed` |

## 6. 項目別比較

| item | spreadsheet observation | current implementation | result | notes |
| --- | --- | --- | --- | --- |
| 年グループ | A=1・4・7/酉午卯子、B=3・6・9/戌未辰丑、C=2・5・8/亥申巳寅 | 月盤regressionの3グループ | `match` | 現行55,152日でも保護済み |
| 月支 | 12月支 | `duplicateMonth` | `match` | 日付境界時刻は台帳にないため別問題 |
| 中宮星 | 36対応 | `monthKyusei` | `match` | 36/36 |
| 8方位大字九星 | 324値 | `getKyuseiDirectionStar` | `mismatch` | 322一致、A寅の東・南東2セル不一致 |
| 五黄殺 | 大字五の方位 | 月五黄殺 | `match` | 32方位 + 中宮5の4盤なし |
| 暗剣殺 | `ア`32盤 | 月暗剣殺 | `match` | 32方位 + 中宮5の4盤なし。marker自体の画像確認は2セル |
| 月破 | `破`36盤 | 月破 | `match` | 36/36。画像確認済み4セル、user-transcribed 32セル |
| 月空 | `空`36盤 | 一般月空なし。特定プロフィール固定文字列あり | `concept_mismatch` | 一般月空runtimeとしては`not_implemented` |
| 天道 | `天月`/`天`解釈から36位置 | 単一天道12節月表 | `source_unconfirmed` | 位置は36/36一致するが略記本文定義未確認 |
| 天徳 | `天月`/`天`解釈から36位置 | 天徳12節月表 | `source_unconfirmed` | 位置は36/36一致するが略記本文定義未確認 |
| 月徳 | `天月`/`月`解釈から36位置 | 月徳方位なし | `not_implemented` | `月徳日`を比較値にしない。略記意味も一部`source_unconfirmed` |
| 天徳合 | `天合`24盤 | 専用月盤値なし | `not_implemented` | 12盤にmarkerなし。成立規則の独立確認が必要 |
| 月徳合 | `月合`35盤 | 専用月盤値なし | `not_implemented` | C寅欠落と寅月期待値が矛盾。現データセット全体は昇格不可 |
| 生気 | `生`36盤 | palace blendの同名値 | `concept_mismatch` | 方位神markerとblendを統合しない |
| 定位対冲 | `冲`32盤 | 専用実装なし | `not_implemented` | 4盤はmarkerなし。暗剣殺対宮や十二支冲から生成しない |
| 三合 | 36盤に1〜2方向、計48marker | 三合4局の3方向経路 | `concept_mismatch` | 36/36で方向集合が異なる。直接置換しない |
| 節入り境界 | 月支別台帳のみ | 日付精度暦DB | `cannot_compare` | 立春・各節入り前後の日時fixtureが必要 |

## 7. 原記号辞書の扱い

| original symbol | spreadsheet normalized candidate | promotion assessment |
| --- | --- | --- |
| `天月` | 天道・天徳・月徳 | 原記号の読取は保持可。意味展開はLevel 2、本文定義確認前は`source_unconfirmed` |
| `天` | 天道・天徳 | 原記号の読取は保持可。個別意味はLevel 2、本文定義確認前は`source_unconfirmed` |
| `月` | 月徳 | 原記号と候補名は保持可。production方位値は未実装 |
| `天合` | 天徳合 | 原記号と候補名は保持可。成立規則は未実装 |
| `月合` | 月徳合 | 原記号と候補名は保持可。C寅差異の解消が必要 |
| `破` | 月破 | 現行月破と36/36一致 |
| `空` | 月空 | 原記号は保持可。現行固定プロフィール表示とは別概念 |
| `生` | 生気 | 原記号は保持可。現行palace blendとは別概念 |
| `冲` | 定位対冲 | 原表記`冲`を維持。暗剣殺や十二支冲と統合しない |
| `三合` | 三合 | 原記号は保持可。現行3方向三合経路と統合しない |
| `ア` | 暗剣殺 | 32盤位置が現行と一致。五黄中宮4盤はmarkerなし |

原記号、原位置、正規化名称、8方位派生、現行コード比較を別フィールドにする。正規化名称だけを正本にせず、`天月`や`天`を複数markerへ不可逆展開しない。

## 8. 正式データ昇格レベル

このLevelは「現在の監査分類」であり、productionへ反映したことを意味しない。

### Level 1: 正式採用候補

| item | scope | condition / note |
| --- | --- | --- |
| 年支3グループ | 3グループ・12年支 | 研究台帳、現行実装、既存静的回帰が一致 |
| 月盤中宮 | 36対応 | 36/36一致。既存静的回帰あり |
| 九星1〜9一意性 | 36盤 | 36/36成立。ただし方向別324値の一括昇格とは別 |
| 五黄殺 | 9中宮対応 | 32方位 + 中宮5の4盤なしが一致 |
| 暗剣殺 | 9中宮対応 | 32方位 + 中宮5の4盤なしが一致。原marker全件独立画像確認は別途必要 |
| 月破 | 12月支対応 | 36/36一致。原marker全件独立画像確認は別途必要 |

大字九星324値全体はLevel 1に含めない。A寅2セルを解消するまでは、現行計算式の保護と原資料転記masterの採用を分離する。

### Level 2: 正式採用可能だが注記が必要

| item | reason | required note |
| --- | --- | --- |
| `天月` | 読取と配置整合は強いが本文定義未確認 | 原記号を保持し、天道・天徳・月徳への展開を暫定とする |
| `天` | 読取と配置整合は強いが個別意味未確認 | 天道・天徳の共用記号か個別記号か未確定 |
| 天道・天徳の8方位位置 | 現行12対応と36/36位置一致 | 略記意味確認前は`source_unconfirmed`。正式方位神masterへ未昇格 |

Level 2も即時production採用を許可しない。本文定義または独立した凡例資料とPO判断が必要である。

### Level 3: 研究データとして保持

| item | reason |
| --- | --- |
| 月徳方位 | 36位置はあるがproduction未実装、略記意味と全12月独立原典確認が不足 |
| 天徳合 | 24盤marker。production未実装、成立規則未確認 |
| 月徳合の矛盾しない35盤側記録 | production未実装。C寅差異を含む全体採用は不可 |
| 月空 | 36markerだが一般規則未実装。固定プロフィール表示とは別概念 |
| 生気 | 36markerだがproduction同名blendとは別概念 |
| 定位対冲 | 32marker。production未実装、4盤markerなしの意味未確認 |
| 三合 | 36盤48marker。現行三合4局の3方向経路とは粒度が異なる |
| 296 `user_transcribed` cells | 一次転記・内部整合の研究証拠。独立原画像照合前はsource masterにしない |

### Level 4: 正式採用不可

| item | blocker |
| --- | --- |
| 36盤324区画の一括静的master | A寅2セル不一致、296セル未独立確認 |
| A寅の東7・南東6を現行方向値として採用 | 現行式は東6・南東7。同一中宮8の他盤とも再照合が必要 |
| C寅の月徳合全体判定 | `12か月方位神期待値`の西と、C寅西のmarkerなしが矛盾 |
| `天月`・`天`の断定展開 | 萬年暦本文の明示定義未確認 |
| 盤内`三合`を現行三合3方向へ置換 | 36/36で方向集合が一致せず、概念粒度が異なる |
| 月空・生気の既存同名コード流用 | 用途が異なる`concept_mismatch` |

## 9. データ設計案

### 案1: 計算生成型

構造:

```text
3種類の月盤中宮パターン
+ 9宮飛泊計算
+ 12か月共通の方位神ルール
```

利点:

- 現行`getKyuseiDirectionStar`と相性がよく、重複データを抑えられる。
- 中宮、九星一意性、五黄殺、暗剣殺、月破を少数ルールで検証できる。
- 同一中宮から異なる配置を生成しない不変条件を守りやすい。

欠点:

- 原資料固有の例外・誤植・略号・複数markerを失いやすい。
- `天月`・`天`・`三合`の意味を先に計算規則へ固定する危険がある。
- A寅2セルのようなsource差異を「計算が正しい」として消してしまう。

評価: 九星配置・三大凶方位の計算層には適するが、原資料marker正本には不適。

### 案2: 36盤master型

構造:

```text
3グループ × 12か月 × 9区画
```

利点:

- 原記号、重複marker、空欄、出典行をそのまま保持できる。
- 1セル単位のレビュー、差分、fixture化が容易。
- 計算規則へ還元できない資料事実を保存できる。

欠点:

- 324区画の誤転記がそのままruntimeへ入る。
- 同じ中宮配置を複製し、A寅2セルのような矛盾を増幅する。
- 296セルが未独立確認の現状では正式master化できない。
- 将来の訂正でproduction値とsource転記値が混ざりやすい。

評価: source transcription ledgerまたは回帰fixtureには適するが、現時点のproduction正本には不適。

### 案3: ハイブリッド型（推奨）

構造:

```text
月盤中宮36対応 + 九星飛泊計算
+ 方位神12か月source master候補
+ 原記号辞書
+ 36盤324区画source fixture
```

推奨する層分離:

| layer | canonical content | current action |
| --- | --- | --- |
| calculation | 年グループ、中宮、9宮配置、五黄殺、暗剣殺、月破 | 現行挙動を維持。今回変更しない |
| source transcription | source_id、page、group、month、original_position、original_symbol | 研究台帳として保持。独立レビュー状態を付ける |
| normalized deity candidate | marker_type、mountain_24、direction_8、rule confidence | 未確認値をproductionへ出さない |
| symbol dictionary | `天月`等の原記号と解釈候補 | 原記号を正本にし、解釈はversioned statusにする |
| regression fixture | 36盤324区画と計算結果の比較 | A寅差異を解消後、tests-only工程で検討 |

利点:

- 現行の安定した計算生成を維持しながら原資料の差異を失わない。
- 原記号と正規化名称を分離できる。
- 未確認方位神をcandidate/rank/warningへ誤接続しない。
- source fixtureをproduction masterと同一視せず、差異を可視化できる。

欠点:

- calculation、source、normalized viewの3層を比較する型とレビュー手順が必要。
- 同じ値が複数層に見えるため、正本フィールドの責務を明文化する必要がある。

評価: 現行実装、研究台帳の証拠粒度、未確定項目の隔離に最も適する。

## 10. 推奨schema

まだ実装しない。将来のsource layerは少なくとも次を分離する。

```ts
type MonthlyPlateSourceCell = {
  sourceId: string;
  edition: string | null;
  page: number;
  pattern: "A" | "B" | "C";
  yearStarGroup: string;
  yearBranchGroup: string;
  monthBranch: string;
  monthNumber: number;
  centerStar: string;
  originalPosition: string;
  originalLargeStar: string;
  originalSymbol: string[];
  normalizedMarkerCandidate: string[];
  mountain24: string[] | null;
  direction8Derived: string | null;
  directionDerivationStatus: "confirmed" | "probable" | "unreadable";
  sourceReviewStatus: "confirmed" | "user_transcribed" | "conflict";
  independentReviewer: string | null;
  comparisonStatus: "match" | "mismatch" | "not_implemented" | "concept_mismatch" | "source_unconfirmed" | "cannot_compare";
  notes: string[];
};
```

8方位へ丸めた値だけを正本にしない。`originalPosition`、`originalSymbol`、`mountain24`、`direction8Derived`、現行実装比較を別フィールドにする。

## 11. 昇格前の停止条件

1. A寅の東・南東を原画像で再確認し、同じ中宮8のA亥・B申・C巳と独立比較する。
2. C寅の西区画を再確認し、月徳合がないのか、転記漏れか、グループ差かを確定する。
3. `天月`・`天`の本文または凡例上の明示定義を確認する。
4. 296 `user_transcribed`セルを、原画像に対する独立二重入力またはサンプリングではなく全件照合する。
5. 方位基準と24山派生根拠をsourceとして登録する。
6. 月徳、天徳合、月徳合、月空、生気、定位対冲、三合を、同名既存コードに依存せず項目別に独立照合する。
7. POがLevel 1/2の採用範囲、作用、UI表示、候補判定への非接続または接続を決定する。

## 12. 将来のテスト案

今回テストは追加・変更・実行しない。将来の実装工程は最低限次を分ける。

- 3年グループ × 12か月の中宮星36件。
- 各盤で九星1〜9が1回ずつ出現すること。
- 中宮星と8方位の対応。A寅差異解消前にsource値を固定しない。
- 五黄中宮時は五黄殺・暗剣殺なし。
- 五黄が方位宮にある場合、その対宮が暗剣殺。
- 月破の12か月循環。
- 月空の12か月循環。source確認前は期待値を固定しない。
- `天月`・`天`・`月`の展開。原記号と正規化名称を別assertにする。
- 原記号と正規化名称の分離。
- 境界日で使用する月支の切替。
- 立春・各節入りの直前直後。時刻精度と日付精度を別fixtureにする。
- 既存`/purpose-calendar` URLとqueryの回帰。
- 研究source fixtureとcalculation outputの差異が黙って消えないこと。
- 未実装方位神がcandidate、rank、warning、blockingへ接続されないこと。

既存テスト:

```text
not run: docs-only investigation
baseline: 707/707
```

## 13. URL・UI・API・Preview

- `src/`変更なし。
- productionコード、master、generated data、test期待値変更なし。
- `/purpose-calendar`、`year`、`month`、`selectedDate`、`compassOrientation`、candidate関連query変更なし。
- API response変更なし。
- UI変更なし。
- Vercel Preview: not required.
- Reason: no production or UI changes.

## 14. 次の安全な工程

1. A寅2区画とC寅月徳合の限定原画像再確認。
2. 296区画の独立二重入力計画とreview status更新。
3. `天月`・`天`の本文定義確認。
4. Level 1候補だけを対象にPO採用判断。
5. ハイブリッド型の型・正本境界をdocsで確定。
6. source fixtureを先にtests-onlyで保護し、production接続は別工程にする。
7. 未実装方位神は項目別にsource master候補を作り、候補rank・相殺・warning接続を別Decisionにする。

Googleスプレッドシートは研究原本であり、GitHubの正式masterではない。今回の監査はproduction採用を実施せず、昇格可否と停止条件を整理したものである。
