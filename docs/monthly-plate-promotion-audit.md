# 月盤研究台帳 正式データ昇格可否監査

調査日: 2026-07-18
作業区分: `documentation_only`
対象スプレッドシート: `hibi-kippo_monthly_plate_research_ledger`
Spreadsheet ID: `1du3QGUmT8tO4hC5DZifi1C_r7KI9W4rrbqTZmZxa6aE`

## 1. 結論

研究台帳は、3年グループ × 12か月 × 9区画 = 324行を保持し、36盤すべてについて一次転記と研究上の一次検算が記録されている。ただし、現時点で324区画をそのままproduction masterへ一括昇格してはならない。

主な理由は次のとおり。

- 324行のうち画像確認済みは28行、`user_transcribed`は296行であり、296行は独立原画像照合済みではない。
- 初回監査ではAグループ寅月の東・南東2区画が現行配置と不一致だったが、POが原資料現物を目視し、東=六白、南東=七赤、両区画とも原記号なしと確認した。研究台帳の東=7、南東=6は転記誤りであり、原資料と現行実装は一致する。
- POはCグループ寅月の南=六白・`天月 / 三合`、南西=八白・`ア / 破 / 冲`、西=四緑・原記号なしを確認し、盤内の他区画にも`月合`がないことを確認した。`12か月方位神期待値`の寅月「月徳合=辛=西」と萬年暦盤面は一致せず、資料間不一致は未解決である。
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

### 2.3 PO原資料現物目視確認

2026-07-18の初回監査後、POが原資料現物を目視し、次を確認した。この確認はGoogle Sheetを書き換えず、初回監査値に対する後続のsource reviewとして記録する。

| plate | direction | large star | original symbol | result |
| --- | --- | --- | --- | --- |
| A寅 | 東 | 六白 | なし | 研究台帳の7は転記誤り。現行6と一致 |
| A寅 | 南東 | 七赤 | なし | 研究台帳の6は転記誤り。現行7と一致 |
| C寅 | 南 | 六白 | `天月 / 三合` | 盤面表示を現物確認 |
| C寅 | 南西 | 八白 | `ア / 破 / 冲` | 盤面表示を現物確認 |
| C寅 | 西 | 四緑 | なし | `月合`表示なしを現物確認 |

C寅は他の区画にも`月合`表示がない。これは転記漏れではなく、萬年暦盤面上の非表示である。ただし、古典期待値「月徳合=辛=西」と萬年暦盤面のどちらが誤りかは推測で断定しない。月徳合を西としてproductionデータへ補完しない。

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
| A | 寅 | 8 `match` | 9/9 `match`。PO確認: 東=六白、南東=七赤。台帳旧値は転記誤り | `match` | `match` | 位置36対応内`match`、意味`source_unconfirmed` | confirmed + PO reviewed |
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
| 大字九星 | PO原資料確認後、324/324 `match`。初回2セル差は台帳転記誤り |
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
| 8方位大字九星 | 324値 | `getKyuseiDirectionStar` | `match` | PO確認後324/324一致。A寅の台帳旧値2セルは転記誤り |
| 五黄殺 | 大字五の方位 | 月五黄殺 | `match` | 32方位 + 中宮5の4盤なし |
| 暗剣殺 | `ア`32盤 | 月暗剣殺 | `match` | 32方位 + 中宮5の4盤なし。marker自体の画像確認は2セル |
| 月破 | `破`36盤 | 月破 | `match` | 36/36。画像確認済み4セル、user-transcribed 32セル |
| 月空 | `空`36盤 | 一般月空なし。特定プロフィール固定文字列あり | `concept_mismatch` | 一般月空runtimeとしては`not_implemented` |
| 天道 | `天月`/`天`解釈から36位置 | 単一天道12節月表 | `source_unconfirmed` | 位置は36/36一致するが略記本文定義未確認 |
| 天徳 | `天月`/`天`解釈から36位置 | 天徳12節月表 | `source_unconfirmed` | 位置は36/36一致するが略記本文定義未確認 |
| 月徳 | `天月`/`月`解釈から36位置 | 月徳方位なし | `not_implemented` | `月徳日`を比較値にしない。略記意味も一部`source_unconfirmed` |
| 天徳合 | `天合`24盤 | 専用月盤値なし | `not_implemented` | 12盤にmarkerなし。成立規則の独立確認が必要 |
| 月徳合 | `月合`35盤。PO確認でC寅盤面には表示なし | 専用月盤値なし | `not_implemented` | 古典期待値「辛=西」と萬年暦盤面が矛盾。資料間不一致は未解決で、productionへ西を補完しない |
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
| 8方位大字九星 | 324区画 | POがA寅2セルを原資料で再確認し、現行実装と324/324一致 |
| 九星1〜9一意性 | 36盤 | 36/36成立。ただし方向別324値の一括昇格とは別 |
| 五黄殺 | 36盤 | 36/36一致。32方位 + 中宮5の4盤なし |
| 暗剣殺 | 36盤 | 36/36一致。32方位 + 中宮5の4盤なし。原marker全件独立画像確認は別途必要 |
| 月破 | 36盤 | 36/36一致。原marker全件独立画像確認は別途必要 |

大字九星324値はLevel 1候補へ更新する。ただし、296セルの独立原画像照合、方位神marker、略記定義、C寅月徳合の資料間不一致は別ゲートであるため、324区画全体をproduction masterへ一括昇格できるとはしない。

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
| 月徳合 | production未実装。C寅に`月合`がないことはPO確認済みだが、古典期待値との資料間不一致は未解決 |
| 月空 | 36markerだが一般規則未実装。固定プロフィール表示とは別概念 |
| 生気 | 36markerだがproduction同名blendとは別概念 |
| 定位対冲 | 32marker。production未実装、4盤markerなしの意味未確認 |
| 三合 | 36盤48marker。現行三合4局の3方向経路とは粒度が異なる |
| 296 `user_transcribed` cells | 一次転記・内部整合の研究証拠。独立原画像照合前はsource masterにしない |

### Level 4: 正式採用不可

| item | blocker |
| --- | --- |
| 36盤324区画の一括静的master | 大字九星は324/324一致したが、296セルの独立確認、方位神marker、略記定義、資料間不一致が残る |
| C寅の月徳合を西として採用 | 古典期待値の西と、PO確認済みのC寅盤面markerなしが矛盾。資料間不一致は未解決 |
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
- A寅2セルで検出した転記誤りのようなsource差異を、計算値だけで黙って上書きする危険がある。

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
- 同じ中宮配置を複製し、A寅で確認されたような転記誤りを増幅する。
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
| regression fixture | 36盤324区画と計算結果の比較 | PO確認済みA寅訂正をsource review履歴付きで反映後、tests-only工程で検討 |

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

1. C寅の古典期待値「月徳合=辛=西」と萬年暦盤面markerなしの資料間不一致を、追加原典で調査する。どちらかを推測で訂正しない。
2. `天月`・`天`の本文または凡例上の明示定義を確認する。
3. 296 `user_transcribed`セルを、原画像に対する独立二重入力またはサンプリングではなく全件照合する。
4. 方位基準と24山派生根拠をsourceとして登録する。
5. 月徳、天徳合、月徳合、月空、生気、定位対冲、三合を、同名既存コードに依存せず項目別に独立照合する。
6. POがLevel 1/2の採用範囲、作用、UI表示、候補判定への非接続または接続を決定する。

## 12. 将来のテスト案

今回テストは追加・変更・実行しない。将来の実装工程は最低限次を分ける。

- 3年グループ × 12か月の中宮星36件。
- 各盤で九星1〜9が1回ずつ出現すること。
- 中宮星と8方位の対応。A寅はPO確認済み訂正値の由来も別assertで保持する。
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

1. C寅月徳合の古典期待値と萬年暦盤面の資料間不一致を追加原典で調査する。
2. 296区画の独立二重入力計画とreview status更新。
3. `天月`・`天`の本文定義確認。
4. Level 1候補だけを対象にPO採用判断。
5. ハイブリッド型の型・正本境界をdocsで確定。
6. source fixtureを先にtests-onlyで保護し、production接続は別工程にする。
7. 未実装方位神は項目別にsource master候補を作り、候補rank・相殺・warning接続を別Decisionにする。

Googleスプレッドシートは研究原本であり、GitHubの正式masterではない。今回の監査はproduction採用を実施せず、昇格可否と停止条件を整理したものである。

## 15. 月盤Level 1 provenance完全サンプル

Date: 2026-07-18
Decision: D-0020 implementation

月盤Level 1を全占技共通provenance schemaの最初の完全サンプルとして、production非接続の静的registryへ登録した。

登録Technique:

- `monthly-period-resolution`
- `monthly-year-group-resolution`
- `monthly-center-star`
- `monthly-nine-palace-placement`
- `monthly-gohosatsu`
- `monthly-ankensatsu`
- `monthly-breaker`
- `monthly-source-orientation`

`monthly-plate-level1-workflow`は8 Techniqueを束ねるaggregateであり、独立した吉凶効果、candidate、ranking、warning、UI effectを持たない。

### 15.1 Level 1 fixture

- 3年支group × 12月 = 36 fixture。
- 36 × 9宮 = 324大字九星。
- 年支group、月支、月番号、中宮、9宮配置、五黄殺、暗剣殺、月破、紙面原位置から8方位への対応だけを含む。
- A寅は東6・南東7、C寅は南6・南西8・西4のPO確認値を保持する。
- 細字marker、C寅月徳合、三合、24山、raw marker意味展開、application policyはfixtureへ含めない。
- fixtureはproduction計算式やdaily masterから生成せず、Level 1の静的期待値として保持する。

### 15.2 節入り境界のdual lane

| lane | boundary | status |
| --- | --- | --- |
| source rule | 節入り時刻を月界とする資料・占術rule | `partially_confirmed`。古典一次資料の書誌・頁claimは未登録 |
| project adopted | 正確なJST節入り時刻で切替 | `adopted` |
| current implementation | 1日1行のdaily master値を終日使用 | `implementation_observed` / `date` / exact timestamp support false |

BoundaryRule:

- `boundary.jst-normalization.v1`
- `boundary.monthly-setsuiri-timestamp.v1`
- `boundary.monthly-daily-master-resolution.v1`

公式節入り1,812件に対する現行daily masterの観測は、同日切替1,806件、翌日切替6件、missing 0件である。翌日切替6件の丸め、timezone、source由来の理由は`unresolved`とし、generated masterを自動修正しない。

### 15.3 CalculationTrace

- 通常例は2026-07-08 JST。小暑`2026-07-07T10:56:57+09:00`、未月、午年group A、中宮3、五黄殺西、暗剣殺東、月破北東と9宮配置をstep別に保持する。
- 境界例は2026-07-07 10:56:56 / 10:56:57 / 10:56:58 JSTについて、source rule、project adopted、current implementationを別laneで保持する。
- 10:56:56時点の午月・中宮4と、daily masterの未月・中宮3の差はopen `ImplementationGap`であり、production挙動を変更しない。

### 15.4 非接続と未解決事項

- 新規registryはapp、API、client component、既存production moduleからimportしない。
- 既存月盤計算、calendar master、generated data、既存月盤test、URL、UI、candidate、ranking、warningは変更しない。
- C寅月徳合、原資料三合、296細字区画のconflict / evidence limitationは参照として保持するが、Level 1結果へ混入させない。
- source orientationはA寅2セル・C寅3セルのPO確認を根拠とする`partially_confirmed`であり、24山確認済みへ昇格しない。
