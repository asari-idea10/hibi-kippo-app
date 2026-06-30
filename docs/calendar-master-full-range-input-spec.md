# スプシ全期間抽出用 入力JSON仕様 v1

## 目的

`★フォーチューンマイレージマスタ > 年月日` を1900〜2050年、将来的には2100年以降へ拡張して取り込むための入力JSON仕様を定める。

このJSONは、暦注発生マスター、暦JSON、ベストデー検索、命式計算の土台になる。

## ファイル方針

初期の全期間入力ファイル案:

```text
src/data/calendar-master-rows.1900-2050.json
```

形式は配列。

```json
[
  {
    "row": 46158,
    "date": "2026-05-16",
    "yearPillar": "丙午",
    "monthPillar": "癸巳",
    "dayPillar": "庚寅"
  }
]
```

既存の30日サンプルと同じキー形式を維持する。

```text
src/data/calendar-master-rows.sample.json
```

スプシからの実データは、年別または10年単位で分割して次のフォルダに置く。

```text
src/data/import/chunks/
```

例:

```text
src/data/import/chunks/calendar-master-rows.1900-1900.source.csv
src/data/import/chunks/calendar-master-rows.1901-1901.source.csv
src/data/import/chunks/calendar-master-rows.1910-1919.source.json
```

`chunks` 配下は元データ置き場なので、Git管理から外す。

## 必須キー

### 最小必須

すべての処理の基礎になるため、必須。

| key | 型 | 用途 |
|---|---|---|
| `row` | number | スプシ行番号。検証・差分追跡用 |
| `date` | string | `YYYY-MM-DD` |
| `year` | string | 西暦年 |
| `month` | string | 月 |
| `day` | string | 日 |
| `ymLabel` | string | スプシ由来の年月日ラベル |

### 干支・空亡

命式、選日、暦注計算に必要。

| key | 型 |
|---|---|
| `yearNumber` | string |
| `monthNumber` | string |
| `dayNumber` | string |
| `sexagenaryNumber` | string |
| `cycle` | string |
| `yearPillar` | string |
| `monthPillar` | string |
| `dayPillar` | string |
| `yearStem` | string |
| `monthStem` | string |
| `dayStem` | string |
| `duplicateYear` | string |
| `duplicateMonth` | string |
| `duplicateDay` | string |
| `kuubou` | string |

### 二十四節気・節入り

節入り、月柱、蔵干、土用、月盤の検算に必要。

| key | 型 |
|---|---|
| `solarTerm` | string |
| `setsuiri` | string |
| `daysFromSetsuiri` | string |
| `kasshiHelper` | string |
| `switchFlag` | string |
| `seasonalBoundaryFlag` | string |

### 九星

九星気学の基礎値。

| key | 型 |
|---|---|
| `yearKyusei` | string |
| `monthKyusei` | string |
| `dayKyusei` | string |
| `ton` | string |

### 方位殺

共通暦の注意方位。

| key | 型 |
|---|---|
| `yearAnkensatsu` | string |
| `yearGohosatsu` | string |
| `yearSaiha` | string |
| `monthAnkensatsu` | string |
| `monthGohosatsu` | string |
| `monthSaiha` | string |
| `dayAnkensatsu` | string |
| `dayGohosatsu` | string |
| `daySaiha` | string |

### 暦注発生マスター用

`calendar_note_occurrences` の生成に必要。

| key | 型 |
|---|---|
| `legacyJunichoku` | string |
| `legacyNijuhachishuku` | string |
| `legacySummary` | string |
| `legacySanrinbou` | string |
| `legacyIchiryumanbaibi` | string |
| `legacyFujoju` | string |
| `legacyHassen` | string |
| `legacyJippoGure` | string |
| `legacyTenichiTenjo` | string |
| `legacyRoujitsu` | string |
| `legacyKasshi` | string |
| `legacyKoushin` | string |
| `legacyShinnyu` | string |
| `legacyTsuchinotoMi` | string |
| `legacyTenshaBi` | string |

## 暫定・検証用キー

蔵干は重要だが流派差があり、方式IDで管理する。

| key | 方針 |
|---|---|
| `yearZokanMain` | スプシ方式 v0 として保持 |
| `monthZokanMain` | スプシ方式 v0 として保持 |
| `dayZokanMain` | スプシ方式 v0 として保持 |
| `yearZokanMiddle` | スプシ方式 v0 として保持 |
| `monthZokanMiddle` | スプシ方式 v0 として保持 |
| `dayZokanMiddle` | スプシ方式 v0 として保持 |
| `yearZokanExtra` | スプシ方式 v0 として保持 |
| `monthZokanExtra` | スプシ方式 v0 として保持 |
| `dayZokanExtra` | スプシ方式 v0 として保持 |

## 土用キー

現時点ではスプシ由来も保持するが、将来的には二十四節気マスターから再計算する。

| key | 方針 |
|---|---|
| `doyoFlag` | legacy_spreadsheet として保持 |
| `doyoLabel` | legacy_spreadsheet として保持 |

## 取り込みルール

1. 1行1日
2. `date` は必ず `YYYY-MM-DD`
3. 行は日付昇順
4. 欠損日はエラー
5. 重複日はエラー
6. boolean系フラグは原則 `"1"` または `"0"`。空欄 `""` も許容する
7. 方位・暦注・蔵干の空欄は `""`
8. `row` は数値
9. 未完成列は入れない。必要になったら別マスターで追加する

## スプシA:BN実データの扱い

`年月日!A:BN` をそのまま抽出した場合、ヘッダーなし66列として扱う。

この実データは、アプリ側の正規JSONとは列構造が少し違う。

| 項目 | 扱い |
|---|---|
| `date` | スプシ実列Eから取得 |
| `row` | スプシ実列には含めず、`1900-01-01 = row 2` を起点に自動算出 |
| `year` | スプシ実列Bが空欄の場合は、`date` または `ymLabel` から自動算出 |

列対応はここで管理する。

```text
src/data/calendar-master-column-map.v1.json
```

CSVだけでなく、Google Sheets API/コネクタから取得した次の形式も入力として許容する。

```json
{
  "values": [
    ["1900/1/1", "", "1", "1", "1900-01-01"]
  ]
}
```

または、`valueRanges` 形式も許容する。

## 全期間ファイル命名

```text
src/data/calendar-master-rows.1900-2050.json
src/data/calendar-master-rows.1900-2100.json
src/data/calendar-master-rows.1900-2150.json
```

## 検証コマンド

検証スクリプトは、全期間抽出時のゆらぎに備えて `"1"` / `"0"` / `""` / `1` / `0` / `true` / `false` をboolean系フラグとして許容する。

```bash
npm run data:calendar-master:validate -- \
  --input src/data/calendar-master-rows.sample.json \
  --start-date 2026-05-16 \
  --end-date 2026-06-14
```

全期間では以下。

```bash
npm run data:calendar-master:validate -- \
  --input src/data/calendar-master-rows.1900-2050.json \
  --start-date 1900-01-01 \
  --end-date 2050-12-31
```

`chunks` 配下の年別・10年単位ファイルから全期間JSONを作る場合:

```bash
npm run data:calendar-master:build-full
```

出力せずに欠損・重複・行数だけ確認する場合:

```bash
npm run data:calendar-master:check-full
```

## 次の工程

1. 全期間JSONをこの形式で抽出する
2. バリデーションを通す
3. `data:calendar-notes:generate-range` で年別暦注発生マスターを生成する
4. 万年暦サンプリングで重要年を検証する
